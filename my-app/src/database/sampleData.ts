import { MaterialsDatabase } from "../types";

/**
 * Complete materials database for bend correction calculations
 * Hierarchical structure: Material → Flange → Data points
 */
export const MATERIALS_DB: MaterialsDatabase = {
  "2mm_aluminum": {
    name: "2mm / 12ga 3003 Aluminum",
    thickness: 2,
    unit: "mm",
    flanges: {
      6: [
        { bendLength: 100, correction: null, crown: null, note: "not possible", enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 100, correction: 13.6, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 16.1, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 16.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 17.25, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 21.45, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 23.95, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 25.35, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 25.85, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 26.75, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 26.75, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 27.75, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 29.25, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 29.25, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 30, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 521, correction: null, crown: null, note: "not possible", enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 100, correction: 8.92, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 10.32, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 10.32, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 11.62, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 12.12, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 13.52, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 13.72, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 14.12, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 14.67, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 15.67, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 15.87, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 15.87, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 15.87, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 16, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 598, correction: 17.25, crown: 0.12, enteredAt: 1778068800000 },
        { bendLength: 672, correction: 16.75, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 750, correction: 16.75, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 808, correction: 18.55, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 838, correction: 17.35, crown: 0.17, enteredAt: 1778068800000 },
        { bendLength: 919, correction: 17.55, crown: 0.18, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 17.55, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 1079, correction: 18.45, crown: 0.22, enteredAt: 1778068800000 },
        { bendLength: 1123, correction: 18.85, crown: 0.23, enteredAt: 1778068800000 },
        { bendLength: 1200, correction: 19.15, crown: 0.24, enteredAt: 1778068800000 },
        { bendLength: 1263, correction: 19.65, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 1311, correction: 20.05, crown: 0.26, enteredAt: 1778068800000 },
        { bendLength: 1384, correction: 20.05, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1400, correction: 20.05, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1487, correction: 20.25, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 1550, correction: 20.4, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 1646, correction: 20.7, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 1743, correction: 20.7, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 1888, correction: 20.7, crown: 0.38, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 20.4, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2250, correction: 20.9, crown: 0.45, enteredAt: 1778068800000 },
        { bendLength: 2600, correction: 20.9, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 2750, correction: 21.1, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 3000, correction: 22.6, crown: 0.5, enteredAt: 1778068800000 }
      ],
      12: [
        { bendLength: 100, correction: 7.54, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 7.84, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 8.04, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 8.24, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 9.04, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 9.54, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 9.99, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 10.59, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 10.59, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 10.99, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 11.29, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 11.59, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 11.59, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 11.79, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 598, correction: 11.79, crown: 0.12, enteredAt: 1778068800000 },
        { bendLength: 672, correction: 11.79, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 750, correction: 11.99, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 808, correction: 12.69, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 838, correction: 12.69, crown: 0.17, enteredAt: 1778068800000 },
        { bendLength: 919, correction: 12.94, crown: 0.18, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 12.94, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 1079, correction: 13.44, crown: 0.22, enteredAt: 1778068800000 },
        { bendLength: 1123, correction: 13.6, crown: 0.23, enteredAt: 1778068800000 },
        { bendLength: 1200, correction: 13.9, crown: 0.24, enteredAt: 1778068800000 },
        { bendLength: 1263, correction: 14.3, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 1311, correction: 14.3, crown: 0.26, enteredAt: 1778068800000 },
        { bendLength: 1384, correction: 14.7, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1400, correction: 15.05, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1487, correction: 15.05, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 1550, correction: 15.05, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 1646, correction: 15.05, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 1743, correction: 15.05, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 1881, correction: 15.05, crown: 0.38, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 15.2, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 15.3, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 2750, correction: 15.3, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 3000, correction: 16, crown: 0.5, enteredAt: 1778068800000 }
      ],
      14: [
        { bendLength: 100, correction: 6.87, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 6.77, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 6.62, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 6.62, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 7.02, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 7.62, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 8.12, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 8.12, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 8.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 9, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 9, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 9.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 9.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 9.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 598, correction: 9.3, crown: 0.12, enteredAt: 1778068800000 },
        { bendLength: 672, correction: 9.3, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 750, correction: 9.3, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 808, correction: 9.8, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 838, correction: 10, crown: 0.17, enteredAt: 1778068800000 },
        { bendLength: 919, correction: 10.3, crown: 0.18, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 10.45, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 1079, correction: 10.6, crown: 0.22, enteredAt: 1778068800000 },
        { bendLength: 1123, correction: 11.05, crown: 0.23, enteredAt: 1778068800000 },
        { bendLength: 1200, correction: 11.55, crown: 0.24, enteredAt: 1778068800000 },
        { bendLength: 1263, correction: 11.55, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 1311, correction: 11.55, crown: 0.26, enteredAt: 1778068800000 },
        { bendLength: 1384, correction: 11.95, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1400, correction: 11.95, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1487, correction: 11.95, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 1550, correction: 12.15, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 1646, correction: 12.15, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 1743, correction: 11.65, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 1881, correction: 11.65, crown: 0.38, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 11.8, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 12.1, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 2750, correction: 11.9, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 3000, correction: 12.1, crown: 0.5, enteredAt: 1778068800000 }
      ],
      20: [
        { bendLength: 100, correction: 5.9, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 5.1, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 5.1, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 5.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 5.55, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 6, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 6.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 6.3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 6.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 6.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 6.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 6.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 6.6, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 6.7, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 598, correction: 6.9, crown: 0.12, enteredAt: 1778068800000 },
        { bendLength: 672, correction: 6.9, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 750, correction: 7.1, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 808, correction: 7.7, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 838, correction: 7.8, crown: 0.17, enteredAt: 1778068800000 },
        { bendLength: 919, correction: 8.3, crown: 0.18, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 8.5, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 1079, correction: 8.5, crown: 0.22, enteredAt: 1778068800000 },
        { bendLength: 1123, correction: 8.9, crown: 0.23, enteredAt: 1778068800000 },
        { bendLength: 1200, correction: 9.05, crown: 0.24, enteredAt: 1778068800000 },
        { bendLength: 1263, correction: 9.05, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 1311, correction: 9.55, crown: 0.26, enteredAt: 1778068800000 },
        { bendLength: 1384, correction: 9.55, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1400, correction: 9.55, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1487, correction: 9.55, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 1550, correction: 9.55, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 1646, correction: 9.55, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 1743, correction: 9.55, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 1881, correction: 9.3, crown: 0.38, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 9.6, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 9.9, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 2750, correction: 9.9, crown: 0.5, enteredAt: 1778068800000 },
        { bendLength: 3000, correction: 9.9, crown: 0.5, enteredAt: 1778068800000 }
      ]
    }
  }
  "0_8mm_aluminum": {
    name: "0.8mm / 20ga 3003 Aluminum",
    thickness: 0.8,
    unit: "mm",
    flanges: {
      8: [
        { bendLength: 500, correction: 4, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 3.87, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 4.57, crown: 0.34, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 3.19, crown: 0.45, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 4.33, crown: 0.6, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 4.59, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.18, crown: 0.14, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 4.56, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 4.31, crown: 0.45, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 4.53, crown: 0.6, enteredAt: 1778068800000 }
      ]
    }
  },
  "1mm_aluminum_18ga": {
    name: "1mm / 18ga 3003 Aluminum",
    thickness: 1,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: 5.76, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 8.48, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.52, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 6.54, crown: 0.46, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 7.21, crown: 0.52, enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 3.46, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 3.48, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.92, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 4.73, crown: 0.46, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 4.7, crown: 0.52, enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 3.77, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 3.98, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 4.43, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 4.33, crown: 0.46, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 4.3, crown: 0.52, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 3.37, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.49, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 4.55, crown: 0.39, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 3.82, crown: 0.46, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 4.78, crown: 0.52, enteredAt: 1778068800000 }
      ]
    }
  },
  "1_2mm_aluminum_16ga": {
    name: "1.2mm / 16ga 3003 Aluminum",
    thickness: 1.2,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: 16.89, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 17.33, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 19.31, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 18.04, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 25.78, crown: 0.45, enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 9.99, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 13.23, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 13.51, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 13.33, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 15.98, crown: 0.45, enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 5.99, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 7.03, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 7.51, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 8.03, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 6.98, crown: 0.45, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 5.99, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 6.32, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.4, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 5.72, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 5.18, crown: 0.45, enteredAt: 1778068800000 }
      ]
    }
  },
  "0_6mm_galvanized": {
    name: "0.6mm / 24ga Galvanized Steel",
    thickness: 0.6,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: 6.71, crown: 0.04, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 8.24, crown: 0.11, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 9.31, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 9.91, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 9.37, crown: 0.4, enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 5.21, crown: 0.03, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 5.85, crown: 0.11, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 7.41, crown: 0.09, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 6.01, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 7.87, crown: 0.4, enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 4.78, crown: 0.03, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 7.06, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.81, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 5.91, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 7.07, crown: 0.4, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 4.61, crown: 0.03, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 5.96, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 6.61, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 6.01, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 5.38, crown: 0.4, enteredAt: 1778068800000 }
      ]
    }
  },
  "0_8mm_galvanized": {
    name: "0.8mm / 22ga Galvanized Steel",
    thickness: 0.8,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: 5.48, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 8.08, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 12.78, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 18.68, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 21.86, crown: 0.4, enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 4.78, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 6.37, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 8.78, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 8.25, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 12.66, crown: 0.45, enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 4.18, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.84, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.54, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 6.27, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 8.74, crown: 0.34, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 4.19, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.82, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.08, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 5.77, crown: 0.31, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 5.56, crown: 0.34, enteredAt: 1778068800000 }
      ]
    }
  },
  "1mm_galvanized": {
    name: "1mm / 20ga Galvanized Steel",
    thickness: 1,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: 10.2, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 17.83, crown: 0.11, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 25.26, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 33.19, crown: 0.44, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 48.08, crown: 0.55, enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 7.2, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 10.23, crown: 0.11, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 14.06, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 14.69, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 19.78, crown: 0.45, enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 5.1, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.93, crown: 0.11, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 7.66, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 7.69, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 7.88, crown: 0.45, enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 5.1, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 5.33, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 5.36, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 5.39, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 6.08, crown: 0.45, enteredAt: 1778068800000 }
      ],
      20: [
        { bendLength: 100, correction: 3, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 150, correction: 3.15, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 180, correction: 3.45, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 200, correction: 3.48, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 240, correction: 3.5, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 275, correction: 3.55, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 300, correction: 3.6, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 328, correction: 3.7, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 350, correction: 3.8, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 381, correction: 3.9, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 400, correction: 4, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 425, correction: 4.05, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 450, correction: 4.15, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 475, correction: 4.15, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 502, correction: 4.15, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 521, correction: 4.15, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 598, correction: 4.25, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 614, correction: 4.25, crown: 0.09, enteredAt: 1778068800000 },
        { bendLength: 672, correction: 4.28, crown: 0.09, enteredAt: 1778068800000 },
        { bendLength: 750, correction: 4.55, crown: 0.09, enteredAt: 1778068800000 },
        { bendLength: 808, correction: 4.55, crown: 0.12, enteredAt: 1778068800000 },
        { bendLength: 838, correction: 4.55, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 919, correction: 4.7, crown: 0.13, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 4.85, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1079, correction: 4.85, crown: 0.16, enteredAt: 1778068800000 },
        { bendLength: 1123, correction: 4.85, crown: 0.17, enteredAt: 1778068800000 },
        { bendLength: 1200, correction: 4.95, crown: 0.18, enteredAt: 1778068800000 },
        { bendLength: 1263, correction: 4.95, crown: 0.19, enteredAt: 1778068800000 },
        { bendLength: 1311, correction: 5.05, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 1384, correction: 5.05, crown: 0.21, enteredAt: 1778068800000 },
        { bendLength: 1400, correction: 5.05, crown: 0.21, enteredAt: 1778068800000 },
        { bendLength: 1487, correction: 5.05, crown: 0.22, enteredAt: 1778068800000 },
        { bendLength: 1550, correction: 5.15, crown: 0.23, enteredAt: 1778068800000 },
        { bendLength: 1646, correction: 5.25, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 1743, correction: 5.2, crown: 0.26, enteredAt: 1778068800000 },
        { bendLength: 1828, correction: 5.25, crown: 0.28, enteredAt: 1778068800000 },
        { bendLength: 1900, correction: 5.3, crown: 0.29, enteredAt: 1778068800000 },
        { bendLength: 1955, correction: 5.35, crown: 0.2, enteredAt: 1778068800000 },
        { bendLength: 2026, correction: 5.35, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2175, correction: 5.4, crown: 0.33, enteredAt: 1778068800000 },
        { bendLength: 2294, correction: 5.45, crown: 0.35, enteredAt: 1778068800000 },
        { bendLength: 2377, correction: 5.45, crown: 0.36, enteredAt: 1778068800000 },
        { bendLength: 2409, correction: 5.45, crown: 0.36, enteredAt: 1778068800000 },
        { bendLength: 2482, correction: 5.5, crown: 0.37, enteredAt: 1778068800000 },
        { bendLength: 2550, correction: 5.55, crown: 0.38, enteredAt: 1778068800000 },
        { bendLength: 2650, correction: 5.6, crown: 0.4, enteredAt: 1778068800000 },
        { bendLength: 2700, correction: 5.6, crown: 0.41, enteredAt: 1778068800000 },
        { bendLength: 2741, correction: 5.65, crown: 0.41, enteredAt: 1778068800000 },
        { bendLength: 2789, correction: 5.7, crown: 0.42, enteredAt: 1778068800000 },
        { bendLength: 2815, correction: 5.75, crown: 0.42, enteredAt: 1778068800000 },
        { bendLength: 2934, correction: 5.8, crown: 0.44, enteredAt: 1778068800000 },
        { bendLength: 2987, correction: 5.9, crown: 0.45, enteredAt: 1778068800000 },
        { bendLength: 3039, correction: 6.35, crown: 0.46, enteredAt: 1778068800000 }
      ]
    }
  },
  "1_5mm_galvanized": {
    name: "1.5mm / 16ga Galvanized Steel",
    thickness: 1.5,
    unit: "mm",
    flanges: {
      5: [
        { bendLength: 500, correction: null, crown: null, note: "not possible", enteredAt: 1778068800000 }
      ],
      6: [
        { bendLength: 500, correction: 27.98, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: null, crown: null, note: "not possible", enteredAt: 1778068800000 }
      ],
      8: [
        { bendLength: 500, correction: 13.81, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 20.76, crown: 0.1, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 22.04, crown: 0.25, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: null, crown: null, note: "not possible", enteredAt: 1778068800000 }
      ],
      10: [
        { bendLength: 500, correction: 8.65, crown: 0, enteredAt: 1778068800000 },
        { bendLength: 1000, correction: 12.36, crown: 0.15, enteredAt: 1778068800000 },
        { bendLength: 1500, correction: 15.43, crown: 0.3, enteredAt: 1778068800000 },
        { bendLength: 2000, correction: 19.59, crown: 0.45, enteredAt: 1778068800000 },
        { bendLength: 2500, correction: 22.1, crown: 0.7, enteredAt: 1778068800000 }
      ]
    }
  }
};
