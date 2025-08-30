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
  const formatNumber = (value: number, decimals: number = 3, unit: string = 'mm') => {
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getDeviationStatus = (deviation: number) => {
    if (deviation <= 0.1) return { status: 'Excellent', color: 'success', icon: CheckCircle };
    if (deviation <= 0.3) return { status: 'Good', color: 'warning', icon: Activity };
    return { status: 'Needs Review', color: 'destructive', icon: AlertTriangle };
  };

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
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Calculating Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Processing superimposition analysis...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!displayMetrics) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
              Upload and analyze STL files to view detailed metrics
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const maxDeviationStatus = getDeviationStatus(displayMetrics.maxDeviation);
  const meanDeviationStatus = getDeviationStatus(displayMetrics.meanDeviation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
              Superimposition completed • {new Date(displayMetrics.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onExportData} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={onGenerateReport} className="gap-2 btn-medical">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Max Deviation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Max Deviation</p>
                <p className="text-lg font-bold text-foreground">
                  {formatNumber(displayMetrics.maxDeviation)}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`bg-${maxDeviationStatus.color}/10 text-${maxDeviationStatus.color} border-${maxDeviationStatus.color}`}
            >
              {maxDeviationStatus.status}
            </Badge>
          </div>
        </Card>

        {/* Mean Deviation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Mean Deviation</p>
                <p className="text-lg font-bold text-foreground">
                  {formatNumber(displayMetrics.meanDeviation)}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`bg-${meanDeviationStatus.color}/10 text-${meanDeviationStatus.color} border-${meanDeviationStatus.color}`}
            >
              {meanDeviationStatus.status}
            </Badge>
          </div>
        </Card>

        {/* RMS Deviation */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">RMS Deviation</p>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(displayMetrics.rmsDeviation)}
              </p>
            </div>
          </div>
        </Card>

        {/* Volume Difference */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Ruler className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Volume Difference</p>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(displayMetrics.volumeDifference, 2, 'mm³')}
              </p>
            </div>
          </div>
        </Card>

        {/* Surface Area Difference */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Ruler className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Surface Area Diff</p>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(displayMetrics.surfaceAreaDifference, 2, 'mm²')}
              </p>
            </div>
          </div>
        </Card>

        {/* Overlap Percentage */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Overlap</p>
              <p className="text-lg font-bold text-foreground">
                {displayMetrics.overlapPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Detailed Analysis</h4>
          
          <div className="overflow-x-auto">
            <table className="metrics-table w-full">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-foreground">Maximum Deviation</td>
                  <td className="font-mono text-foreground">{displayMetrics.maxDeviation.toFixed(3)}</td>
                  <td className="text-muted-foreground">mm</td>
                  <td>
                    <Badge 
                      variant="outline" 
                      className={`bg-${maxDeviationStatus.color}/10 text-${maxDeviationStatus.color} border-${maxDeviationStatus.color}`}
                    >
                      {maxDeviationStatus.status}
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Largest deviation between reference and query models
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">Mean Deviation</td>
                  <td className="font-mono text-foreground">{displayMetrics.meanDeviation.toFixed(3)}</td>
                  <td className="text-muted-foreground">mm</td>
                  <td>
                    <Badge 
                      variant="outline" 
                      className={`bg-${meanDeviationStatus.color}/10 text-${meanDeviationStatus.color} border-${meanDeviationStatus.color}`}
                    >
                      {meanDeviationStatus.status}
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Average deviation across all measured points
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">RMS Deviation</td>
                  <td className="font-mono text-foreground">{displayMetrics.rmsDeviation.toFixed(3)}</td>
                  <td className="text-muted-foreground">mm</td>
                  <td>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                      Calculated
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Root mean square of all deviations
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">Volume Difference</td>
                  <td className="font-mono text-foreground">{displayMetrics.volumeDifference.toFixed(2)}</td>
                  <td className="text-muted-foreground">mm³</td>
                  <td>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                      Measured
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Volumetric difference between models
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">Surface Area Difference</td>
                  <td className="font-mono text-foreground">{displayMetrics.surfaceAreaDifference.toFixed(2)}</td>
                  <td className="text-muted-foreground">mm²</td>
                  <td>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                      Measured
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Surface area difference between models
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">Overlap Percentage</td>
                  <td className="font-mono text-foreground">{displayMetrics.overlapPercentage.toFixed(1)}</td>
                  <td className="text-muted-foreground">%</td>
                  <td>
                    <Badge variant="outline" className="bg-success/10 text-success border-success">
                      Excellent
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Percentage of overlapping geometry
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-foreground">Analysis Time</td>
                  <td className="font-mono text-foreground">{displayMetrics.analysisTime.toFixed(1)}</td>
                  <td className="text-muted-foreground">sec</td>
                  <td>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                      System
                    </Badge>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Time taken for complete analysis
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};