import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { ICPAlgorithm, ICPResult } from './icpAlgorithm';
import { DeviationAnalyzer, DeviationAnalysisResult } from './deviationAnalyzer';

export interface ProcessedSTLData {
  geometry: THREE.BufferGeometry;
  originalGeometry: THREE.BufferGeometry;
  boundingBox: THREE.Box3;
  center: THREE.Vector3;
  scale: number;
  vertices: number;
  fileName: string;
}

export interface SuperimpositionResult {
  trainingGeometry: THREE.BufferGeometry;
  testGeometry: THREE.BufferGeometry;
  alignedTestGeometry: THREE.BufferGeometry;
  icpResult: ICPResult;
  deviationAnalysis: DeviationAnalysisResult;
  superimposedMesh: THREE.Mesh;
}

/**
 * Complete STL processing pipeline with ICP alignment and deviation analysis
 */
export class STLProcessor {
  private static stlLoader = new STLLoader();

  /**
   * Load and preprocess an STL file
   */
  public static async loadSTLFile(file: File): Promise<ProcessedSTLData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read file'));
          return;
        }

        try {
          console.log(`Loading STL file: ${file.name}`);
          
          // Parse STL data
          const originalGeometry = this.stlLoader.parse(arrayBuffer);
          const geometry = originalGeometry.clone();
          
          console.log(`Original vertices: ${originalGeometry.attributes.position.count}`);
          
          // Calculate bounding box and center
          geometry.computeBoundingBox();
          const boundingBox = geometry.boundingBox!;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          console.log(`Bounding box: ${boundingBox.min.x}, ${boundingBox.min.y}, ${boundingBox.min.z} to ${boundingBox.max.x}, ${boundingBox.max.y}, ${boundingBox.max.z}`);
          console.log(`Center: ${center.x}, ${center.y}, ${center.z}`);
          
          // Center geometry at origin
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Calculate uniform scaling
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = 4 / maxDimension; // Larger scale for better visualization
          
          console.log(`Scale factor: ${scale}`);
          
          // Apply scaling
          geometry.scale(scale, scale, scale);
          
          // Optimize geometry
          geometry.computeVertexNormals();
          geometry.computeBoundingSphere();
          
          console.log(`Processed vertices: ${geometry.attributes.position.count}`);
          
          resolve({
            geometry,
            originalGeometry,
            boundingBox,
            center,
            scale,
            vertices: geometry.attributes.position.count,
            fileName: file.name
          });
        } catch (error) {
          console.error('Error parsing STL file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read STL file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Perform complete superimposition analysis
   */
  public static async performSuperimposition(
    trainingFile: File,
    testFile: File,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<SuperimpositionResult> {
    try {
      // Load both STL files
      onProgress?.('Loading files', 10);
      console.log('Loading STL files...');
      
      const [trainingData, testData] = await Promise.all([
        this.loadSTLFile(trainingFile),
        this.loadSTLFile(testFile)
      ]);

      console.log('Both files loaded successfully');
      console.log(`Training: ${trainingData.vertices} vertices`);
      console.log(`Test: ${testData.vertices} vertices`);

      // Prepare geometries for ICP alignment
      onProgress?.('Preparing for alignment', 30);
      const trainingGeometry = trainingData.geometry.clone();
      const testGeometry = testData.geometry.clone();

      // Perform ICP alignment
      onProgress?.('Performing ICP alignment', 50);
      console.log('Starting ICP alignment...');
      
      const icpResult = ICPAlgorithm.align(testGeometry, trainingGeometry, {
        maxIterations: 50,
        tolerance: 1e-6,
        correspondenceThreshold: 0.5
      });

      console.log('ICP alignment result:', {
        converged: icpResult.converged,
        iterations: icpResult.iterations,
        error: icpResult.error
      });

      // Apply ICP transformation to test geometry
      onProgress?.('Applying transformation', 60);
      const alignedTestGeometry = testGeometry.clone();
      alignedTestGeometry.applyMatrix4(icpResult.transformation);
      
      console.log('Applied ICP transformation to test geometry');

      // Perform deviation analysis
      onProgress?.('Analyzing deviations', 80);
      console.log('Starting deviation analysis...');
      
      const deviationAnalysis = DeviationAnalyzer.analyze(
        trainingGeometry,
        alignedTestGeometry,
        {
          matchingThreshold: 0.01, // 1cm threshold for matching
          samplingDensity: 1.0     // Use all vertices
        }
      );

      console.log('Deviation analysis complete:', deviationAnalysis.statistics);

      // Create superimposed mesh with deviation colors
      onProgress?.('Creating visualization', 90);
      const superimposedMesh = this.createSuperimposedMesh(
        alignedTestGeometry,
        deviationAnalysis.colors
      );

      console.log('Superimposed mesh created');

      onProgress?.('Complete', 100);

      return {
        trainingGeometry,
        testGeometry,
        alignedTestGeometry,
        icpResult,
        deviationAnalysis,
        superimposedMesh
      };

    } catch (error) {
      console.error('Error in superimposition analysis:', error);
      throw error;
    }
  }

  /**
   * Create a mesh with deviation-based coloring
   */
  private static createSuperimposedMesh(
    geometry: THREE.BufferGeometry,
    colors: Float32Array
  ): THREE.Mesh {
    // Apply colors to geometry
    DeviationAnalyzer.applyColorsToGeometry(geometry, colors);

    // Create material that uses vertex colors
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide,
      flatShading: false,
      shininess: 30,
      specular: new THREE.Color(0x333333)
    });

    // Create and configure mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      type: 'superimposed',
      hasDeviationColors: true
    };

    return mesh;
  }

  /**
   * Create individual mesh for preview (before analysis)
   */
  public static createPreviewMesh(
    geometry: THREE.BufferGeometry,
    color: THREE.Color,
    position: THREE.Vector3
  ): THREE.Mesh {
    const material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      type: 'preview'
    };

    return mesh;
  }
}