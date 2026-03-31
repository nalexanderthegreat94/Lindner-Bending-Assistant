import { BendDataPoint, CorrectionResult, MaterialsDatabase } from '../types';
import { MATERIALS_DB } from '../database/sampleData';

/**
 * Linear interpolation between two points
 */
function interpolate(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x2 === x1) return y1;
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

/**
 * Quadratic extrapolation using Lagrange interpolation
 * Fits a parabola through 3 points and evaluates at x
 */
function quadraticExtrapolate(
  x: number,
  points: { x: number; y: number }[]
): number {
  const [p1, p2, p3] = points;

  // Lagrange interpolation for quadratic
  const L0 = ((x - p2.x) * (x - p3.x)) / ((p1.x - p2.x) * (p1.x - p3.x));
  const L1 = ((x - p1.x) * (x - p3.x)) / ((p2.x - p1.x) * (p2.x - p3.x));
  const L2 = ((x - p1.x) * (x - p2.x)) / ((p3.x - p1.x) * (p3.x - p2.x));

  return p1.y * L0 + p2.y * L1 + p3.y * L2;
}

/**
 * Linear regression extrapolation using least squares
 */
function linearRegressionExtrapolate(
  x: number,
  points: { x: number; y: number }[]
): number {
  const n = points.length;
  if (n === 0) return 0;
  if (n === 1) return points[0].y;

  // Calculate means
  let sumX = 0,
    sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate slope and intercept
  let numerator = 0,
    denominator = 0;
  for (const p of points) {
    numerator += (p.x - meanX) * (p.y - meanY);
    denominator += (p.x - meanX) * (p.x - meanX);
  }

  if (denominator === 0) return meanY;

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  return slope * x + intercept;
}

/**
 * Find bend correction using interpolation/extrapolation.
 * Pass a custom `db` (e.g. merged user data) or omit to use the built-in MATERIALS_DB.
 */
