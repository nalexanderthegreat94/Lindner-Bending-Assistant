# Adding Future Material Data

When you have bend correction data for additional materials and thicknesses, follow these steps to add them to the app.

## Materials You Mentioned

You indicated you'll eventually have data for:
- ✅ Aluminum (multiple thicknesses) - *ready now!*
- Steel (multiple thicknesses)
- Stainless Steel (multiple thicknesses)
- Spring Steel (multiple thicknesses)

## Step-by-Step: Adding New Materials

### Option 1: Using the Import Screen (Easiest)

1. **Prepare your data:**
   - Test bend corrections on your machine
   - Record: bend length (mm), bend correction (degrees), crown correction
   - Export as CSV or create it manually

2. **Format the CSV:**
   ```
   Test Bend Length (mm),Bend Correction (Degrees),Crown
   100,value1,value2
   150,value1,value2
   200,value1,value2
   [continue for all test points]
   ```

3. **In the app:**
   - Go to **Import Data** tab
   - Fill in details:
     - Material: "Steel" or "Stainless Steel", etc.
     - Thickness: your value (e.g., 3 for 3mm)
     - Unit: mm or gauge
     - Flange: flange length you tested (e.g., 20mm)
   - Paste your CSV data
   - Tap "Import Data"

4. **Verify:**
   - Go to "Browse Data" tab
   - Switch to your new material
   - Verify data points appear correctly

### Option 2: Programmatic (if you have many datasets)

You can also add datasets directly in code by editing `src/database/sampleData.ts`:

```typescript
// In initializeSampleData() function, add:

await bendDatabase.saveDataset({
  id: 'Steel_3mm_20mm',
  material: 'Steel',
  thickness: 3,
  thicknessUnit: 'mm',
  flange: 20,
  label: '3mm Steel (20mm flange)',
  data: [
    { bendLength: 100, bendCorrection: 6.1, crown: 0 },
    { bendLength: 150, bendCorrection: 5.9, crown: 0 },
    { bendLength: 200, bendCorrection: 6.0, crown: 0 },
    // ... add all your data points
  ],
  createdAt: Date.now(),
});
```

---

## Data Requirements

### Minimum Data Points
- At least 5 data points per dataset (more is better)
- Recommended: 20-40 points for accurate interpolation

### Bend Length Range
- Cover the full range your operators use
- Example: 100mm to 3000mm for large presses
- Gaps in data are okay (interpolation handles them)

### Testing Tips
- Keep consistent flange length for each dataset
- Test at least 5-10 different bend lengths
- Record corrections to 2 decimal places
- Record crown to 3-4 decimal places

### ID Naming Convention
Use this format for consistency:
```
{Material}_{Thickness}{Unit}_{Flange}mm
```

Examples:
- `Aluminum_2mm_20mm`
- `Steel_3mm_16mm`
- `StainlessSteel_1_5mm_20mm`
- `SpringSteel_4gauge_20mm`

---

## Material Collections

Once you have multiple materials/thicknesses, here's how they'll appear:

### Example: Full Setup
```
Lookup Tab:
├── 2mm Aluminum 12ga (20mm flange)      [Current]
├── 3mm Aluminum (20mm flange)
├── 4mm Aluminum (20mm flange)
├── 2mm Steel (20mm flange)
├── 3mm Steel (20mm flange)
├── 2mm Stainless Steel (20mm flange)
└── ...and more
```

Operators select the matching material/thickness/flange, then enter their bend length.

---

## Special Considerations

### Multiple Flange Lengths
If you test the same material/thickness with **different flange lengths**, create separate datasets:

❌ Wrong: One dataset mixing flanges
✅ Right: Separate datasets per flange length

Example:
- `Aluminum_2mm_16mm` - 2mm Aluminum with 16mm flange
- `Aluminum_2mm_20mm` - 2mm Aluminum with 20mm flange (current)
- `Aluminum_2mm_25mm` - 2mm Aluminum with 25mm flange

This is important because flange length affects bend corrections!

### Gauge vs. MM
Choose one unit per material and stick to it:
- 12 gauge ≈ 2mm
- 10 gauge ≈ 3.25mm
- 8 gauge ≈ 4mm

For consistency with your existing data, use gauge if that's what your testing used, or convert to mm.

### Thickness Precision
Record thickness as you'll reference it:
- `2` for 2mm
- `2.4` for 2.4mm (if needed)
- `1.5` for 1.5mm
- Not critical for lookups, just for display

---

## CSV Template

Save this template and reuse it:

```
[Material] [Thickness] Bend Correction Data,,
[Flange]mm flange lengths,,
,,
Test Bend Length (mm),Bend Correction (Degrees),Crown
100,,,
150,,,
200,,,
250,,,
300,,,
400,,,
500,,,
600,,,
700,,,
800,,,
900,,,
1000,,,
```

Fill in your values and import!

---

## Organization Tips

### Before Testing
1. Plan your bend lengths (e.g., 100mm increments, or test actual part sizes)
2. Create a spreadsheet with the template above
3. Set up data collection at the machine

### After Testing
1. Calculate bend corrections (tested length - nominal length)
2. Enter into the template
3. Export as CSV
4. Import into the app
5. Verify in Browse Data tab

### Version Control
- Keep your source test data in a spreadsheet
- Label files by date and material: `Steel_3mm_2024_03_31.csv`
- Store centrally so you can re-import if app data is lost

---

## Troubleshooting New Materials

### Data won't import
- Check CSV format (3 columns only)
- Ensure all values are numbers (not text)
- Verify no extra spaces or commas
- Check the error message in the app

### Results don't look right
- Verify your test data is correct
- Use Browse Data tab to see exact values
- Check for outliers (typos in test data)
- Consider re-testing if values seem off

### Performance issues with large datasets
- 1000+ data points will still work fine
- Consider splitting into multiple datasets if needed
- The app uses linear interpolation (fast)

---

## Future Enhancements

Requested features for future versions:
- [ ] CSV file picker (easier than copy-paste)
- [ ] Bulk import multiple files
- [ ] Data export/backup
- [ ] Edit existing data points
- [ ] Delete specific materials
- [ ] Advanced interpolation (spline fitting)

Contact the development team to request features!

---

## Questions?

If you need help with:
- **Adding materials**: Use the Import Data tab (visual, easiest)
- **Formatting data**: Reference the CSV template and examples above
- **Technical issues**: Check app Troubleshooting or contact development team

Happy bending! 🏭
