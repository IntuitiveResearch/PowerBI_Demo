# AI Prompts and Templates

## Overview

The Star Cement KPI Platform uses OpenAI GPT-4o to generate actionable insights from cement manufacturing data. This document explains the prompt engineering approach and provides rationale for design choices.

## Core Principles

### 1. No Hallucination
**Problem:** LLMs can invent facts when they don't have data.

**Solution:** Never ask the LLM to analyze raw data. Instead:
1. Run deterministic SQL queries to compute metrics
2. Pass only computed metrics to the LLM
3. Ask LLM to synthesize explanation from provided metrics

**Example:**
```python
# ❌ BAD: Asking LLM to analyze data
prompt = f"""
Here's production data: {json.dumps(raw_data)}
Why did EBITDA drop?
"""

# ✅ GOOD: Providing computed evidence
evidence = {
    'ebitda_delta': -85,  # Computed from SQL
    'cost_delta': 60,
    'afr_delta': -2.1
}
prompt = f"""
Numeric evidence:
{json.dumps(evidence)}

Task: Explain EBITDA drop using ONLY provided metrics.
"""
```

### 2. Evidence-Based
Every insight must include:
- **Computed Metrics:** Numeric evidence from SQL queries
- **SQL Query:** The exact query used (for transparency)
- **Top Data Points:** Sample rows supporting the conclusion

### 3. Structured Output
Responses must be JSON-formatted for consistent parsing:
```json
{
  "summary": "<150 words max>",
  "causes": ["<cause 1>", "<cause 2>", "<cause 3>"],
  "recommendedActions": ["<8-12 words>", "<8-12 words>", "<8-12 words>"]
}
```

## Pre-Defined SQL Templates

We use question classification to map user queries to SQL templates:

### Template 1: EBITDA Analysis
```sql
SELECT 
    strftime('%Y-%m', date) as month,
    AVG(ebitda_rs_ton) as avg_ebitda,
    AVG(cost_rs_ton) as avg_cost,
    AVG(margin_pct) as avg_margin
FROM fact_finance
WHERE date >= '{start_date}' AND date <= '{end_date}'
GROUP BY month
ORDER BY month
```

**Computed Metrics:**
- `ebitda_delta`: Latest month vs previous month
- `cost_delta`: Cost change
- `margin_delta`: Margin change

### Template 2: Energy Anomaly Detection
```sql
SELECT 
    plant_name,
    AVG(power_kwh_ton) as avg_power,
    AVG(heat_kcal_kg) as avg_heat,
    AVG(fuel_cost_rs_ton) as avg_fuel_cost,
    AVG(afr_pct) as avg_afr
FROM fact_energy
WHERE date >= '{start_date}' AND date <= '{end_date}'
GROUP BY plant_name
```

**Computed Metrics:**
- Identify plants with power/heat above/below average
- Flag AFR deviations

### Template 3: Plant Performance Comparison
```sql
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
```

**Computed Metrics:**
- `best_plant`, `best_ebitda`
- `worst_plant`, `worst_ebitda`
- `performance_gap`

### Template 4: Margin Leak Analysis
```sql
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
```

**Computed Metrics:**
- Identify plants with lowest margins
- Break down cost components

### Template 5: Downtime Root Cause
```sql
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
```

**Computed Metrics:**
- `top_equipment`, `top_plant`
- `avg_breakdown_hrs`
- `mtbf_hrs`, `mttr_hrs`

## Prompt Template

Here's the full prompt template used in `ai_insights.py`:

```python
prompt = f"""
You are a domain expert in cement manufacturing analytics for Star Cement.

User Question: {question}

Numeric evidence from database:
{json.dumps(computed_metrics, indent=2)}

Top data points:
{json.dumps(raw_data[:5], indent=2, default=str)}

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
}}
"""
```

## Sample Prompts for Users

These are pre-baked prompts shown in the UI:

1. **"Why did EBITDA drop in the recent month?"**
   - Maps to: `ebitda_drop` template
   - Analyzes financial trends

2. **"Which plants have energy consumption anomalies?"**
   - Maps to: `energy_anomaly` template
   - Identifies outliers in power/fuel usage

3. **"What are the root causes of downtime?"**
   - Maps to: `downtime_root_cause` template
   - Analyzes maintenance incidents

4. **"Where are we losing margin?"**
   - Maps to: `margin_leak` template
   - Breaks down cost components

5. **"Compare plant performance across regions"**
   - Maps to: `plant_performance` template
   - Ranks plants by key metrics

## Question Classification Logic

