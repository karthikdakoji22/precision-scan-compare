import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
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
  const stlLoaderRef = useRef<STLLoader>();
  const loadedMeshesRef = useRef<{
    reference?: THREE.Mesh;
    query?: THREE.Mesh;
    superimposed?: THREE.Mesh;
  }>({});
  
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [showQuery, setShowQuery] = useState(true);
  const [loadingSTL, setLoadingSTL] = useState(false);

  // Initialize Three.js scene and STL loader
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize STL loader
    stlLoaderRef.current = new STLLoader();

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

  // STL File Loading and Display System
  const loadSTLFile = async (file: File, type: 'reference' | 'query'): Promise<THREE.Mesh | null> => {
    if (!stlLoaderRef.current) return null;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read file'));
          return;
        }

        try {
          const geometry = stlLoaderRef.current!.parse(arrayBuffer);
          
          // Center and normalize geometry
          geometry.computeBoundingBox();
          const boundingBox = geometry.boundingBox!;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Scale to reasonable size
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDimension; // Scale to fit in 2 unit cube
          geometry.scale(scale, scale, scale);
          
          // Compute normals for proper lighting
          geometry.computeVertexNormals();
          
          // Create material based on type and analysis state
          let material;
          if (type === 'reference') {
            material = new THREE.MeshPhongMaterial({
              color: analysisComplete && showHeatmap ? 0x00ff88 : 0x4ade80,
              transparent: true,
              opacity: 0.85,
              wireframe: showWireframe,
              side: THREE.DoubleSide
            });
          } else {
            if (analysisComplete && showHeatmap) {
              // Create vertex colors for heatmap
              const colors = new Float32Array(geometry.attributes.position.count * 3);
              for (let i = 0; i < colors.length; i += 3) {
                // Simulate heatmap coloring based on vertex position
                const vertex = i / 3;
                const heatValue = Math.random(); // In real implementation, this would be actual deviation data
                
                if (heatValue < 0.25) {
                  // Low deviation - Green
                  colors[i] = 0.0;     // R
                  colors[i + 1] = 1.0; // G
                  colors[i + 2] = 0.0; // B
                } else if (heatValue < 0.5) {
                  // Medium deviation - Yellow
                  colors[i] = 1.0;     // R
                  colors[i + 1] = 1.0; // G
                  colors[i + 2] = 0.0; // B
                } else if (heatValue < 0.75) {
                  // High deviation - Magenta
                  colors[i] = 1.0;     // R
                  colors[i + 1] = 0.0; // G
                  colors[i + 2] = 1.0; // B
                } else {
                  // Critical deviation - Red
                  colors[i] = 1.0;     // R
                  colors[i + 1] = 0.0; // G
                  colors[i + 2] = 0.0; // B
                }
              }
              
              geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
              
              material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                wireframe: showWireframe,
                side: THREE.DoubleSide
              });
            } else {
              material = new THREE.MeshPhongMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.85,
                wireframe: showWireframe,
                side: THREE.DoubleSide
              });
            }
          }
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.isSTLModel = true;
          mesh.userData.type = type;
          mesh.userData.fileName = file.name;
          
          // Position models side by side when not superimposed
          if (!analysisComplete) {
            mesh.position.set(type === 'reference' ? -1.2 : 1.2, 0, 0);
          } else {
            // When analysis is complete, position for superimposition
            mesh.position.set(0, 0, 0);
          }
          
          resolve(mesh);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read STL file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Load and display STL files when they change
  useEffect(() => {
    if (!sceneRef.current || !stlLoaderRef.current) return;

    const loadAndDisplaySTL = async () => {
      setLoadingSTL(true);
      
      // Clear existing STL models
      const objectsToRemove: THREE.Object3D[] = [];
      sceneRef.current!.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.isSTLModel) {
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
      
      // Clear loaded meshes reference
      loadedMeshesRef.current = {};

      try {
        // Load reference file
        if (referenceFile && showReference) {
          const referenceMesh = await loadSTLFile(referenceFile, 'reference');
          if (referenceMesh) {
            loadedMeshesRef.current.reference = referenceMesh;
            sceneRef.current!.add(referenceMesh);
          }
        }

        // Load query file
        if (queryFile && showQuery) {
          const queryMesh = await loadSTLFile(queryFile, 'query');
          if (queryMesh) {
            loadedMeshesRef.current.query = queryMesh;
            sceneRef.current!.add(queryMesh);
          }
        }

        // Create superimposed model when analysis is complete
        if (analysisComplete && referenceFile && queryFile && loadedMeshesRef.current.reference) {
          const superimposedGeometry = loadedMeshesRef.current.reference.geometry.clone();
          
          // Create heatmap material for superimposed model
          const material = new THREE.MeshPhongMaterial({
            color: showHeatmap ? 0x00ff88 : 0x8b5cf6,
            transparent: true,
            opacity: 0.6,
            wireframe: showWireframe,
            side: THREE.DoubleSide
          });
          
          const superimposedMesh = new THREE.Mesh(superimposedGeometry, material);
          superimposedMesh.position.set(0, 0, 0);
          superimposedMesh.userData.isSTLModel = true;
          superimposedMesh.userData.type = 'superimposed';
          
          loadedMeshesRef.current.superimposed = superimposedMesh;
          sceneRef.current!.add(superimposedMesh);
        }

        // Auto-adjust camera to fit models
        if (loadedMeshesRef.current.reference || loadedMeshesRef.current.query) {
          const box = new THREE.Box3();
          
          if (loadedMeshesRef.current.reference) {
            box.expandByObject(loadedMeshesRef.current.reference);
          }
          if (loadedMeshesRef.current.query) {
            box.expandByObject(loadedMeshesRef.current.query);
          }
          
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const distance = Math.max(size.x, size.y, size.z) * 1.5;
          
          if (cameraRef.current) {
            cameraRef.current.position.set(0, 0, distance);
            cameraRef.current.lookAt(center);
          }
        }

      } catch (error) {
        console.error('Error loading STL files:', error);
        // Fallback to simple geometry if STL loading fails
        if (referenceFile && showReference) {
          const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
          const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 });
          const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
          fallbackMesh.position.set(-1.2, 0, 0);
          fallbackMesh.userData.isSTLModel = true;
          fallbackMesh.userData.type = 'reference';
          sceneRef.current!.add(fallbackMesh);
        }
      } finally {
        setLoadingSTL(false);
      }
    };

    loadAndDisplaySTL();
  }, [referenceFile, queryFile, analysisComplete, showHeatmap, showWireframe, showReference, showQuery]);

  // Update materials when display options change
  useEffect(() => {
    if (!sceneRef.current) return;

    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isSTLModel) {
        const material = child.material as THREE.MeshPhongMaterial;
        material.wireframe = showWireframe;
        
        // Update visibility
        if (child.userData.type === 'reference') {
          child.visible = showReference;
        } else if (child.userData.type === 'query') {
          child.visible = showQuery;
        }
      }
    });
  }, [showWireframe, showReference, showQuery]);

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

        {loadingSTL && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-foreground font-medium">Loading STL files...</p>
              <p className="text-sm text-muted-foreground">Parsing 3D geometry</p>
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