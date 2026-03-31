# Lindner-Bending-Assistant

A mobile app for bending machine operators to look up and predict bend corrections and crown corrections based on material test data. Built with React Native and Expo for tablet use.

## 🚀 Quick Start

See [QUICK_START.md](QUICK_START.md) for installation and running the app.

## 📱 App Overview

The app provides bend correction assistance with three main features:

### 1. **Lookup** (Search & Predict)
- Enter a bend length and get instant predictions
- Linear interpolation between test data points
- Confidence indicator (exact vs. interpolated)
- Reference nearby data points

### 2. **Browse Data** (View Test Data)
- View all bend correction test data for each material
- Filter by material and thickness
- See exact values from the test database

### 3. **Import Data** (Add New Materials)
- Add new bend correction datasets
- Support for multiple materials, thicknesses, and flange lengths
- Simple CSV paste interface
- Data saved locally to device

## 📊 Current Data

**Pre-loaded:**
- 2mm Aluminum 12ga (3003 grade)
- 20mm flange length  
- 37 data points (bend length: 100-3000mm)
- Covers bend corrections: 5.9° - 9.9°
- Crown corrections: 0 - 0.5mm

## 📈 Planned Materials

You indicated you'll provide test data for:
- ✅ Aluminum (multiple thicknesses)
- Steel (multiple thicknesses)
- Stainless Steel (multiple thicknesses)
- Spring Steel (multiple thicknesses)

See [ADDING_MATERIALS.md](ADDING_MATERIALS.md) for how to import new datasets.

## 🏗️ Project Structure

```
Lindner-Bending-Assistant/
├── my-app/                          # React Native Expo app
│   ├── app/                         # Screens & navigation
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx         # Tab navigation
│   │   │   ├── index.tsx           # Lookup screen
│   │   │   ├── explore.tsx         # Browse data screen
│   │   │   └── settings.tsx        # Import data screen
│   │   └── _layout.tsx             # Root layout
│   ├── components/                 # UI Components
│   │   ├── LookupScreen.tsx        # Bend lookup interface
│   │   ├── DataBrowserScreen.tsx   # Data viewing interface
│   │   └── ImportDataScreen.tsx    # CSV import interface
│   ├── src/                        # Core logic
│   │   ├── database/
│   │   │   ├── index.ts           # Database manager
│   │   │   └── sampleData.ts      # Sample data
│   │   ├── utils/
│   │   │   ├── csvParser.ts       # CSV parsing
│   │   │   └── interpolation.ts   # Interpolation math
│   │   └── types/
│   │       └── index.ts           # TypeScript definitions
│   ├── package.json
│   └── README_BENDING_APP.md       # App documentation
├── 2mm_Alu_12ga_Bend_Correction_Data.csv  # Sample data file
├── QUICK_START.md                  # Getting started guide
├── ADDING_MATERIALS.md             # Guide for new materials
└── README.md                       # This file
```

## 🔧 Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **Storage**: AsyncStorage (local device storage)
- **Target**: iOS, Android, Web (development)
- **Optimization**: Tablet-ready UI with touch optimization

## 💾 Data Storage

- **Local AsyncStorage**: All bend data stored on device
- **No Cloud Required**: Works completely offline
- **Persistent**: Data survives app restarts
- **Easy Backup**: Can export datasets as CSV

## 🔄 How It Works

### Lookup Process
1. User selects material/thickness/flange
2. Enters desired bend length
3. App searches for data point or finds nearest points
4. **If exact match**: Returns exact correction values
5. **If between points**: Uses linear interpolation
6. **If outside range**: Returns edge values
7. Shows confidence and reference data points

### Interpolation Formula
```
interpolated_value = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1)

Where:
- x = requested bend length
- (x1, y1) = lower data point
- (x2, y2) = upper data point
```

## 📋 CSV Format for Data Import

**Minimum format (3 columns):**
```
bendLength,bendCorrection,crown
100,5.9,0
150,5.1,0
200,5.3,0
```

**With headers:**
```
Test Bend Length (mm),Bend Correction (Degrees),Crown
100,5.9,0
150,5.1,0
```

See [ADDING_MATERIALS.md](ADDING_MATERIALS.md) for complete examples.

## 🎯 Features

✅ **Core Functionality**
- Bend correction lookup
- Crown correction lookup
- Linear interpolation
- Multi-dataset support
- Local data storage
- CSV import

✅ **User Interface**
- Large, touch-friendly buttons
- Material/thickness selection
- Real-time search
- Data reference viewing
- Success indicators

