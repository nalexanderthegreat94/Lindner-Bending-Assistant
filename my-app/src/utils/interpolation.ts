import { BendDataPoint, PredictionResult } from '../types';

/**
 * Linear interpolation between two values
 */
function linearInterpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (x2 === x1) return y1; // Avoid division by zero
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

/**
 * Predict bend correction and crown for a given bend length
 */
export function predictBendCorrection(
  bendLength: number,
  dataPoints: BendDataPoint[]
): PredictionResult {
  if (dataPoints.length === 0) {
    throw new Error('No data points available for prediction');
  }

  // Sort data points by bend length
  const sorted = [...dataPoints].sort((a, b) => a.bendLength - b.bendLength);

  // Check if exact match exists
  const exactMatch = sorted.find(p => p.bendLength === bendLength);
  if (exactMatch) {
    return {
      bendLength,
      estimatedBendCorrection: exactMatch.bendCorrection,
      estimatedCrown: exactMatch.crown,
      confidence: 'exact',
      nearestDataPoints: {
        below: exactMatch,
        above: exactMatch,
      },
    };
  }

  // Find the two nearest points for interpolation
  let below: BendDataPoint | undefined;
  let above: BendDataPoint | undefined;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].bendLength < bendLength) {
      below = sorted[i];
    } else if (sorted[i].bendLength > bendLength && !above) {
      above = sorted[i];
      break;
    }
  }

  // If beyond data range, use edge values
  if (!below) {
    const edge = sorted[0];
    return {
      bendLength,
      estimatedBendCorrection: edge.bendCorrection,
      estimatedCrown: edge.crown,
      confidence: 'interpolated',
      nearestDataPoints: { below: edge, above: edge },
    };
  }

  if (!above) {
    const edge = sorted[sorted.length - 1];
    return {
      bendLength,
      estimatedBendCorrection: edge.bendCorrection,
      estimatedCrown: edge.crown,
      confidence: 'interpolated',
      nearestDataPoints: { below: edge, above: edge },
    };
  }

  // Interpolate between the two points
  const interpolatedCorrection = linearInterpolate(
    bendLength,
    below.bendLength,
    below.bendCorrection,
    above.bendLength,
    above.bendCorrection
  );

  const interpolatedCrown = linearInterpolate(
    bendLength,
    below.bendLength,
    below.crown,
    above.bendLength,
    above.crown
  );

  return {
    bendLength,
    estimatedBendCorrection: interpolatedCorrection,
    estimatedCrown: interpolatedCrown,
    confidence: 'interpolated',
    nearestDataPoints: { below, above },
  };
}

/**
 * Find the closest data point to a given bend length
 */
export function findClosestDataPoint(
  bendLength: number,
  dataPoints: BendDataPoint[]
): BendDataPoint | null {
  if (dataPoints.length === 0) return null;

  return dataPoints.reduce((closest, current) => {
    const currentDist = Math.abs(current.bendLength - bendLength);
    const closestDist = Math.abs(closest.bendLength - bendLength);
    return currentDist < closestDist ? current : closest;
  });
}
