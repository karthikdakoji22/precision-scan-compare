import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Palette,
  Grid3X3,
  Move3D,
  RefreshCw 
} from 'lucide-react';
import { STLProcessor, SuperimpositionResult } from '@/utils/stlProcessor';

interface STLViewerProps {
  referenceFile: File | null;
  queryFile: File | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  isHeatmapVisible?: boolean;
  isWireframeMode?: boolean;
  viewMode?: 'reference' | 'query' | 'superimposed';
  onAnalysisProgress?: (stage: string, progress: number) => void;
  onAnalysisComplete?: (result: SuperimpositionResult) => void;
  onAnalysisError?: (error: Error) => void;
}

export const STLViewer: React.FC<STLViewerProps> = ({
  referenceFile,
  queryFile,
  isAnalyzing,
  analysisComplete,
  isHeatmapVisible = true,
  isWireframeMode = false,
  viewMode = 'superimposed',
  onAnalysisProgress,
  onAnalysisComplete,
  onAnalysisError
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const analysisResultRef = useRef<SuperimpositionResult | null>(null);
  
  const [loadingSTL, setLoadingSTL] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Initializing Three.js scene...');

    // Scene setup
    const scene = new THREE.Scene();
    const backgroundColor = theme === 'dark' ? 0x1a1a2e : 0xf1f5f9;
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Professional lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Basic mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      // Rotate camera around the scene
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(factor);
      
      // Limit zoom range
      const distance = camera.position.length();
      if (distance < 2) {
        camera.position.setLength(2);
      } else if (distance > 50) {
        camera.position.setLength(50);
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    console.log('Three.js scene initialized');

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear scene function
  const clearScene = () => {
    if (!sceneRef.current) return;

    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.type) {
        objectsToRemove.push(child);
      }
    });

    objectsToRemove.forEach(obj => {
      sceneRef.current!.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    console.log('Scene cleared');
  };

  // Load preview meshes (before analysis)
  const loadPreviewMeshes = async () => {
    if (!sceneRef.current || !referenceFile || !queryFile) return;

    try {
      setLoadingSTL(true);
      console.log('Loading preview meshes...');

      // Clear existing meshes
      clearScene();

      // Load both files for preview
      const [trainingData, testData] = await Promise.all([
        STLProcessor.loadSTLFile(referenceFile),
        STLProcessor.loadSTLFile(queryFile)
      ]);

      // Create preview meshes with distinct colors and positions
      const trainingMesh = STLProcessor.createPreviewMesh(
        trainingData.geometry,
        new THREE.Color(0.4, 0.8, 0.4), // Green for training
        new THREE.Vector3(-3, 0, 0)
      );

      const testMesh = STLProcessor.createPreviewMesh(
        testData.geometry,
        new THREE.Color(0.4, 0.4, 0.8), // Blue for test
        new THREE.Vector3(3, 0, 0)
      );

      sceneRef.current.add(trainingMesh);
      sceneRef.current.add(testMesh);

      console.log('Preview meshes loaded');
      toast.success('STL files loaded successfully');

    } catch (error) {
      console.error('Error loading preview meshes:', error);
      toast.error('Failed to load STL files');
    } finally {
      setLoadingSTL(false);
    }
  };

  // Perform superimposition analysis
  const performAnalysis = async () => {
    if (!sceneRef.current || !referenceFile || !queryFile) return;

    try {
      setLoadingSTL(true);
      console.log('Starting superimposition analysis...');
      toast.info('Starting ICP superimposition analysis...');

      // Clear existing meshes
      clearScene();

      // Progress callback
      const progressCallback = (stage: string, progress: number) => {
        setCurrentStage(stage);
        setAnalysisProgress(progress);
        onAnalysisProgress?.(stage, progress);
        console.log(`Analysis progress: ${stage} - ${progress}%`);
      };

      // Perform complete superimposition analysis
      const result = await STLProcessor.performSuperimposition(
        referenceFile,
        queryFile,
        progressCallback
      );

      // Store result
      analysisResultRef.current = result;

      // Add superimposed mesh to scene
      sceneRef.current.add(result.superimposedMesh);

      console.log('Superimposition analysis complete');
      console.log('ICP Result:', {
        converged: result.icpResult.converged,
        iterations: result.icpResult.iterations,
        error: result.icpResult.error
      });
      console.log('Deviation Statistics:', result.deviationAnalysis.statistics);

      // Notify completion
      onAnalysisComplete?.(result);
      toast.success('Superimposition analysis completed successfully!');

    } catch (error) {
      console.error('Error in superimposition analysis:', error);
      onAnalysisError?.(error as Error);
      toast.error('Failed to perform superimposition analysis');
    } finally {
      setLoadingSTL(false);
      setCurrentStage('');
      setAnalysisProgress(0);
    }
  };

  // Effect to handle file changes and analysis state
  useEffect(() => {
    if (referenceFile && queryFile && !isAnalyzing && !analysisComplete) {
      // Load preview meshes
      loadPreviewMeshes();
    } else if (isAnalyzing && referenceFile && queryFile) {
      // Perform analysis
      performAnalysis();
    } else if (!referenceFile && !queryFile) {
      // Clear scene if no files
      clearScene();
    }
  }, [referenceFile, queryFile, isAnalyzing]);

  // Handle wireframe mode change
  useEffect(() => {
    if (!sceneRef.current || !analysisResultRef.current) return;

    const superimposedMesh = analysisResultRef.current.superimposedMesh;
    if (superimposedMesh && superimposedMesh.material instanceof THREE.Material) {
      (superimposedMesh.material as any).wireframe = isWireframeMode;
    }
  }, [isWireframeMode]);

  // Reset camera view
  const resetView = () => {
    if (!cameraRef.current) return;
    
    cameraRef.current.position.set(5, 5, 5);
    cameraRef.current.lookAt(0, 0, 0);
    toast.info('Camera view reset');
  };

  return (
    <Card className="h-[600px] viewer-container overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Move3D className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">STL Viewer</h3>
              </div>
              {analysisComplete && analysisResultRef.current && (
                <Badge variant="default" className="bg-success text-success-foreground">
                  Analysis Complete
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset View
              </Button>
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentStage}</span>
                <span className="text-muted-foreground">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <div 
            ref={containerRef} 
            className="w-full h-full bg-surface"
            style={{ minHeight: '400px' }}
          />
          
          {/* Loading overlay */}
          {loadingSTL && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {currentStage || 'Loading STL files...'}
                </p>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {!referenceFile || !queryFile ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2 text-muted-foreground">
                <Grid3X3 className="w-12 h-12 mx-auto opacity-50" />
                <p className="text-lg font-medium">Upload STL Files</p>
                <p className="text-sm">Upload both training and test STL files to begin</p>
              </div>
            </div>
          ) : !analysisComplete && !isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto opacity-50" />
                <p className="text-lg font-medium">Files Loaded</p>
                <p className="text-sm">Ready for superimposition analysis</p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results Summary */}
        {analysisComplete && analysisResultRef.current && (
          <div className="p-4 border-t border-border bg-surface/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">ICP Iterations</p>
                <p className="font-semibold text-foreground">
                  {analysisResultRef.current.icpResult.iterations}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Alignment Error</p>
                <p className="font-semibold text-foreground">
                  {analysisResultRef.current.icpResult.error.toFixed(6)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Matching Areas</p>
                <p className="font-semibold text-success">
                  {analysisResultRef.current.deviationAnalysis.statistics.matchingPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Deviation Areas</p>
                <p className="font-semibold text-destructive">
                  {analysisResultRef.current.deviationAnalysis.statistics.deviationPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};