🔄 **Future Enhancements**
- [ ] File picker for CSV import
- [ ] Export lookup history
- [ ] Advanced interpolation (spline)
- [ ] Cloud backup/sync
- [ ] Bend history tracking
- [ ] Custom calculations
- [ ] Multi-language support
- [ ] Dark mode

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd my-app
npm install
```

### 2. Start Development Server
```bash
npm run ios      # iOS (Mac only)
npm run android  # Android
npm run web      # Web (development only)
```

### 3. For Your Coworker
- Build the app for their tablet (iOS or Android)
- Transfer the APK or IPA file
- Install on tablet
- Data is pre-loaded and ready to use
- Use "Import Data" tab to add more materials when you have test data

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Getting the app running
- **[ADDING_MATERIALS.md](ADDING_MATERIALS.md)** - How to add new materials
- **[my-app/README_BENDING_APP.md](my-app/README_BENDING_APP.md)** - Detailed app guide

## 🔌 Database Schema

### BendDataPoint
```typescript
{
  bendLength: number;        // mm
  bendCorrection: number;    // degrees
  crown: number;             // mm
}
```

### BendDataset
```typescript
{
  id: string;               // Unique identifier
  material: string;         // e.g., "Aluminum"
  thickness: number;        // e.g., 2
  thicknessUnit: string;    // "mm" or "gauge"
  flange: number;           // mm
  label: string;            // Display name
  data: BendDataPoint[];    // Array of bend points
  createdAt: number;        // Timestamp
}
```

## 🛠️ Development

### Adding a New Tab
1. Create new screen in `app/(tabs)/newscreen.tsx`
2. Create component in `components/NewScreenComponent.tsx`
3. Add Tabs.Screen entry in `app/(tabs)/_layout.tsx`

### Adding New Material Data Programmatically
Edit `src/database/sampleData.ts`:
```typescript
await bendDatabase.saveDataset({
  id: 'Material_Thickness_Flange',
  material: 'Material Name',
  thickness: 2,
  thicknessUnit: 'mm',
  flange: 20,
  label: 'Display Label',
  data: [
    { bendLength: 100, bendCorrection: 5.9, crown: 0 },
    // ... more data
  ],
  createdAt: Date.now(),
});
```

### Database Operations
```typescript
import { bendDatabase } from '@/src/database';

// Save dataset
await bendDatabase.saveDataset(dataset);

// Get all datasets
const all = await bendDatabase.getAllDatasets();

// Get by material
const aluminum = await bendDatabase.getDatasetsByMaterial('Aluminum');

// Get statistics
const stats = await bendDatabase.getStats();

// Delete dataset
await bendDatabase.deleteDataset(datasetId);
```

## 🐛 Troubleshooting

**App won't start**
```bash
cd my-app
rm -rf node_modules package-lock.json
npm install
npm run ios  # or run android
```

**Data not showing**
- Check "Browse Data" tab
- Verify dataset is selected in "Lookup" tab
- Try restarting the app

**Import failed**
- Verify CSV has 3 comma-separated columns
- Check all values are numbers (not text)
- Look for error message in dialog

**Performance issues**
- Close unnecessary apps
- Restart the app
- Large datasets (1000+ points) still work fine

## 📝 CSV Import Guide

**Step 1: Prepare Data**
- Test your bending machine
- Record: bend length (mm), bend correction (°), crown correction

**Step 2: Format CSV**
```
bendLength,bendCorrection,crown
100,value1,value2
150,value1,value2
```

**Step 3: Import in App**
- Go to "Import Data" tab
- Fill in material details
- Paste CSV data
- Tap "Import Data"

See [ADDING_MATERIALS.md](ADDING_MATERIALS.md) for complete guide.

## 💡 Tips for Your Operator

- **Bookmark common lengths** by switching to "Browse Data" tab
- **Screenshot results** for record-keeping
- **Use exact values** when available (green indicator)
- **Trust interpolations** between data points when needed
- **Add new materials** via "Import Data" tab when you have test data

## 📞 Support

For questions or issues:
1. Check the documentation files above
2. Review the [QUICK_START.md](QUICK_START.md) guide
3. See [ADDING_MATERIALS.md](ADDING_MATERIALS.md) for data import help
4. Contact the development team

## 📄 License

Internal use only. Developed for the Lindner-Bending-Assistant project.

---

**Version**: 1.0.0  
**Last Updated**: March 31, 2026  
**Status**: Ready for deployment 🎉
