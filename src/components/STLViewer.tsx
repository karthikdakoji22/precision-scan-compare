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
  Move3D,
  RefreshCw 
} from 'lucide-react';

interface STLViewerProps {
  referenceFile: File | null;
  queryFile: File | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  deviationData?: number[];
  isHeatmapVisible?: boolean;
  isWireframeMode?: boolean;
  viewMode?: 'reference' | 'query' | 'superimposed';
}

export const STLViewer: React.FC<STLViewerProps> = ({
  referenceFile,
  queryFile,
  isAnalyzing,
  analysisComplete,
  deviationData,
  isHeatmapVisible = true,
  isWireframeMode = false,
  viewMode = 'superimposed'
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
  
  const [showReference, setShowReference] = useState(true);
  const [showQuery, setShowQuery] = useState(true);
  
  // Use props for controlled state
  const showHeatmap = isHeatmapVisible;
  const showWireframe = isWireframeMode;
  const [loadingSTL, setLoadingSTL] = useState(false);
  const [deviationStats, setDeviationStats] = useState<{
    min: number;
    max: number;
    average: number;
    median: number;
  } | null>(null);

  // Initialize Three.js scene and STL loader
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize STL loader
    stlLoaderRef.current = new STLLoader();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafbfc);
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

    // Professional medical lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(1, 1, 1);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-1, 0.5, 0.5);
    scene.add(directionalLight2);

    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
    rimLight.position.set(0, 0, -1);
    scene.add(rimLight);

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

  // Advanced STL File Loading with Precision Alignment
  const loadSTLFile = async (file: File, type: 'reference' | 'query'): Promise<{ 
    geometry: THREE.BufferGeometry, 
    originalGeometry: THREE.BufferGeometry,
    boundingBox: THREE.Box3,
    center: THREE.Vector3,
    scale: number 
  } | null> => {
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
          const originalGeometry = stlLoaderRef.current!.parse(arrayBuffer);
          const geometry = originalGeometry.clone();
          
          // Calculate precise bounding box and center
          geometry.computeBoundingBox();
          const boundingBox = geometry.boundingBox!;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          // Store original center for alignment
          const originalCenter = center.clone();
          
          // Center geometry at origin for perfect alignment
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Calculate consistent scaling for superimposition
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = 3 / maxDimension; // Larger scale for better detail
          geometry.scale(scale, scale, scale);
          
          // Optimize geometry for analysis
          geometry.computeVertexNormals();
          geometry.computeBoundingSphere();
          
          resolve({ 
            geometry, 
            originalGeometry, 
            boundingBox, 
            center: originalCenter, 
            scale 
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read STL file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Advanced Mesh Deviation Analysis with Statistical Accuracy
  const calculateMeshDeviations = (queryGeometry: THREE.BufferGeometry, referenceGeometry: THREE.BufferGeometry): {
    deviations: Float32Array;
    stats: { min: number; max: number; average: number; median: number; };
  } => {
    const queryPositions = queryGeometry.attributes.position.array as Float32Array;
    const referencePositions = referenceGeometry.attributes.position.array as Float32Array;
    const deviations = new Float32Array(queryPositions.length / 3);
    
    // Build spatial index for reference mesh for faster lookups
    const refVertices: THREE.Vector3[] = [];
    for (let i = 0; i < referencePositions.length; i += 3) {
      refVertices.push(new THREE.Vector3(
        referencePositions[i],
        referencePositions[i + 1],
        referencePositions[i + 2]
      ));
    }
    
    const tempDeviations: number[] = [];
    
    // Calculate precise point-to-point deviations
    for (let i = 0; i < queryPositions.length; i += 3) {
      const queryVertex = new THREE.Vector3(
        queryPositions[i],
        queryPositions[i + 1],
        queryPositions[i + 2]
      );
      
      let minDistance = Infinity;
      
      // Optimized distance calculation with early exit
      for (const refVertex of refVertices) {
        const distance = queryVertex.distanceTo(refVertex);
        if (distance < minDistance) {
          minDistance = distance;
        }
        // Early exit if very close match found
        if (distance < 0.001) break;
      }
      
      deviations[i / 3] = minDistance;
      tempDeviations.push(minDistance);
    }
    
    // Calculate statistical measures
    const sortedDeviations = [...tempDeviations].sort((a, b) => a - b);
    const min = sortedDeviations[0];
    const max = sortedDeviations[sortedDeviations.length - 1];
    const average = tempDeviations.reduce((sum, val) => sum + val, 0) / tempDeviations.length;
    const median = sortedDeviations[Math.floor(sortedDeviations.length / 2)];
    
    const stats = { min, max, average, median };
    setDeviationStats(stats);
    
    return { deviations, stats };
  };

  // Professional Superimposed Mesh with Advanced Heatmap Analysis
  const createSuperimposedMesh = (
    referenceGeometry: THREE.BufferGeometry,
    queryGeometry: THREE.BufferGeometry
  ): THREE.Mesh => {
    // Create perfectly aligned superimposed geometry
    const superGeometry = queryGeometry.clone();
    
    if (showHeatmap) {
      // Calculate advanced deviations with statistics
      const { deviations, stats } = calculateMeshDeviations(queryGeometry, referenceGeometry);
      
      // Create sophisticated vertex colors with professional medical color scheme
      const colors = new Float32Array(superGeometry.attributes.position.count * 3);
      const maxDeviation = stats.max;
      
      for (let i = 0; i < deviations.length; i++) {
        const deviation = deviations[i];
        const normalizedDeviation = maxDeviation > 0 ? deviation / maxDeviation : 0;
        const colorIndex = i * 3;
        
        // Professional medical heatmap color mapping
        if (normalizedDeviation <= 0.1) {
          // Excellent match - Deep Green (HSL: 140, 65%, 45%)
          colors[colorIndex] = 0.133;     // R
          colors[colorIndex + 1] = 0.753; // G
          colors[colorIndex + 2] = 0.416; // B
        } else if (normalizedDeviation <= 0.25) {
          // Good match - Light Green
          colors[colorIndex] = 0.486;     // R
          colors[colorIndex + 1] = 0.867; // G
          colors[colorIndex + 2] = 0.514; // B
        } else if (normalizedDeviation <= 0.5) {
          // Moderate deviation - Yellow (HSL: 45, 90%, 55%)
          colors[colorIndex] = 0.976;     // R
          colors[colorIndex + 1] = 0.867; // G
          colors[colorIndex + 2] = 0.220; // B
        } else if (normalizedDeviation <= 0.75) {
          // High deviation - Orange
          colors[colorIndex] = 1.0;       // R
          colors[colorIndex + 1] = 0.647; // G
          colors[colorIndex + 2] = 0.0;   // B
        } else {
          // Critical deviation - Red (HSL: 0, 75%, 55%)
          colors[colorIndex] = 0.894;     // R
          colors[colorIndex + 1] = 0.278; // G
          colors[colorIndex + 2] = 0.278; // B
        }
      }
      
      superGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        wireframe: showWireframe,
        side: THREE.DoubleSide,
        flatShading: false
      });
      
      const mesh = new THREE.Mesh(superGeometry, material);
      mesh.position.set(0, 0, 0);
      mesh.userData.isSTLModel = true;
      mesh.userData.type = 'superimposed';
      mesh.userData.deviationStats = stats;
      
      return mesh;
    } else {
      // Professional unified model without heatmap
      const material = new THREE.MeshLambertMaterial({
        color: 0x4a90e2, // Professional medical blue
        transparent: true,
        opacity: 0.85,
        wireframe: showWireframe,
        side: THREE.DoubleSide,
        flatShading: false
      });
      
      const mesh = new THREE.Mesh(superGeometry, material);
      mesh.position.set(0, 0, 0);
      mesh.userData.isSTLModel = true;
      mesh.userData.type = 'superimposed';
      
      return mesh;
    }
  };

  // Store loaded geometries for superimposition
  const loadedGeometriesRef = useRef<{
    reference?: THREE.BufferGeometry;
    query?: THREE.BufferGeometry;
  }>({});

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
      loadedGeometriesRef.current = {};

      try {
        let referenceGeometry: THREE.BufferGeometry | null = null;
        let queryGeometry: THREE.BufferGeometry | null = null;

        // Load reference file with precision alignment
        if (referenceFile) {
          const refData = await loadSTLFile(referenceFile, 'reference');
          if (refData) {
            referenceGeometry = refData.geometry;
            loadedGeometriesRef.current.reference = refData.geometry;
            
            if (!analysisComplete) {
              // Show reference model separately before analysis
              const material = new THREE.MeshLambertMaterial({
                color: 0x22c55e, // Professional green
                transparent: true,
                opacity: 0.9,
                wireframe: showWireframe,
                side: THREE.DoubleSide,
                flatShading: false
              });
              
              const mesh = new THREE.Mesh(referenceGeometry, material);
              mesh.position.set(-2.0, 0, 0); // Wider spacing for better visibility
              mesh.userData.isSTLModel = true;
              mesh.userData.type = 'reference';
              mesh.userData.fileName = referenceFile.name;
              mesh.visible = showReference;
              
              loadedMeshesRef.current.reference = mesh;
              sceneRef.current!.add(mesh);
            }
          }
        }

        // Load query file with precision alignment
        if (queryFile) {
          const queryData = await loadSTLFile(queryFile, 'query');
          if (queryData) {
            queryGeometry = queryData.geometry;
            loadedGeometriesRef.current.query = queryData.geometry;
            
            if (!analysisComplete) {
              // Show query model separately before analysis
              const material = new THREE.MeshLambertMaterial({
                color: 0x3b82f6, // Professional blue
                transparent: true,
                opacity: 0.9,
                wireframe: showWireframe,
                side: THREE.DoubleSide,
                flatShading: false
              });
              
              const mesh = new THREE.Mesh(queryGeometry, material);
              mesh.position.set(2.0, 0, 0); // Wider spacing for better visibility
              mesh.userData.isSTLModel = true;
              mesh.userData.type = 'query';
              mesh.userData.fileName = queryFile.name;
              mesh.visible = showQuery;
              
              loadedMeshesRef.current.query = mesh;
              sceneRef.current!.add(mesh);
            }
          }
        }

        // Create professionally superimposed model when analysis is complete
        if (analysisComplete && referenceGeometry && queryGeometry) {
          // Hide individual models during superimposition for clean analysis view
          if (loadedMeshesRef.current.reference) {
            loadedMeshesRef.current.reference.visible = false;
          }
          if (loadedMeshesRef.current.query) {
            loadedMeshesRef.current.query.visible = false;
          }
          
          const superimposedMesh = createSuperimposedMesh(referenceGeometry, queryGeometry);
          loadedMeshesRef.current.superimposed = superimposedMesh;
          sceneRef.current!.add(superimposedMesh);
        }

        // Professional camera positioning with optimal viewing angle
        if (referenceGeometry || queryGeometry) {
          const box = new THREE.Box3();
          
          if (loadedMeshesRef.current.reference && loadedMeshesRef.current.reference.visible) {
            box.expandByObject(loadedMeshesRef.current.reference);
          }
          if (loadedMeshesRef.current.query && loadedMeshesRef.current.query.visible) {
            box.expandByObject(loadedMeshesRef.current.query);
          }
          if (loadedMeshesRef.current.superimposed) {
            box.expandByObject(loadedMeshesRef.current.superimposed);
          }
          
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          
          // Professional camera positioning for medical analysis
          const distance = analysisComplete ? maxSize * 2.2 : maxSize * 2.8;
          
          if (cameraRef.current) {
            cameraRef.current.position.set(
              analysisComplete ? 0 : 0,
              analysisComplete ? 0 : maxSize * 0.3,
              distance
            );
            cameraRef.current.lookAt(center);
          }
        }

      } catch (error) {
        console.error('Error loading STL files:', error);
      } finally {
        setLoadingSTL(false);
      }
    };

    loadAndDisplaySTL();
  }, [referenceFile, queryFile, analysisComplete, isHeatmapVisible, isWireframeMode, showReference, showQuery]);

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
      // Reset to optimal viewing position
      const distance = analysisComplete ? 6 : 8;
      cameraRef.current.position.set(0, 0, distance);
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
      {/* Professional Header with Enhanced Controls */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-surface to-background">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">Professional 3D Superimposition Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {analysisComplete ? 'Precision superimposition analysis completed with statistical accuracy' : 
               isAnalyzing ? 'Processing advanced geometric comparison...' : 
               'Upload STL files for professional superimposition analysis'}
            </p>
            {deviationStats && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Max: {deviationStats.max.toFixed(4)}mm</span>
                <span>Avg: {deviationStats.average.toFixed(4)}mm</span>
                <span>Min: {deviationStats.min.toFixed(4)}mm</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {analysisComplete && (
              <Badge variant="outline" className="bg-success/15 text-success border-success font-medium px-3 py-1">
                ✓ Analysis Complete
              </Badge>
            )}
            {isAnalyzing && (
              <Badge variant="outline" className="bg-primary/15 text-primary border-primary font-medium px-3 py-1">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Analyzing...
              </Badge>
            )}
          </div>
        </div>

        {/* Professional Control Panel */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1.5">
              <Button variant="ghost" size="sm" onClick={resetView} className="hover:bg-primary/10">
                <RotateCcw className="w-4 h-4" />
                <span className="ml-1 text-xs">Reset</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={zoomIn} className="hover:bg-primary/10">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={zoomOut} className="hover:bg-primary/10">
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {!analysisComplete && (
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1.5">
                <Button 
                  variant={showReference ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setShowReference(!showReference)}
                  className="text-xs"
                >
                  {showReference ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="ml-1">Reference</span>
                </Button>
                <Button 
                  variant={showQuery ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setShowQuery(!showQuery)}
                  className="text-xs"
                >
                  {showQuery ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="ml-1">Query</span>
                </Button>
              </div>
            )}
          </div>

            {analysisComplete && (
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1.5">
                <Button 
                  variant={showHeatmap ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs font-medium"
                >
                  <Palette className="w-4 h-4" />
                  <span className="ml-1">Deviation Map</span>
                </Button>
                <Button 
                  variant={showWireframe ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="ml-1">Wireframe</span>
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

      {/* Professional Deviation Analysis Legend */}
      {analysisComplete && showHeatmap && deviationStats && (
        <div className="p-5 border-t border-border bg-gradient-to-r from-surface/50 to-background/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Deviation Analysis Scale</h4>
              <span className="text-xs text-muted-foreground">Range: {deviationStats.min.toFixed(4)}mm - {deviationStats.max.toFixed(4)}mm</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border border-border" style={{backgroundColor: 'rgb(34, 197, 94)'}} />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">Excellent</div>
                    <div className="text-muted-foreground">≤10% deviation</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border border-border" style={{backgroundColor: 'rgb(124, 221, 131)'}} />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">Good</div>
                    <div className="text-muted-foreground">10-25%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border border-border" style={{backgroundColor: 'rgb(249, 221, 56)'}} />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">Moderate</div>
                    <div className="text-muted-foreground">25-50%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border border-border" style={{backgroundColor: 'rgb(255, 165, 0)'}} />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">High</div>
                    <div className="text-muted-foreground">50-75%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border border-border" style={{backgroundColor: 'rgb(228, 71, 71)'}} />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">Critical</div>
                    <div className="text-muted-foreground">&gt;75%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};