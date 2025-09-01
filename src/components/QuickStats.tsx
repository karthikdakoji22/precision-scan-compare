import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface QuickStatsProps {
  analysisComplete: boolean;
  isAnalyzing: boolean;
  metrics?: {
    maxDeviation: number;
    meanDeviation: number;
    analysisTime: number;
    overlapPercentage: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  analysisComplete,
  isAnalyzing,
  metrics
}) => {
  const getStatusIcon = () => {
    if (analysisComplete) return CheckCircle;
    if (isAnalyzing) return Activity;
    return AlertTriangle;
  };

  const getStatusColor = () => {
    if (analysisComplete) return 'success';
    if (isAnalyzing) return 'primary';
    return 'warning';
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Quick Statistics</h4>
          <Badge variant="outline" className={`bg-${statusColor}/10 text-${statusColor} border-${statusColor}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {analysisComplete ? 'Complete' : isAnalyzing ? 'Processing' : 'Ready'}
          </Badge>
        </div>

        {analysisComplete && metrics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface rounded-lg text-center">
              <TrendingUp className="w-5 h-5 text-destructive mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {metrics.maxDeviation.toFixed(2)}mm
              </div>
              <div className="text-xs text-muted-foreground">Max Deviation</div>
            </div>
            
            <div className="p-3 bg-surface rounded-lg text-center">
              <Target className="w-5 h-5 text-warning mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {metrics.meanDeviation.toFixed(2)}mm
              </div>
              <div className="text-xs text-muted-foreground">Mean Deviation</div>
            </div>
            
            <div className="p-3 bg-surface rounded-lg text-center">
              <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {metrics.overlapPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Overlap</div>
            </div>
            
            <div className="p-3 bg-surface rounded-lg text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {metrics.analysisTime.toFixed(1)}s
              </div>
              <div className="text-xs text-muted-foreground">Analysis Time</div>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">
              Calculating precision metrics...
            </p>
          </div>
        )}

        {!analysisComplete && !isAnalyzing && (
          <div className="text-center space-y-3">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Start analysis to view metrics
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};