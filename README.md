# Star Cement KPI Platform

**Production-ready full-stack analytics platform for cement manufacturing operations**

## Overview

The Star Cement KPI Platform is a comprehensive data analytics solution that enables executives and managers to:
- Upload Excel-based operational data
- Automatically transform data into a star-schema analytical database
- View role-specific KPI dashboards
- Generate AI-powered insights using natural language queries
- Access Power BI embedded reports (online mode) or static visualizations (offline demo)

## Technology Stack

**Backend:**
- Python 3.11+ with FastAPI
- DuckDB (embedded analytical database)
- Pandas for data processing
- emergentintegrations for OpenAI GPT-4o integration
- JWT authentication

**Frontend:**
- React 19 with React Router
- Tailwind CSS with custom industrial design theme
- Recharts for data visualization
- Shadcn/UI components
- Power BI Client (for online mode)

**Database:**
- DuckDB star schema with dimension and fact tables
- MongoDB for session/metadata storage

## Quick Start

### Prerequisites

- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB (local or remote)

### Local Development

1. **Clone and setup:**
```bash
cd /app
```

2. **Backend setup:**
```bash
cd backend
pip install -r requirements.txt
python database.py  # Initialize star schema
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

3. **Frontend setup:**
```bash
cd frontend
yarn install
yarn start  # Runs on port 3000
```

4. **Access the application:**
   - Open http://localhost:3000
   - Login with demo credentials (see below)

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@starcement.com | Demo1234! | CXO |
| plant@starcement.com | Plant1234! | Plant Head |
| energy@starcement.com | Energy1234! | Energy Manager |
| sales@starcement.com | Sales1234! | Sales |

## Environment Variables

### Backend (.env)

```bash
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="star_cement_kpi"

# Security
JWT_SECRET=star-cement-secret-key-change-in-production
CORS_ORIGINS="*"

# Demo Mode
NEXT_PUBLIC_DEMO_MODE=offline  # or "online"

# Demo Auth
APP_DEMO_ADMIN_EMAIL=demo@starcement.com
APP_DEMO_ADMIN_PASSWORD=Demo1234!

# AI Integration (using Emergent LLM key)
EMERGENT_LLM_KEY=sk-emergent-9De2fD5D9AbC39f48E

# Power BI (optional, for online mode only)
POWERBI_TENANT_ID=your-tenant-id
POWERBI_CLIENT_ID=your-client-id
POWERBI_CLIENT_SECRET=your-client-secret
POWERBI_WORKSPACE_ID=your-workspace-id
POWERBI_REPORT_CXO_ID=your-report-id
```

### Frontend (.env)

```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Data Model: Star Schema

### Dimension Tables

**dim_date**
- date (PK), year, month, day, month_name, quarter

**dim_plant**
- plant_id (PK), plant_name (UK), region

### Fact Tables

**fact_production**
- date, plant_name, line, cement_mt, clinker_mt, capacity_util_pct, downtime_hrs

**fact_energy**
- date, plant_name, power_kwh_ton, heat_kcal_kg, fuel_cost_rs_ton, afr_pct

**fact_maintenance**
- date, plant_name, equipment, breakdown_hrs, mtbf_hrs, mttr_hrs

**fact_quality**
- date, plant_name, blaine, strength_28d, clinker_factor

**fact_sales**
- date, plant_name, region, dispatch_mt, realization_rs_ton, freight_rs_ton, otif_pct

**fact_finance**
- date, plant_name, cost_rs_ton, ebitda_rs_ton, margin_pct

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info

### Data Management

- `POST /api/upload` - Upload Excel file (multipart/form-data)
- `GET /api/schema` - Get star schema metadata

### Analytics

- `GET /api/kpis?role=CXO&start=YYYY-MM-DD&end=YYYY-MM-DD&plant=all` - Get KPI aggregates
- `POST /api/insights` - Generate AI-powered insights
- `GET /api/insights/prompts` - Get sample prompts

### Power BI

- `GET /api/powerbi-token` - Get embed token (online mode)
- `GET /api/reports/:reportId` - Get offline report data

## AI Insights Feature

### How It Works

1. **Question Classification:** Identifies query type (EBITDA drop, energy anomaly, etc.)
2. **SQL Execution:** Runs deterministic SQL queries to compute numeric evidence
3. **LLM Synthesis:** Sends computed metrics to OpenAI GPT-4o for human-readable explanation
4. **Structured Output:** Returns summary, causes, and recommended actions with evidence

### Sample Questions

