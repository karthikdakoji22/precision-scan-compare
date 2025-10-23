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
    <Card className="p-6 card-professional">
      <h3 className="font-semibold text-foreground mb-6 text-base flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-primary" />
        Viewer Controls
      </h3>
      <div>
        
        {/* View Mode Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-foreground">View Mode</label>
          <div className="grid grid-cols-1 gap-2">
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
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-foreground">Navigation</label>
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
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-foreground">Display Options</label>
          <div className="space-y-2">
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
      <div className="pt-5 border-t border-border">
        <div className="flex items-center justify-between text-sm py-2">
          <span className="text-muted-foreground font-medium">Render Mode:</span>
          <Badge variant="outline" className="text-xs font-semibold">
            {isWireframeMode ? 'Wireframe' : 'Solid'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm py-2">
          <span className="text-muted-foreground font-medium">View Mode:</span>
          <Badge variant="default" className="text-xs capitalize font-semibold">
            {viewMode}
          </Badge>
        </div>
      </div>
    </Card>
  );
};