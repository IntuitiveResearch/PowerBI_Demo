import React from 'react';
import NavBar from '@/components/NavBar';
import { Settings, Database, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPage({ user }) {
  const demoMode = 'offline'; // Always offline

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
            Admin Settings
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Platform configuration - Offline Demo Mode
          </p>
        </div>

        {/* Demo Mode Setting */}
        <div className="kpi-card mb-6 bg-primary/5 border-primary/20" data-testid="demo-mode-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-semibold">Demo Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Platform is configured for <strong>Offline Demo Mode</strong> using static charts and precomputed data. No Power BI authentication required.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 px-4 py-2 bg-primary/10 rounded-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Offline Mode Active
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-sm">
                <p className="text-xs text-muted-foreground">
                  <strong>Benefits:</strong> Works without internet • No Power BI credentials needed • Perfect for in-room demos • Uses Recharts for all visualizations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Info */}
        <div className="kpi-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-semibold">Data & Visualization</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visualization Library:</span>
              <span className="font-mono font-medium">Recharts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Source:</span>
              <span className="font-mono font-medium">DuckDB + Precomputed JSON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precomputed Reports:</span>
              <span className="font-mono font-medium">CXO, Plant, Energy, Sales</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Real-time Data:</span>
              <span className="font-mono font-medium text-success">✓ Available via API</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="kpi-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-semibold">Database</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Engine:</span>
              <span className="font-mono">DuckDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-mono">/app/backend/star_cement.duckdb</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schema:</span>
              <span className="font-mono">Star Schema (9 tables)</span>
            </div>
          </div>
        </div>

        {/* Demo Users */}
        <div className="kpi-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-semibold">Demo Users</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">demo@starcement.com</p>
                <p className="text-muted-foreground">Password: Demo1234!</p>
                <p className="text-xs text-muted-foreground mt-1">Role: CXO</p>
              </div>
              <div>
                <p className="font-medium">plant@starcement.com</p>
                <p className="text-muted-foreground">Password: Plant1234!</p>
                <p className="text-xs text-muted-foreground mt-1">Role: Plant Head</p>
              </div>
              <div>
                <p className="font-medium">energy@starcement.com</p>
                <p className="text-muted-foreground">Password: Energy1234!</p>
                <p className="text-xs text-muted-foreground mt-1">Role: Energy Manager</p>
              </div>
              <div>
                <p className="font-medium">sales@starcement.com</p>
                <p className="text-muted-foreground">Password: Sales1234!</p>
                <p className="text-xs text-muted-foreground mt-1">Role: Sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Mode Info */}
        <div className="kpi-card bg-muted/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-heading font-semibold mb-2">About Offline Mode</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This platform is configured to work entirely offline using:
              </p>
              <ul className="text-sm space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Recharts</strong> for all data visualizations (charts, graphs, KPI cards)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>DuckDB</strong> for analytical queries on uploaded data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Precomputed JSON</strong> files in <code className="bg-muted px-1 rounded text-xs">/samples/precomputed/</code> for demo reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>OpenAI GPT-4o</strong> via Emergent LLM key for AI insights (internet required only for AI)</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Power BI embedding is not enabled. All dashboards use native React visualizations. For Power BI integration, see <code className="bg-muted px-1 rounded text-xs">/app/docs/powerbi-setup.md</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
