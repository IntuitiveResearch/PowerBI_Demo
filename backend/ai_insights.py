from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from dotenv import load_dotenv
import logging
import json
from typing import Dict, Any, List
from database import get_db_connection

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("EMERGENT_LLM_KEY")

# Pre-defined SQL templates for common queries
SQL_TEMPLATES = {
    'ebitda_drop': """
        SELECT 
            strftime('%Y-%m', date) as month,
            AVG(ebitda_rs_ton) as avg_ebitda,
            AVG(cost_rs_ton) as avg_cost,
            AVG(margin_pct) as avg_margin
        FROM fact_finance
        WHERE date >= '{start_date}' AND date <= '{end_date}'
        GROUP BY month
        ORDER BY month
    """,
    'energy_anomaly': """
        SELECT 
            plant_name,
            AVG(power_kwh_ton) as avg_power,
            AVG(heat_kcal_kg) as avg_heat,
            AVG(fuel_cost_rs_ton) as avg_fuel_cost,
            AVG(afr_pct) as avg_afr
        FROM fact_energy
        WHERE date >= '{start_date}' AND date <= '{end_date}'
        GROUP BY plant_name
    """,
    'plant_performance': """
        SELECT 
            p.plant_name,
            SUM(p.cement_mt) as total_cement,
            AVG(p.capacity_util_pct) as avg_capacity,
            AVG(p.downtime_hrs) as avg_downtime,
            AVG(f.ebitda_rs_ton) as avg_ebitda
        FROM fact_production p
        LEFT JOIN fact_finance f ON p.date = f.date AND p.plant_name = f.plant_name
        WHERE p.date >= '{start_date}' AND p.date <= '{end_date}'
        GROUP BY p.plant_name
        ORDER BY avg_ebitda DESC
    """,
    'margin_leak': """
        SELECT 
            f.plant_name,
            AVG(f.margin_pct) as avg_margin,
            AVG(f.cost_rs_ton) as avg_cost,
            AVG(s.realization_rs_ton) as avg_realization,
            AVG(s.freight_rs_ton) as avg_freight,
            AVG(e.fuel_cost_rs_ton) as avg_fuel_cost
        FROM fact_finance f
        LEFT JOIN fact_sales s ON f.date = s.date AND f.plant_name = s.plant_name
        LEFT JOIN fact_energy e ON f.date = e.date AND f.plant_name = e.plant_name
        WHERE f.date >= '{start_date}' AND f.date <= '{end_date}'
        GROUP BY f.plant_name
        ORDER BY avg_margin ASC
    """,
    'downtime_root_cause': """
        SELECT 
            m.plant_name,
            m.equipment,
            AVG(m.breakdown_hrs) as avg_breakdown,
            AVG(m.mtbf_hrs) as avg_mtbf,
            AVG(m.mttr_hrs) as avg_mttr,
            COUNT(*) as incident_count
        FROM fact_maintenance m
        WHERE m.date >= '{start_date}' AND m.date <= '{end_date}'
        GROUP BY m.plant_name, m.equipment
        HAVING avg_breakdown > 0
        ORDER BY avg_breakdown DESC
        LIMIT 10
    """
}

def classify_question(question: str) -> str:
    """Classify question type based on keywords"""
    question_lower = question.lower()
    
    if 'ebitda' in question_lower and ('drop' in question_lower or 'decrease' in question_lower or 'fall' in question_lower):
        return 'ebitda_drop'
    elif 'energy' in question_lower or 'power' in question_lower or 'fuel' in question_lower:
        return 'energy_anomaly'
    elif 'plant' in question_lower and ('performance' in question_lower or 'comparison' in question_lower):
        return 'plant_performance'
    elif 'margin' in question_lower and ('leak' in question_lower or 'loss' in question_lower):
        return 'margin_leak'
    elif 'downtime' in question_lower or 'breakdown' in question_lower or 'maintenance' in question_lower:
        return 'downtime_root_cause'
    else:
        return 'plant_performance'  # Default

def execute_sql_analysis(query_type: str, context_filters: Dict) -> Dict[str, Any]:
    """Execute SQL queries to get numeric evidence"""
    conn = get_db_connection()
    
    start_date = context_filters.get('start', '2024-01-01')
    end_date = context_filters.get('end', '2025-12-31')
    plant = context_filters.get('plant', 'all')
    
    sql_query = SQL_TEMPLATES.get(query_type, SQL_TEMPLATES['plant_performance'])
    sql_query = sql_query.format(start_date=start_date, end_date=end_date)
    
    if plant != 'all' and 'WHERE' in sql_query:
        # Add plant filter
        sql_query = sql_query.replace('WHERE', f"WHERE plant_name = '{plant}' AND")
    
    try:
        result = conn.execute(sql_query).fetchdf()
        evidence = result.to_dict('records')
        
        # Compute deltas and key metrics
        computed_metrics = compute_key_metrics(evidence, query_type)
        
        conn.close()
        return {
            'raw_data': evidence,
            'computed_metrics': computed_metrics,
            'sql_query': sql_query
        }
    except Exception as e:
        logger.error(f"SQL execution error: {str(e)}")
        conn.close()
        return {
            'raw_data': [],
            'computed_metrics': {},
            'sql_query': sql_query,
            'error': str(e)
        }

