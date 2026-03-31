# Bending Machine Assistant

A mobile app for bend press operators to look up and predict bend corrections and crown corrections based on material test data.

## Features

- **Bend Lookup**: Enter a bend length and get instant predictions for bend correction (degrees) and crown correction
- **Linear Interpolation**: Predictions between data points for accurate results
- **Data Browser**: View all bend correction data for each material and thickness
- **Multi-Material Support**: Currently includes 2mm Aluminum 12ga data, with support for multiple materials and thicknesses
- **Tablet Optimized**: Responsive design built for touchscreen operation
- **Local Storage**: All data stored locally on the device

## How to Use

### **Lookup Screen** (First Tab)
1. Select a material and thickness from the buttons at the top
2. Enter the bend length in millimeters
3. Tap "Look Up Correction"
4. View results for:
   - **Bend Correction** (in degrees)
   - **Crown Correction** (in mm)
   - **Confidence** indicator (Exact Match or Interpolated)

The app uses linear interpolation when the exact bend length isn't in the database, showing the nearest data points used for the calculation.

### **Browse Data** (Second Tab)
View all bend correction data points for each material. Select a material from the tabs to view its complete dataset. Each bend length shows:
- Exact bend correction value
- Exact crown correction value

## Adding New Data

Currently, the app is loaded with 2mm Aluminum 12ga data with 20mm flanges. To add new material datasets:

### CSV Format

Your bend data should be formatted as follows:

```
[Thickness]/[Gauge]/[Material] [Specification],,
[Flange]mm flange lengths,,
,,
Test Bend Length (mm),Bend Correction (Degrees),Crown
100,5.9,0
150,5.1,0
200,5.3,0
[more data...]
```

### Importing Data

1. Export your test data as a CSV file
2. Format according to the template above
3. Use the data import utility (to be added in next update)
4. Select material, thickness, and flange specifications
5. Data will be saved locally to the app

## Data Structure

Each bend dataset contains:
- **Material**: e.g., "Aluminum", "Steel", "Stainless Steel"
- **Thickness**: Numeric value
- **Unit**: "mm" or "gauge"
- **Flange**: Flange length in mm
- **Data Points**: Array of bend lengths → corrections

Example entry:
```json
{
  "bendLength": 500,
  "bendCorrection": 6.55,
  "crown": 0.08
}
```

## Technical Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **Storage**: AsyncStorage (local device storage)
- **Language**: TypeScript

## Project Structure

```
my-app/
├── app/                          # App screens and navigation
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx            # Lookup screen
│   │   └── explore.tsx          # Data browser screen
│   └── _layout.tsx              # Root layout
├── components/
│   ├── LookupScreen.tsx         # Bend lookup and prediction UI
│   └── DataBrowserScreen.tsx    # Data viewing UI
└── src/
    ├── database/
    │   ├── index.ts             # Database manager
    │   └── sampleData.ts        # Sample data initialization
    ├── utils/
    │   ├── csvParser.ts         # CSV parsing and export
    │   └── interpolation.ts     # Linear interpolation logic
    └── types/
        └── index.ts             # TypeScript interfaces
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (for testing)
```bash
npm run web
```

## Future Enhancements

- [ ] CSV import screen for adding new datasets
- [ ] Export lookup history
- [ ] Custom flange length support
- [ ] Advanced interpolation methods
- [ ] Data sync with cloud/server
- [ ] Bend history logging
- [ ] Multi-language support

## Notes for Your Coworker

This app is designed to be used right at the bending machine. All data is stored locally, so no internet connection is required. Simply:

1. Tap "Lookup"
2. Select the material you're working with
3. Enter the bend length
4. See the correction values needed

The "Browse Data" tab lets you see all the test data if you want to verify values or understand the data ranges.

## Support

For questions or to add new material datasets, contact the development team with your test data in CSV format.
