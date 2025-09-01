import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeatmapLegendProps {
  minDeviation: number;
  maxDeviation: number;
  unit?: string;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({
  minDeviation,
  maxDeviation,
  unit = 'mm'
}) => {
  const ranges = [
    { label: 'Minimal', color: 'heatmap-low', range: `0.00-${(maxDeviation * 0.25).toFixed(2)}${unit}` },
    { label: 'Low', color: 'heatmap-medium', range: `${(maxDeviation * 0.25).toFixed(2)}-${(maxDeviation * 0.5).toFixed(2)}${unit}` },
    { label: 'Medium', color: 'heatmap-high', range: `${(maxDeviation * 0.5).toFixed(2)}-${(maxDeviation * 0.75).toFixed(2)}${unit}` },
    { label: 'High', color: 'heatmap-critical', range: `${(maxDeviation * 0.75).toFixed(2)}-${maxDeviation.toFixed(2)}${unit}` }
  ];

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Deviation Heatmap</h4>
        
        {/* Color gradient bar */}
        <div className="relative h-6 rounded heatmap-gradient">
          <div className="absolute -top-6 left-0 text-xs text-muted-foreground">
            {minDeviation.toFixed(2)}{unit}
          </div>
          <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
            {maxDeviation.toFixed(2)}{unit}
          </div>
        </div>
        
        {/* Legend items */}
        <div className="grid grid-cols-2 gap-2">
          {ranges.map((range, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className={`w-4 h-4 rounded`} 
                style={{ backgroundColor: `hsl(var(--${range.color}))` }}
              />
              <div className="text-xs">
                <div className="font-medium text-foreground">{range.label}</div>
                <div className="text-muted-foreground">{range.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};