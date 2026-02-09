# Power BI Reports

## Report Files

Place your .pbix files here:

- `cxodashboard.pbix` - CXO executive dashboard
- `plant.pbix` - Plant operations dashboard
- `energy.pbix` - Energy management dashboard
- `sales.pbix` - Sales and logistics dashboard

## Publishing to Power BI Service

1. Open each .pbix file in Power BI Desktop
2. Click **File > Publish > Publish to Power BI**
3. Select workspace: `StarCement-Analytics` (or your workspace name)
4. Note the Report ID from the URL after publishing

## Configuration

After publishing, update `/app/backend/.env` with:

```bash
POWERBI_WORKSPACE_ID=your-workspace-id
POWERBI_REPORT_CXO_ID=your-cxo-report-id
POWERBI_REPORT_PLANT_ID=your-plant-report-id
POWERBI_REPORT_ENERGY_ID=your-energy-report-id
POWERBI_REPORT_SALES_ID=your-sales-report-id
```

## Detailed Setup

See `/app/docs/powerbi-setup.md` for complete setup instructions including:
- Azure AD app registration
- Service principal configuration
- API permissions
- Embed token generation

## Data Source

Power BI reports should connect to:
- Exported CSV/Parquet files from DuckDB
- Direct database connection (if using PostgreSQL/SQL Server)
- Sample Excel data for demo purposes

