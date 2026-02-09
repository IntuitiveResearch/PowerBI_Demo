import React from 'react';
import { 
  ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Scatter, ScatterChart, ZAxis, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import { POWERBI_COLORS } from '@/utils/powerBIColors';

// Enhanced Tooltip Style
const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
};

// Donut Chart Component
export const DonutChart = ({ data, dataKey, nameKey, title, subtitle, colors, height = 280 }) => {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey={dataKey}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value) => value.toLocaleString('en-IN')} 
          />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">Total: </span>
        <span className="text-sm font-bold text-gray-800">{total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

// Grouped Bar Chart
export const GroupedBarChart = ({ data, title, subtitle, bars, colors, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={2} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} tick={{ fill: '#6B7280' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} tick={{ fill: '#6B7280' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
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

// Waterfall Chart
export const WaterfallChart = ({ data, title, subtitle, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis type="number" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis dataKey="name" type="category" stroke="#6B7280" style={{ fontSize: '10px' }} width={80} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `₹${Math.abs(v).toLocaleString('en-IN')}`} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'total' ? '#3B82F6' : entry.type === 'profit' ? '#10B981' : '#EF4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Horizontal Bar Chart
export const HorizontalBarChart = ({ data, dataKey, nameKey, title, subtitle, color = '#0EA5E9', height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis type="number" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis dataKey={nameKey} type="category" stroke="#6B7280" style={{ fontSize: '10px' }} width={70} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combo Chart (Bar + Line)
export const ComboChart = ({ data, title, subtitle, barKey, lineKey, barName, lineName, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis yAxisId="left" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" style={{ fontSize: '10px' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey={barKey} name={barName} fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey={lineKey} name={lineName} stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stacked Area Chart
export const StackedAreaChart = ({ data, title, subtitle, areas, colors, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={area.dataKey} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index]} stopOpacity={0.2}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stackId="1"
              stroke={colors[index]}
              fill={`url(#gradient${index})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Radar Chart
export const RadarChartComponent = ({ data, title, subtitle, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="metric" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <PolarRadiusAxis stroke="#6B7280" style={{ fontSize: '9px' }} />
          <Radar name="Current" dataKey="current" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.5} strokeWidth={2} />
          <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} strokeDasharray="5 5" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gauge Chart (simulated with pie)
export const GaugeChart = ({ value, max = 100, title, subtitle, color = '#0EA5E9', height = 200 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [
    { name: 'Value', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-8">
        <span className="text-3xl font-bold" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-sm text-gray-500">/{max}</span>
      </div>
    </div>
  );
};

// Mini Sparkline
export const Sparkline = ({ data, dataKey, color = '#0EA5E9', height = 50 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#spark-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Bullet Chart
export const BulletChart = ({ actual, target, max, title, color = '#0EA5E9' }) => {
  const actualPct = (actual / max) * 100;
  const targetPct = (target / max) * 100;
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-500">{actual.toFixed(1)} / {target}</span>
      </div>
      <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
        {/* Background zones */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 bg-gray-200"></div>
          <div className="w-1/3 bg-gray-150"></div>
          <div className="w-1/3 bg-gray-100"></div>
        </div>
        {/* Actual bar */}
        <div 
          className="absolute h-4 top-1 rounded" 
          style={{ width: `${actualPct}%`, backgroundColor: color }}
        ></div>
        {/* Target marker */}
        <div 
          className="absolute w-0.5 h-full bg-gray-800" 
          style={{ left: `${targetPct}%` }}
        ></div>
      </div>
    </div>
  );
};

// Multi-metric Line Chart
export const MultiLineChart = ({ data, lines, title, subtitle, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {lines.map((line, index) => (
            <Line 
              key={line.dataKey}
              type="monotone" 
              dataKey={line.dataKey} 
              name={line.name}
              stroke={POWERBI_COLORS.vibrant[index % POWERBI_COLORS.vibrant.length]} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stacked Bar Chart
export const StackedBarChart = ({ data, bars, title, subtitle, colors, height = 280 }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              name={bar.name}
              stackId="a"
              fill={colors[index % colors.length]}
              radius={index === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Progress Ring
export const ProgressRing = ({ value, max = 100, title, color = '#0EA5E9', size = 120 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{value.toFixed(0)}</span>
        <span className="text-xs text-gray-500">{title}</span>
      </div>
    </div>
  );
};

// Table Chart
export const TableChart = ({ data, columns, title, subtitle }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-base font-heading font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-gray-800">
                    {typeof row[col.key] === 'number' 
                      ? row[col.key].toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
