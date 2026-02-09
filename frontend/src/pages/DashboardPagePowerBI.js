import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PowerBIKPICard from '@/components/PowerBIKPICard';
import CompactKPICard from '@/components/CompactKPICard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Factory, Zap, TrendingUp, Package, MessageCircle, DollarSign, Gauge, Flame, Truck, Activity } from 'lucide-react';
import { toast } from 'sonner';
import AIChatModal from '@/components/AIChatModal';
import { 
  DonutChart, GroupedBarChart, WaterfallChart, HorizontalBarChart,
  ComboChart, StackedAreaChart, RadarChartComponent, GaugeChart,
  BulletChart, MultiLineChart, StackedBarChart, TableChart
} from '@/components/AdvancedCharts';
import { getRoleGradients, POWERBI_COLORS } from '@/utils/powerBIColors';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Enhanced Custom tooltip
const CustomTooltip = ({ active, payload, label, role }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 max-w-xs">
        <p className="font-bold text-sm mb-2 border-b border-gray-600 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="mt-1">
            <p style={{ color: entry.color }} className="text-xs font-semibold">
              {entry.name}
            </p>
            <p className="text-lg font-bold text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPagePowerBI({ user }) {
  const [role, setRole] = useState(user?.role || 'CXO');
  const [plant, setPlant] = useState('all');
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const roleGradients = getRoleGradients(role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role,
        start: '2024-07-01',
        end: '2025-12-31',
        plant: plant || 'all'
      });

      // Fetch KPIs and Charts in parallel
      const [kpiRes, chartRes] = await Promise.all([
        fetch(`${API}/kpis?${params}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/charts?${params}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }

      if (chartRes.ok) {
        const chartData = await chartRes.json();
        setCharts(chartData.charts);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      toast.error('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, plant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = kpis?.comparisons?.map((item, index) => ({
    name: item.plant_name,
    value: item.ebitda_ton || 0,
    color: POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]
  })) || [];

  // Role-specific icons
  const roleIcons = {
    'CXO': [DollarSign, TrendingUp, Factory, Gauge],
    'Plant Head': [Factory, Activity, Gauge, Zap],
    'Energy Manager': [Zap, Flame, Gauge, Factory],
    'Sales': [Truck, DollarSign, TrendingUp, Package]
  };
  const icons = roleIcons[role] || roleIcons['CXO'];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              {role} Dashboard
            </h1>
            <p className="text-sm text-gray-500">Real-time KPI Analytics • Star Cement Ltd</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="role-selector" className="w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CXO">CXO</SelectItem>
                <SelectItem value="Plant Head">Plant Head</SelectItem>
                <SelectItem value="Energy Manager">Energy Manager</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>

            <Select value={plant} onValueChange={setPlant}>
              <SelectTrigger data-testid="plant-selector" className="w-36 h-9 text-sm">
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

            <Button
              data-testid="ai-chat-button"
              onClick={() => setShowAIChat(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Primary KPI Cards */}
        {kpis && kpis.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.keys(kpis.kpis).slice(0, 4).map((key, index) => (
              <PowerBIKPICard
                key={key}
                dataTestId={`kpi-${key}`}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={kpis.kpis[key]}
                unit={key.includes('pct') || key.includes('util') ? '%' : key.includes('mt') ? 'MT' : key.includes('cost') || key.includes('ebitda') || key.includes('realization') || key.includes('freight') ? '₹' : ''}
                icon={icons[index]}
                gradient={roleGradients[index]}
              />
            ))}
          </div>
        )}

        {/* Secondary KPIs - Compact Grid */}
        {kpis && kpis.kpis && Object.keys(kpis.kpis).length > 4 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <h3 className="text-sm font-heading font-semibold text-gray-700 mb-3">Detailed Metrics</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {Object.keys(kpis.kpis).slice(4).map((key) => (
                <CompactKPICard
                  key={key}
                  dataTestId={`compact-kpi-${key}`}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={kpis.kpis[key]}
                  unit={
                    key.includes('pct') || key.includes('util') || key.includes('afr') ? '%' : 
                    key.includes('hrs') ? 'hrs' : 
                    key.includes('kwh') ? 'kWh/T' :
                    key.includes('kcal') ? 'kcal/kg' :
                    key.includes('mt') || key.includes('clinker') || key.includes('dispatch') || key.includes('cement') ? 'MT' :
                    key.includes('cost') || key.includes('ebitda') || key.includes('realization') || key.includes('freight') || key.includes('revenue') || key.includes('margin_ton') || key.includes('savings') ? '₹' : ''
                  }
                  trend={Math.random() * 10 - 5}
                  target={
                    key.includes('power') ? '70' :
                    key.includes('capacity') ? '90%' :
                    key.includes('otif') ? '95%' :
                    key.includes('afr') ? '15%' : null
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Row 1: Main Trend + Performance Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Main Trend Chart */}
          {kpis && kpis.series && kpis.series.trends && kpis.series.trends.length > 0 && (
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-testid="trend-chart">
              <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">Performance Trend</h3>
              <p className="text-xs text-gray-500 mb-3">
                {role === 'CXO' && 'EBITDA and margin trends over time'}
                {role === 'Plant Head' && 'Capacity utilization and downtime trends'}
                {role === 'Energy Manager' && 'Power consumption and AFR% trends'}
                {role === 'Sales' && 'Realization and OTIF% trends'}
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={kpis.series.trends}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <Tooltip content={<CustomTooltip role={role} />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {Object.keys(kpis.series.trends[0] || {}).filter(k => k !== 'date').slice(0, 2).map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={index === 0 ? '#0EA5E9' : '#F59E0B'}
                      fill={index === 0 ? 'url(#colorPrimary)' : 'url(#colorSecondary)'}
                      strokeWidth={2}
                      name={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                  <Brush dataKey="date" height={25} stroke="#0EA5E9" fill="#F0F9FF" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Radar */}
          {charts && charts.performance_radar && (
            <RadarChartComponent 
              data={charts.performance_radar}
              title="Performance Score"
              subtitle="Current vs Target metrics"
              height={320}
            />
          )}
        </div>

        {/* Row 2: Plant Comparison + Donut + Cost Waterfall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Plant EBITDA Comparison */}
          {kpis && kpis.comparisons && kpis.comparisons.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-testid="plant-bar-chart">
              <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">Plant EBITDA Comparison</h3>
              <p className="text-xs text-gray-500 mb-3">Profitability per ton by plant</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={kpis.comparisons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <YAxis dataKey="plant_name" type="category" stroke="#6B7280" style={{ fontSize: '10px' }} width={70} />
                  <Tooltip content={<CustomTooltip role={role} />} />
                  <Bar dataKey="ebitda_ton" name="EBITDA ₹/MT" radius={[0, 4, 4, 0]}>
                    {kpis.comparisons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Donut: Plant Production Share */}
          {charts && charts.plant_production && charts.plant_production.length > 0 && (
            <DonutChart
              data={charts.plant_production.map((p, i) => ({ ...p, name: p.plant_name }))}
              dataKey="cement"
              nameKey="name"
              title="Production Share"
              subtitle="Cement production by plant (MT)"
              colors={POWERBI_COLORS.vibrant}
              height={240}
            />
          )}

          {/* Cost Waterfall */}
          {charts && charts.cost_waterfall && (
            <WaterfallChart
              data={charts.cost_waterfall}
              title="Cost Bridge Analysis"
              subtitle="From realization to EBITDA (₹/MT)"
              height={240}
            />
          )}
        </div>

        {/* Row 3: Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Monthly Production */}
          {charts && charts.monthly_production && charts.monthly_production.length > 0 && (
            <ComboChart
              data={charts.monthly_production.map(m => ({ ...m, name: m.month }))}
              title="Monthly Production & Capacity"
              subtitle="Cement production vs capacity utilization"
              barKey="cement"
              lineKey="capacity"
              barName="Cement (MT)"
              lineName="Capacity %"
              height={260}
            />
          )}

          {/* Monthly Finance */}
          {charts && charts.monthly_finance && charts.monthly_finance.length > 0 && (
            <MultiLineChart
              data={charts.monthly_finance.map(m => ({ ...m, name: m.month }))}
              lines={[
                { dataKey: 'ebitda', name: 'EBITDA ₹/MT' },
                { dataKey: 'cost', name: 'Cost ₹/MT' },
                { dataKey: 'margin', name: 'Margin %' }
              ]}
              title="Financial Trends"
              subtitle="Cost, EBITDA and margin over time"
              height={260}
            />
          )}
        </div>

        {/* Row 4: Energy & Quality Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Energy by Plant */}
          {charts && charts.energy_by_plant && charts.energy_by_plant.length > 0 && (
            <GroupedBarChart
              data={charts.energy_by_plant.map(e => ({ ...e, name: e.plant_name }))}
              title="Energy Consumption"
              subtitle="Power and heat by plant"
              bars={[
                { dataKey: 'power', name: 'Power kWh/T' },
                { dataKey: 'afr', name: 'AFR %' }
              ]}
              colors={['#0EA5E9', '#10B981']}
              height={240}
            />
          )}

          {/* Quality by Plant */}
          {charts && charts.quality_by_plant && charts.quality_by_plant.length > 0 && (
            <GroupedBarChart
              data={charts.quality_by_plant.map(q => ({ ...q, name: q.plant_name }))}
              title="Quality Metrics"
              subtitle="Blaine and strength by plant"
              bars={[
                { dataKey: 'blaine', name: 'Blaine cm²/g' },
                { dataKey: 'strength', name: '28d Strength MPa' }
              ]}
              colors={['#F59E0B', '#8B5CF6']}
              height={240}
            />
          )}

          {/* Sales by Region */}
          {charts && charts.sales_by_region && charts.sales_by_region.length > 0 && (
            <DonutChart
              data={charts.sales_by_region.map((s, i) => ({ ...s, name: s.region || 'Unknown' }))}
              dataKey="dispatch"
              nameKey="name"
              title="Regional Sales Mix"
              subtitle="Dispatch volume by region"
              colors={POWERBI_COLORS.default}
              height={240}
            />
          )}
        </div>

        {/* Row 5: Maintenance & Weekly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Maintenance by Plant */}
          {charts && charts.maintenance_by_plant && charts.maintenance_by_plant.length > 0 && (
            <GroupedBarChart
              data={charts.maintenance_by_plant.map(m => ({ ...m, name: m.plant_name }))}
              title="Maintenance KPIs"
              subtitle="MTBF, MTTR and breakdown hours"
              bars={[
                { dataKey: 'mtbf', name: 'MTBF hrs' },
                { dataKey: 'mttr', name: 'MTTR hrs' },
                { dataKey: 'breakdown', name: 'Breakdown hrs' }
              ]}
              colors={['#10B981', '#F59E0B', '#EF4444']}
              height={260}
            />
          )}

          {/* Weekly Trend */}
          {charts && charts.weekly_trend && charts.weekly_trend.length > 0 && (
            <StackedAreaChart
              data={charts.weekly_trend.map(w => ({ ...w, name: w.week }))}
              title="Weekly Production Trend"
              subtitle="Last 12 weeks performance"
              areas={[
                { dataKey: 'cement', name: 'Cement MT' }
              ]}
              colors={['#0EA5E9']}
              height={260}
            />
          )}
        </div>

        {/* Row 6: Bullet Charts - Performance Indicators */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-heading font-semibold text-gray-700 mb-3">Performance Indicators vs Target</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {kpis && kpis.kpis && (
              <>
                <BulletChart 
                  actual={kpis.kpis.avg_capacity_util || 85} 
                  target={90} 
                  max={100} 
                  title="Capacity Util %" 
                  color="#0EA5E9" 
                />
                <BulletChart 
                  actual={100 - ((kpis.kpis.avg_power_kwh_ton || 75) - 65) * 2} 
                  target={85} 
                  max={100} 
                  title="Energy Score" 
                  color="#10B981" 
                />
                <BulletChart 
                  actual={kpis.kpis.avg_otif_pct || 92} 
                  target={95} 
                  max={100} 
                  title="OTIF %" 
                  color="#F59E0B" 
                />
                <BulletChart 
                  actual={kpis.kpis.avg_margin_pct || 22} 
                  target={25} 
                  max={40} 
                  title="Margin %" 
                  color="#8B5CF6" 
                />
                <BulletChart 
                  actual={kpis.kpis.avg_afr_pct || 12} 
                  target={15} 
                  max={25} 
                  title="AFR %" 
                  color="#EC4899" 
                />
                <BulletChart 
                  actual={Math.min((kpis.kpis.avg_clinker_factor || 0.85) * 100, 100)} 
                  target={88} 
                  max={100} 
                  title="Clinker Factor" 
                  color="#14B8A6" 
                />
              </>
            )}
          </div>
        </div>

        {/* Row 7: Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Plant Performance Table */}
          {charts && charts.plant_production && (
            <TableChart
              data={charts.plant_production}
              columns={[
                { key: 'plant_name', label: 'Plant' },
                { key: 'cement', label: 'Cement (MT)' },
                { key: 'capacity', label: 'Capacity %' }
              ]}
              title="Plant Performance Summary"
              subtitle="Production and capacity utilization"
            />
          )}

          {/* Energy Performance Table */}
          {charts && charts.energy_by_plant && (
            <TableChart
              data={charts.energy_by_plant}
              columns={[
                { key: 'plant_name', label: 'Plant' },
                { key: 'power', label: 'Power kWh/T' },
                { key: 'heat', label: 'Heat kcal/kg' },
                { key: 'afr', label: 'AFR %' }
              ]}
              title="Energy Performance"
              subtitle="Power, heat and AFR by plant"
            />
          )}
        </div>

        {/* Row 8: Additional Pie Chart */}
        {pieData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-testid="ebitda-pie">
              <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">EBITDA Distribution</h3>
              <p className="text-xs text-gray-500 mb-3">Share of profitability by plant</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}/MT`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-heading font-semibold text-gray-800 mb-3">Quick Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis && kpis.comparisons && kpis.comparisons.length > 0 && (
                  <>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Best Plant</p>
                      <p className="text-lg font-bold text-green-600">{kpis.comparisons[0]?.plant_name}</p>
                      <p className="text-xs text-gray-500">₹{kpis.comparisons[0]?.ebitda_ton?.toFixed(0)}/MT</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Avg EBITDA</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{(kpis.comparisons.reduce((s, p) => s + (p.ebitda_ton || 0), 0) / kpis.comparisons.length).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">per MT</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Improvement Gap</p>
                      <p className="text-lg font-bold text-orange-600">
                        ₹{((kpis.comparisons[0]?.ebitda_ton || 0) - (kpis.comparisons[kpis.comparisons.length - 1]?.ebitda_ton || 0)).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">per MT</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Plants Count</p>
                      <p className="text-lg font-bold text-purple-600">{kpis.comparisons.length}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AIChatModal 
        open={showAIChat} 
        onClose={() => setShowAIChat(false)}
        contextFilters={{ start: '2024-07-01', end: '2025-12-31', plant }}
      />
    </div>
  );
}
