import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PowerBIKPICard from '@/components/PowerBIKPICard';
import CompactKPICard from '@/components/CompactKPICard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush 
} from 'recharts';
import { Factory, Zap, TrendingUp, Package, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import AIChatModal from '@/components/AIChatModal';
import { getRoleGradients, POWERBI_COLORS } from '@/utils/powerBIColors';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Enhanced Custom tooltip with role-specific context
const CustomTooltip = ({ active, payload, label, role }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700 max-w-xs">
        <p className="font-bold text-lg mb-2 border-b border-gray-600 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="mt-2">
            <p style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}
            </p>
            <p className="text-xl font-bold text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : entry.value}
            </p>
            {/* Contextual info based on role */}
            {role === 'CXO' && entry.name.includes('ebitda') && (
              <p className="text-xs text-gray-400 mt-1">Profitability per ton of cement</p>
            )}
            {role === 'Plant Head' && entry.name.includes('capacity') && (
              <p className="text-xs text-gray-400 mt-1">% of rated capacity utilized</p>
            )}
            {role === 'Energy Manager' && entry.name.includes('power') && (
              <p className="text-xs text-gray-400 mt-1">Lower is better - target: 70 kWh/T</p>
            )}
            {role === 'Sales' && entry.name.includes('realization') && (
              <p className="text-xs text-gray-400 mt-1">Average selling price per ton</p>
            )}
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
          {role === 'CXO' && 'Strategic View: Financial & Operational Performance'}
          {role === 'Plant Head' && 'Operations View: Production Efficiency & Reliability'}
          {role === 'Energy Manager' && 'Energy View: Cost Optimization & Sustainability'}
          {role === 'Sales' && 'Sales View: Market Performance & Logistics'}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Pie Chart Label with context
const renderPieLabel = (entry) => {
  return `${entry.name}: ${entry.value.toFixed(0)}`;
};

// Custom Pie Tooltip
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700">
        <p className="font-bold text-lg mb-2" style={{ color: data.payload.color }}>
          {data.name}
        </p>
        <div className="space-y-1">
          <p className="text-sm text-gray-400">EBITDA/Ton</p>
          <p className="text-2xl font-bold">₹{data.value.toLocaleString('en-IN')}/MT</p>
          <p className="text-sm text-gray-400 mt-2">Share of total performance</p>
          <p className="text-lg font-semibold text-green-400">{percentage}%</p>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
          Higher EBITDA = Better profitability
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPagePowerBI({ user }) {
  const [role, setRole] = useState(user?.role || 'CXO');
  const [plant, setPlant] = useState('all');
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [zoomDomain, setZoomDomain] = useState({ startIndex: 0, endIndex: 100 });
  const roleGradients = getRoleGradients(role);

  const handleBrushChange = (domain) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setZoomDomain(domain);
    }
  };

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role,
        start: '2024-07-01',
        end: '2025-12-31',
        plant: plant || 'all'
      });

      const response = await fetch(`${API}/kpis?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to load KPIs');
      }
    } catch (error) {
      console.error('KPI fetch error:', error);
      toast.error('Network error loading KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, plant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  // Prepare pie chart data from comparisons with total for percentage calculation
  const pieData = kpis?.comparisons?.map((item, index) => ({
    name: item.plant_name,
    value: item.ebitda_ton || 0,
    color: POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]
  })) || [];
  
  // Calculate total for percentage
  const totalEbitda = pieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithTotal = pieData.map(item => ({
    ...item,
    total: totalEbitda
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              {role} Dashboard
            </h1>
            <p className="text-base text-muted-foreground">
              Real-time KPI Analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <Button
              data-testid="ai-chat-button"
              onClick={() => setShowAIChat(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid - Power BI Style */}
        {kpis && kpis.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.keys(kpis.kpis).slice(0, 4).map((key, index) => (
              <PowerBIKPICard
                key={key}
                dataTestId={`kpi-${key}`}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={kpis.kpis[key]}
                unit={key.includes('pct') || key.includes('util') ? '%' : key.includes('mt') ? 'MT' : key.includes('cost') || key.includes('ebitda') || key.includes('realization') || key.includes('freight') ? '₹' : ''}
                icon={index === 0 ? Factory : index === 1 ? TrendingUp : index === 2 ? Package : Zap}
                gradient={roleGradients[index % roleGradients.length]}
              />
            ))}
          </div>
        )}

        {/* Charts Section - Power BI Style with 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Chart with Zoom */}
          {kpis && kpis.series && kpis.series.trends && (
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg" data-testid="trend-chart">
              <div className="mb-4">
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Performance Trend (Drag Brush to Zoom)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {role === 'CXO' && 'Track EBITDA and margin trends over time to identify profitability patterns'}
                  {role === 'Plant Head' && 'Monitor capacity utilization and downtime to optimize production efficiency'}
                  {role === 'Energy Manager' && 'Analyze power consumption and AFR% to identify cost-saving opportunities'}
                  {role === 'Sales' && 'Track realization and OTIF% to measure market performance and service quality'}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip role={role} />} />
                  <Legend />
                  {Object.keys(kpis.series.trends[0] || {}).filter(k => k !== 'date').slice(0, 2).map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={index === 0 ? '#0EA5E9' : '#F59E0B'}
                      fill={index === 0 ? 'url(#colorPrimary)' : 'url(#colorSecondary)'}
                      strokeWidth={3}
                      name={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#0EA5E9"
                    fill="#E0F2FE"
                    onChange={handleBrushChange}
                    startIndex={zoomDomain.startIndex}
                    endIndex={zoomDomain.endIndex}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie Chart - Plant Distribution */}
          {pieDataWithTotal.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg" data-testid="pie-chart">
              <div className="mb-4">
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Plant Performance Share
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  EBITDA/Ton contribution by plant - Hover to see details
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieDataWithTotal}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={renderPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieDataWithTotal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  💡 Larger slice = Higher profitability • Target: Balanced performance across plants
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Plant Comparison */}
        {kpis && kpis.comparisons && kpis.comparisons.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8" data-testid="plant-comparison-chart">
            <div className="mb-4">
              <h3 className="text-lg font-heading font-semibold text-gray-800">
                Plant-wise Performance Comparison
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Benchmarking EBITDA/Ton across all plants - Identify best performers and improvement opportunities
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.comparisons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="plant_name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} label={{ value: '₹/MT', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip role={role} />} />
                <Legend />
                <Bar dataKey="ebitda_ton" name="EBITDA per Ton (₹/MT)" radius={[8, 8, 0, 0]}>
                  {kpis.comparisons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Best Performer</p>
                <p className="text-sm font-bold text-green-600">{kpis.comparisons[0]?.plant_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Average EBITDA</p>
                <p className="text-sm font-bold text-blue-600">
                  ₹{(kpis.comparisons.reduce((sum, p) => sum + (p.ebitda_ton || 0), 0) / kpis.comparisons.length).toFixed(2)}/MT
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Improvement Gap</p>
                <p className="text-sm font-bold text-orange-600">
                  ₹{((kpis.comparisons[0]?.ebitda_ton || 0) - (kpis.comparisons[kpis.comparisons.length - 1]?.ebitda_ton || 0)).toFixed(2)}/MT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional KPI Cards */}
        {kpis && kpis.kpis && Object.keys(kpis.kpis).length > 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(kpis.kpis).slice(4, 8).map((key, index) => (
              <PowerBIKPICard
                key={key}
                dataTestId={`kpi-secondary-${key}`}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={kpis.kpis[key]}
                unit={key.includes('pct') || key.includes('util') || key.includes('afr') ? '%' : key.includes('hrs') ? 'hrs' : key.includes('kwh') ? 'kWh/T' : ''}
                gradient={roleGradients[index % roleGradients.length]}
              />
            ))}
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
