# Offline Demo Mode - Star Cement KPI Platform

## Overview

The Star Cement KPI Platform is configured to run entirely in **Offline Demo Mode**, perfect for in-room presentations, demos without internet connectivity, or environments where Power BI access is not available.

## What's Included

### ✅ Fully Functional Features

1. **Authentication** - JWT-based login with 4 demo roles
2. **Data Upload** - Excel file processing and star-schema ingestion
3. **Analytics Database** - DuckDB with dimension and fact tables
4. **KPI Dashboards** - Role-specific views (CXO, Plant Head, Energy Manager, Sales)
5. **Data Visualizations** - All charts powered by Recharts library
6. **AI Insights** - Natural language queries with OpenAI GPT-4o (requires internet for AI only)
7. **Precomputed Reports** - Static report data for instant demo

### 📊 Visualization Library

**Recharts** - A composable charting library built on React components
- Line charts for trends
- Bar charts for comparisons
- Responsive and customizable
- No external dependencies
- Works completely offline (except AI)

### 💾 Data Sources

1. **Real-time Data**: Uploaded Excel → DuckDB → API → Dashboard
2. **Precomputed Data**: JSON files in `/samples/precomputed/` for instant demo

Available precomputed reports:
- `cxo.json` - Executive dashboard data
- `plant.json` - Plant operations data
- `energy.json` - Energy management data
- `sales.json` - Sales & logistics data

### 🔧 Technical Architecture

```
User → React Frontend (Recharts) → FastAPI Backend → DuckDB
                                                   ↓
                                            Precomputed JSON
```

**Key Components:**
- **Frontend**: React 19, Tailwind CSS, Recharts, Shadcn/UI
- **Backend**: FastAPI, DuckDB, Pandas, emergentintegrations
- **Database**: DuckDB (embedded analytical database)
- **AI**: OpenAI GPT-4o via Emergent LLM key

## Demo Workflow

### 1. Login
- Use any demo account (CXO, Plant Head, Energy Manager, Sales)
- Credentials in README.md

### 2. Upload Data
- Navigate to Upload page
- Drag & drop `/app/samples/StarCement_DemoData.xlsx`
- Data is validated, transformed, and loaded into DuckDB
- Works completely offline

### 3. View Dashboards
- Real-time KPIs from uploaded data
- Interactive charts (Recharts)
- Plant comparisons, trends, performance metrics
- All rendered client-side, no external dependencies

### 4. AI Insights
- Click "Ask AI" button
- Select sample prompt or type custom question
- **Note**: Requires internet connection for OpenAI API
- Returns structured insights with evidence

### 5. Admin Panel
- View configuration
- Check database status
- See demo user credentials

## Offline vs Online Comparison

| Feature | Offline Mode | Online Mode (Power BI) |
|---------|--------------|------------------------|
| Authentication | ✅ Works | ✅ Works |
| Data Upload | ✅ Works | ✅ Works |
| KPI Dashboards | ✅ Recharts | ✅ Power BI Embed |
| Charts & Graphs | ✅ Recharts | ✅ Power BI Visuals |
| AI Insights | ⚠️ Needs Internet | ⚠️ Needs Internet |
| Internet Required | ❌ No (except AI) | ✅ Yes |
| Power BI Credentials | ❌ Not Needed | ✅ Required |
| Demo Ready | ✅ Instant | ⚠️ Setup Required |

## Benefits of Offline Mode

1. **No Setup Required** - Works out of the box
2. **No Credentials Needed** - No Power BI, Azure AD, or API keys (except optional AI)
3. **Perfect for Demos** - Works in conference rooms without internet
4. **Fast Performance** - All rendering done client-side
5. **Full Control** - Complete visibility into data flow
6. **Cost Effective** - No Power BI licenses required
7. **Portable** - Can be deployed anywhere

## AI Insights (Optional Internet)

The AI feature is the only component requiring internet:
- Uses OpenAI GPT-4o via Emergent LLM key
- Generates insights from computed metrics
- Can be disabled if full offline is required
- All other features work without AI

To disable AI completely:
- Remove "Ask AI" button from dashboard
- Comment out AI endpoints in backend

## Testing Offline Mode

1. **Disconnect from internet** (except for initial git clone)
2. Start backend: `cd /app/backend && uvicorn server:app --host 0.0.0.0 --port 8001`
3. Start frontend: `cd /app/frontend && yarn start`
4. Navigate to http://localhost:3000
5. Login → Upload → Dashboard → Works!

## Switching to Online Mode (Power BI)

If you want to enable Power BI embedding:

1. Follow `/app/docs/powerbi-setup.md`
2. Configure Azure AD app
3. Set environment variables
4. Update `NEXT_PUBLIC_DEMO_MODE=online` in backend/.env
5. Implement token exchange in `/api/powerbi-token`

## Files & Directories

```
/app/
├── samples/
│   ├── StarCement_DemoData.xlsx  # Sample data for upload
│   └── precomputed/               # Precomputed reports
│       ├── cxo.json
│       ├── plant.json
│       ├── energy.json
│       └── sales.json
├── frontend/
│   └── src/
│       ├── components/
│       │   └── KPICard.js        # Recharts components
│       └── pages/
│           └── DashboardPage.js  # Main dashboard
└── backend/
    ├── server.py                  # API endpoints
    ├── database.py                # DuckDB schema
    └── ai_insights.py             # AI integration
```

## Production Deployment

Offline mode is production-ready:
- Deploy frontend to static hosting (Vercel, Netlify, S3)
- Deploy backend to Python hosting (Railway, Render, AWS Lambda)
- No additional services required
- Works behind corporate firewalls
- No external API dependencies (except optional AI)

## Support

For questions or issues with offline mode:
- Check README.md for setup instructions
- Review demo script in /app/docs/demo-script.md
- Contact: Development Team

---

**Current Status**: ✅ Fully Operational in Offline Mode
**Last Updated**: January 2025
