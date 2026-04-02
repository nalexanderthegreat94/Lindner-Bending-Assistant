/**
 * Data point for a single bend test
 */
export interface BendDataPoint {
  bendLength: number; // mm
  correction: number | null; // degrees or null if not possible
  crown: number | null; // mm or null if not possible
  note?: string; // e.g., "not possible"
}

/**
 * Complete dataset for a material with specific thickness and flange configuration
 */
export interface BendDataset {
  id: string; // Unique identifier
  material: string; // e.g., "Aluminum"
  thickness: number; // e.g., 2
  thicknessUnit: string; // "mm" or "gauge"
  flange: number; // mm
  label: string; // Display name
  data: BendDataPoint[]; // Array of bend points
  createdAt: number; // Timestamp
}

/**
 * Data for a specific flange length
 */
export interface FlangeData {
  [flangeLength: number]: BendDataPoint[];
}

/**
 * Complete material definition with multiple flange options
 */
export interface Material {
  name: string;
  thickness: number;
  unit: "mm" | "gauge";
  flanges: FlangeData;
}

/**
 * Materials database
 */
export interface MaterialsDatabase {
  [materialKey: string]: Material;
}

/**
 * Prediction result with detailed metadata
 */
export interface CorrectionResult {
  // Success case
  correction?: number;
  crown?: number;
  bendLength?: number;
  isExact?: boolean;
  
  // Interpolation metadata
  interpolatedBetween?: [number, number];
  lowerPoint?: BendDataPoint;
  upperPoint?: BendDataPoint;
  
  // Extrapolation metadata
  isExtrapolated?: boolean;
  extrapolatedAbove?: boolean;
  extrapolatedFrom?: number[];
  minTested?: number;
  maxTested?: number;
  warning?: string;
  
  // Flange interpolation metadata
  isFlangeInterpolated?: boolean;
  flangeInterpolatedBetween?: [number, number];
  isFlangeCapped?: boolean;
  flangeUsed?: number;
  flangeTooSmall?: boolean;
  flangeNoData?: boolean;      // below tested range but not confirmed impossible

  // Error case
  error?: string;
  reason?: string;
  notPossible?: boolean;
  maxBendLength?: number;
  suggestion?: BendDataPoint;
}
