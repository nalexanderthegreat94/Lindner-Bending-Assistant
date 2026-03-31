import { BendDataPoint, BendDataset } from '../types';

export interface CSVParseOptions {
  material: string;
  thickness: number;
  thicknessUnit: string;
  flange: number;
}

/**
 * Parse CSV data from your bend testing format
 * Expected format:
 * Row 1: Material header
 * Row 2: Flange info
 * Row 3: Empty
 * Row 4+: bendLength, bendCorrection, crown
 */
export function parseCSV(
  csvContent: string,
  options: CSVParseOptions
): BendDataset {
  const lines = csvContent.trim().split('\n');
  const dataPoints: BendDataPoint[] = [];

  // Skip header rows (first 3 rows)
  const startIndex = 3;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());

    // Parse the three columns
    const bendLength = parseFloat(values[0]);
    const bendCorrection = parseFloat(values[1]);
    const crown = parseFloat(values[2]);

    // Validate that we got numbers
    if (!isNaN(bendLength) && !isNaN(bendCorrection) && !isNaN(crown)) {
      dataPoints.push({
        bendLength,
        bendCorrection,
        crown,
      });
    }
  }

  // Create dataset
  const dataset: BendDataset = {
    id: `${options.material}_${options.thickness}${options.thicknessUnit}_${options.flange}mm`,
    material: options.material,
    thickness: options.thickness,
    thicknessUnit: options.thicknessUnit,
    flange: options.flange,
    label: `${options.thickness}${options.thicknessUnit} ${options.material} (${options.flange}mm flange)`,
    data: dataPoints,
    createdAt: Date.now(),
  };

  return dataset;
}

/**
 * Convert BendDataset back to CSV for export
 */
export function datasetToCSV(dataset: BendDataset): string {
  const lines: string[] = [];

  // Header
  lines.push(`${dataset.thickness}${dataset.thicknessUnit} ${dataset.material} Bend Correction Data,,`);
  lines.push(`${dataset.flange}mm flange lengths,,`);
  lines.push(',,');
  lines.push('Test Bend Length (mm),Bend Correction (Degrees),Crown');

  // Data rows
  for (const point of dataset.data) {
    lines.push(`${point.bendLength},${point.bendCorrection},${point.crown}`);
  }

  return lines.join('\n');
}
