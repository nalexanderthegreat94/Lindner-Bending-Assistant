/**
 * Data point for a single bend test
 */
export interface BendDataPoint {
  bendLength: number; // mm
  bendCorrection: number; // degrees
  crown: number; // mm or inches
}

/**
 * A complete dataset for a specific material/thickness/flange combination
 */
export interface BendDataset {
  id: string; // unique identifier
  material: string; // e.g., "Aluminum"
  thickness: number; // in mm
  thicknessUnit: string; // "mm" or "gauge"
  flange: number; // mm
  label: string; // e.g., "2mm Aluminum 12ga (20mm flange)"
  data: BendDataPoint[];
  createdAt: number; // timestamp
}

/**
 * Prediction result
 */
export interface PredictionResult {
  bendLength: number;
  estimatedBendCorrection: number;
  estimatedCrown: number;
  confidence: "exact" | "interpolated"; // exact if matches a data point, interpolated if between points
  nearestDataPoints?: {
    below?: BendDataPoint;
    above?: BendDataPoint;
  };
}
