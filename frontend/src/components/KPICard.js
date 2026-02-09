import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ label, value, unit, change, icon: Icon, dataTestId }) {
  const getChangeColor = () => {
    if (!change) return 'text-muted-foreground';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (!change || change === 0) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const ChangeIcon = getChangeIcon();

  return (
    <div className="kpi-card" data-testid={dataTestId}>
      <div className="flex items-start justify-between mb-3">
        <p className="kpi-label">{label}</p>
        {Icon && (
          <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="kpi-value font-data">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 mt-2 kpi-change ${getChangeColor()}`}>
          <ChangeIcon className="w-4 h-4" />
          <span className="font-data">
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
