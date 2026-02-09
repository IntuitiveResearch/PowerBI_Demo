import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PowerBIKPICard from '@/components/PowerBIKPICard';
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

// Custom tooltip for Power BI style
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
          </p>
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
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const roleGradients = getRoleGradients(role);

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

  // Prepare pie chart data from comparisons
  const pieData = kpis?.comparisons?.map((item, index) => ({
    name: item.plant_name,
    value: item.ebitda_ton || 0,
    color: POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]
  })) || [];

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
              <h3 className="text-lg font-heading font-semibold mb-4 text-gray-800">
                Performance Trend (with Zoom)
              </h3>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(kpis.series.trends[0] || {}).filter(k => k !== 'date').slice(0, 2).map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={index === 0 ? '#0EA5E9' : '#F59E0B'}
                      fill={index === 0 ? 'url(#colorPrimary)' : 'url(#colorSecondary)'}
                      strokeWidth={3}
                    />
                  ))}
                  <Brush dataKey="date" height={30} stroke="#0EA5E9" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie Chart - Plant Distribution */}
          {pieData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg" data-testid="pie-chart">
              <h3 className="text-lg font-heading font-semibold mb-4 text-gray-800">
                Plant Performance Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart - Plant Comparison */}
        {kpis && kpis.comparisons && kpis.comparisons.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8" data-testid="plant-comparison-chart">
            <h3 className="text-lg font-heading font-semibold mb-4 text-gray-800">
              Plant Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.comparisons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="plant_name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ebitda_ton" name="EBITDA/Ton" radius={[8, 8, 0, 0]}>
                  {kpis.comparisons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