```python
def classify_question(question: str) -> str:
    question_lower = question.lower()
    
    if 'ebitda' in question_lower and ('drop' in question_lower or 'decrease' in question_lower):
        return 'ebitda_drop'
    elif 'energy' in question_lower or 'power' in question_lower:
        return 'energy_anomaly'
    elif 'plant' in question_lower and 'performance' in question_lower:
        return 'plant_performance'
    elif 'margin' in question_lower and ('leak' in question_lower or 'loss' in question_lower):
        return 'margin_leak'
    elif 'downtime' in question_lower or 'breakdown' in question_lower:
        return 'downtime_root_cause'
    else:
        return 'plant_performance'  # Default
```

## Response Parsing

The LLM sometimes wraps JSON in markdown code blocks:

```python
response_text = response.strip()
if '```json' in response_text:
    response_text = response_text.split('```json')[1].split('```')[0].strip()
elif '```' in response_text:
    response_text = response_text.split('```')[1].split('```')[0].strip()

insight_data = json.loads(response_text)
```

## Rationale for Design Choices

### Why GPT-4o instead of GPT-3.5?
- Better at following structured output instructions
- More reliable JSON formatting
- Stronger domain reasoning for technical topics

### Why emergentintegrations library?
- Simplified API for LLM integration
- Unified interface for OpenAI, Anthropic, Gemini
- Built-in session management
- Using Emergent's universal key for easy demo

### Why pre-defined SQL templates?
- Faster response time (no SQL generation needed)
- Guaranteed valid SQL
- Consistent metric computation
- Easier to audit and debug

### Why limit LLM to synthesis only?
- Eliminates hallucination risk
- Makes insights verifiable (SQL + data)
- Reduces API costs (smaller prompts)
- Faster response time

## Extending with New Query Types

To add a new query type:

1. **Add SQL template** to `SQL_TEMPLATES` in `ai_insights.py`:
```python
'quality_issues': """
    SELECT plant_name, AVG(blaine), AVG(strength_28d)
    FROM fact_quality
    WHERE date >= '{start_date}' AND date <= '{end_date}'
    GROUP BY plant_name
"""
```

2. **Add classification rule**:
```python
if 'quality' in question_lower or 'blaine' in question_lower:
    return 'quality_issues'
```

3. **Add metric computation** in `compute_key_metrics()`:
```python
elif query_type == 'quality_issues':
    metrics['low_blaine_plants'] = ...
```

4. **Add sample prompt** to `SAMPLE_PROMPTS`:
```python
"Which plants have quality issues?"
```

## Testing AI Insights

Manual testing:
```bash
curl -X POST ${REACT_APP_BACKEND_URL}/api/insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "Why did EBITDA drop in the recent month?",
    "contextFilters": {"start": "2024-01-01", "end": "2025-12-31"}
  }'
```

Expected response structure:
```json
{
  "status": "success",
  "summary": "...",
  "causes": ["...", "...", "..."],
  "recommendedActions": ["...", "...", "..."],
  "evidence": {
    "computed_metrics": {...},
    "sql_query": "...",
    "top_data": [...]
  }
}
```

## Rate Limiting

To prevent abuse, implement rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@api_router.post("/insights")
@limiter.limit("5/minute")  # 5 requests per minute
async def get_insights(request: InsightRequest):
    ...
```

## Cost Optimization

**Estimated Costs (using EMERGENT_LLM_KEY):**
- Average prompt: ~500 tokens
- Average response: ~300 tokens
- Cost per query: ~$0.01 (GPT-4o pricing)
- 1000 queries/month: ~$10

**Optimization strategies:**
1. Cache frequent queries (e.g., "EBITDA drop" for same date range)
2. Use GPT-4o-mini for simpler queries
3. Implement query result caching (Redis)
4. Batch multiple questions in one API call

## Security Considerations

1. **Input Validation:** Sanitize user questions to prevent prompt injection
2. **SQL Injection:** Use parameterized queries only
3. **API Key Security:** Never expose EMERGENT_LLM_KEY to frontend
4. **Rate Limiting:** Prevent API abuse
5. **Audit Logging:** Log all AI queries for compliance

## Future Enhancements

1. **Multi-turn Conversations:** Allow follow-up questions
2. **Custom Metrics:** Let users define their own KPIs
3. **Anomaly Detection:** Auto-generate insights for detected anomalies
4. **Report Generation:** Export insights as PDF reports
5. **Voice Interface:** Support voice queries

## References

- OpenAI GPT-4o documentation: https://platform.openai.com/docs
- emergentintegrations library: (internal documentation)
- Prompt engineering best practices: https://platform.openai.com/docs/guides/prompt-engineering
