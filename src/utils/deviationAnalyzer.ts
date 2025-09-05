import * as THREE from 'three';

export interface DeviationAnalysisResult {
  deviations: Float32Array;
  colors: Float32Array;
  statistics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    matchingPercentage: number;
    deviationPercentage: number;
  };
}

export interface DeviationParams {
  matchingThreshold: number; // Distance threshold for considering areas as "matching"
  samplingDensity: number;   // Controls how many points to sample for analysis
}

/**
 * Advanced deviation analysis between training and test STL files
 * Provides precise color coding: mint green for matches, pink for deviations
 */
export class DeviationAnalyzer {
  private static readonly MINT_GREEN = new THREE.Color(0.2, 1.0, 0.7); // Pure mint green for matches
  private static readonly PINK = new THREE.Color(1.0, 0.4, 0.8);       // Pure pink for deviations

  /**
   * Build spatial hash for efficient nearest neighbor queries
   */
  private static buildSpatialHash(
    points: THREE.Vector3[],
    cellSize: number
  ): Map<string, THREE.Vector3[]> {
    const spatialHash = new Map<string, THREE.Vector3[]>();

    points.forEach(point => {
      const key = `${Math.floor(point.x / cellSize)},${Math.floor(point.y / cellSize)},${Math.floor(point.z / cellSize)}`;
      if (!spatialHash.has(key)) {
        spatialHash.set(key, []);
      }
      spatialHash.get(key)!.push(point);
    });

    return spatialHash;
  }