export function findCorrection(
  materialKey: string,
  flangeLength: number,
  bendLength: number,
  db: MaterialsDatabase = MATERIALS_DB
): CorrectionResult {
  const material = db[materialKey];
  if (!material) return { error: "Material not found" };

  const flangeData = material.flanges[flangeLength];
  if (!flangeData) {
    // Flange length not in database
    const availableFlanges = Object.keys(material.flanges)
      .map(Number)
      .sort((a, b) => a - b);
    const minFlange = availableFlanges[0];

    if (flangeLength < minFlange) {
      return {
        error: "BEND NOT POSSIBLE",
        reason: `Flange height ${flangeLength}mm is too short. Minimum flange for this material is ${minFlange}mm.`,
        notPossible: true
      };
    }
    return { error: `No data for ${flangeLength}mm flange` };
  }

  // Filter out "not possible" entries for interpolation
  const validData = flangeData.filter((d) => d.correction !== null);

  // Check if ALL entries are "not possible"
  if (validData.length === 0) {
    return {
      error: "BEND NOT POSSIBLE",
      reason: `${flangeLength}mm flange is too short for any bend length with this material.`,
      notPossible: true
    };
  }

  // Check if requested bend length exceeds what this flange can handle
  const maxPossibleBend = Math.max(...validData.map((d) => d.bendLength));
  const notPossibleEntries = flangeData.filter((d) => d.correction === null);

  if (notPossibleEntries.length > 0) {
    const minNotPossible = Math.min(...notPossibleEntries.map((d) => d.bendLength));
    if (bendLength >= minNotPossible) {
      return {
        error: "BEND NOT POSSIBLE",
        reason: `${flangeLength}mm flange cannot hold a ${bendLength}mm bend. Maximum bend length for this flange is ${maxPossibleBend}mm.`,
        notPossible: true,
        maxBendLength: maxPossibleBend
      };
    }
  }

  // Check bounds
  const minBend = Math.min(...validData.map((d) => d.bendLength));
  const maxBend = Math.max(...validData.map((d) => d.bendLength));

  // Extrapolate below minimum
  if (bendLength < minBend) {
    const point1 = validData[0];
    const point2 = validData[1];
    const point3 = validData[2];

    if (point1 && point2 && point3) {
      const correctionPoints = [
        { x: point1.bendLength, y: point1.correction || 0 },
        { x: point2.bendLength, y: point2.correction || 0 },
        { x: point3.bendLength, y: point3.correction || 0 }
      ];

      const crownPointCount = Math.min(6, validData.length);
      const crownPoints = validData
        .slice(0, crownPointCount)
        .map((d) => ({
          x: d.bendLength,
          y: d.crown || 0
        }));

      const extrapCorrection = quadraticExtrapolate(bendLength, correctionPoints);
      const extrapCrown = linearRegressionExtrapolate(bendLength, crownPoints);

      return {
        correction: Math.round(Math.max(0, extrapCorrection) * 100) / 100,
        crown: Math.round(Math.max(0, extrapCrown) * 100) / 100,
        isExact: false,
        isExtrapolated: true,
        bendLength,
        extrapolatedFrom: [point1.bendLength, point2.bendLength, point3.bendLength],
        minTested: minBend,
        warning: `Extrapolated below minimum tested (${minBend}mm)`
      };
    }

    return {
      error: `Below minimum tested (${minBend}mm)`,
      suggestion: validData[0]
    };
  }

  // Extrapolate above maximum
  if (bendLength > maxBend) {
    const point1 = validData[validData.length - 3];
    const point2 = validData[validData.length - 2];
    const point3 = validData[validData.length - 1];

    if (point1 && point2 && point3) {
      const correctionPoints = [
        { x: point1.bendLength, y: point1.correction || 0 },
        { x: point2.bendLength, y: point2.correction || 0 },
        { x: point3.bendLength, y: point3.correction || 0 }
      ];

      const crownPointCount = Math.min(6, validData.length);
      const crownPoints = validData
        .slice(-crownPointCount)
        .map((d) => ({
          x: d.bendLength,
          y: d.crown || 0
        }));

      const extrapCorrection = quadraticExtrapolate(bendLength, correctionPoints);
      const extrapCrown = linearRegressionExtrapolate(bendLength, crownPoints);

      return {
        correction: Math.round(Math.max(0, extrapCorrection) * 100) / 100,
        crown: Math.round(Math.max(0, extrapCrown) * 100) / 100,
        isExact: false,
        isExtrapolated: true,
        extrapolatedAbove: true,
        bendLength,
        extrapolatedFrom: [point1.bendLength, point2.bendLength, point3.bendLength],
        maxTested: maxBend,
        warning: `Extrapolated above maximum tested (${maxBend}mm)`
      };
    }

    return {
      error: `Above maximum tested (${maxBend}mm)`,
      suggestion: validData[validData.length - 1]
    };
  }

  // Check for exact match
  const exact = validData.find((d) => d.bendLength === bendLength);
  if (exact) {
    return {
      correction: exact.correction || 0,
      crown: exact.crown || 0,
      isExact: true,
      bendLength
    };
  }

  // Interpolate between points
  let lower: BendDataPoint | null = null;
  let upper: BendDataPoint | null = null;
  for (let i = 0; i < validData.length - 1; i++) {
    if (validData[i].bendLength < bendLength && validData[i + 1].bendLength > bendLength) {
      lower = validData[i];
      upper = validData[i + 1];
      break;
    }
  }

  if (lower && upper) {
    const interpCorrection = interpolate(
      bendLength,
      lower.bendLength,
      lower.correction || 0,
      upper.bendLength,
      upper.correction || 0
    );
    const interpCrown = interpolate(
      bendLength,
      lower.bendLength,
      lower.crown || 0,
      upper.bendLength,
      upper.crown || 0
    );

    return {
      correction: Math.round(interpCorrection * 100) / 100,
      crown: Math.round(interpCrown * 100) / 100,
      isExact: false,
      bendLength,
      interpolatedBetween: [lower.bendLength, upper.bendLength],
      lowerPoint: lower,
      upperPoint: upper
    };
  }

  return { error: "Could not interpolate" };
}

/**
 * Get available flanges for a material
 */
export function getAvailableFlanges(materialKey: string): number[] {
  const material = MATERIALS_DB[materialKey];
  if (!material) return [];
  return Object.keys(material.flanges)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Get all materials
 */
export function getMaterials() {
  return MATERIALS_DB;
}
