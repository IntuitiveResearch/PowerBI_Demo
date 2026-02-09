# Power BI Setup Guide

## Overview

The Star Cement KPI Platform supports embedding Power BI reports for online mode. This guide walks through the setup process.

## Prerequisites

1. **Power BI Pro or Premium License**
2. **Azure AD Application Registration**
3. **Power BI Service Workspace**
4. **Published Power BI Reports**

## Step 1: Create Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory > App registrations**
3. Click **New registration**
   - Name: `StarCement-KPI-Platform`
   - Supported account types: Single tenant
   - Redirect URI: Leave blank for now
4. Click **Register**

5. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

## Step 2: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
   - Description: `StarCement API Access`
   - Expires: 24 months (or your preference)
3. Click **Add**
4. **IMPORTANT:** Copy the **Value** immediately - you won't see it again
5. Note down:
   - **Client Secret Value**

## Step 3: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Power BI Service**
4. Select **Delegated permissions**
5. Check the following permissions:
   - `Report.Read.All`
   - `Dataset.Read.All`
   - `Workspace.Read.All`
6. Click **Add permissions**
7. Click **Grant admin consent** (requires admin privileges)

## Step 4: Enable Power BI Service Principal

1. Go to [Power BI Admin Portal](https://app.powerbi.com/admin-portal)
2. Navigate to **Tenant settings**
3. Scroll to **Developer settings**
4. Enable **Service principals can use Power BI APIs**
5. Add your app's **Application ID** to the security group or apply to entire organization
6. Click **Apply**

## Step 5: Create and Publish Power BI Reports

### Report Requirements

Create the following reports in Power BI Desktop:

1. **CXO Dashboard** (`cxodashboard.pbix`)
   - Enterprise-wide KPIs
   - Plant comparisons
   - Financial summaries
   - Trend analysis

2. **Plant Dashboard** (`plant.pbix`)
   - Plant-specific production metrics
   - Capacity utilization
   - Downtime analysis
   - Line-level performance

3. **Energy Dashboard** (`energy.pbix`)
   - Power consumption trends
   - Fuel cost analysis
   - AFR tracking
   - Heat rate optimization

4. **Sales Dashboard** (`sales.pbix`)
   - Dispatch volumes
   - Realization trends
   - Freight analysis
   - OTIF performance

### Data Source Connection

Connect your Power BI reports to:
- **DuckDB export** (export tables to CSV/Parquet and use as data source)
- **Direct SQL** (if using PostgreSQL/SQL Server instead of DuckDB)
- **Excel** (upload sample data for demo)

### Publish Reports

1. Open each report in Power BI Desktop
2. Click **File > Publish > Publish to Power BI**
3. Select your workspace (e.g., `StarCement-Analytics`)
4. Click **Select**
5. Note down the **Report ID** from the URL:
   - URL format: `https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}`

## Step 6: Configure Workspace Access

1. Go to [Power BI Service](https://app.powerbi.com)
2. Navigate to your workspace
3. Click **Access**
4. Add your service principal:
   - Enter your **Application ID**
   - Set role to **Viewer** or **Member**
5. Click **Add**

## Step 7: Get Workspace and Report IDs

### Workspace ID
1. Navigate to your workspace in Power BI Service
2. Copy the GUID from the URL:
   ```
   https://app.powerbi.com/groups/{workspace-id}/...
   ```

### Report IDs
1. Open each report
2. Copy the GUID from the URL:
   ```
   https://app.powerbi.com/groups/{workspace-id}/reports/{report-id}
   ```

## Step 8: Update Backend Environment Variables

Edit `/app/backend/.env`:

```bash
# Power BI Configuration
POWERBI_TENANT_ID=your-tenant-id-from-step-1
POWERBI_CLIENT_ID=your-client-id-from-step-1
POWERBI_CLIENT_SECRET=your-secret-value-from-step-2
POWERBI_WORKSPACE_ID=your-workspace-id-from-step-7

# Report IDs
POWERBI_REPORT_CXO_ID=your-cxo-report-id
POWERBI_REPORT_PLANT_ID=your-plant-report-id
POWERBI_REPORT_ENERGY_ID=your-energy-report-id
POWERBI_REPORT_SALES_ID=your-sales-report-id

# Set demo mode to online
NEXT_PUBLIC_DEMO_MODE=online
```

## Step 9: Implement Power BI Token Exchange

The backend API at `/api/powerbi-token` needs to be enhanced to exchange service principal credentials for an embed token. Here's the implementation:

```python
# Add to backend/server.py

import requests
import os

@api_router.get("/powerbi-token")
async def get_powerbi_token(report_id: str = None):
    """Get Power BI embed token"""
    demo_mode = os.getenv("NEXT_PUBLIC_DEMO_MODE", "offline")
    
    if demo_mode == "offline":
        return {'mode': 'offline', 'message': 'Using offline demo mode'}
    
    # Step 1: Get Azure AD token
    tenant_id = os.getenv("POWERBI_TENANT_ID")
    client_id = os.getenv("POWERBI_CLIENT_ID")
    client_secret = os.getenv("POWERBI_CLIENT_SECRET")
    
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    token_data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'https://analysis.windows.net/powerbi/api/.default'
    }
    
    token_response = requests.post(token_url, data=token_data)
    access_token = token_response.json().get('access_token')
    
    # Step 2: Get embed token
    workspace_id = os.getenv("POWERBI_WORKSPACE_ID")
    report_id = report_id or os.getenv("POWERBI_REPORT_CXO_ID")
    
    embed_url = f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/reports/{report_id}/GenerateToken"
    embed_data = {
        'accessLevel': 'View'
    }
    
    embed_response = requests.post(
        embed_url,
        headers={'Authorization': f'Bearer {access_token}'},
        json=embed_data
    )
    
    embed_token = embed_response.json().get('token')
    
    return {
        'mode': 'online',
        'token': embed_token,
        'reportId': report_id,
        'embedUrl': f'https://app.powerbi.com/reportEmbed?reportId={report_id}&groupId={workspace_id}'
    }
```

## Step 10: Update Frontend to Use Power BI Embed

Create a Power BI embed component:

```jsx
// frontend/src/components/PowerBIEmbed.js

import React, { useEffect, useRef } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

export default function PowerBIEmbedComponent({ reportId }) {
  const [embedConfig, setEmbedConfig] = useState(null);

  useEffect(() => {
    fetch(`${API}/powerbi-token?report_id=${reportId}`)
      .then(res => res.json())
      .then(data => {
        if (data.mode === 'online') {
          setEmbedConfig({
            type: 'report',
            id: data.reportId,
            embedUrl: data.embedUrl,
            accessToken: data.token,
            tokenType: models.TokenType.Embed,
            settings: {
              panes: {
                filters: { expanded: false, visible: false },
                pageNavigation: { visible: true }
              },
              background: models.BackgroundType.Transparent
            }
          });
        }
      });
  }, [reportId]);

  if (!embedConfig) {
    return <div>Loading Power BI report...</div>;
  }

  return (
    <PowerBIEmbed
      embedConfig={embedConfig}
      cssClassName="powerbi-embed"
    />
  );
}
```

## Step 11: Test the Integration

1. Restart backend: `sudo supervisorctl restart backend`
2. Restart frontend: `cd /app/frontend && yarn start`
3. Login to the platform
4. Navigate to Dashboard
5. Verify Power BI reports load correctly

## Troubleshooting

### "Invalid token" error
- Check that service principal has workspace access
- Verify client secret hasn't expired
- Ensure API permissions are granted

### "Report not found" error
- Verify report ID is correct
- Check workspace ID
- Ensure report is published

### "Access denied" error
- Add service principal to workspace with appropriate role
- Check tenant settings allow service principals

### Token expires quickly
- Embed tokens expire after 1 hour by default
- Implement token refresh logic in frontend
- Handle token expiration gracefully

## Best Practices

1. **Use Azure Key Vault** for storing secrets in production
2. **Implement token caching** to reduce API calls
3. **Set appropriate token expiration** (default 1 hour)
4. **Use dedicated service principal** per environment (dev, staging, prod)
5. **Monitor API usage** to avoid rate limits
6. **Test in offline mode first** before configuring Power BI

## Additional Resources

- [Power BI Embedded documentation](https://docs.microsoft.com/en-us/power-bi/developer/embedded/)
- [Power BI REST API reference](https://docs.microsoft.com/en-us/rest/api/power-bi/)
- [Azure AD app registration guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Support

For issues with Power BI integration, check:
1. Azure AD app configuration
2. Power BI service principal settings
3. Backend logs: `tail -f /var/log/supervisor/backend.err.log`
4. Browser console for frontend errors