  /**
   * Find minimum distance from a point to a set of reference points using spatial hashing
   */
  private static findMinimumDistance(
    queryPoint: THREE.Vector3,
    spatialHash: Map<string, THREE.Vector3[]>,
    cellSize: number
  ): number {
    let minDistance = Infinity;

    // Check current cell and neighboring cells (3x3x3 neighborhood)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${Math.floor(queryPoint.x / cellSize) + dx},${Math.floor(queryPoint.y / cellSize) + dy},${Math.floor(queryPoint.z / cellSize) + dz}`;
          const candidates = spatialHash.get(key);

          if (candidates) {
            for (const candidate of candidates) {
              const distance = queryPoint.distanceTo(candidate);
              if (distance < minDistance) {
                minDistance = distance;
                // Early exit for exact matches
                if (distance < 0.0001) {
                  return distance;
                }
              }
            }
          }
        }
      }
    }

    return minDistance;
  }

  /**
   * Extract vertices from BufferGeometry with optional sampling
   */
  private static extractVertices(
    geometry: THREE.BufferGeometry,
    samplingDensity: number = 1.0
  ): THREE.Vector3[] {
    const positions = geometry.attributes.position;
    const vertices: THREE.Vector3[] = [];
    
    const step = Math.max(1, Math.floor(1 / samplingDensity));
    
    for (let i = 0; i < positions.count; i += step) {
      vertices.push(new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      ));
    }

    return vertices;
  }

  /**
   * Calculate statistical measures for deviation data
   */
  private static calculateStatistics(
    deviations: number[],
    matchingThreshold: number
  ): DeviationAnalysisResult['statistics'] {
    if (deviations.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        matchingPercentage: 0,
        deviationPercentage: 0
      };
    }

    const sorted = [...deviations].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = deviations.reduce((sum, val) => sum + val, 0) / deviations.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    // Calculate standard deviation
    const variance = deviations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / deviations.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate matching vs deviation percentages
    const matchingCount = deviations.filter(d => d <= matchingThreshold).length;
    const matchingPercentage = (matchingCount / deviations.length) * 100;
    const deviationPercentage = 100 - matchingPercentage;

    return {
      min,
      max,
      mean,
      median,
      standardDeviation,
      matchingPercentage,
      deviationPercentage
    };
  }

  /**
   * Generate color array based on deviation analysis
   */
  private static generateColors(
    deviations: Float32Array,
    matchingThreshold: number
  ): Float32Array {
    const colors = new Float32Array(deviations.length * 3);

    for (let i = 0; i < deviations.length; i++) {
      const deviation = deviations[i];
      const colorIndex = i * 3;

      if (deviation <= matchingThreshold) {
        // TRAINING FILE MATCHES TEST FILE - Mint Green
        colors[colorIndex] = DeviationAnalyzer.MINT_GREEN.r;
        colors[colorIndex + 1] = DeviationAnalyzer.MINT_GREEN.g;
        colors[colorIndex + 2] = DeviationAnalyzer.MINT_GREEN.b;
      } else {
        // TRAINING FILE DEVIATES FROM TEST FILE - Pink
        colors[colorIndex] = DeviationAnalyzer.PINK.r;
        colors[colorIndex + 1] = DeviationAnalyzer.PINK.g;
        colors[colorIndex + 2] = DeviationAnalyzer.PINK.b;
      }
    }

    return colors;
  }

  /**
   * Main deviation analysis function
   * Analyzes how well the training file matches the test file after superimposition
   */
  public static analyze(
    trainingGeometry: THREE.BufferGeometry,
    testGeometry: THREE.BufferGeometry,
    params: DeviationParams = {
      matchingThreshold: 0.01,
      samplingDensity: 1.0
    }
  ): DeviationAnalysisResult {
    console.log('Starting deviation analysis...');
    console.log('Training vertices:', trainingGeometry.attributes.position.count);
    console.log('Test vertices:', testGeometry.attributes.position.count);

    // Extract vertices from both geometries
    const trainingVertices = this.extractVertices(trainingGeometry, params.samplingDensity);
    const testVertices = this.extractVertices(testGeometry, params.samplingDensity);

    console.log('Extracted training vertices:', trainingVertices.length);
    console.log('Extracted test vertices:', testVertices.length);

    if (testVertices.length === 0 || trainingVertices.length === 0) {
      throw new Error('Invalid geometries for deviation analysis');
    }

    // Calculate appropriate cell size for spatial hashing
    const testBounds = new THREE.Box3().setFromPoints(testVertices);
    const testSize = testBounds.getSize(new THREE.Vector3());
    const cellSize = Math.max(testSize.x, testSize.y, testSize.z) / 50; // Adaptive cell size

    // Build spatial hash for training vertices (reference for matching)
    const trainingSpatialHash = this.buildSpatialHash(trainingVertices, cellSize);

    console.log('Built spatial hash with cell size:', cellSize);
    console.log('Spatial hash entries:', trainingSpatialHash.size);

    // Calculate deviations for each test vertex
    const deviations = new Float32Array(testVertices.length);
    const deviationValues: number[] = [];

    console.log('Calculating deviations...');
    
    for (let i = 0; i < testVertices.length; i++) {
      const testVertex = testVertices[i];
      const minDistance = this.findMinimumDistance(testVertex, trainingSpatialHash, cellSize);
      
      deviations[i] = minDistance;
      deviationValues.push(minDistance);

      if (i % 1000 === 0) {
        console.log(`Processed ${i}/${testVertices.length} vertices`);
      }
    }

    console.log('Deviation calculation complete');

    // Calculate statistics
    const statistics = this.calculateStatistics(deviationValues, params.matchingThreshold);
    
    console.log('Deviation statistics:', statistics);

    // Generate colors based on deviation analysis
    const colors = this.generateColors(deviations, params.matchingThreshold);

    console.log('Color generation complete');

    return {
      deviations,
      colors,
      statistics
    };
  }

  /**
   * Apply deviation colors to a geometry
   */
  public static applyColorsToGeometry(
    geometry: THREE.BufferGeometry,
    colors: Float32Array
  ): void {
    // Ensure colors array matches vertex count
    const vertexCount = geometry.attributes.position.count;
    const expectedColorCount = vertexCount * 3;

    if (colors.length !== expectedColorCount) {
      console.warn(`Color array length (${colors.length}) doesn't match expected (${expectedColorCount})`);
      return;
    }

    // Set color attribute
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    console.log('Applied colors to geometry');
  }
}