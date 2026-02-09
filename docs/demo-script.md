# 10-Minute Demo Script for Star Cement KPI Platform

## Pre-Demo Setup (5 minutes before)

1. Ensure backend and frontend are running
2. Have the sample Excel file ready: `/app/samples/StarCement_DemoData.xlsx`
3. Open browser to login page
4. Prepare talking points based on audience role (CXO, Operations, IT)

## Demo Flow (10 minutes)

### 1. Login & Introduction (1 minute)

**Action:**
- Navigate to the login page
- Click the "CXO" demo button to auto-fill credentials
- Click "Sign In"

**Talking Points:**
> "Welcome to the Star Cement KPI Platform - a production-ready analytics solution designed specifically for cement manufacturing operations. The platform supports role-based access with four key roles: CXO, Plant Head, Energy Manager, and Sales. Let me show you the CXO view first."

**What They See:**
- Professional industrial-themed login page
- Clean authentication flow
- Immediate redirection to dashboard

---

### 2. Dashboard Overview (2 minutes)

**Action:**
- Point out the top KPI cards (Total Cement Production, EBITDA, Power Consumption, Margin)
- Highlight the role selector dropdown (currently "CXO")
- Show the plant filter (currently "All Plants")

**Talking Points:**
> "The dashboard provides real-time KPIs tailored to each role. As a CXO, I'm seeing enterprise-wide metrics across all five plants. Notice the key financial metrics - EBITDA per ton at ₹X, margin at Y%. The data is pulled from our star-schema analytical database built on DuckDB."

**Demonstrate:**
- Switch role to "Plant Head" - observe how the view emphasizes operational metrics
- Switch plant filter to "Lumshnong" - show plant-specific data
- Switch back to "CXO" and "All Plants"

**What They See:**
- High-density Bento Grid layout
- Industrial color scheme (Deep Teal primary)
- Real-time data updates
- Margin trend line chart
- Plant comparison bar chart

---

### 3. Data Upload Feature (2 minutes)

**Action:**
- Click "Upload" in the navigation bar
- Drag and drop (or browse) the sample Excel file
- Click "Upload & Process"
- Wait for success message

**Talking Points:**
> "One of the platform's key features is automated data ingestion. You simply upload a structured Excel file containing your production, energy, maintenance, quality, sales, and finance data. The system validates the structure, transforms it into a star schema, and loads it into the analytical database - all in seconds. This eliminates manual data entry and ensures consistency."

**What They See:**
- Drag-and-drop upload zone with clear visual feedback
- File validation
- Preview of uploaded data
- Statistics (number of rows per sheet, date range, plants)
- Success confirmation with "View Dashboards" button

**Talking Points (Success Screen):**
> "The upload processed 18 months of daily data across 5 plants - over 10,000 data points. The system automatically populated our dimension tables (dates, plants) and six fact tables (production, energy, maintenance, quality, sales, finance). Now let's see the updated dashboards."

---

### 4. AI Insights - "Ask My Data" (3 minutes)

**Action:**
- Click "View Dashboards" or navigate back to Dashboard
- Click the "Ask AI" button
- Select a sample prompt: "Why did EBITDA drop in the recent month?"
- Click Send
- Wait for AI response (5-10 seconds)

**Talking Points (While Waiting):**
> "This is where it gets interesting. The AI Insights feature lets you ask natural language questions about your data. Behind the scenes, the system classifies your question, runs SQL queries to extract numeric evidence, and then uses OpenAI GPT-4o to synthesize a human-readable explanation with recommended actions. Critically, the AI cannot hallucinate - it only uses the computed metrics we provide."

**What They See:**
- Modal with sample prompts
- Loading state
- Structured insight response:
  - **Summary:** Concise explanation (120 words max)
  - **Identified Causes:** 2-3 root causes
  - **Recommended Actions:** 3 prioritized actions (8-12 words each)
  - **Evidence:** Expandable section with SQL query and computed metrics

**Action:**
- Expand "Show Evidence & SQL Query"
- Point out the computed metrics (e.g., EBITDA delta, cost delta)
- Point out the SQL query used

**Talking Points:**
> "Notice the response is structured and actionable. It's telling us EBITDA dropped by ₹85/ton, identifies fuel cost increase and lower AFR as causes, and recommends three specific actions. If I expand the evidence section, you can see the exact SQL query and metrics used - complete transparency, no black box."

