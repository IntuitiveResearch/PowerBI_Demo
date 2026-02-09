import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import KPICard from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Factory, Zap, TrendingUp, Package, MessageCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AIChatModal from '@/components/AIChatModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage({ user }) {
  const [role, setRole] = useState(user?.role || 'CXO');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [plant, setPlant] = useState('all');
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role,
        start: dateRange.start,
        end: dateRange.end,
        plant
      });

      const response = await fetch(`${API}/kpis?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      } else {
        toast.error('Failed to load KPIs');
      }
    } catch (error) {
      toast.error('Network error loading KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [role, dateRange, plant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Role: <span className="font-medium text-foreground">{role}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Selector */}
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="role-selector" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CXO">CXO</SelectItem>
                <SelectItem value="Plant Head">Plant Head</SelectItem>
                <SelectItem value="Energy Manager">Energy Manager</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>

            {/* Plant Filter */}
            <Select value={plant} onValueChange={setPlant}>
              <SelectTrigger data-testid="plant-selector" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plants</SelectItem>
                <SelectItem value="Lumshnong">Lumshnong</SelectItem>
                <SelectItem value="Sonapur">Sonapur</SelectItem>
                <SelectItem value="Siliguri">Siliguri</SelectItem>
                <SelectItem value="Jalpaiguri">Jalpaiguri</SelectItem>
                <SelectItem value="Guwahati">Guwahati</SelectItem>
              </SelectContent>
            </Select>

            {/* AI Chat Button */}
            <Button
              data-testid="ai-chat-button"
              onClick={() => setShowAIChat(true)}
              className="btn-primary"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        {kpis && kpis.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {role === 'CXO' && (
              <>
                <KPICard
                  dataTestId="kpi-cement-production"
                  label="Total Cement Production"
                  value={kpis.kpis.total_cement_mt}
                  unit="MT"
                  icon={Factory}
                />
                <KPICard
                  dataTestId="kpi-ebitda"
                  label="Avg EBITDA per Ton"
                  value={kpis.kpis.avg_ebitda_ton}
                  unit="₹/MT"
                  icon={TrendingUp}
                />
                <KPICard
                  dataTestId="kpi-cost"
                  label="Avg Cost per Ton"
                  value={kpis.kpis.avg_cost_ton}
                  unit="₹/MT"
                  icon={Package}
                />
                <KPICard
                  dataTestId="kpi-margin"
                  label="Avg Margin"
                  value={kpis.kpis.avg_margin_pct}
                  unit="%"
                  icon={TrendingUp}
                />
              </>
            )}
            
            {role === 'Plant Head' && (
              <>
                <KPICard
                  dataTestId="kpi-daily-cement"
                  label="Avg Daily Cement"
                  value={kpis.kpis.avg_daily_cement}
                  unit="MT/Day"
                  icon={Factory}
                />
                <KPICard
                  dataTestId="kpi-capacity"
                  label="Capacity Utilization"
                  value={kpis.kpis.avg_capacity_util}
                  unit="%"
                  icon={TrendingUp}
                />
                <KPICard
                  dataTestId="kpi-downtime"
                  label="Avg Downtime"
                  value={kpis.kpis.avg_downtime_hrs}
                  unit="hrs"
                  icon={Zap}
                />
                <KPICard
                  dataTestId="kpi-mtbf"
                  label="Avg MTBF"
                  value={kpis.kpis.avg_mtbf_hrs}
                  unit="hrs"
                  icon={Package}
                />
              </>
            )}
            
            {role === 'Energy Manager' && (
              <>
                <KPICard
                  dataTestId="kpi-power"
                  label="Avg Power Consumption"
                  value={kpis.kpis.avg_power_kwh_ton}
                  unit="kWh/T"
                  icon={Zap}
                />
                <KPICard
                  dataTestId="kpi-heat"
                  label="Avg Heat Consumption"
                  value={kpis.kpis.avg_heat_kcal_kg}
                  unit="kcal/kg"
                  icon={TrendingUp}
                />
                <KPICard
                  dataTestId="kpi-fuel-cost"
                  label="Avg Fuel Cost"
                  value={kpis.kpis.avg_fuel_cost_ton}
                  unit="₹/T"
                  icon={Package}
                />
                <KPICard
                  dataTestId="kpi-afr"
                  label="Avg AFR"
                  value={kpis.kpis.avg_afr_pct}
                  unit="%"
                  icon={TrendingUp}
                />
              </>
            )}
            
            {role === 'Sales' && (
              <>
                <KPICard
                  dataTestId="kpi-dispatch"
                  label="Total Dispatch"
                  value={kpis.kpis.total_dispatch_mt}
                  unit="MT"
                  icon={Package}
                />
                <KPICard
                  dataTestId="kpi-realization"
                  label="Avg Realization"
                  value={kpis.kpis.avg_realization_ton}
                  unit="₹/T"
                  icon={TrendingUp}
                />
                <KPICard
                  dataTestId="kpi-freight"
                  label="Avg Freight Cost"
                  value={kpis.kpis.avg_freight_ton}
                  unit="₹/T"
                  icon={Zap}
                />
                <KPICard
                  dataTestId="kpi-otif"
                  label="Avg OTIF"
                  value={kpis.kpis.avg_otif_pct}
                  unit="%"
                  icon={Package}
                />
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Role-specific Trend Chart */}
          {kpis && kpis.series && kpis.series.trends && (
            <div className="kpi-card p-6" data-testid="trend-chart">
              <h3 className="text-lg font-heading font-semibold mb-4">
                {role === 'CXO' && 'EBITDA & Margin Trend'}
                {role === 'Plant Head' && 'Capacity & Downtime Trend'}
                {role === 'Energy Manager' && 'Power & AFR Trend'}
                {role === 'Sales' && 'Realization & OTIF Trend'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={kpis.series.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  {role === 'CXO' && (
                    <>
                      <Line type="monotone" dataKey="ebitda" stroke="#0E7490" strokeWidth={2} name="EBITDA" />
                      <Line type="monotone" dataKey="margin" stroke="#F97316" strokeWidth={2} name="Margin %" />
                    </>
                  )}
                  {role === 'Plant Head' && (
                    <>
                      <Line type="monotone" dataKey="capacity" stroke="#0E7490" strokeWidth={2} name="Capacity %" />
                      <Line type="monotone" dataKey="downtime" stroke="#F97316" strokeWidth={2} name="Downtime hrs" />
                    </>
                  )}
                  {role === 'Energy Manager' && (
                    <>
                      <Line type="monotone" dataKey="power" stroke="#0E7490" strokeWidth={2} name="Power kWh/T" />
                      <Line type="monotone" dataKey="afr" stroke="#F97316" strokeWidth={2} name="AFR %" />
                    </>
                  )}
                  {role === 'Sales' && (
                    <>
                      <Line type="monotone" dataKey="realization" stroke="#0E7490" strokeWidth={2} name="Realization" />
                      <Line type="monotone" dataKey="otif" stroke="#F97316" strokeWidth={2} name="OTIF %" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Plant Comparison */}
          {kpis && kpis.comparisons && (
            <div className="kpi-card p-6" data-testid="plant-comparison-chart">
              <h3 className="text-lg font-heading font-semibold mb-4">Plant Performance (EBITDA/Ton)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpis.comparisons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="plant_name" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="ebitda_ton" 
                    fill="#0E7490"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Additional Role-Specific KPIs */}
        {kpis && kpis.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {role === 'CXO' && (
              <>
                <KPICard
                  dataTestId="kpi-capacity"
                  label="Avg Capacity Utilization"
                  value={kpis.kpis.avg_capacity_util}
                  unit="%"
                />
                <KPICard
                  dataTestId="kpi-clinker-factor"
                  label="Avg Clinker Factor"
                  value={kpis.kpis.avg_clinker_factor}
                  unit=""
                />
                <KPICard
                  dataTestId="kpi-otif"
                  label="Avg OTIF"
                  value={kpis.kpis.avg_otif_pct}
                  unit="%"
                />
              </>
            )}
            
            {role === 'Plant Head' && (
              <>
                <KPICard
                  dataTestId="kpi-blaine"
                  label="Avg Blaine"
                  value={kpis.kpis.avg_blaine}
                  unit=""
                />
                <KPICard
                  dataTestId="kpi-strength"
                  label="Avg 28D Strength"
                  value={kpis.kpis.avg_strength_28d}
                  unit="MPa"
                />
                <KPICard
                  dataTestId="kpi-mttr"
                  label="Avg MTTR"
                  value={kpis.kpis.avg_mttr_hrs}
                  unit="hrs"
                />
              </>
            )}
            
            {role === 'Energy Manager' && (
              <>
                <KPICard
                  dataTestId="kpi-power-variance"
                  label="Power Variance (Best vs Worst)"
                  value={kpis.kpis.power_variance}
                  unit="kWh/T"
                />
                <KPICard
                  dataTestId="kpi-best-power"
                  label="Best Power Performance"
                  value={kpis.kpis.best_power}
                  unit="kWh/T"
                />
                <KPICard
                  dataTestId="kpi-worst-power"
                  label="Improvement Opportunity"
                  value={kpis.kpis.worst_power}
                  unit="kWh/T"
                />
              </>
            )}
            
            {role === 'Sales' && (
              <>
                <KPICard
                  dataTestId="kpi-margin"
                  label="Avg Margin"
                  value={kpis.kpis.avg_margin_pct}
                  unit="%"
                />
                <KPICard
                  dataTestId="kpi-price-variance"
                  label="Price Variance (Best vs Worst)"
                  value={kpis.kpis.price_variance}
                  unit="₹/T"
                />
                <KPICard
                  dataTestId="kpi-ebitda"
                  label="Avg EBITDA Contribution"
                  value={kpis.kpis.avg_ebitda_ton}
                  unit="₹/T"
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      <AIChatModal 
        open={showAIChat} 
        onClose={() => setShowAIChat(false)}
        contextFilters={{ start: dateRange.start, end: dateRange.end, plant }}
      />
    </div>
  );
}
