import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  EyeOff,
  Palette,
  Settings2,
  Maximize,
  RefreshCw
} from 'lucide-react';

interface ViewerControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleHeatmap: () => void;
  onToggleWireframe: () => void;
  onFullscreen: () => void;
  isHeatmapVisible: boolean;
  isWireframeMode: boolean;
  viewMode: 'reference' | 'query' | 'superimposed';
  onViewModeChange: (mode: 'reference' | 'query' | 'superimposed') => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleHeatmap,
  onToggleWireframe,
  onFullscreen,
  isHeatmapVisible,
  isWireframeMode,
  viewMode,
  onViewModeChange
}) => {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h4 className="font-semibold text-foreground mb-3">Viewer Controls</h4>
        
        {/* View Mode Selection */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">View Mode</label>
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant={viewMode === 'reference' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('reference')}
              className="justify-start"
            >
              Reference Only
            </Button>
            <Button
              variant={viewMode === 'query' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('query')}
              className="justify-start"
            >
              Query Only
            </Button>
            <Button
              variant={viewMode === 'superimposed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('superimposed')}
              className="justify-start"
            >
              Superimposed
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">Navigation</label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onZoomIn} className="gap-2">
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </Button>
            <Button variant="outline" size="sm" onClick={onZoomOut} className="gap-2">
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </Button>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 col-span-2">
              <RotateCcw className="w-4 h-4" />
              Reset View
            </Button>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">Display Options</label>
          <div className="space-y-2">
            <Button
              variant={isHeatmapVisible ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleHeatmap}
              className="w-full justify-start gap-2"
            >
              <Palette className="w-4 h-4" />
              Heatmap {isHeatmapVisible ? 'On' : 'Off'}
            </Button>
            <Button
              variant={isWireframeMode ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleWireframe}
              className="w-full justify-start gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Wireframe {isWireframeMode ? 'On' : 'Off'}
            </Button>
          </div>
        </div>

        {/* Additional Controls */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={onFullscreen} className="w-full gap-2">
            <Maximize className="w-4 h-4" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Render Mode:</span>
          <Badge variant="outline" className="text-xs">
            {isWireframeMode ? 'Wireframe' : 'Solid'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Heatmap:</span>
          <Badge variant={isHeatmapVisible ? 'default' : 'outline'} className="text-xs">
            {isHeatmapVisible ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </Card>
  );
};