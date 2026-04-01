import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useBendData } from '@/src/context/BendDataContext';
import DropdownPicker from '@/components/ui/DropdownPicker';

const ADMIN_PASSWORD = 'admin';

// ─── Template generator ───────────────────────────────────────────────────────

const TEMPLATE_HEADER = 'bend_length,correction,crown';
const TEMPLATE_EXAMPLE = [
  '100,3.50,0.00',
  '200,4.25,0.15',
  '300,5.10,0.30',
  '400,5.80,0.45',
  '500,6.40,0.60',
].join('\n');
const TEMPLATE_CSV = `${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE}\n`;

function downloadTemplate(materialName: string, flange: string) {
  const filename = `bend_template_${materialName.replace(/\s+/g, '_')}_${flange}mm.csv`;
  if (Platform.OS === 'web') {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Native: copy template text to clipboard as fallback
    // Full native share would need expo-file-system + expo-sharing
    alert('Template CSV format:\n\n' + TEMPLATE_CSV);
  }
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

interface ParsedRow {
  bendLength: number;
  correction: number;
  crown: number;
}

function parseCSVContent(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    // Skip header rows (any line that starts with a non-numeric character)
    const firstChar = line[0];
    if (firstChar && isNaN(Number(firstChar)) && firstChar !== '-') continue;

    // Support both comma and tab delimiters (Excel copies as tab-separated)
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');
    const [rawBend, rawCorr, rawCrown] = parts.map(p => p.trim());

    const bendLength = parseFloat(rawBend);
    const correction = parseFloat(rawCorr);
    const crown = rawCrown ? parseFloat(rawCrown) : 0;

    if (isNaN(bendLength) || isNaN(correction)) {
      errors.push(`Skipped: "${line}"`);
      continue;
    }
    rows.push({ bendLength, correction, crown: isNaN(crown) ? 0 : crown });
  }

  return { rows, errors };
}

// ─── Root component: password gate ───────────────────────────────────────────

export default function SettingsScreen() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleUnlock = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockContainer}>
          <View style={styles.lockIconBox}>
            <Text style={styles.lockIcon}>⚙</Text>
          </View>
          <Text style={styles.lockTitle}>SETTINGS</Text>
          <Text style={styles.lockSubtitle}>Admin access required</Text>
          <View style={styles.lockForm}>
            <TextInput
              style={[styles.lockInput, passwordError && styles.lockInputError]}
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry
              value={passwordInput}
              onChangeText={(t) => { setPasswordInput(t); setPasswordError(false); }}
              onSubmitEditing={handleUnlock}
              autoCapitalize="none"
            />
            {passwordError && <Text style={styles.lockErrorText}>Incorrect password</Text>}
            <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <SettingsContent onLock={() => { setUnlocked(false); setPasswordInput(''); }} />;
}

// ─── Unlocked settings content ────────────────────────────────────────────────

