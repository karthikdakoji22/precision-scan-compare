import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Palette,
  Grid3X3,
  Move3D 
} from 'lucide-react';

interface STLViewerProps {
  referenceFile: File | null;
  queryFile: File | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  deviationData?: number[];
}

export const STLViewer: React.FC<STLViewerProps> = ({
  referenceFile,
  queryFile,
  isAnalyzing,
  analysisComplete,
  deviationData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>();
  
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [showQuery, setShowQuery] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-1, -1, 1);
    scene.add(pointLight);

    // Controls (basic mouse interaction)
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

      // Rotate scene
      scene.rotation.y += deltaX * 0.01;
      scene.rotation.x += deltaY * 0.01;

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(1, Math.min(20, camera.position.z));
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
  }, []);

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

  // Create mock 3D models when files are available
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing models
    const objectsToRemove = [];
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isSTLModel) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current?.remove(obj));

    if (referenceFile && showReference) {
      // Create reference model (green-tinted)
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: analysisComplete && showHeatmap ? 0x00ff88 : 0x4ade80,
        transparent: true,
        opacity: 0.8,
        wireframe: showWireframe
      });
      const referenceMesh = new THREE.Mesh(geometry, material);
      referenceMesh.position.set(-0.5, 0, 0);
      referenceMesh.userData.isSTLModel = true;
      referenceMesh.userData.type = 'reference';
      sceneRef.current.add(referenceMesh);
    }

    if (queryFile && showQuery) {
      // Create query model with heatmap colors if analysis is complete
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      
      let material;
      if (analysisComplete && showHeatmap) {
        // Create heatmap material
        material = new THREE.MeshPhongMaterial({ 
          color: 0xff4081, // Magenta for high deviation areas
          transparent: true,
          opacity: 0.8,
          wireframe: showWireframe
        });
      } else {
        material = new THREE.MeshPhongMaterial({ 
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          wireframe: showWireframe
        });
      }
      
      const queryMesh = new THREE.Mesh(geometry, material);
      queryMesh.position.set(0.5, 0, 0);
      queryMesh.userData.isSTLModel = true;
      queryMesh.userData.type = 'query';
      sceneRef.current.add(queryMesh);
    }

    if (analysisComplete && referenceFile && queryFile) {
      // Add superimposed model showing overlap
      const geometry = new THREE.SphereGeometry(0.75, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: showHeatmap ? 0x00ff88 : 0x8b5cf6,
        transparent: true,
        opacity: 0.6,
        wireframe: showWireframe
      });
      const superimposedMesh = new THREE.Mesh(geometry, material);
      superimposedMesh.position.set(0, 0, 0);
      superimposedMesh.userData.isSTLModel = true;
      superimposedMesh.userData.type = 'superimposed';
      sceneRef.current.add(superimposedMesh);
    }
  }, [referenceFile, queryFile, analysisComplete, showHeatmap, showWireframe, showReference, showQuery]);

  const resetView = () => {
    if (cameraRef.current && sceneRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      sceneRef.current.rotation.set(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(1, cameraRef.current.position.z - 0.5);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(20, cameraRef.current.position.z + 0.5);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">3D Visualization</h3>
            <p className="text-sm text-muted-foreground">
              {analysisComplete ? 'Superimposition Analysis Complete' : 
               isAnalyzing ? 'Analyzing...' : 
               'Upload STL files to begin analysis'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {analysisComplete && (
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                Analysis Complete
              </Badge>
            )}
            {isAnalyzing && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                Analyzing...
              </Badge>
            )}
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1 border border-border rounded-md p-1">
            <Button variant="ghost" size="sm" onClick={resetView}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border border-border rounded-md p-1">
            <Button 
              variant={showReference ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setShowReference(!showReference)}
            >
              {showReference ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Reference
            </Button>
            <Button 
              variant={showQuery ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setShowQuery(!showQuery)}
            >
              {showQuery ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Query
            </Button>
          </div>

          {analysisComplete && (
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button 
                variant={showHeatmap ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Palette className="w-4 h-4" />
                Heatmap
              </Button>
              <Button 
                variant={showWireframe ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setShowWireframe(!showWireframe)}
              >
                <Grid3X3 className="w-4 h-4" />
                Wireframe
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <div 
          ref={containerRef} 
          className="w-full h-full viewer-container"
          style={{ minHeight: '400px' }}
        />
        
        {!referenceFile && !queryFile && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
            <div className="text-center space-y-2">
              <Move3D className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Upload STL files to visualize</p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-foreground font-medium">Performing superimposition analysis...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        )}
      </div>

      {/* Heatmap legend */}
      {analysisComplete && showHeatmap && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deviation Scale</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-heatmap-low rounded-sm" />
                <span className="text-xs text-muted-foreground">Low (0-0.1mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-heatmap-medium rounded-sm" />
                <span className="text-xs text-muted-foreground">Medium (0.1-0.3mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-heatmap-high rounded-sm" />
                <span className="text-xs text-muted-foreground">High (0.3-0.5mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-heatmap-critical rounded-sm" />
                <span className="text-xs text-muted-foreground">Critical (&gt;0.5mm)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};