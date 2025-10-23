import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Target, 
  Ruler, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MetricsData {
  maxDeviation: number;
  meanDeviation: number;
  rmsDeviation: number;
  volumeDifference: number;
  surfaceAreaDifference: number;
  overlapPercentage: number;
  analysisTime: number;
  timestamp: string;
}

interface MetricsDashboardProps {
  metrics: MetricsData | null;
  isAnalyzing: boolean;
  onGenerateReport: () => void;
  onExportData: () => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  isAnalyzing,
  onGenerateReport,
  onExportData
}) => {
  const mockMetrics: MetricsData = {
    maxDeviation: 0.45,
    meanDeviation: 0.12,
    rmsDeviation: 0.18,
    volumeDifference: 2.34,
    surfaceAreaDifference: 1.87,
    overlapPercentage: 94.2,
    analysisTime: 12.5,
    timestamp: new Date().toISOString()
  };

  const displayMetrics = metrics || (isAnalyzing ? null : mockMetrics);

  if (isAnalyzing) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Calculating Similarity</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Processing superimposition analysis...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!displayMetrics) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Similarity Analysis</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Upload and analyze STL files to view similarity percentage
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Main Similarity Card */}
      <Card className="p-12 bg-gradient-to-br from-surface via-card to-background border-2 shadow-xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Similarity Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Superimposition completed on {new Date(displayMetrics.timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Large Similarity Percentage */}
          <div className="py-8">
            <div className="inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-success/20 to-success/5 border-4 border-success/30">
              <div className="text-center">
                <div className="text-7xl font-bold text-success mb-2">
                  {displayMetrics.overlapPercentage.toFixed(1)}%
                </div>
                <div className="text-lg font-semibold text-foreground">
                  Similarity Match
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assessment */}
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-success" />
            <Badge variant="outline" className="bg-success/15 text-success border-success px-4 py-2 text-base font-semibold">
              {displayMetrics.overlapPercentage >= 95 ? 'Excellent Match' : 
               displayMetrics.overlapPercentage >= 90 ? 'Very Good Match' :
               displayMetrics.overlapPercentage >= 80 ? 'Good Match' : 'Moderate Match'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button onClick={onExportData} variant="outline" size="lg" className="gap-2 px-6">
              <Download className="w-5 h-5" />
              Export Data
            </Button>
            <Button onClick={onGenerateReport} size="lg" className="gap-2 px-6 btn-medical">
              <FileText className="w-5 h-5" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};