def compute_key_metrics(data: List[Dict], query_type: str) -> Dict[str, Any]:
    """Compute key metrics from raw SQL data"""
    metrics = {}
    
    if query_type == 'ebitda_drop' and len(data) >= 2:
        # Compare latest two months
        latest = data[-1]
        previous = data[-2]
        metrics['ebitda_delta'] = round(latest.get('avg_ebitda', 0) - previous.get('avg_ebitda', 0), 2)
        metrics['cost_delta'] = round(latest.get('avg_cost', 0) - previous.get('avg_cost', 0), 2)
        metrics['margin_delta'] = round(latest.get('avg_margin', 0) - previous.get('avg_margin', 0), 2)
        metrics['latest_month'] = latest.get('month')
        metrics['previous_month'] = previous.get('month')
    
    elif query_type == 'plant_performance' and len(data) > 0:
        best_plant = max(data, key=lambda x: x.get('avg_ebitda', 0))
        worst_plant = min(data, key=lambda x: x.get('avg_ebitda', 0))
        metrics['best_plant'] = best_plant.get('plant_name')
        metrics['best_ebitda'] = round(best_plant.get('avg_ebitda', 0), 2)
        metrics['worst_plant'] = worst_plant.get('plant_name')
        metrics['worst_ebitda'] = round(worst_plant.get('avg_ebitda', 0), 2)
        metrics['performance_gap'] = round(best_plant.get('avg_ebitda', 0) - worst_plant.get('avg_ebitda', 0), 2)
    
    elif query_type == 'downtime_root_cause' and len(data) > 0:
        top_issue = data[0]
        metrics['top_equipment'] = top_issue.get('equipment')
        metrics['top_plant'] = top_issue.get('plant_name')
        metrics['avg_breakdown_hrs'] = round(top_issue.get('avg_breakdown', 0), 2)
        metrics['mtbf_hrs'] = round(top_issue.get('avg_mtbf', 0), 2)
        metrics['mttr_hrs'] = round(top_issue.get('avg_mttr', 0), 2)
    
    return metrics

async def generate_insight(question: str, context_filters: Dict) -> Dict[str, Any]:
    """Generate AI-powered insight based on question and data"""
    
    # Step 1: Classify question
    query_type = classify_question(question)
    
    # Step 2: Execute SQL to get numeric evidence
    evidence = execute_sql_analysis(query_type, context_filters)
    
    if 'error' in evidence:
        return {
            'status': 'error',
            'message': 'Unable to analyze data',
            'error': evidence['error']
        }
    
    # Step 3: Build LLM prompt with computed metrics
    computed = evidence['computed_metrics']
    raw_data = evidence['raw_data']
    
    evidence_text = f"""Numeric evidence from database:
{json.dumps(computed, indent=2)}

Top data points:
{json.dumps(raw_data[:5], indent=2, default=str)}
"""
    
    prompt = f"""You are a domain expert in cement manufacturing analytics for Star Cement.

User Question: {question}

{evidence_text}

Task: Produce a concise business insight (max 150 words) that:
1. Directly answers the question
2. Links causes to observed metrics
3. Provides 3 prioritized recommended actions (each 8-12 words)

IMPORTANT: 
- Do NOT make up numbers - only use the provided evidence
- Be prescriptive and actionable
- Use Indian Rupee format (₹)

Respond in JSON format:
{{
  "summary": "<concise explanation>",
  "causes": ["<cause 1>", "<cause 2>", "<cause 3>"],
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"]
}}"""
    
    # Step 4: Call LLM
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"insight-{context_filters.get('start', 'default')}",
            system_message="You are a cement manufacturing analytics expert. Always respond in valid JSON format."
        )
        chat.with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Extract JSON from response
            response_text = response.strip()
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            insight_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            insight_data = {
                'summary': response[:500],
                'causes': ['Data analysis completed'],
                'recommendedActions': ['Review detailed metrics', 'Consult with operations team', 'Monitor trends']
            }
        
        return {
            'status': 'success',
            'summary': insight_data.get('summary', ''),
            'causes': insight_data.get('causes', []),
            'recommendedActions': insight_data.get('recommendedActions', []),
            'evidence': {
                'computed_metrics': computed,
                'sql_query': evidence['sql_query'],
                'top_data': raw_data[:3]
            }
        }
    
    except Exception as e:
        logger.error(f"AI insight generation error: {str(e)}")
        return {
            'status': 'error',
            'message': 'AI service temporarily unavailable',
            'error': str(e)
        }

# Pre-baked sample prompts for common queries
SAMPLE_PROMPTS = [
    "Why did EBITDA drop in the recent month?",
    "Which plants have energy consumption anomalies?",
    "What are the root causes of downtime?",
    "Where are we losing margin?",
    "Compare plant performance across regions"
]
