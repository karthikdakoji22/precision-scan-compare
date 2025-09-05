import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Upload, 
  GitCompareArrows, 
  Target, 
  Activity, 
  FileText,
  X 
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: React.ElementType;
}

interface AnalysisProcessorProps {
  referenceFile: File | null;
  queryFile: File | null;
  onAnalysisComplete: () => void;
  onCancel: () => void;
  isVisible: boolean;
  analysisStage?: string;
  analysisProgress?: number;
}

export const AnalysisProcessor: React.FC<AnalysisProcessorProps> = ({
  referenceFile,
  queryFile,
  onAnalysisComplete,
  onCancel,
  isVisible,
  analysisStage = '',
  analysisProgress = 0
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const analysisSteps: AnalysisStep[] = [
    {
      id: 'upload',
      title: 'File Validation',
      description: 'Validating STL file integrity and format',
      status: 'pending',
      progress: 0,
      icon: Upload
    },
    {
      id: 'preprocessing',
      title: 'Preprocessing',
      description: 'Converting STL to point clouds and mesh optimization',
      status: 'pending',
      progress: 0,
      icon: Activity
    },
    {
      id: 'alignment',
      title: 'Model Alignment',
      description: 'Performing ICP registration and superimposition',
      status: 'pending',
      progress: 0,
      icon: GitCompareArrows
    },
    {
      id: 'analysis',
      title: 'Deviation Analysis',
      description: 'Calculating point-to-point deviations and metrics',
      status: 'pending',
      progress: 0,
      icon: Target
    },
    {
      id: 'visualization',
      title: 'Heatmap Generation',
      description: 'Creating color-coded deviation visualization',
      status: 'pending',
      progress: 0,
      icon: Activity
    },
    {
      id: 'report',
      title: 'Report Generation',
      description: 'Preparing analysis results and metrics',
      status: 'pending',
      progress: 0,
      icon: FileText
    }
  ];

  const [steps, setSteps] = useState(analysisSteps);

  useEffect(() => {
    if (isVisible && referenceFile && queryFile && !isProcessing) {
      startAnalysis();
    }
  }, [isVisible, referenceFile, queryFile]);

  const startAnalysis = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    setOverallProgress(0);

    // Reset all steps
    setSteps(prevSteps => 
      prevSteps.map(step => ({ 
        ...step, 
        status: 'pending' as const, 
        progress: 0 
      }))
    );

    // Process each step with realistic timing
    for (let i = 0; i < analysisSteps.length; i++) {
      await processStep(i);
      setCurrentStep(i + 1);
      setOverallProgress(((i + 1) / analysisSteps.length) * 100);
    }

    setIsProcessing(false);
    setTimeout(() => {
      onAnalysisComplete();
    }, 1000);
  };

  const processStep = async (stepIndex: number) => {
    // Set step to processing
    setSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === stepIndex 
          ? { ...step, status: 'processing' as const }
          : step
      )
    );

    // Simulate step progress
    const stepDuration = [2000, 3000, 4000, 3500, 2500, 2000][stepIndex]; // Different durations for each step
    const progressIncrement = 100 / (stepDuration / 100);

    for (let progress = 0; progress <= 100; progress += progressIncrement) {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === stepIndex 
            ? { ...step, progress: Math.min(progress, 100) }
            : step
        )
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Set step to completed
    setSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === stepIndex 
          ? { ...step, status: 'completed' as const, progress: 100 }
          : step
      )
    );
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setCurrentStep(0);
    setOverallProgress(0);
    setSteps(prevSteps => 
      prevSteps.map(step => ({ 
        ...step, 
        status: 'pending' as const, 
        progress: 0 
      }))
    );
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                STL Superimposition Analysis
              </h2>
              <p className="text-sm text-muted-foreground">
                Processing {referenceFile?.name} vs {queryFile?.name}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              disabled={!isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Overall Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep && isProcessing;
            const isCompleted = step.status === 'completed';
            const isPending = step.status === 'pending';

            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-all duration-300
                  ${isActive ? 'border-primary bg-primary/5' : 
                    isCompleted ? 'border-success bg-success/5' : 
                    'border-border bg-surface'}
                `}
              >
                {/* Step Icon */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-success text-success-foreground' :
                    isActive ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      font-medium
                      ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {step.title}
                    </h3>
                    <span className={`
                      text-sm
                      ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {step.status === 'processing' ? `${Math.round(step.progress)}%` :
                       step.status === 'completed' ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  
                  <p className={`
                    text-sm mt-1
                    ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step.description}
                  </p>

                  {/* Step Progress Bar */}
                  {step.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {step.status === 'processing' && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isProcessing ? 
                'Analysis in progress. This may take several minutes...' :
                'Ready to begin analysis'
              }
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              {!isProcessing && currentStep === 0 && (
                <Button onClick={startAnalysis} className="btn-medical">
                  Start Analysis
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};