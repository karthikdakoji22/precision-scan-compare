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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 max-w-[1400px]">
        {/* Upload Section */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-1 px-3 py-1 text-xs font-medium">
              Step 1: Upload Files
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Upload STL Files for Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              Upload your reference and query STL files to perform precise superimposition analysis 
              with detailed deviation metrics and visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
          <div className="flex justify-center max-w-6xl mx-auto">
            <Card className="p-8 w-full max-w-2xl card-professional">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Ready to Analyze</h3>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full transition-colors ${referenceFile ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                      <span className={referenceFile ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        Reference STL
                      </span>
                    </div>
                    <div className="w-px h-5 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full transition-colors ${queryFile ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                      <span className={queryFile ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        Query STL
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!canStartAnalysis}
                  size="lg"
                  className="w-full h-12 text-sm font-semibold btn-medical gap-2"
                >
                  <Play className="w-5 h-5" />
                  {isAnalyzing ? 'Analyzing Models...' : 'Start Superimposition Analysis'}
                </Button>
                
                {!canStartAnalysis && !isAnalyzing && (
                  <p className="text-xs text-muted-foreground">
                    Please upload both STL files to begin analysis
                  </p>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Visualization Section */}
        {(referenceFile || queryFile) && (
          <section className="space-y-10">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-1 px-3 py-1 text-xs font-medium">
                Step 2: Visualize & Analyze
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                3D Visualization & Results
              </h2>
              <p className="text-muted-foreground text-base">
                Interactive 3D viewer with real-time superimposition analysis
              </p>
            </div>

            {/* 3D Viewer */}
            <div className="flex justify-center">
              <div className="w-full max-w-[1200px]">
                <div className="rounded-xl overflow-hidden viewer-container">
                  <STLViewer
                    referenceFile={referenceFile}
                    queryFile={queryFile}
                    isAnalyzing={isAnalyzing}
                    analysisComplete={analysisComplete}
                    isHeatmapVisible={true}
                    isWireframeMode={isWireframeMode}
                    viewMode={viewMode}
                  />
                </div>
              </div>
            </div>

            {/* Controls and Info Below Viewer - Perfectly Aligned */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {/* Viewer Controls */}
              <ViewerControls
                onReset={handleResetView}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleHeatmap={() => {}}
                onToggleWireframe={handleToggleWireframe}
                onFullscreen={handleFullscreen}
                isHeatmapVisible={true}
                isWireframeMode={isWireframeMode}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Analysis Status */}
              <Card className="p-6 card-professional">
                <h3 className="font-semibold text-foreground mb-6 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Analysis Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface/80">
                    <span className="text-sm font-medium text-muted-foreground">Reference File</span>
                    <Badge variant={referenceFile ? "default" : "outline"} className="font-medium text-xs">
                      {referenceFile ? "Loaded" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface/80">
                    <span className="text-sm font-medium text-muted-foreground">Query File</span>
                    <Badge variant={queryFile ? "default" : "outline"} className="font-medium text-xs">
                      {queryFile ? "Loaded" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface/80">
                    <span className="text-sm font-medium text-muted-foreground">Analysis</span>
                    <Badge variant={
                      analysisComplete ? "default" : 
                      isAnalyzing ? "outline" : "secondary"
                    } className="font-medium text-xs">
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
          <section className="space-y-10">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-1 px-3 py-1 text-xs font-medium">
                Step 3: Review Results
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Analysis Metrics & Results
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                Comprehensive quantitative analysis with detailed deviation measurements
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
