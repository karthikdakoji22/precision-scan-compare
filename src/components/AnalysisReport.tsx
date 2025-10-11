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
    <Card className="p-5 space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Analysis Report</h3>
          <Badge variant="outline" className="bg-success/15 text-success border-success">
            Complete
          </Badge>
        </div>

        {/* Report Summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
              </div>
              <p className="font-medium text-foreground">{analysisDate}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Time:</span>
              </div>
              <p className="font-medium text-foreground">{analysisTime}</p>
            </div>
          </div>

          <Separator />

          {/* File Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">File Information</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-surface/50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">Reference STL:</span>
                  <span className="font-medium text-foreground truncate">
                    {referenceFile?.name || 'Not loaded'}
                  </span>
                  {referenceFile && (
                    <span className="text-xs text-muted-foreground">
                      {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-surface/50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">Query STL:</span>
                  <span className="font-medium text-foreground truncate">
                    {queryFile?.name || 'Not loaded'}
                  </span>
                  {queryFile && (
                    <span className="text-xs text-muted-foreground">
                      {(queryFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Similarity Result */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">Similarity Result</h4>
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
              <Activity className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-3xl font-bold text-success mb-1">94.2%</div>
              <div className="text-xs text-muted-foreground">Geometric Similarity</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-3 border-t border-border">
          <Button onClick={onGenerateReport} className="w-full gap-2 btn-medical">
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
          <Button onClick={onExportData} variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Data
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