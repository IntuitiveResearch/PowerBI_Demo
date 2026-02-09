import React from 'react';

export default function PowerBIKPICard({ label, value, unit, icon: Icon, gradient = 'from-blue-500 to-cyan-500', dataTestId }) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
      data-testid={dataTestId}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
      
      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
            {label}
          </p>
          {Icon && (
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold font-mono tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}
          </p>
          {unit && <span className="text-lg font-medium opacity-90">{unit}</span>}
        </div>
        
        {/* Decorative element */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
