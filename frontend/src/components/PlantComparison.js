import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';
import { X, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POWERBI_COLORS } from '@/utils/powerBIColors';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff'
};

export default function PlantComparison({ plants, onClose }) {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch data for each selected plant
      const plantDataPromises = plants.map(plantName =>
        fetch(`${API}/kpis?role=CXO&plant=${encodeURIComponent(plantName)}&start=2024-07-01&end=2025-12-31`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );

      const chartDataPromises = plants.map(plantName =>
        fetch(`${API}/charts?role=CXO&plant=${encodeURIComponent(plantName)}&start=2024-07-01&end=2025-12-31`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );

      const [kpiResults, chartResults] = await Promise.all([
        Promise.all(plantDataPromises),
        Promise.all(chartDataPromises)
      ]);

      // Process comparison data
      const comparison = {
        plants: plants,
        kpis: plants.map((name, idx) => ({
          plant: name,
          ...kpiResults[idx]?.kpis,
          color: POWERBI_COLORS.vibrant[idx]
        })),
        radar: buildRadarData(plants, kpiResults),
        production: buildProductionComparison(plants, kpiResults),
        financial: buildFinancialComparison(plants, kpiResults),
        energy: buildEnergyComparison(plants, kpiResults),
        trends: buildTrendComparison(plants, chartResults)
      };

      setComparisonData(comparison);
    } catch (error) {
      console.error('Comparison fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildRadarData = (plants, kpiResults) => {
    const metrics = [
      { key: 'avg_capacity_util', label: 'Capacity', max: 100 },
      { key: 'avg_margin_pct', label: 'Margin', max: 40 },
      { key: 'avg_otif_pct', label: 'OTIF', max: 100 },
      { key: 'avg_afr_pct', label: 'AFR', max: 20 },
      { key: 'avg_clinker_factor', label: 'Clinker Factor', max: 1, scale: 100 }
    ];

    return metrics.map(m => {
      const point = { metric: m.label };
      plants.forEach((plant, idx) => {
        const value = kpiResults[idx]?.kpis?.[m.key] || 0;
        point[plant] = m.scale ? value * m.scale : (value / m.max) * 100;
      });
      return point;
    });
  };

  const buildProductionComparison = (plants, kpiResults) => {
    return [
      {
        metric: 'Cement (MT)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.total_cement_mt || 0;
          return acc;
        }, {})
      },
      {
        metric: 'Capacity Util (%)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_capacity_util || 0;
          return acc;
        }, {})
      }
    ];
  };

  const buildFinancialComparison = (plants, kpiResults) => {
    return [
      {
        metric: 'EBITDA (₹/MT)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_ebitda_ton || 0;
          return acc;
        }, {})
      },
      {
        metric: 'Margin (%)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_margin_pct || 0;
          return acc;
        }, {})
      },
      {
        metric: 'Cost (₹/MT)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_cost_ton || 0;
          return acc;
        }, {})
      }
    ];
  };

  const buildEnergyComparison = (plants, kpiResults) => {
    return [
      {
        metric: 'Power (kWh/T)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_power_kwh_ton || 0;
          return acc;
        }, {})
      },
      {
        metric: 'AFR (%)',
        ...plants.reduce((acc, plant, idx) => {
          acc[plant] = kpiResults[idx]?.kpis?.avg_afr_pct || 0;
          return acc;
        }, {})
      }
    ];
  };

  const buildTrendComparison = (plants, chartResults) => {
    // Merge monthly data from all plants
    const monthlyData = {};
    
    plants.forEach((plant, idx) => {
      const monthly = chartResults[idx]?.charts?.monthly_finance || [];
      monthly.forEach(m => {
        if (!monthlyData[m.month]) {
          monthlyData[m.month] = { month: m.month };
        }
        monthlyData[m.month][`${plant}_ebitda`] = m.ebitda || 0;
      });
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <GitCompare className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Plant Comparison</h2>
              <p className="text-sm opacity-90">Side-by-side analysis: {plants.join(' vs ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonData?.kpis?.map((plant, idx) => (
              <div 
                key={plant.plant} 
                className="p-4 rounded-xl border-2 shadow-sm"
                style={{ borderColor: plant.color }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plant.color }}></div>
                  <h3 className="font-bold text-gray-800">{plant.plant}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Production</p>
                    <p className="font-bold">{(plant.total_cement_mt || 0).toLocaleString('en-IN')} MT</p>
                  </div>
                  <div>
                    <p className="text-gray-500">EBITDA</p>
                    <p className="font-bold">₹{(plant.avg_ebitda_ton || 0).toFixed(0)}/MT</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-bold">{(plant.avg_capacity_util || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Power</p>
                    <p className="font-bold">{(plant.avg_power_kwh_ton || 0).toFixed(1)} kWh/T</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Comparison */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Performance Scorecard</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={comparisonData?.radar}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="metric" stroke="#6B7280" style={{ fontSize: '11px' }} />
                  <PolarRadiusAxis stroke="#6B7280" style={{ fontSize: '9px' }} domain={[0, 100]} />
                  {plants.map((plant, idx) => (
                    <Radar 
                      key={plant}
                      name={plant} 
                      dataKey={plant} 
                      stroke={POWERBI_COLORS.vibrant[idx]} 
                      fill={POWERBI_COLORS.vibrant[idx]} 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Comparison */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Financial Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData?.financial} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <YAxis dataKey="metric" type="category" stroke="#6B7280" style={{ fontSize: '10px' }} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {plants.map((plant, idx) => (
                    <Bar key={plant} dataKey={plant} name={plant} fill={POWERBI_COLORS.vibrant[idx]} radius={[0, 4, 4, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Energy Comparison */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Energy Efficiency</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparisonData?.energy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="metric" stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {plants.map((plant, idx) => (
                    <Bar key={plant} dataKey={plant} name={plant} fill={POWERBI_COLORS.vibrant[idx]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* EBITDA Trend Comparison */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">EBITDA Trend Comparison</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={comparisonData?.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '9px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {plants.map((plant, idx) => (
                    <Line 
                      key={plant}
                      type="monotone" 
                      dataKey={`${plant}_ebitda`} 
                      name={plant}
                      stroke={POWERBI_COLORS.vibrant[idx]} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Detailed Metrics Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-3 py-2 text-left text-gray-600 font-semibold">Metric</th>
                    {plants.map((plant, idx) => (
                      <th key={plant} className="px-3 py-2 text-center font-semibold" style={{ color: POWERBI_COLORS.vibrant[idx] }}>
                        {plant}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-gray-600 font-semibold">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Total Cement (MT)', key: 'total_cement_mt', format: (v) => v.toLocaleString('en-IN'), higher: true },
                    { label: 'EBITDA (₹/MT)', key: 'avg_ebitda_ton', format: (v) => `₹${v.toFixed(0)}`, higher: true },
                    { label: 'Margin (%)', key: 'avg_margin_pct', format: (v) => `${v.toFixed(1)}%`, higher: true },
                    { label: 'Cost (₹/MT)', key: 'avg_cost_ton', format: (v) => `₹${v.toFixed(0)}`, higher: false },
                    { label: 'Capacity Util (%)', key: 'avg_capacity_util', format: (v) => `${v.toFixed(1)}%`, higher: true },
                    { label: 'Power (kWh/T)', key: 'avg_power_kwh_ton', format: (v) => v.toFixed(1), higher: false },
                    { label: 'AFR (%)', key: 'avg_afr_pct', format: (v) => `${v.toFixed(1)}%`, higher: true },
                    { label: 'OTIF (%)', key: 'avg_otif_pct', format: (v) => `${v.toFixed(1)}%`, higher: true },
                    { label: 'Clinker Factor', key: 'avg_clinker_factor', format: (v) => v.toFixed(3), higher: false }
                  ].map(metric => {
                    const values = comparisonData?.kpis?.map(p => ({ plant: p.plant, value: p[metric.key] || 0, color: p.color }));
                    const best = metric.higher 
                      ? values?.reduce((a, b) => a.value > b.value ? a : b)
                      : values?.reduce((a, b) => a.value < b.value ? a : b);
                    
                    return (
                      <tr key={metric.key} className="border-b border-gray-100 hover:bg-white">
                        <td className="px-3 py-2 text-gray-700 font-medium">{metric.label}</td>
                        {values?.map(v => (
                          <td 
                            key={v.plant} 
                            className={`px-3 py-2 text-center ${v.plant === best?.plant ? 'font-bold' : ''}`}
                            style={{ color: v.plant === best?.plant ? v.color : '#374151' }}
                          >
                            {metric.format(v.value)}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: best?.color }}>
                            {best?.plant}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">AI Comparison Insight</h3>
                <p className="text-sm text-gray-600">
                  {comparisonData?.kpis && (() => {
                    const sorted = [...comparisonData.kpis].sort((a, b) => (b.avg_ebitda_ton || 0) - (a.avg_ebitda_ton || 0));
                    const best = sorted[0];
                    const worst = sorted[sorted.length - 1];
                    const gap = (best.avg_ebitda_ton || 0) - (worst.avg_ebitda_ton || 0);
                    
                    return `${best.plant} leads with EBITDA of ₹${(best.avg_ebitda_ton || 0).toFixed(0)}/MT, while ${worst.plant} has potential for improvement with a gap of ₹${gap.toFixed(0)}/MT. ${best.plant}'s higher capacity utilization of ${(best.avg_capacity_util || 0).toFixed(1)}% and lower power consumption contribute to superior performance.`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
