import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useBendData } from '@/src/context/BendDataContext';
import DropdownPicker from '@/components/ui/DropdownPicker';

const ADMIN_PASSWORD = 'admin';

// ─── Root component: gate ────────────────────────────────────────────────────

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
            {passwordError && (
              <Text style={styles.lockErrorText}>Incorrect password</Text>
            )}
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

// ─── Unlocked settings content ───────────────────────────────────────────────

function SettingsContent({ onLock }: { onLock: () => void }) {
  const { db, importCSV } = useBendData();

  const getDefaultForm = () => ({
    selectedMaterialKey: Object.keys(db)[0] ?? '__new__',
    newMaterialName: '',
    newMaterialThickness: '',
    newMaterialUnit: 'mm' as 'mm' | 'gauge',
    selectedFlange: '__new__',
    newFlangeHeight: '',
    csvContent: '',
  });

  const [form, setForm] = useState(getDefaultForm);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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

  // Reset flange when material changes
  const handleMaterialChange = (val: string) => {
    const defaultFlange = val === '__new__'
      ? '__new__'
      : (Object.keys(db[val]?.flanges || {}).map(Number).sort((a, b) => a - b)[0]?.toString() ?? '__new__');
    setForm({ ...form, selectedMaterialKey: val, selectedFlange: defaultFlange });
    setStatus(null);
  };

  const handleImport = async () => {
    setStatus(null);

    // Resolve material
    let matKey: string;
    let matMeta: { name: string; thickness: number; unit: 'mm' | 'gauge' } | undefined;
    if (form.selectedMaterialKey === '__new__') {
      const name = form.newMaterialName.trim();
      const thickness = parseFloat(form.newMaterialThickness);
      if (!name) { setStatus({ type: 'error', msg: 'Please enter a material name' }); return; }
      if (isNaN(thickness) || thickness <= 0) { setStatus({ type: 'error', msg: 'Please enter a valid thickness' }); return; }
      matKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + thickness + form.newMaterialUnit;
      matMeta = { name, thickness, unit: form.newMaterialUnit };
    } else {
      matKey = form.selectedMaterialKey;
    }

    // Resolve flange
    let flange: number;
    if (form.selectedFlange === '__new__') {
      flange = parseFloat(form.newFlangeHeight);
      if (isNaN(flange) || flange <= 0) { setStatus({ type: 'error', msg: 'Please enter a valid flange height' }); return; }
    } else {
      flange = Number(form.selectedFlange);
    }

    if (!form.csvContent.trim()) {
      setStatus({ type: 'error', msg: 'Please paste CSV data before importing' });
      return;
    }

    try {
      const count = await importCSV(matKey, flange, form.csvContent, matMeta);
      setForm(f => ({ ...f, csvContent: '' }));
      setStatus({ type: 'success', msg: `Imported ${count} data point${count !== 1 ? 's' : ''} into ${flange}mm flange` });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Import failed. Check CSV format.' });
    }
  };

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

        {/* Import CSV section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Import CSV Data</Text>
          <Text style={styles.sectionDescription}>
            Paste correction data to add to the database. Format:{' '}
            <Text style={styles.code}>bendLength,correction,crown</Text>
          </Text>

          {/* Material */}
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

          {/* Flange height */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Flange Height</Text>
            <DropdownPicker
              options={flangeOptions}
              selectedValue={form.selectedFlange}
              onSelect={(val) => { setForm({ ...form, selectedFlange: val }); setStatus(null); }}
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

          {/* CSV */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>CSV Data</Text>
            <Text style={styles.hint}>One row per line · header rows are skipped automatically</Text>
            <TextInput
              style={[styles.input, styles.csvInput]}
              placeholder={'bendLength,correction,crown\n100,5.9,0\n200,5.3,0\n300,6.1,0.12'}
              placeholderTextColor="#444"
              multiline
              numberOfLines={10}
              value={form.csvContent}
              onChangeText={(t) => { setForm({ ...form, csvContent: t }); setStatus(null); }}
            />
          </View>

          {/* Status */}
          {status && (
            <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
              <Text style={[styles.statusText, status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError]}>
                {status.type === 'success' ? '✓ ' : '⚠ '}{status.msg}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.importButton} onPress={handleImport}>
            <Text style={styles.importButtonText}>Import Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },

  // Lock screen
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockIconBox: {
    width: 72,
    height: 72,
    backgroundColor: '#252542',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 36,
    color: '#f59e0b',
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 32,
  },
  lockForm: {
    width: '100%',
    maxWidth: 320,
  },
  lockInput: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  lockInputError: {
    borderColor: '#ef4444',
  },
  lockErrorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  unlockButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  unlockButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },

  // Settings content
  scrollContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#1a1a2e',
    opacity: 0.8,
    marginTop: 4,
  },
  lockButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lockButtonText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#111125',
    borderWidth: 1,
    borderColor: '#3d3d5c',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
    lineHeight: 19,
  },
  code: {
    color: '#f59e0b',
    fontFamily: 'monospace',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
  },
  csvInput: {
    height: 200,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  hint: {
    fontSize: 11,
    color: '#555',
    marginBottom: 6,
  },
  unitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  unitButtonActive: {
    backgroundColor: '#f59e0b',
  },
  unitButtonText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#1a1a2e',
  },
  statusBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statusSuccess: {
    backgroundColor: '#1a3d1a',
    borderWidth: 1,
    borderColor: '#3d5c3d',
  },
  statusError: {
    backgroundColor: '#2d1f1f',
    borderWidth: 1,
    borderColor: '#5c3d3d',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#4ade80',
  },
  statusTextError: {
    color: '#f87171',
  },
  importButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  importButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    height: 20,
  },
});
