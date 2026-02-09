import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function CompactKPICard({ label, value, unit, trend, target, dataTestId }) {
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
  
  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      data-testid={dataTestId}
    >
      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold font-mono text-gray-900">
          {typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}
        </p>
        {unit && <span className="text-sm text-gray-600">{unit}</span>}
      </div>
      
      <div className="flex items-center justify-between mt-2">
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 ${trendColor} text-xs font-semibold`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
        )}
        
        {target && (
          <div className="text-xs text-gray-500">
            Target: <span className="font-semibold">{target}</span>
          </div>
        )}
      </div>
    </div>
  );
}