**Demonstrate (Optional):**
- Click "Ask Another Question"
- Try another sample prompt: "Which plants have energy consumption anomalies?"

---

### 5. Admin & Mode Switching (1 minute)

**Action:**
- Navigate to "Admin" page
- Point out the Demo Mode toggle
- Show demo user credentials
- Highlight Power BI setup instructions

**Talking Points:**
> "The platform supports two modes: Offline Demo for in-room presentations without external dependencies, and Online Mode which embeds live Power BI reports. We're currently in offline mode using Recharts. For production deployment, you'd configure Power BI credentials here and switch to online mode. The admin panel also shows our database configuration - we're using DuckDB for analytical queries and MongoDB for session management."

---

### 6. Wrap-Up & Key Takeaways (1 minute)

**Talking Points:**
> "To summarize what we've just seen:
> 1. **Role-Based Dashboards:** Tailored KPIs for CXOs, Plant Heads, Energy Managers, and Sales teams
> 2. **Automated Data Ingestion:** Upload Excel, get instant analytics - no manual data entry
> 3. **AI-Powered Insights:** Ask natural language questions, get evidence-based recommendations
> 4. **Flexible Deployment:** Offline demo mode or online with Power BI embedding
> 5. **Production-Ready:** JWT auth, star-schema database, rate-limited APIs, and comprehensive documentation
>
> The platform is built with FastAPI backend, React frontend, DuckDB for analytics, and OpenAI for insights. It's deployed on Kubernetes with hot reload for rapid development. All code is documented, tested, and ready for production use."

**Next Steps:**
- Provide access credentials
- Share documentation (README.md, API docs)
- Schedule training session
- Discuss customization requirements

---

## Audience-Specific Adjustments

### For CXO/Business Executives
- Emphasize business impact: faster decision-making, data-driven insights
- Highlight ROI: reduced manual work, actionable recommendations
- Focus on AI insights and strategic dashboards
- Skip technical details (database schema, APIs)

### For Plant Managers/Operations
- Emphasize operational metrics: capacity utilization, downtime, maintenance
- Show plant-specific filtering
- Demonstrate energy and quality dashboards
- Highlight drill-down capabilities

### For IT/Technical Teams
- Emphasize architecture: FastAPI, DuckDB, star schema
- Show API documentation and endpoints
- Discuss deployment options (Kubernetes, Vercel)
- Highlight security features (JWT, rate limiting)
- Explain data flow and database schema

### For Data/Analytics Teams
- Emphasize star schema design
- Show SQL query evidence in AI insights
- Discuss data validation and transformation logic
- Highlight extensibility (adding new KPIs, custom queries)

---

## Troubleshooting During Demo

### If upload fails:
- Check file format (must be .xlsx or .xls)
- Verify sample file exists at `/app/samples/StarCement_DemoData.xlsx`
- Check backend logs: `tail -n 50 /var/log/supervisor/backend.err.log`

### If AI insights timeout:
- Check EMERGENT_LLM_KEY in backend .env
- Try a different sample prompt
- Fallback: Show pre-recorded screenshot or video

### If dashboard shows no data:
- Ensure data has been uploaded
- Check database: `cd /app/backend && python -c "from database import get_db_connection; conn = get_db_connection(); print(conn.execute('SELECT COUNT(*) FROM fact_production').fetchall())"`

### If charts not rendering:
- Refresh page
- Check browser console for errors
- Verify Recharts is installed: `cd /app/frontend && yarn list recharts`

---

## Post-Demo Deliverables

1. **Access Credentials:** Share demo user credentials
2. **Documentation:** Provide README.md and API documentation
3. **Sample Data:** Share StarCement_DemoData.xlsx
4. **Deployment Guide:** docs/deployment.md (if deploying to client infrastructure)
5. **Training Materials:** This demo script and video recording
6. **Customization Proposal:** Next steps for client-specific requirements

---

## Demo Tips

- **Practice:** Run through the demo 2-3 times beforehand
- **Backup Plan:** Have screenshots/video ready if live demo fails
- **Engage Audience:** Ask questions, invite them to suggest queries for AI
- **Time Management:** Use a timer, skip sections if running over
- **Technical Check:** Test internet, backend, frontend 30 minutes before
- **Have Fun:** Show enthusiasm - this is a powerful platform!
