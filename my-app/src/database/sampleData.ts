import { bendDatabase } from './index';
import { parseCSV } from '../utils/csvParser';

/**
 * Initialize database with sample data
 */
export async function initializeSampleData(): Promise<void> {
  try {
    const stats = await bendDatabase.getStats();

    // Only add sample data if database is empty
    if (stats.totalDatasets === 0) {
      // Sample CSV data is embedded below
      // In production, you would load from an actual CSV file

      // For now, we'll add a properly formatted parse
      await bendDatabase.saveDataset({
        id: 'Aluminum_2mm_12ga_20mm',
        material: 'Aluminum',
        thickness: 2,
        thicknessUnit: 'mm',
        flange: 20,
        label: '2mm Aluminum 12ga (20mm flange)',
        data: [
          { bendLength: 100, bendCorrection: 5.9, crown: 0 },
          { bendLength: 150, bendCorrection: 5.1, crown: 0 },
          { bendLength: 180, bendCorrection: 5.1, crown: 0 },
          { bendLength: 200, bendCorrection: 5.3, crown: 0 },
          { bendLength: 240, bendCorrection: 5.55, crown: 0 },
          { bendLength: 275, bendCorrection: 6, crown: 0 },
          { bendLength: 300, bendCorrection: 6.3, crown: 0 },
          { bendLength: 328, bendCorrection: 6.3, crown: 0 },
          { bendLength: 350, bendCorrection: 6.5, crown: 0 },
          { bendLength: 381, bendCorrection: 6.5, crown: 0 },
          { bendLength: 400, bendCorrection: 6.5, crown: 0 },
          { bendLength: 425, bendCorrection: 6.5, crown: 0 },
          { bendLength: 475, bendCorrection: 6.6, crown: 0 },
          { bendLength: 502, bendCorrection: 6.7, crown: 0 },
          { bendLength: 598, bendCorrection: 6.9, crown: 0.12 },
          { bendLength: 672, bendCorrection: 6.9, crown: 0.13 },
          { bendLength: 750, bendCorrection: 7.1, crown: 0.15 },
          { bendLength: 808, bendCorrection: 7.7, crown: 0.16 },
          { bendLength: 838, bendCorrection: 7.8, crown: 0.17 },
          { bendLength: 919, bendCorrection: 8.3, crown: 0.18 },
          { bendLength: 1000, bendCorrection: 8.5, crown: 0.2 },
          { bendLength: 1079, bendCorrection: 8.5, crown: 0.22 },
          { bendLength: 1123, bendCorrection: 8.9, crown: 0.23 },
          { bendLength: 1200, bendCorrection: 9.05, crown: 0.24 },
          { bendLength: 1263, bendCorrection: 9.05, crown: 0.25 },
          { bendLength: 1311, bendCorrection: 9.55, crown: 0.26 },
          { bendLength: 1384, bendCorrection: 9.55, crown: 0.28 },
          { bendLength: 1400, bendCorrection: 9.55, crown: 0.28 },
          { bendLength: 1487, bendCorrection: 9.55, crown: 0.3 },
          { bendLength: 1550, bendCorrection: 9.55, crown: 0.31 },
          { bendLength: 1646, bendCorrection: 9.55, crown: 0.33 },
          { bendLength: 1743, bendCorrection: 9.55, crown: 0.35 },
          { bendLength: 1881, bendCorrection: 9.3, crown: 0.38 },
          { bendLength: 2000, bendCorrection: 9.6, crown: 0.4 },
          { bendLength: 2500, bendCorrection: 9.9, crown: 0.5 },
          { bendLength: 2750, bendCorrection: 9.9, crown: 0.5 },
          { bendLength: 3000, bendCorrection: 9.9, crown: 0.5 },
        ],
        createdAt: Date.now(),
      });

      console.log('✓ Sample data initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
