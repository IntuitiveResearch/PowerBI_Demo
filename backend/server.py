from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import timedelta
import tempfile
import json

from auth import authenticate_user, create_access_token, decode_token, LoginRequest, Token
from database import init_star_schema, get_db_connection
from excel_processor import ExcelProcessor
from data_ingestion import ingest_excel_data
from ai_insights import generate_insight, SAMPLE_PROMPTS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize star schema on startup
try:
    init_star_schema()
    logging.info("Star schema initialized")
except Exception as e:
    logging.warning(f"Schema initialization: {str(e)}")

# Create the main app
app = FastAPI(title="Star Cement KPI Platform API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class InsightRequest(BaseModel):
    question: str
    contextFilters: Optional[Dict[str, Any]] = {}

class KPIParams(BaseModel):
    role: Optional[str] = "CXO"
    start: Optional[str] = "2024-01-01"
    end: Optional[str] = "2025-12-31"
    plant: Optional[str] = "all"

# Auth dependency
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        token = authorization.replace("Bearer ", "")
        token_data = decode_token(token)
        if token_data:
            return {"email": token_data.email, "role": token_data.role}
    except:
        pass
    return None

# Routes
@api_router.post("/auth/login", response_model=Token)
async def login(login_req: LoginRequest):
    """Demo authentication endpoint"""
    user = authenticate_user(login_req.email, login_req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(hours=8)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

@api_router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    """Upload and process Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be Excel format")
    
    # Check file size (50MB limit)
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        # Process Excel
        processor = ExcelProcessor(tmp_path)
        validation = processor.validate_structure()
        preview = processor.get_preview_data(max_rows=5)
        stats = processor.get_stats()
        
        # Ingest data
        sheets_data = processor.read_and_validate_data()
        ingest_excel_data(sheets_data)
        
        return JSONResponse({
            'status': 'ok',
            'message': 'Data uploaded and ingested successfully',
            'preview': preview,
            'mapping': validation,
            'stats': stats
        })
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except:
            pass

@api_router.get("/schema")
async def get_schema():
    """Get star schema metadata and sample data"""
    try:
        conn = get_db_connection()
        
        # Get sample from each table
        samples = {}
        tables = ['dim_date', 'dim_plant', 'fact_production', 'fact_energy', 
                  'fact_maintenance', 'fact_quality', 'fact_sales', 'fact_finance']
        
        for table in tables:
            try:
                result = conn.execute(f"SELECT * FROM {table} LIMIT 5").fetchdf()
                samples[table] = result.to_dict('records')
            except:
                samples[table] = []
        
        conn.close()
        
        return {
            'status': 'ok',
            'schema': {
                'dim_date': ['date', 'year', 'month', 'day', 'month_name', 'quarter'],
                'dim_plant': ['plant_id', 'plant_name', 'region'],
                'fact_production': ['date', 'plant_name', 'line', 'cement_mt', 'clinker_mt', 'capacity_util_pct', 'downtime_hrs'],
                'fact_energy': ['date', 'plant_name', 'power_kwh_ton', 'heat_kcal_kg', 'fuel_cost_rs_ton', 'afr_pct'],
                'fact_maintenance': ['date', 'plant_name', 'equipment', 'breakdown_hrs', 'mtbf_hrs', 'mttr_hrs'],
                'fact_quality': ['date', 'plant_name', 'blaine', 'strength_28d', 'clinker_factor'],
                'fact_sales': ['date', 'plant_name', 'region', 'dispatch_mt', 'realization_rs_ton', 'freight_rs_ton', 'otif_pct'],
                'fact_finance': ['date', 'plant_name', 'cost_rs_ton', 'ebitda_rs_ton', 'margin_pct']
            },
            'samples': samples
        }
    except Exception as e:
        logger.error(f"Schema error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/kpis")
async def get_kpis(
    role: str = "CXO",
    start: str = "2024-01-01",
    end: str = "2025-12-31",
    plant: str = "all"
):
    """Get KPIs for specified role and filters"""
    try:
        conn = get_db_connection()
        
        plant_filter = "" if plant == "all" else f"AND p.plant_name = '{plant}'"
        
        # Get aggregate KPIs
        query = f"""
            SELECT 
                SUM(p.cement_mt) as total_cement_mt,
                AVG(f.ebitda_rs_ton) as avg_ebitda_ton,
                AVG(e.power_kwh_ton) as avg_power_kwh_ton,
                AVG(q.clinker_factor) as avg_clinker_factor,
                AVG(p.capacity_util_pct) as avg_capacity_util,
                AVG(p.downtime_hrs) as avg_downtime_hrs,
                AVG(s.otif_pct) as avg_otif_pct,
                AVG(f.margin_pct) as avg_margin_pct
            FROM fact_production p
            LEFT JOIN fact_finance f ON p.date = f.date AND p.plant_name = f.plant_name
            LEFT JOIN fact_energy e ON p.date = e.date AND p.plant_name = e.plant_name
            LEFT JOIN fact_quality q ON p.date = q.date AND p.plant_name = q.plant_name
            LEFT JOIN fact_sales s ON p.date = s.date AND p.plant_name = s.plant_name
            WHERE p.date >= '{start}' AND p.date <= '{end}' {plant_filter}
        """
        
        kpis_result = conn.execute(query).fetchdf().to_dict('records')[0]
        
        # Get margin trend
        trend_filter = "" if plant == "all" else f"AND plant_name = '{plant}'"
        trend_query = f"""
            SELECT 
                date,
                AVG(margin_pct) as value
            FROM fact_finance
            WHERE date >= '{start}' AND date <= '{end}' {trend_filter}
            GROUP BY date
            ORDER BY date
        """
        
        margin_trend = conn.execute(trend_query).fetchdf()
        margin_trend['date'] = margin_trend['date'].astype(str)
        
        # Get plant comparisons
        comparison_query = f"""
            SELECT 
                f.plant_name,
                AVG(ebitda_rs_ton) as ebitda_ton,
                SUM(f.ebitda_rs_ton * p.cement_mt) / SUM(p.cement_mt) as weighted_ebitda
            FROM fact_finance f
            LEFT JOIN fact_production p ON f.date = p.date AND f.plant_name = p.plant_name
            WHERE f.date >= '{start}' AND f.date <= '{end}'
            GROUP BY f.plant_name
            ORDER BY ebitda_ton DESC
        """
        
        comparisons = conn.execute(comparison_query).fetchdf().to_dict('records')
        
        conn.close()
        
        return {
            'status': 'ok',
            'kpis': {
                'total_cement_mt': round(kpis_result.get('total_cement_mt', 0) or 0, 2),
                'avg_ebitda_ton': round(kpis_result.get('avg_ebitda_ton', 0) or 0, 2),
                'avg_power_kwh_ton': round(kpis_result.get('avg_power_kwh_ton', 0) or 0, 2),
                'avg_clinker_factor': round(kpis_result.get('avg_clinker_factor', 0) or 0, 3),
                'avg_capacity_util': round(kpis_result.get('avg_capacity_util', 0) or 0, 2),
                'avg_downtime_hrs': round(kpis_result.get('avg_downtime_hrs', 0) or 0, 2),
                'avg_otif_pct': round(kpis_result.get('avg_otif_pct', 0) or 0, 2),
                'avg_margin_pct': round(kpis_result.get('avg_margin_pct', 0) or 0, 2)
            },
            'series': {
                'margin_trend': margin_trend.to_dict('records')
            },
            'comparisons': comparisons
        }
    
    except Exception as e:
        logger.error(f"KPI error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/insights")
async def get_insights(request: InsightRequest):
    """Generate AI-powered insights"""
    try:
        result = await generate_insight(request.question, request.contextFilters)
        return result
    except Exception as e:
        logger.error(f"Insight error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/insights/prompts")
async def get_sample_prompts():
    """Get pre-baked sample prompts"""
    return {'prompts': SAMPLE_PROMPTS}

@api_router.get("/powerbi-token")
async def get_powerbi_token():
    """Get Power BI embed token or offline mode flag"""
    demo_mode = os.getenv("NEXT_PUBLIC_DEMO_MODE", "offline")
    
    if demo_mode == "offline":
        return {
            'mode': 'offline',
            'message': 'Using offline demo mode'
        }
    else:
        # In production, implement Power BI token exchange
        # using POWERBI_* environment variables
        return {
            'mode': 'online',
            'token': 'placeholder-implement-powerbi-auth',
            'message': 'Power BI online mode - implement token exchange'
        }

@api_router.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get report metadata for offline rendering"""
    # Return precomputed data for offline mode
    reports_dir = Path(__file__).parent.parent / 'samples' / 'precomputed'
    report_file = reports_dir / f"{report_id}.json"
    
    if report_file.exists():
        with open(report_file, 'r') as f:
            return json.load(f)
    else:
        return {
            'status': 'not_found',
            'report_id': report_id,
            'message': 'Report data not available'
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down API")
