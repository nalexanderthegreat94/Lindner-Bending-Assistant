# Bending Machine Assistant - Quick Start Guide

## Setup & Installation

### 1. Install Dependencies
```bash
cd my-app
npm install
```

### 2. Start the App

**For iOS (Mac only):**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

**For Web (testing only):**
```bash
npm run web
```

Press `w` during development to switch to web mode, or `i` for iOS, `a` for Android.

---

## App Overview

The app has **3 main tabs**:

### **Tab 1: Lookup** (🔍 Magnifying Glass)
- Search for bend corrections by bend length
- Automatically interpolates between data points
- Shows exact vs. interpolated confidence indicator
- Displays nearby reference data points

**How to use:**
1. Select material/thickness (e.g., "2mm Aluminum 12ga (20mm flange)")
2. Enter a bend length in mm (e.g., 500)
3. Tap "Look Up Correction"
4. View bend correction (°) and crown correction results

### **Tab 2: Browse Data** (📋 List)
- View all bend correction test data
- Switch between materials using tabs
- See exact bend correction and crown values for each data point
- Useful for reference and verification

### **Tab 3: Import Data** (⬇️ Download)
- Import new bend correction datasets
- Support for multiple materials and thicknesses
- Paste CSV data directly
- Saves locally to the device

**How to import:**
1. Export your bend test data as CSV
2. Fill in material details:
   - Material name (Aluminum, Steel, etc.)
   - Thickness value
   - Unit (mm or gauge)
   - Flange length (mm)
3. Paste your CSV data (3 columns: bendLength, bendCorrection, crown)
4. Tap "Import Data"

---

## Built-in Sample Data

The app comes pre-loaded with bend correction data for:
- **2mm Aluminum 12ga** (3003 grade)
- **Flange: 20mm**
- **37 data points** (bendLength: 100-3000mm)

This data is automatically imported when you first open the app.

---

## CSV Format for Importing Data

Your bend test data should follow this format:

```
2mm/0.080/12ga 3003 Aluminum Bend Correction Data,,
20mm flange lengths,,
,,
Test Bend Length (mm),Bend Correction (Degrees),Crown
100,5.9,0
150,5.1,0
180,5.1,0
200,5.3,0
240,5.55,0
275,6,0
300,6.3,0
```

**Key points:**
- **Row 1-3**: Metadata (headers, will be read but reformatted)
- **Row 4**: Column names
- **Row 5+**: Your data (bendLength, bendCorrection, crown)

**Example data format:**
```
100,5.9,0
500,6.55,0.08
1000,8.5,0.2
2000,9.6,0.4
```

---

## Technical Details

### Data Storage
- All data stored locally on device using AsyncStorage
- No internet required
- Data persists between app sessions

### Interpolation Logic
- Linear interpolation between nearest data points
- If exact bend length exists: returns exact value
- If outside data range: returns edge value
- Includes nearby reference points for verification

### Project Structure
```
my-app/
├── app/                    # Navigation & screens
│   └── (tabs)/
│       ├── index.tsx       # Lookup screen
│       ├── explore.tsx     # Browse data screen
│       ├── settings.tsx    # Import data screen
│       └── _layout.tsx     # Tab navigation
├── components/             # UI Components
│   ├── LookupScreen.tsx
│   ├── DataBrowserScreen.tsx
│   └── ImportDataScreen.tsx
├── src/                    # Core logic
│   ├── database/          # Data management
│   ├── utils/             # Interpolation & CSV parsing
│   └── types/             # TypeScript definitions
└── package.json           # Dependencies
```

---

## Future Enhancements

Planned features for next version:
- [ ] File picker for CSV import (instead of copy-paste)
- [ ] Export lookup history
- [ ] Custom flange length calculations
- [ ] Advanced curve fitting (polynomial, spline)
- [ ] Cloud backup/sync
- [ ] Bend log history
- [ ] Multi-language support
- [ ] Dark mode

---

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run ios  # or android
```

### Data not appearing
- Make sure you're on the "Browse Data" tab
- Check the "Lookup" tab - is a dataset selected?
- Try restarting the app

### Import didn't work
- Verify CSV format (3 columns: bendLength, bendCorrection, crown)
- Check that all values are valid numbers
- Look for error message in the Alert dialog

### Performance issues
- Close other apps on the tablet
- Restart the app
- For very large datasets (1000+ points), consider splitting into multiple files

---

## Notes for Your Coworker

This app is designed for **one-handed operation** at the bending machine:
- Large touch targets
- Clear, easy-to-read results
- Fast lookup (typically instant)
- No internet needed

**Tip**: Bookmark the most common bend lengths for quick reference using the "Browse Data" tab. 

For questions or to add new material datasets, provide test data in the CSV format shown above.
