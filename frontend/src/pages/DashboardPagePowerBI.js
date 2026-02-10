import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PowerBIKPICard from '@/components/PowerBIKPICard';
import CompactKPICard from '@/components/CompactKPICard';
import PlantComparison from '@/components/PlantComparison';
import EmailReportModal from '@/components/EmailReportModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Factory, Zap, TrendingUp, Package, MessageCircle, DollarSign, Gauge, 
  Flame, Truck, Activity, Wrench, Target, BarChart3, Droplets, Timer, GitCompare, Sparkles, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import AIChatModal from '@/components/AIChatModal';
import { 
  DonutChart, GroupedBarChart, WaterfallChart, HorizontalBarChart,
  ComboChart, StackedAreaChart, RadarChartComponent, GaugeChart,
  BulletChart, MultiLineChart, StackedBarChart, TableChart
} from '@/components/AdvancedCharts';
import { getRoleGradients, POWERBI_COLORS } from '@/utils/powerBIColors';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Available plants for comparison
const AVAILABLE_PLANTS = ['Lumshnong', 'Sonapur', 'Siliguri', 'Jalpaiguri', 'Guwahati'];

// Role-specific configurations
const ROLE_CONFIG = {
  'CXO': {
    title: 'Executive Dashboard',
    subtitle: 'Strategic KPIs & Financial Performance',
    color: 'blue',
    primaryKPIs: ['total_cement_mt', 'avg_ebitda_ton', 'avg_margin_pct', 'avg_cost_ton'],
    icons: [Factory, DollarSign, TrendingUp, Target],
    focusAreas: ['Financial Performance', 'Operational Efficiency', 'Market Position', 'Value Creation']
  },
  'Plant Head': {
    title: 'Operations Dashboard',
    subtitle: 'Production, Quality & Equipment Performance',
    color: 'teal',
    primaryKPIs: ['total_cement_mt', 'avg_capacity_util', 'avg_downtime_hrs', 'uptime_pct'],
    icons: [Factory, Gauge, Timer, Activity],
    focusAreas: ['Production Volume', 'Capacity Utilization', 'Equipment Reliability', 'Quality Control']
  },
  'Energy Manager': {
    title: 'Energy Dashboard',
    subtitle: 'Power Consumption, Thermal Efficiency & Sustainability',
    color: 'green',
    primaryKPIs: ['avg_power_kwh_ton', 'avg_heat_kcal_kg', 'avg_afr_pct', 'savings_potential'],
    icons: [Zap, Flame, Droplets, DollarSign],
    focusAreas: ['Power Optimization', 'Thermal Efficiency', 'Alternative Fuels', 'Cost Savings']
  },
  'Sales': {
    title: 'Sales Dashboard',
    subtitle: 'Revenue, Pricing & Logistics Performance',
    color: 'pink',
    primaryKPIs: ['total_dispatch_mt', 'avg_realization_ton', 'avg_otif_pct', 'total_revenue'],
    icons: [Truck, DollarSign, Target, TrendingUp],
    focusAreas: ['Dispatch Volume', 'Price Realization', 'Delivery Performance', 'Revenue Growth']
  }
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 max-w-xs">
        <p className="font-bold text-sm mb-2 border-b border-gray-600 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="mt-1">
            <p style={{ color: entry.color }} className="text-xs font-semibold">{entry.name}</p>
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
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [selectedPlantsForCompare, setSelectedPlantsForCompare] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG['CXO'];
  const roleGradients = getRoleGradients(role);

  const togglePlantSelection = (plantName) => {
    setSelectedPlantsForCompare(prev => {
      if (prev.includes(plantName)) {
        return prev.filter(p => p !== plantName);
      }
      if (prev.length < 3) {
        return [...prev, plantName];
      }
      toast.error('Maximum 3 plants can be compared');
      return prev;
    });
  };

  const startComparison = () => {
    if (selectedPlantsForCompare.length < 2) {
      toast.error('Select at least 2 plants to compare');
      return;
    }
    setShowComparisonModal(true);
  };

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

      const [kpiRes, chartRes] = await Promise.all([
        fetch(`${API}/kpis?${params}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/charts?${params}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, plant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading {role} dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get KPI value
  const getKPI = (key) => kpis?.kpis?.[key] || 0;

  // Render CXO-specific dashboard
  const renderCXODashboard = () => (
    <>
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PowerBIKPICard dataTestId="kpi-cement" label="Total Production" value={getKPI('total_cement_mt')} unit="MT" icon={Factory} gradient={roleGradients[0]} />
        <PowerBIKPICard dataTestId="kpi-ebitda" label="EBITDA/Ton" value={getKPI('avg_ebitda_ton')} unit="₹" icon={DollarSign} gradient={roleGradients[1]} />
        <PowerBIKPICard dataTestId="kpi-margin" label="Margin" value={getKPI('avg_margin_pct')} unit="%" icon={TrendingUp} gradient={roleGradients[2]} />
        <PowerBIKPICard dataTestId="kpi-cost" label="Cost/Ton" value={getKPI('avg_cost_ton')} unit="₹" icon={Target} gradient={roleGradients[3]} />
      </div>

      {/* Secondary KPIs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Strategic Metrics</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <CompactKPICard label="Revenue/Ton" value={getKPI('revenue_per_ton')} unit="₹" />
          <CompactKPICard label="Capacity Util" value={getKPI('avg_capacity_util')} unit="%" target="90%" />
          <CompactKPICard label="Power kWh/T" value={getKPI('avg_power_kwh_ton')} unit="" target="70" />
          <CompactKPICard label="AFR %" value={getKPI('avg_afr_pct')} unit="%" target="15%" />
          <CompactKPICard label="OTIF %" value={getKPI('avg_otif_pct')} unit="%" target="95%" />
          <CompactKPICard label="Clinker Factor" value={getKPI('avg_clinker_factor')} unit="" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {kpis?.series?.trends && (
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Financial Performance Trend</h3>
            <p className="text-xs text-gray-500 mb-3">EBITDA and margin over time</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={kpis.series.trends}>
                <defs>
                  <linearGradient id="ebitdaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="ebitda" name="EBITDA ₹/MT" stroke="#3B82F6" fill="url(#ebitdaGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="margin" name="Margin %" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {charts?.performance_radar && (
          <RadarChartComponent data={charts.performance_radar} title="Business Scorecard" subtitle="Performance vs targets" height={320} />
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {kpis?.comparisons && (
          <HorizontalBarChart data={kpis.comparisons} dataKey="ebitda_ton" nameKey="plant_name" title="Plant Profitability" subtitle="EBITDA ₹/MT by plant" height={240} />
        )}
        {charts?.cost_waterfall && (
          <WaterfallChart data={charts.cost_waterfall} title="Cost Bridge Analysis" subtitle="Realization to EBITDA" height={240} />
        )}
        {charts?.plant_production && (
          <DonutChart data={charts.plant_production.map(p => ({ ...p, name: p.plant_name }))} dataKey="cement" title="Production Mix" subtitle="Share by plant" colors={POWERBI_COLORS.vibrant} height={240} />
        )}
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {charts?.monthly_finance && (
          <MultiLineChart
            data={charts.monthly_finance.map(m => ({ ...m, name: m.month }))}
            lines={[{ dataKey: 'ebitda', name: 'EBITDA' }, { dataKey: 'cost', name: 'Cost' }, { dataKey: 'margin', name: 'Margin %' }]}
            title="Monthly Financial Trend" subtitle="Cost, EBITDA and margin" height={260}
          />
        )}
        {charts?.sales_by_region && (
          <DonutChart data={charts.sales_by_region.map(s => ({ ...s, name: s.region || 'Unknown' }))} dataKey="dispatch" title="Regional Revenue Mix" subtitle="Dispatch by region" colors={POWERBI_COLORS.default} height={260} />
        )}
      </div>
    </>
  );

  // Render Plant Head-specific dashboard
  const renderPlantHeadDashboard = () => (
    <>
      {/* Production KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PowerBIKPICard dataTestId="kpi-cement" label="Total Production" value={getKPI('total_cement_mt')} unit="MT" icon={Factory} gradient={roleGradients[0]} />
        <PowerBIKPICard dataTestId="kpi-capacity" label="Capacity Util" value={getKPI('avg_capacity_util')} unit="%" icon={Gauge} gradient={roleGradients[1]} />
        <PowerBIKPICard dataTestId="kpi-uptime" label="Uptime" value={getKPI('uptime_pct')} unit="%" icon={Activity} gradient={roleGradients[2]} />
        <PowerBIKPICard dataTestId="kpi-downtime" label="Avg Downtime" value={getKPI('avg_downtime_hrs')} unit="hrs" icon={Timer} gradient={roleGradients[3]} />
      </div>

      {/* Secondary KPIs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Production & Quality Metrics</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <CompactKPICard label="Daily Production" value={getKPI('avg_daily_cement')} unit="MT" />
          <CompactKPICard label="Clinker Factor" value={getKPI('avg_clinker_factor')} unit="" />
          <CompactKPICard label="Blaine" value={getKPI('avg_blaine')} unit="cm²/g" />
          <CompactKPICard label="28d Strength" value={getKPI('avg_strength_28d')} unit="MPa" />
          <CompactKPICard label="MTBF" value={getKPI('avg_mtbf_hrs')} unit="hrs" />
          <CompactKPICard label="MTTR" value={getKPI('avg_mttr_hrs')} unit="hrs" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {kpis?.series?.trends && (
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Production Performance</h3>
            <p className="text-xs text-gray-500 mb-3">Capacity utilization and downtime trends</p>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={kpis.series.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="left" stroke="#14B8A6" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#EF4444" style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="capacity" name="Capacity %" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="downtime" name="Downtime hrs" stroke="#EF4444" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        {charts?.performance_radar && (
          <RadarChartComponent data={charts.performance_radar} title="Operations Scorecard" subtitle="Current vs target" height={320} />
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {charts?.plant_production && (
          <GroupedBarChart
            data={charts.plant_production.map(p => ({ ...p, name: p.plant_name }))}
            title="Plant Production" subtitle="Cement output by plant"
            bars={[{ dataKey: 'cement', name: 'Cement MT' }]}
            colors={['#14B8A6']} height={240}
          />
        )}
        {charts?.quality_by_plant && (
          <GroupedBarChart
            data={charts.quality_by_plant.map(q => ({ ...q, name: q.plant_name }))}
            title="Quality Metrics" subtitle="Blaine and strength by plant"
            bars={[{ dataKey: 'blaine', name: 'Blaine' }, { dataKey: 'strength', name: '28d Strength' }]}
            colors={['#F59E0B', '#8B5CF6']} height={240}
          />
        )}
        {charts?.maintenance_by_plant && (
          <GroupedBarChart
            data={charts.maintenance_by_plant.map(m => ({ ...m, name: m.plant_name }))}
            title="Equipment Reliability" subtitle="MTBF, MTTR by plant"
            bars={[{ dataKey: 'mtbf', name: 'MTBF hrs' }, { dataKey: 'mttr', name: 'MTTR hrs' }]}
            colors={['#10B981', '#EF4444']} height={240}
          />
        )}
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {charts?.monthly_production && (
          <ComboChart
            data={charts.monthly_production.map(m => ({ ...m, name: m.month }))}
            title="Monthly Production & Capacity" subtitle="Volume vs utilization"
            barKey="cement" lineKey="capacity" barName="Cement MT" lineName="Capacity %" height={260}
          />
        )}
        {charts?.weekly_trend && (
          <StackedAreaChart
            data={charts.weekly_trend.map(w => ({ ...w, name: w.week }))}
            title="Weekly Production Trend" subtitle="Last 12 weeks"
            areas={[{ dataKey: 'cement', name: 'Cement MT' }]}
            colors={['#14B8A6']} height={260}
          />
        )}
      </div>

      {/* Bullet Charts */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance vs Target</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BulletChart actual={getKPI('avg_capacity_util')} target={90} max={100} title="Capacity %" color="#14B8A6" />
          <BulletChart actual={getKPI('uptime_pct')} target={95} max={100} title="Uptime %" color="#3B82F6" />
          <BulletChart actual={getKPI('avg_strength_28d')} target={53} max={60} title="28d Strength" color="#8B5CF6" />
          <BulletChart actual={getKPI('avg_mtbf_hrs')} target={200} max={250} title="MTBF hrs" color="#10B981" />
        </div>
      </div>
    </>
  );

  // Render Energy Manager-specific dashboard
  const renderEnergyDashboard = () => (
    <>
      {/* Energy KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PowerBIKPICard dataTestId="kpi-power" label="Power Consumption" value={getKPI('avg_power_kwh_ton')} unit="kWh/T" icon={Zap} gradient={roleGradients[0]} />
        <PowerBIKPICard dataTestId="kpi-heat" label="Heat Consumption" value={getKPI('avg_heat_kcal_kg')} unit="kcal/kg" icon={Flame} gradient={roleGradients[1]} />
        <PowerBIKPICard dataTestId="kpi-afr" label="AFR Usage" value={getKPI('avg_afr_pct')} unit="%" icon={Droplets} gradient={roleGradients[2]} />
        <PowerBIKPICard dataTestId="kpi-savings" label="Savings Potential" value={getKPI('savings_potential')} unit="₹" icon={DollarSign} gradient={roleGradients[3]} />
      </div>

      {/* Secondary KPIs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Energy Performance Metrics</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <CompactKPICard label="Best Power" value={getKPI('min_power_kwh_ton')} unit="kWh/T" />
          <CompactKPICard label="Worst Power" value={getKPI('max_power_kwh_ton')} unit="kWh/T" />
          <CompactKPICard label="Power Variance" value={getKPI('power_variance')} unit="kWh/T" />
          <CompactKPICard label="Best Heat" value={getKPI('min_heat_kcal_kg')} unit="kcal/kg" />
          <CompactKPICard label="Worst Heat" value={getKPI('max_heat_kcal_kg')} unit="kcal/kg" />
          <CompactKPICard label="Fuel Cost" value={getKPI('avg_fuel_cost_ton')} unit="₹/T" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {kpis?.series?.trends && (
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Energy Consumption Trend</h3>
            <p className="text-xs text-gray-500 mb-3">Power and AFR% over time</p>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={kpis.series.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="left" stroke="#10B981" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="power" name="Power kWh/T" stroke="#10B981" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="afr" name="AFR %" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        {charts?.performance_radar && (
          <RadarChartComponent data={charts.performance_radar} title="Energy Scorecard" subtitle="Efficiency metrics" height={320} />
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {charts?.energy_by_plant && (
          <GroupedBarChart
            data={charts.energy_by_plant.map(e => ({ ...e, name: e.plant_name }))}
            title="Power by Plant" subtitle="kWh/Ton comparison"
            bars={[{ dataKey: 'power', name: 'Power kWh/T' }]}
            colors={['#10B981']} height={240}
          />
        )}
        {charts?.energy_by_plant && (
          <GroupedBarChart
            data={charts.energy_by_plant.map(e => ({ ...e, name: e.plant_name }))}
            title="Heat by Plant" subtitle="kcal/kg comparison"
            bars={[{ dataKey: 'heat', name: 'Heat kcal/kg' }]}
            colors={['#F59E0B']} height={240}
          />
        )}
        {charts?.energy_by_plant && (
          <GroupedBarChart
            data={charts.energy_by_plant.map(e => ({ ...e, name: e.plant_name }))}
            title="AFR Usage" subtitle="Alternative fuel rate %"
            bars={[{ dataKey: 'afr', name: 'AFR %' }]}
            colors={['#8B5CF6']} height={240}
          />
        )}
      </div>

      {/* Charts Row 3 - Energy Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {charts?.energy_by_plant && (
          <TableChart
            data={charts.energy_by_plant}
            columns={[
              { key: 'plant_name', label: 'Plant' },
              { key: 'power', label: 'Power kWh/T' },
              { key: 'heat', label: 'Heat kcal/kg' },
              { key: 'afr', label: 'AFR %' }
            ]}
            title="Energy Performance Summary" subtitle="Detailed metrics by plant"
          />
        )}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Energy Optimization Targets</h3>
          <div className="space-y-3">
            <BulletChart actual={getKPI('avg_power_kwh_ton')} target={70} max={90} title="Power kWh/T (Lower is better)" color="#10B981" />
            <BulletChart actual={getKPI('avg_heat_kcal_kg')} target={720} max={800} title="Heat kcal/kg (Lower is better)" color="#F59E0B" />
            <BulletChart actual={getKPI('avg_afr_pct')} target={15} max={25} title="AFR % (Higher is better)" color="#8B5CF6" />
            <BulletChart actual={100 - ((getKPI('avg_power_kwh_ton') - 65) / 25 * 100)} target={80} max={100} title="Energy Score" color="#3B82F6" />
          </div>
        </div>
      </div>
    </>
  );

  // Render Sales-specific dashboard
  const renderSalesDashboard = () => (
    <>
      {/* Sales KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PowerBIKPICard dataTestId="kpi-dispatch" label="Total Dispatch" value={getKPI('total_dispatch_mt')} unit="MT" icon={Truck} gradient={roleGradients[0]} />
        <PowerBIKPICard dataTestId="kpi-realization" label="Realization" value={getKPI('avg_realization_ton')} unit="₹/MT" icon={DollarSign} gradient={roleGradients[1]} />
        <PowerBIKPICard dataTestId="kpi-otif" label="OTIF %" value={getKPI('avg_otif_pct')} unit="%" icon={Target} gradient={roleGradients[2]} />
        <PowerBIKPICard dataTestId="kpi-revenue" label="Total Revenue" value={getKPI('total_revenue')} unit="₹" icon={TrendingUp} gradient={roleGradients[3]} />
      </div>

      {/* Secondary KPIs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sales & Pricing Metrics</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <CompactKPICard label="Best Price" value={getKPI('max_realization_ton')} unit="₹/MT" />
          <CompactKPICard label="Worst Price" value={getKPI('min_realization_ton')} unit="₹/MT" />
          <CompactKPICard label="Price Variance" value={getKPI('price_variance')} unit="₹" />
          <CompactKPICard label="Freight Cost" value={getKPI('avg_freight_ton')} unit="₹/MT" />
          <CompactKPICard label="Net Realization" value={getKPI('net_realization')} unit="₹/MT" />
          <CompactKPICard label="Daily Revenue" value={getKPI('revenue_per_day')} unit="₹" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {kpis?.series?.trends && (
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Sales Performance Trend</h3>
            <p className="text-xs text-gray-500 mb-3">Realization and OTIF over time</p>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={kpis.series.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="left" stroke="#EC4899" style={{ fontSize: '10px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="realization" name="Realization ₹/MT" fill="#EC4899" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="otif" name="OTIF %" stroke="#10B981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        {charts?.performance_radar && (
          <RadarChartComponent data={charts.performance_radar} title="Sales Scorecard" subtitle="Performance metrics" height={320} />
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {charts?.sales_by_region && (
          <DonutChart
            data={charts.sales_by_region.map(s => ({ ...s, name: s.region || 'Unknown' }))}
            dataKey="dispatch" title="Regional Dispatch Mix" subtitle="Volume by region"
            colors={POWERBI_COLORS.vibrant} height={240}
          />
        )}
        {charts?.sales_by_region && (
          <GroupedBarChart
            data={charts.sales_by_region.map(s => ({ ...s, name: s.region || 'Unknown' }))}
            title="Regional Pricing" subtitle="Realization by region"
            bars={[{ dataKey: 'realization', name: 'Realization ₹/MT' }]}
            colors={['#EC4899']} height={240}
          />
        )}
        {charts?.sales_by_region && (
          <GroupedBarChart
            data={charts.sales_by_region.map(s => ({ ...s, name: s.region || 'Unknown' }))}
            title="Delivery Performance" subtitle="OTIF % by region"
            bars={[{ dataKey: 'otif', name: 'OTIF %' }]}
            colors={['#10B981']} height={240}
          />
        )}
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {charts?.sales_by_region && (
          <TableChart
            data={charts.sales_by_region}
            columns={[
              { key: 'region', label: 'Region' },
              { key: 'dispatch', label: 'Dispatch MT' },
              { key: 'realization', label: 'Realization ₹/MT' },
              { key: 'otif', label: 'OTIF %' }
            ]}
            title="Regional Sales Summary" subtitle="Detailed performance by region"
          />
        )}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Sales Targets</h3>
          <div className="space-y-3">
            <BulletChart actual={getKPI('avg_otif_pct')} target={95} max={100} title="OTIF %" color="#10B981" />
            <BulletChart actual={getKPI('avg_realization_ton') / 60} target={90} max={100} title="Realization Index" color="#EC4899" />
            <BulletChart actual={getKPI('avg_margin_pct')} target={25} max={40} title="Margin %" color="#3B82F6" />
            <BulletChart actual={(getKPI('net_realization') / getKPI('avg_realization_ton')) * 100} target={85} max={100} title="Net Realization %" color="#F59E0B" />
          </div>
        </div>
      </div>
    </>
  );

  // Render dashboard based on role
  const renderRoleDashboard = () => {
    switch (role) {
      case 'CXO': return renderCXODashboard();
      case 'Plant Head': return renderPlantHeadDashboard();
      case 'Energy Manager': return renderEnergyDashboard();
      case 'Sales': return renderSalesDashboard();
      default: return renderCXODashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-gray-900">{roleConfig.title}</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </span>
            </div>
            <p className="text-sm text-gray-500">{roleConfig.subtitle} • Star Cement Ltd</p>
            <div className="flex gap-2 mt-2">
              {roleConfig.focusAreas.map((area, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{area}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="role-selector" className="w-40 h-9 text-sm">
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
              data-testid="compare-plants-button"
              onClick={() => setShowCompareMode(!showCompareMode)}
              size="sm"
              variant={showCompareMode ? "default" : "outline"}
              className={showCompareMode ? "bg-blue-600 text-white" : ""}
            >
              <GitCompare className="w-4 h-4 mr-1" />
              Compare
            </Button>

            <Button
              data-testid="email-report-button"
              onClick={() => setShowEmailModal(true)}
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Mail className="w-4 h-4 mr-1" />
              Send Report
            </Button>

            <Button
              data-testid="ai-chat-button"
              onClick={() => setShowAIChat(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Compare Plants Selection Panel */}
        {showCompareMode && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" />
                  Select Plants to Compare (2-3)
                </h3>
                <p className="text-sm text-gray-500 mt-1">Choose plants for side-by-side performance analysis</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {AVAILABLE_PLANTS.map(plantName => (
                  <label 
                    key={plantName}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      selectedPlantsForCompare.includes(plantName) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <Checkbox
                      checked={selectedPlantsForCompare.includes(plantName)}
                      onCheckedChange={() => togglePlantSelection(plantName)}
                      className={selectedPlantsForCompare.includes(plantName) ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600' : ''}
                    />
                    <span className="text-sm font-medium">{plantName}</span>
                  </label>
                ))}
              </div>
              <Button
                onClick={startComparison}
                disabled={selectedPlantsForCompare.length < 2}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <GitCompare className="w-4 h-4 mr-1" />
                Compare {selectedPlantsForCompare.length > 0 ? `(${selectedPlantsForCompare.length})` : ''}
              </Button>
            </div>
          </div>
        )}

        {/* Role-specific Dashboard */}
        {renderRoleDashboard()}
      </div>

      <AIChatModal 
        open={showAIChat} 
        onClose={() => setShowAIChat(false)}
        contextFilters={{ role, start: '2024-07-01', end: '2025-12-31', plant }}
      />

      {/* Plant Comparison Modal */}
      {showComparisonModal && (
        <PlantComparison 
          plants={selectedPlantsForCompare}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* Email Report Modal */}
      <EmailReportModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        role={role}
        plant={plant}
      />
    </div>
  );
}
