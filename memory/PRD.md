# Star Cement KPI Platform - Product Requirements Document

## Overview
A production-ready **AI Powered KPI Dashboard** for Star Cement Ltd, featuring offline-only mode with role-based dashboards and comprehensive visualizations resembling premium Power BI dashboards.

## Core Requirements
1. **Offline-Only Mode**: Data uploaded from Excel file (`StarCement_DemoData.xlsx`)
2. **Role-Based Dashboards**: CXO, Plant Head, Energy Manager, Sales Head - each with unique KPIs and charts
3. **Power BI-Style UI**: Vibrant colors, multiple chart types, dense information layout
4. **Compare Plants Mode**: Side-by-side comparison of 2-3 plants with detailed metrics
5. **AI Chat**: Powered by Emergent LLM Key for insights

## User Personas & Credentials
| Role | Email | Password |
|------|-------|----------|
| CXO | demo@starcement.com | Demo1234! |
| Plant Head | plant@starcement.com | Plant1234! |
| Energy Manager | energy@starcement.com | Energy1234! |
| Sales | sales@starcement.com | Sales1234! |

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Recharts
- **Backend**: FastAPI + DuckDB (file-based persistence)
- **Database**: `/app/backend/star_cement.duckdb`

## Implemented Features (December 2025)

### Branding Updates
- Updated to "AI Powered KPI Dashboard" across Login page and NavBar
- Added "AI Powered" badge on dashboard header
- Gradient logo styling (blue to purple)

### Compare Plants Mode (NEW)
- Select 2-3 plants for side-by-side comparison
- Plant selection panel with checkboxes
- Comparison modal with:
  - KPI Summary Cards (Production, EBITDA, Capacity, Power)
  - Performance Scorecard (Radar chart)
  - Financial Comparison (Horizontal bar chart)
  - Energy Efficiency (Grouped bar chart)
  - EBITDA Trend Comparison (Line chart)
  - Detailed Metrics Table with "Best" indicator
  - AI Comparison Insight (auto-generated analysis)

### Role-Specific Dashboards
Each role now has a completely different dashboard layout with relevant KPIs and charts:

| Role | Dashboard | Primary KPIs | Charts Focus |
|------|-----------|--------------|--------------|
| CXO | Executive Dashboard | EBITDA, Margin, Cost, Revenue | Financial trends, Cost bridge, Production mix |
| Plant Head | Operations Dashboard | Capacity Util, Uptime, Downtime, Quality | Production performance, Quality metrics, Maintenance |
| Energy Manager | Energy Dashboard | Power kWh/T, Heat, AFR%, Savings | Energy consumption trends, Plant comparison |
| Sales | Sales Dashboard | Dispatch, Realization, OTIF%, Revenue | Regional mix, Pricing, Delivery performance |

### Dashboard Visualizations (19+ charts)
1. **Primary KPI Cards** - 4 gradient cards with icons
2. **Compact KPI Grid** - 8+ secondary metrics with trends/targets
3. **Performance Trend** - Area chart with brush zoom
4. **Performance Radar** - Current vs Target metrics
5. **Plant EBITDA Comparison** - Horizontal bar chart
6. **Production Share** - Donut chart by plant
7. **Cost Bridge Analysis** - Waterfall chart
8. **Monthly Production & Capacity** - Combo chart (bar + line)
9. **Financial Trends** - Multi-line chart
10. **Energy Consumption** - Grouped bar chart
11. **Quality Metrics** - Grouped bar chart
12. **Regional Sales Mix** - Donut chart
13. **Maintenance KPIs** - Grouped bar chart
14. **Weekly Production Trend** - Area chart
15. **Bullet Charts** - 6 performance indicators vs targets
16. **Plant Performance Table** - Data table
17. **Energy Performance Table** - Data table
18. **EBITDA Distribution** - Pie chart
19. **Quick Insights Cards** - Summary metrics

### API Endpoints
- `POST /api/auth/login` - Authentication
- `POST /api/upload` - Excel file upload
- `GET /api/kpis` - Role-specific KPIs
- `GET /api/charts` - Comprehensive chart data
- `POST /api/insights` - AI-powered insights
- `GET /api/schema` - Database schema info

### Database Schema (Star Schema)
- **Dimensions**: dim_date, dim_plant
- **Facts**: fact_production, fact_energy, fact_maintenance, fact_quality, fact_sales, fact_finance

## Deployment Readiness
- [x] Environment variables secured (no hardcoded secrets)
- [x] .env files configured (frontend & backend)
- [x] .gitignore allows .env files for deployment
- [x] DuckDB file-based persistence enabled
- [x] All user logins working

## Known Limitations
- Database resets on file deletion (DuckDB file-based)
- Need to re-upload Excel data after database file removal
- Offline mode only - no real-time data sync

## Future Enhancements (Backlog)
1. Export dashboard as PDF/PNG
2. Custom date range picker
3. Drill-down into charts
4. Email alerts for KPI thresholds
5. Multi-language support
