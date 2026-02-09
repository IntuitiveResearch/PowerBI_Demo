import React from 'react';
import { 
  ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Scatter, ScatterChart, ZAxis, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { POWERBI_COLORS } from '@/utils/powerBIColors';

// Donut Chart Component (like Product Sales Mix in reference)
export const DonutChart = ({ data, dataKey, nameKey, title, subtitle, colors }) => {
  const total = data.reduce((sum, item) => sum + item[dataKey], 0);
  
  const renderLabel = (entry) => {
    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey={dataKey}
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            formatter={(value, entry) => {
              const percent = ((entry.payload[dataKey] / total) * 100).toFixed(1);
              return `${value} (${percent}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Grouped Bar Chart (like Quality Composition in reference)
export const GroupedBarChart = ({ data, title, subtitle, bars, colors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey} 
              dataKey={bar.dataKey} 
              name={bar.name}
              fill={colors[index % colors.length]} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Waterfall Chart Component for Cost/Variance Analysis
export const WaterfallChart = ({ data, title, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Heatmap-style Visualization using Scatter
export const HeatmapChart = ({ data, title, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="x" name="Hour" stroke="#6B7280" />
          <YAxis dataKey="y" name="Day" stroke="#6B7280" />
          <ZAxis dataKey="z" range={[100, 1000]} name="Value" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill="#0EA5E9" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combo Chart (Bar + Line)
export const ComboChart = ({ data, title, subtitle, barKey, lineKey, barName, lineName }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey={barKey} name={barName} fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey={lineKey} name={lineName} stroke="#F59E0B" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stacked Area Chart
export const StackedAreaChart = ({ data, title, subtitle, areas, colors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={area.dataKey} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index]} stopOpacity={0.2}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stackId="1"
              stroke={colors[index]}
              fill={`url(#color${index})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Radar Chart for Multi-dimensional Analysis
export const RadarChartComponent = ({ data, title, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="metric" stroke="#6B7280" style={{ fontSize: '11px' }} />
          <PolarRadiusAxis stroke="#6B7280" />
          <Radar name="Current" dataKey="current" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.6} />
          <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