- "Why did EBITDA drop in the recent month?"
- "Which plants have energy consumption anomalies?"
- "What are the root causes of downtime?"
- "Where are we losing margin?"
- "Compare plant performance across regions"

### Safe Usage Notes

- **No Hallucination:** LLM receives only pre-computed metrics, cannot invent facts
- **Evidence-Based:** All insights backed by SQL queries and numeric evidence
- **Rate Limited:** API calls are rate-limited to prevent abuse

## Offline vs Online Demo Mode

### Offline Mode (Default)

- Uses Recharts for all visualizations
- Precomputed aggregates in `/samples/precomputed/`
- No Power BI authentication required
- Perfect for in-room demos without internet

### Online Mode

- Embeds live Power BI reports
- Requires Power BI Service credentials
- See `docs/powerbi-setup.md` for configuration

## 10-Minute Demo Script

See `docs/demo-script.md` for a complete walkthrough including:
- Login flow
- Data upload
- Dashboard exploration
- AI insights demo
- Mode switching

## Deployment

### Current Deployment (Emergent Platform)

The application is already deployed and running on the Emergent platform with:
- Backend: FastAPI on port 8001
- Frontend: React on port 3000
- Kubernetes ingress with `/api` routing
- Hot reload enabled for development

### Vercel Deployment (Alternative)

1. **Backend:** Deploy to a Python hosting service (Railway, Render, etc.)
2. **Frontend:** Deploy to Vercel
3. **Configuration:**
   - Update `REACT_APP_BACKEND_URL` to point to deployed backend
   - Set all required environment variables in hosting dashboards

### GitHub Actions CI/CD

Example workflow at `.github/workflows/deploy.yml` (to be created) would:
- Run tests
- Build frontend
- Deploy to Vercel on push to main

## Excel Upload Format

Your Excel file must contain these sheets:

### Production
- Date, Plant, Line, Cement_MT, Clinker_MT, Capacity_Util_%, Downtime_Hrs

### Energy
- Date, Plant, Power_kWh_Ton, Heat_kcal_kg, Fuel_Cost_Rs_Ton, AFR_%

### Maintenance
- Date, Plant, Equipment, Breakdown_Hrs, MTBF_Hrs, MTTR_Hrs

### Quality
- Date, Plant, Blaine, Strength_28D, Clinker_Factor

### Sales_Logistics
- Date, Plant, Region, Dispatch_MT, Realization_Rs_Ton, Freight_Rs_Ton, OTIF_%

### Finance
- Date, Plant, Cost_Rs_Ton, EBITDA_Rs_Ton, Margin_%

Sample file: `/app/samples/StarCement_DemoData.xlsx`

## Troubleshooting

### Backend not starting
```bash
# Check logs
tail -n 100 /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend not loading
```bash
# Check for port conflicts
lsof -i :3000

# Reinstall dependencies
cd /app/frontend && yarn install
```

### Database issues
```bash
# Reinitialize schema
cd /app/backend
python database.py
```

## Security Considerations

**For Production Deployment:**

1. Change JWT_SECRET to a strong random value
2. Replace demo passwords
3. Implement rate limiting on all endpoints
4. Use HTTPS only
5. Sanitize all Excel uploads
6. Implement proper role-based access control
7. Store secrets in environment variables or secret managers

## Project Structure

```
star-cement-kpi-platform/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── database.py         # DuckDB schema initialization
│   ├── auth.py             # JWT authentication
│   ├── excel_processor.py  # Excel validation and parsing
│   ├── data_ingestion.py   # Star schema data loading
│   ├── ai_insights.py      # AI-powered analytics
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── UploadPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── AdminPage.js
│   │   ├── components/
│   │   │   ├── NavBar.js
│   │   │   ├── KPICard.js
│   │   │   ├── AIChatModal.js
│   │   │   └── ui/          # Shadcn components
│   │   ├── index.css
│   │   └── App.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
├── samples/
│   ├── StarCement_DemoData.xlsx
│   └── precomputed/        # Offline mode data
├── powerbi/
│   └── README.md           # Power BI setup notes
├── docs/
│   ├── demo-script.md
│   ├── powerbi-setup.md
│   └── ai-prompts.md
└── README.md
```

## Contributing

This is a production application for Star Cement. For modifications:
1. Create a feature branch
2. Test thoroughly with sample data
3. Update documentation
4. Submit for review

## License

© 2025 Star Cement. All rights reserved.

## Support

For technical issues or questions, contact the development team.
