import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Share2, 
  Clock, 
  Calendar,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';

interface AnalysisReportProps {
  referenceFile: File | null;
  queryFile: File | null;
  metrics: any;
  onGenerateReport: () => void;
  onExportData: () => void;
  onShareReport: () => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  referenceFile,
  queryFile,
  metrics,
  onGenerateReport,
  onExportData,
  onShareReport
}) => {
  const analysisDate = new Date().toLocaleDateString();
  const analysisTime = new Date().toLocaleTimeString();

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Analysis Report</h3>
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            Complete
          </Badge>
        </div>

        {/* Report Summary */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Analysis Date:</span>
              </div>
              <p className="font-medium text-foreground">{analysisDate}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Analysis Time:</span>
              </div>
              <p className="font-medium text-foreground">{analysisTime}</p>
            </div>
          </div>

          <Separator />

          {/* File Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">File Information</h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="p-3 bg-surface rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference STL:</span>
                  <span className="font-medium text-foreground">
                    {referenceFile?.name || 'Not loaded'}
                  </span>
                </div>
                {referenceFile && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Size: {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </div>
              <div className="p-3 bg-surface rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Query STL:</span>
                  <span className="font-medium text-foreground">
                    {queryFile?.name || 'Not loaded'}
                  </span>
                </div>
                {queryFile && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Size: {(queryFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Metrics Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Key Findings</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-surface rounded-lg">
                <TrendingUp className="w-5 h-5 text-destructive mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0.45mm</div>
                <div className="text-xs text-muted-foreground">Max Deviation</div>
              </div>
              <div className="text-center p-3 bg-surface rounded-lg">
                <Target className="w-5 h-5 text-warning mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0.12mm</div>
                <div className="text-xs text-muted-foreground">Mean Deviation</div>
              </div>
              <div className="text-center p-3 bg-surface rounded-lg">
                <Activity className="w-5 h-5 text-success mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">94.2%</div>
                <div className="text-xs text-muted-foreground">Overlap</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quality Assessment */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Quality Assessment</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Precision:</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  Excellent
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Geometric Similarity:</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  High (94.2%)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Surface Alignment:</span>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                  Good
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button onClick={onGenerateReport} className="w-full gap-2 btn-medical">
            <FileText className="w-4 h-4" />
            Generate Full Report (PDF)
          </Button>
          <Button onClick={onExportData} variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Data (CSV)
          </Button>
          <Button onClick={onShareReport} variant="outline" className="w-full gap-2">
            <Share2 className="w-4 h-4" />
            Share Report
          </Button>
        </div>
      </div>
    </Card>
  );
};