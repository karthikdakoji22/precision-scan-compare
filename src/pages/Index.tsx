import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Play, 
  FileText, 
  Download,
  Activity
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UploadZone } from '@/components/UploadZone';
import { STLViewer } from '@/components/STLViewer';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { AnalysisProcessor } from '@/components/AnalysisProcessor';
import { HeatmapLegend } from '@/components/HeatmapLegend';
import { ViewerControls } from '@/components/ViewerControls';
import { AnalysisReport } from '@/components/AnalysisReport';

const Index = () => {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [queryFile, setQueryFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showProcessor, setShowProcessor] = useState(false);
  const [metrics, setMetrics] = useState(null);
  
  // Viewer controls state
  const [isWireframeMode, setIsWireframeMode] = useState(false);
  const [viewMode, setViewMode] = useState<'reference' | 'query' | 'superimposed'>('superimposed');

  const handleStartAnalysis = () => {
    if (!referenceFile || !queryFile) {
      toast.error('Please upload both reference and query STL files');
      return;
    }
    
    setShowProcessor(true);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    toast.success('Starting superimposition analysis...');
  };

  const handleAnalysisComplete = () => {
    setShowProcessor(false);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
    toast.success('Analysis completed successfully!');
  };

  const handleCancelAnalysis = () => {
    setShowProcessor(false);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    toast.info('Analysis cancelled');
  };

  const handleGenerateReport = () => {
    toast.success('Generating PDF report...');
    // Mock report generation
    setTimeout(() => {
      toast.success('Report generated successfully!');
    }, 2000);
  };

  const handleExportData = () => {
    toast.success('Exporting metrics data...');
    // Mock data export
    setTimeout(() => {
      toast.success('Data exported to CSV!');
    }, 1000);
  };

  const handleShareReport = () => {
    toast.success('Generating shareable link...');
    setTimeout(() => {
      toast.success('Report link copied to clipboard!');
    }, 1000);
  };

  // Viewer control handlers
  const handleResetView = () => {
    toast.info('View reset to default position');
  };

  const handleZoomIn = () => {
    toast.info('Zooming in...');
  };

  const handleZoomOut = () => {
    toast.info('Zooming out...');
  };

  const handleToggleWireframe = () => {
    setIsWireframeMode(!isWireframeMode);
    toast.info(`Wireframe mode ${!isWireframeMode ? 'enabled' : 'disabled'}`);
  };

  const handleFullscreen = () => {
    toast.info('Entering fullscreen mode...');
  };

  const canStartAnalysis = referenceFile && queryFile && !isAnalyzing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Upload Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Upload STL Files for Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your reference and query STL files to perform precise superimposition analysis 
              with detailed deviation metrics and heatmap visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadZone
              title="Reference STL"
              description="Upload the training/reference STL file"
              onFileUpload={setReferenceFile}
              uploadedFile={referenceFile}
              onRemoveFile={() => setReferenceFile(null)}
              isDisabled={isAnalyzing}
            />
            
            <UploadZone
              title="Query STL"
              description="Upload the test/query STL file to compare"
              onFileUpload={setQueryFile}
              uploadedFile={queryFile}
              onRemoveFile={() => setQueryFile(null)}
              isDisabled={isAnalyzing}
            />
          </div>

          {/* Analysis Controls */}
          <div className="flex justify-center">
            <Card className="p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${referenceFile ? 'bg-success' : 'bg-muted'}`} />
                  Reference STL
                  <div className={`w-2 h-2 rounded-full ${queryFile ? 'bg-success' : 'bg-muted'}`} />
                  Query STL
                </div>
                
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!canStartAnalysis}
                  size="lg"
                  className="w-full btn-medical gap-2"
                >
                  <Play className="w-5 h-5" />
                  {isAnalyzing ? 'Analyzing...' : 'Start Superimposition Analysis'}
                </Button>
                
                {!canStartAnalysis && !isAnalyzing && (
                  <p className="text-xs text-muted-foreground">
                    Upload both STL files to begin analysis
                  </p>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Visualization Section */}
        {(referenceFile || queryFile) && (
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                3D Visualization & Results
              </h2>
              <p className="text-muted-foreground">
                Interactive 3D viewer with superimposition analysis
              </p>
            </div>

            {/* Centered 3D Viewer */}
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <STLViewer
                  referenceFile={referenceFile}
                  queryFile={queryFile}
                  isAnalyzing={isAnalyzing}
                  analysisComplete={analysisComplete}
                  isHeatmapVisible={false}
                  isWireframeMode={isWireframeMode}
                  viewMode={viewMode}
                />
              </div>
            </div>

            {/* Controls and Info Below Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Viewer Controls */}
              <ViewerControls
                onReset={handleResetView}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleHeatmap={() => {}}
                onToggleWireframe={handleToggleWireframe}
                onFullscreen={handleFullscreen}
                isHeatmapVisible={false}
                isWireframeMode={isWireframeMode}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Analysis Status */}
              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold text-foreground mb-4 text-lg">Analysis Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reference File</span>
                    <Badge variant={referenceFile ? "default" : "outline"} className="font-medium">
                      {referenceFile ? "Loaded" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Query File</span>
                    <Badge variant={queryFile ? "default" : "outline"} className="font-medium">
                      {queryFile ? "Loaded" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Analysis</span>
                    <Badge variant={
                      analysisComplete ? "default" : 
                      isAnalyzing ? "outline" : "secondary"
                    } className="font-medium">
                      {analysisComplete ? "Complete" : 
                       isAnalyzing ? "Processing" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Analysis Report */}
              {analysisComplete && (
                <AnalysisReport
                  referenceFile={referenceFile}
                  queryFile={queryFile}
                  metrics={metrics}
                  onGenerateReport={handleGenerateReport}
                  onExportData={handleExportData}
                  onShareReport={handleShareReport}
                />
              )}
            </div>
          </section>
        )}

        {/* Metrics Section */}
        {(analysisComplete || isAnalyzing || (referenceFile && queryFile)) && (
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Analysis Metrics & Results
              </h2>
              <p className="text-muted-foreground">
                Detailed quantitative analysis of deviation measurements
              </p>
            </div>

            <MetricsDashboard
              metrics={metrics}
              isAnalyzing={isAnalyzing}
              onGenerateReport={handleGenerateReport}
              onExportData={handleExportData}
            />
          </section>
        )}
      </main>

      <Footer />

      {/* Analysis Processor Modal */}
      <AnalysisProcessor
        referenceFile={referenceFile}
        queryFile={queryFile}
        onAnalysisComplete={handleAnalysisComplete}
        onCancel={handleCancelAnalysis}
        isVisible={showProcessor}
      />
    </div>
  );
};

export default Index;
