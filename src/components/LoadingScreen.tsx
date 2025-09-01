import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Microscope, Activity } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading Application",
  progress,
  subMessage = "Initializing precision analysis tools..."
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center">
      <Card className="p-8 w-full max-w-md">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Microscope className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{message}</h2>
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          </div>
          
          {progress !== undefined && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Precision Cavity Analyzer</span>
          </div>
        </div>
      </Card>
    </div>
  );
};