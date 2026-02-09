import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Database, FileText, AlertCircle } from 'lucide-react';

export default function AdminPage({ user }) {
  const [demoMode, setDemoMode] = useState(
    process.env.REACT_APP_DEMO_MODE === 'offline'
  );

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
            Admin Settings
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Manage platform configuration and demo modes
          </p>
        </div>

        {/* Demo Mode Setting */}
        <div className="kpi-card mb-6" data-testid="demo-mode-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-semibold">Demo Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Switch between offline demo (static charts) and online mode (Power BI embed)
              </p>
              <div className="flex items-center gap-3">
                <Switch
                  data-testid="demo-mode-switch"
                  checked={demoMode}
                  onCheckedChange={setDemoMode}
                />
                <span className="text-sm font-medium">
                  {demoMode ? 'Offline Demo Mode' : 'Online Mode'}
                </span>
              </div>
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

        {/* Power BI Setup */}
        <div className="kpi-card bg-info/5 border-info/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-heading font-semibold mb-2">Power BI Setup</h3>
              <p className="text-sm text-muted-foreground mb-3">
                To enable online Power BI embedding, configure the following environment variables in <code className="bg-muted px-1 rounded">/app/backend/.env</code>:
              </p>
              <ul className="text-sm space-y-1 font-mono text-xs">
                <li>POWERBI_TENANT_ID</li>
                <li>POWERBI_CLIENT_ID</li>
                <li>POWERBI_CLIENT_SECRET</li>
                <li>POWERBI_WORKSPACE_ID</li>
                <li>POWERBI_REPORT_CXO_ID</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                See <code className="bg-muted px-1 rounded">docs/powerbi-setup.md</code> for detailed instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
