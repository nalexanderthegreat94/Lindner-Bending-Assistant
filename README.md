# Lindner Bend Assistant

A tablet-focused React Native app for Schroeder bending machine operators. Look up bend correction and crown correction values by material, flange height, and bend length — with interpolation and extrapolation when exact data isn't available.

---

## App Overview

Three tabs, all dark-themed and touch-optimized for shop floor use.

### Lookup
- Select material, flange height, and enter a bend length
- Returns bend correction (degrees) and crown correction
- Exact match, interpolated, or extrapolated result — each labeled clearly
- Flange height interpolation: if you enter a flange height between two tested values, results are blended
- Extrapolation uses quadratic fit (3 nearest points) for corrections and linear regression for crown
- Live chart showing the correction curve for the selected material/flange

### Browse Data
- View all raw data points for any material and flange height
- Admin-locked — requires password to access edit/delete controls
- Multiple readings per bend length are shown individually and averaged at calculation time
- Edit or delete any individual data point
- 15-minute auto-relock after login

### Settings
- Admin-locked (same password as Browse Data)
- **Import**: accepts CSV files (single flange) or full JSON backup exports (all materials at once)
- **Export**: saves the complete database as a JSON backup file
- **Change Admin Password**: confirm current password, set a new one — applies to both admin locations immediately
- 15-minute auto-relock after login

---

## Data Behavior

### Multiple readings per bend length
You can have more than one data point at the same bend length (e.g., measurements taken on different days). Each is stored independently and shown separately in the browser. The **average** of all readings at a bend length is what gets used in lookup calculations and the chart.

Entering an exact duplicate (same bend length, correction, and crown) is rejected with a warning.

### Import behavior
- New data points are added alongside existing ones
- Exact duplicates are skipped
- If a point was previously deleted, it is **restored** when re-imported
- Supports both CSV (for a single flange) and JSON export files (all materials at once)

### CSV format
```
bend_length,correction,crown
100,3.50,0.00
200,4.25,0.15
300,5.10,0.30
```
Tab-separated files (Excel copy/paste) are also accepted. A downloadable template is available in the Settings import flow.

---

## Admin Password

Default: `LUSA26`

The password is shared between Browse Data and Settings. Change it in Settings → Change Password. The new password is stored on-device and takes effect immediately.

---

## Project Structure

```
Lindner-Bending-Assistant/
└── my-app/
    ├── app/
    │   ├── _layout.tsx                  # Root layout, context providers
    │   └── (tabs)/
    │       ├── _layout.tsx              # Tab navigation
    │       ├── index.tsx                # Lookup tab
    │       ├── explore.tsx              # Browse Data tab
    │       └── settings.tsx             # Settings tab
    ├── components/
    │   ├── LookupScreen.tsx             # Lookup UI + chart
    │   ├── DataBrowserScreen.tsx        # Data browser + admin controls
    │   └── SettingsScreen.tsx           # Import / export / password
    └── src/
        ├── context/
        │   ├── BendDataContext.tsx      # Data layer: storage, CRUD, import/export
        │   └── AdminPasswordContext.tsx # Shared admin password (AsyncStorage)
        ├── database/
        │   └── sampleData.ts           # Built-in material data
        ├── utils/
        │   └── interpolation.ts        # Interpolation, extrapolation, averaging
        └── types/
            └── index.ts                # TypeScript interfaces
```

---

## Technology

| | |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Storage | AsyncStorage (local, no cloud required) |
| Architecture | New Architecture enabled (`newArchEnabled: true`) |
| Build | EAS Build — `preview` profile produces a sideloadable APK |

---

## Building an APK

```bash
cd my-app
eas build --profile preview --platform android
```

The `preview` profile produces an APK for direct installation (sideload). No Play Store account needed.

---

## Running in Development

```bash
cd my-app
npm install
npx expo start
```

Scan the QR code with Expo Go, or run on a connected device/emulator.

---

## Adding Material Data

The recommended workflow is via the in-app Settings import:

1. Download the CSV template from Settings → Import
2. Fill in your bend test data in Excel or Google Sheets
3. Save as `.csv` and import from Settings
4. To back up or transfer all data: Settings → Export All Data → re-import on another device

To add data directly to the built-in database, edit `my-app/src/database/sampleData.ts`.