function SettingsContent({ onLock }: { onLock: () => void }) {
  const { db, importCSV } = useBendData();

  const getDefaultForm = () => ({
    selectedMaterialKey: Object.keys(db)[0] ?? '__new__',
    newMaterialName: '',
    newMaterialThickness: '',
    newMaterialUnit: 'mm' as 'mm' | 'gauge',
    selectedFlange: (() => {
      const firstKey = Object.keys(db)[0];
      if (!firstKey) return '__new__';
      return Object.keys(db[firstKey]?.flanges || {}).map(Number).sort((a, b) => a - b)[0]?.toString() ?? '__new__';
    })(),
    newFlangeHeight: '',
  });

  const [form, setForm] = useState(getDefaultForm);
  const [pickedFile, setPickedFile] = useState<{ name: string; rows: ParsedRow[]; errors: string[] } | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const materialOptions = useMemo(() => [
    ...Object.keys(db).map(key => ({ label: db[key].name, value: key })),
    { label: '＋ New Material...', value: '__new__' },
  ], [db]);

  const flangeOptions = useMemo(() => {
    const key = form.selectedMaterialKey;
    if (key === '__new__') return [{ label: '＋ New Flange Height...', value: '__new__' }];
    const flanges = Object.keys(db[key]?.flanges || {}).map(Number).sort((a, b) => a - b);
    return [
      ...flanges.map(f => ({ label: `${f}mm`, value: f.toString() })),
      { label: '＋ New Flange Height...', value: '__new__' },
    ];
  }, [db, form.selectedMaterialKey]);

  const handleMaterialChange = (val: string) => {
    const defaultFlange = val === '__new__'
      ? '__new__'
      : (Object.keys(db[val]?.flanges || {}).map(Number).sort((a, b) => a - b)[0]?.toString() ?? '__new__');
    setForm({ ...form, selectedMaterialKey: val, selectedFlange: defaultFlange });
    setStatus(null);
    setPickedFile(null);
  };

  // Resolve the material key and flange number from form state, returns null + sets error if invalid
  const resolveTarget = (): { matKey: string; matMeta?: { name: string; thickness: number; unit: 'mm' | 'gauge' }; flange: number } | null => {
    let matKey: string;
    let matMeta: { name: string; thickness: number; unit: 'mm' | 'gauge' } | undefined;

    if (form.selectedMaterialKey === '__new__') {
      const name = form.newMaterialName.trim();
      const thickness = parseFloat(form.newMaterialThickness);
      if (!name) { setStatus({ type: 'error', msg: 'Please enter a material name' }); return null; }
      if (isNaN(thickness) || thickness <= 0) { setStatus({ type: 'error', msg: 'Please enter a valid thickness' }); return null; }
      matKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + thickness + form.newMaterialUnit;
      matMeta = { name, thickness, unit: form.newMaterialUnit };
    } else {
      matKey = form.selectedMaterialKey;
    }

    let flange: number;
    if (form.selectedFlange === '__new__') {
      flange = parseFloat(form.newFlangeHeight);
      if (isNaN(flange) || flange <= 0) { setStatus({ type: 'error', msg: 'Please enter a valid flange height' }); return null; }
    } else {
      flange = Number(form.selectedFlange);
    }

    return { matKey, matMeta, flange };
  };

  const handleDownloadTemplate = () => {
    const target = resolveTarget();
    if (!target) return;
    const matName = target.matMeta?.name ?? db[target.matKey]?.name ?? target.matKey;
    downloadTemplate(matName, String(target.flange));
  };

  const handlePickFile = async () => {
    setStatus(null);
    setPickedFile(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'text/comma-separated-values', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const text = await response.text();
      const { rows, errors } = parseCSVContent(text);

      if (rows.length === 0) {
        setStatus({ type: 'error', msg: 'No valid data rows found in file. Check the format.' });
        return;
      }

      setPickedFile({ name: asset.name, rows, errors });
    } catch {
      setStatus({ type: 'error', msg: 'Could not read file. Please try again.' });
    }
  };

  const handleImport = async () => {
    if (!pickedFile || pickedFile.rows.length === 0) return;
    const target = resolveTarget();
    if (!target) return;

    setImporting(true);
    setStatus(null);
    try {
      // Convert parsed rows back to CSV for the existing importCSV function
      const csv = pickedFile.rows
        .map(r => `${r.bendLength},${r.correction},${r.crown}`)
        .join('\n');
      const count = await importCSV(target.matKey, target.flange, csv, target.matMeta);
      setPickedFile(null);
      setStatus({
        type: 'success',
        msg: `Imported ${count} data point${count !== 1 ? 's' : ''} into ${target.flange}mm flange`,
      });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Import failed.' });
    } finally {
      setImporting(false);
    }
  };

  const currentMaterialName = form.selectedMaterialKey !== '__new__'
    ? db[form.selectedMaterialKey]?.name ?? ''
    : form.newMaterialName || 'new material';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SETTINGS</Text>
            <Text style={styles.headerSubtitle}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.lockButton} onPress={onLock}>
            <Text style={styles.lockButtonText}>Lock</Text>
          </TouchableOpacity>
        </View>

        {/* Import section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Import Correction Data</Text>
          <Text style={styles.sectionDescription}>
            Select the material and flange height this data belongs to, download the
            CSV template to fill in Excel, then import the completed file.
          </Text>

          {/* Step 1: Material */}
          <View style={styles.stepRow}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
            <Text style={styles.stepLabel}>Choose material &amp; flange</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Material</Text>
            <DropdownPicker
              options={materialOptions}
              selectedValue={form.selectedMaterialKey}
              onSelect={handleMaterialChange}
            />
          </View>

          {form.selectedMaterialKey === '__new__' && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Material Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 3mm Steel"
                  placeholderTextColor="#555"
                  value={form.newMaterialName}
                  onChangeText={(t) => setForm({ ...form, newMaterialName: t })}
                />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Thickness</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor="#555"
                    keyboardType="decimal-pad"
                    value={form.newMaterialThickness}
                    onChangeText={(t) => setForm({ ...form, newMaterialThickness: t })}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.unitToggle}>
                    {(['mm', 'gauge'] as const).map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitButton, form.newMaterialUnit === u && styles.unitButtonActive]}
                        onPress={() => setForm({ ...form, newMaterialUnit: u })}
                      >
                        <Text style={[styles.unitButtonText, form.newMaterialUnit === u && styles.unitButtonTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Flange Height</Text>
            <DropdownPicker
              options={flangeOptions}
              selectedValue={form.selectedFlange}
              onSelect={(val) => { setForm({ ...form, selectedFlange: val }); setStatus(null); setPickedFile(null); }}
            />
          </View>

          {form.selectedFlange === '__new__' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Flange Height (mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 25"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                value={form.newFlangeHeight}
                onChangeText={(t) => setForm({ ...form, newFlangeHeight: t })}
              />
            </View>
          )}

          <View style={styles.divider} />

          {/* Step 2: Download template */}
          <View style={styles.stepRow}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
            <Text style={styles.stepLabel}>Download &amp; fill in the template</Text>
          </View>

          <Text style={styles.stepHint}>
            Opens a pre-formatted CSV with example rows. Fill in your bend data in Excel or
            Google Sheets, then save as <Text style={styles.code}>.csv</Text>.
          </Text>

          <TouchableOpacity style={styles.templateButton} onPress={handleDownloadTemplate}>
            <Text style={styles.templateButtonIcon}>⬇</Text>
            <Text style={styles.templateButtonText}>Download Template</Text>
          </TouchableOpacity>

          <View style={styles.templatePreview}>
            <Text style={styles.templatePreviewText}>
              {'bend_length,correction,crown\n100,3.50,0.00\n200,4.25,0.15\n...'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Step 3: Pick file */}
          <View style={styles.stepRow}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
            <Text style={styles.stepLabel}>Select your completed file</Text>
          </View>

          <Text style={styles.stepHint}>
            Also accepts tab-separated files pasted directly from Excel.
          </Text>

          <TouchableOpacity style={styles.filePickerZone} onPress={handlePickFile}>
            {pickedFile ? (
              <View style={styles.filePickedContent}>
                <Text style={styles.filePickedIcon}>✓</Text>
                <View>
                  <Text style={styles.filePickedName}>{pickedFile.name}</Text>
                  <Text style={styles.filePickedCount}>
                    {pickedFile.rows.length} valid row{pickedFile.rows.length !== 1 ? 's' : ''} found
                    {pickedFile.errors.length > 0 ? ` · ${pickedFile.errors.length} skipped` : ''}
                  </Text>
                </View>
                <Text style={styles.filePickerChange}>Change</Text>
              </View>
            ) : (
              <View style={styles.filePickerEmpty}>
                <Text style={styles.filePickerEmptyIcon}>📄</Text>
                <Text style={styles.filePickerEmptyText}>Tap to choose a CSV file</Text>
                <Text style={styles.filePickerEmptyHint}>.csv or .txt</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Preview table */}
          {pickedFile && pickedFile.rows.length > 0 && (
            <View style={styles.previewTable}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewCell, styles.previewHeaderCell]}>Bend (mm)</Text>
                <Text style={[styles.previewCell, styles.previewHeaderCell]}>Correction (°)</Text>
                <Text style={[styles.previewCell, styles.previewHeaderCell]}>Crown</Text>
              </View>
              {pickedFile.rows.slice(0, 6).map((row, i) => (
                <View key={i} style={styles.previewRow}>
                  <Text style={styles.previewCell}>{row.bendLength}</Text>
                  <Text style={styles.previewCell}>{row.correction}</Text>
                  <Text style={styles.previewCell}>{row.crown}</Text>
                </View>
              ))}
              {pickedFile.rows.length > 6 && (
                <View style={styles.previewRow}>
                  <Text style={[styles.previewCell, { color: '#555', flex: 3 }]}>
                    … and {pickedFile.rows.length - 6} more row{pickedFile.rows.length - 6 !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Status */}
          {status && (
            <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
              <Text style={[styles.statusText, status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError]}>
                {status.type === 'success' ? '✓ ' : '⚠ '}{status.msg}
              </Text>
            </View>
          )}

          {/* Import button */}
          {pickedFile && pickedFile.rows.length > 0 && (
            <TouchableOpacity
              style={[styles.importButton, importing && styles.importButtonDisabled]}
              onPress={handleImport}
              disabled={importing}
            >
              <Text style={styles.importButtonText}>
                {importing
                  ? 'Importing…'
                  : `Import ${pickedFile.rows.length} rows into ${currentMaterialName}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  // Lock screen
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  lockIconBox: {
    width: 72, height: 72, backgroundColor: '#252542',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  lockIcon: { fontSize: 36, color: '#f59e0b' },
  lockTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 2, marginBottom: 8 },
  lockSubtitle: { fontSize: 13, color: '#666', marginBottom: 32 },
  lockForm: { width: '100%', maxWidth: 320 },
  lockInput: {
    backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#3d3d5c', borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 16, color: '#fff', fontSize: 16,
    textAlign: 'center', letterSpacing: 3, marginBottom: 8,
  },
  lockInputError: { borderColor: '#ef4444' },
  lockErrorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  unlockButton: {
    backgroundColor: '#f59e0b', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  unlockButtonText: { color: '#1a1a2e', fontSize: 16, fontWeight: '700' },

  // Settings content
  scrollContent: { padding: 16 },
  header: {
    backgroundColor: '#f59e0b', borderRadius: 12, padding: 16, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 5,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#1a1a2e', opacity: 0.8, marginTop: 4 },
  lockButton: {
    backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8,
  },
  lockButtonText: { color: '#f59e0b', fontSize: 13, fontWeight: '700' },

  sectionCard: {
    backgroundColor: '#111125', borderWidth: 1, borderColor: '#3d3d5c',
    borderRadius: 12, padding: 20, marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sectionDescription: { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 19 },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#f59e0b',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBadgeText: { fontSize: 12, fontWeight: '800', color: '#1a1a2e' },
  stepLabel: { fontSize: 14, fontWeight: '700', color: '#ddd' },
  stepHint: { fontSize: 12, color: '#555', marginBottom: 12, lineHeight: 18 },

  divider: { height: 1, backgroundColor: '#2d2d4d', marginVertical: 20 },

  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', marginBottom: 16 },
  label: {
    fontSize: 11, color: '#888', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#3d3d5c',
    borderRadius: 8, paddingVertical: 12, paddingHorizontal: 12, color: '#fff', fontSize: 14,
  },
  unitToggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#3d3d5c', borderRadius: 8, overflow: 'hidden' },
  unitButton: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#1a1a2e' },
  unitButtonActive: { backgroundColor: '#f59e0b' },
  unitButtonText: { color: '#888', fontSize: 13, fontWeight: '600' },
  unitButtonTextActive: { color: '#1a1a2e' },

  templateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#f59e0b',
    borderRadius: 10, paddingVertical: 14, marginBottom: 12,
  },
  templateButtonIcon: { fontSize: 16, color: '#f59e0b' },
  templateButtonText: { fontSize: 15, fontWeight: '700', color: '#f59e0b' },

  templatePreview: {
    backgroundColor: '#0d0d1a', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#2d2d4d',
  },
  templatePreviewText: {
    fontFamily: 'monospace', fontSize: 11, color: '#555', lineHeight: 18,
  },
  code: { color: '#f59e0b', fontFamily: 'monospace' },

  filePickerZone: {
    borderWidth: 2, borderColor: '#3d3d5c', borderStyle: 'dashed',
    borderRadius: 12, marginBottom: 12, overflow: 'hidden',
  },
  filePickerEmpty: { padding: 28, alignItems: 'center', gap: 6 },
  filePickerEmptyIcon: { fontSize: 32 },
  filePickerEmptyText: { fontSize: 14, fontWeight: '600', color: '#888' },
  filePickerEmptyHint: { fontSize: 11, color: '#444' },
  filePickedContent: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: '#1a3d1a',
  },
  filePickedIcon: { fontSize: 22, color: '#4ade80' },
  filePickedName: { fontSize: 14, fontWeight: '600', color: '#4ade80', flex: 1 },
  filePickedCount: { fontSize: 11, color: '#1d8040', marginTop: 2 },
  filePickerChange: { fontSize: 12, color: '#f59e0b', fontWeight: '600' },

  previewTable: {
    backgroundColor: '#0d0d1a', borderRadius: 8,
    borderWidth: 1, borderColor: '#2d2d4d', overflow: 'hidden', marginBottom: 12,
  },
  previewHeader: {
    flexDirection: 'row', backgroundColor: '#1a1a2e',
    borderBottomWidth: 1, borderBottomColor: '#2d2d4d',
  },
  previewRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a1a30',
  },
  previewCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12, color: '#ccc', textAlign: 'center' },
  previewHeaderCell: { color: '#666', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },

  statusBox: { borderRadius: 8, padding: 12, marginBottom: 12 },
  statusSuccess: { backgroundColor: '#1a3d1a', borderWidth: 1, borderColor: '#3d5c3d' },
  statusError: { backgroundColor: '#2d1f1f', borderWidth: 1, borderColor: '#5c3d3d' },
  statusText: { fontSize: 14, fontWeight: '600' },
  statusTextSuccess: { color: '#4ade80' },
  statusTextError: { color: '#f87171' },

  importButton: {
    backgroundColor: '#f59e0b', borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  importButtonDisabled: { opacity: 0.5 },
  importButtonText: { color: '#1a1a2e', fontSize: 16, fontWeight: '700' },

  spacer: { height: 20 },
});
