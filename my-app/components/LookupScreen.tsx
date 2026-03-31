import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useBendData } from '@/src/context/BendDataContext';
import { findCorrection } from '@/src/utils/interpolation';
import { CorrectionResult } from '@/src/types';
import DropdownPicker from '@/components/ui/DropdownPicker';

interface HistoryEntry {
  id: number;
  material: string;
  flange: number;
  bendLength: number;
  correction: number;
  crown: number;
  isExact: boolean;
  timestamp: string;
}

export default function LookupScreen() {
  const { db, addDataPoint } = useBendData();
  const [material] = useState('2mm_aluminum');

  const availableFlanges = useMemo(() => {
    const mat = db[material];
    if (!mat) return [];
    return Object.keys(mat.flanges).map(Number).sort((a, b) => a - b);
  }, [db, material]);

  const [flangeLength, setFlangeLength] = useState(10);
  const [bendLengthInput, setBendLengthInput] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showChart, setShowChart] = useState(false);

  // Add New Correction modal state
  const [showAddNewModal, setShowAddNewModal] = useState(false);

  const getDefaultAddNewState = () => ({
    selectedMaterialKey: material,
    newMaterialName: '',
    newMaterialThickness: '',
    newMaterialUnit: 'mm' as 'mm' | 'gauge',
    selectedFlange: flangeLength.toString(),
    newFlangeHeight: '',
    bendLength: '',
    bendCorrection: '',
    crown: '',
  });

  const [addNewFormState, setAddNewFormState] = useState(getDefaultAddNewState);

  const materialOptions = useMemo(() => [
    ...Object.keys(db).map(key => ({ label: db[key].name, value: key })),
    { label: '＋ New Material...', value: '__new__' },
  ], [db]);

  const addFormFlangeOptions = useMemo(() => {
    const key = addNewFormState.selectedMaterialKey;
    if (key === '__new__') {
      return [{ label: '＋ New Flange Height...', value: '__new__' }];
    }
    const flanges = Object.keys(db[key]?.flanges || {}).map(Number).sort((a, b) => a - b);
    return [
      ...flanges.map(f => ({ label: `${f}mm`, value: f.toString() })),
      { label: '＋ New Flange Height...', value: '__new__' },
    ];
  }, [db, addNewFormState.selectedMaterialKey]);

  const chartData = useMemo(() => {
    const mat = db[material];
    if (!mat || !mat.flanges[flangeLength]) return [];
    return mat.flanges[flangeLength]
      .filter(d => d.correction !== null)
      .map(d => ({
        bendLength: d.bendLength,
        correction: d.correction,
        crown: d.crown
      }));
  }, [db, material, flangeLength]);

  const handleNumpadPress = (value: string) => {
    if (value === 'C') {
      setBendLengthInput('');
      setResult(null);
    } else if (value === '⌫') {
      setBendLengthInput(prev => prev.slice(0, -1));
    } else if (value === 'GO') {
      calculateResult();
    } else {
      setBendLengthInput(prev => prev + value);
    }
  };

  const calculateResult = () => {
    const bendLen = parseFloat(bendLengthInput);
    if (isNaN(bendLen) || bendLen <= 0) {
      setResult({ error: 'Enter a valid bend length' });
      return;
    }

    const res = findCorrection(material, flangeLength, bendLen, db);
    setResult(res);

    if (!res.error) {
      const historyEntry: HistoryEntry = {
        id: Date.now(),
        material: db[material]?.name || material,
        flange: flangeLength,
        bendLength: bendLen,
        correction: res.correction || 0,
        crown: res.crown || 0,
        isExact: res.isExact || false,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setBendLengthInput(entry.bendLength.toString());
    setFlangeLength(entry.flange);
    const res = findCorrection(material, entry.flange, entry.bendLength, db);
    setResult(res);
  };

  const handleAddNewCorrection = async () => {
    const bendLen = parseFloat(addNewFormState.bendLength);
    const correction = parseFloat(addNewFormState.bendCorrection);
    const crown = addNewFormState.crown ? parseFloat(addNewFormState.crown) : 0;

    if (isNaN(bendLen) || bendLen <= 0 || isNaN(correction)) {
      alert('Please enter a valid bend length and correction');
      return;
    }

    // Resolve material
    let matKey: string;
    let matMeta: { name: string; thickness: number; unit: 'mm' | 'gauge' } | undefined;
    if (addNewFormState.selectedMaterialKey === '__new__') {
      const name = addNewFormState.newMaterialName.trim();
      const thickness = parseFloat(addNewFormState.newMaterialThickness);
      if (!name) { alert('Please enter a material name'); return; }
      if (isNaN(thickness) || thickness <= 0) { alert('Please enter a valid thickness'); return; }
      matKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + thickness + addNewFormState.newMaterialUnit;
      matMeta = { name, thickness, unit: addNewFormState.newMaterialUnit };
    } else {
      matKey = addNewFormState.selectedMaterialKey;
    }

    // Resolve flange height
    let flange: number;
    if (addNewFormState.selectedFlange === '__new__') {
      flange = parseFloat(addNewFormState.newFlangeHeight);
      if (isNaN(flange) || flange <= 0) { alert('Please enter a valid flange height'); return; }
    } else {
      flange = Number(addNewFormState.selectedFlange);
    }

    try {
      await addDataPoint(matKey, flange, {
        bendLength: bendLen,
        correction,
        crown: isNaN(crown) ? 0 : crown,
      }, matMeta);
      setShowAddNewModal(false);
      setAddNewFormState(getDefaultAddNewState());
      alert(`Saved: ${bendLen}mm → ${correction}° for ${flange}mm flange`);
    } catch {
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>BEND CORRECTION</Text>
            <Text style={styles.headerSubtitle}>Sheet Metal Calculator</Text>
          </View>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>◢</Text>
          </View>
        </View>

        {/* Material & Flange Selection */}
        <View style={styles.selectionGrid}>
          <View style={styles.selectionItem}>
            <Text style={styles.selectionLabel}>Material</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>
                {db[material]?.name}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionItem}>
            <Text style={styles.selectionLabel}>Flange Height</Text>
            <DropdownPicker
              options={availableFlanges.map(f => ({ label: `${f}mm`, value: f.toString() }))}
              selectedValue={flangeLength.toString()}
              onSelect={(val) => setFlangeLength(Number(val))}
            />
          </View>
        </View>

        {/* Bend Length Input Display */}
        <View style={styles.inputDisplay}>
          <Text style={styles.inputLabel}>Bend Length (mm)</Text>
          <Text style={styles.inputValue}>
            {bendLengthInput || '0'}
          </Text>
        </View>

        {/* Numpad */}
        <View style={styles.numpadGrid}>
          {['7', '8', '9', 'C', '4', '5', '6', '⌫', '1', '2', '3', '.', '0', '00', 'GO'].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleNumpadPress(key)}
              style={[
                styles.numpadButton,
                key === 'GO' && styles.numpadButtonGO,
                key === 'C' && styles.numpadButtonClear,
                key === '⌫' && styles.numpadButtonDelete,
              ]}
            >
              <Text style={styles.numpadButtonText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Display */}
        {result && (
          <View style={[
            styles.resultContainer,
            result.error ? styles.resultError : styles.resultSuccess
          ]}>
            {result.error ? (
              <View>
                {result.notPossible ? (
                  <>
                    <View style={styles.resultErrorHeader}>
                      <Text style={styles.resultErrorIcon}>⊘</Text>
                      <Text style={styles.resultErrorTitle}>{result.error}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.resultErrorText}>⚠ {result.error}</Text>
                    {result.suggestion && (
                      <Text style={styles.resultSuggestion}>
                        Nearest: {result.suggestion.bendLength}mm → {result.suggestion.correction}°
                      </Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <View>
                <View style={styles.resultValues}>
                  <View>
                    <Text style={styles.resultLabel}>Bend Correction</Text>
                    <Text style={styles.resultCorrection}>{result.correction}°</Text>
                  </View>
                  <View style={styles.resultCrown}>
                    <Text style={styles.resultLabel}>Crown</Text>
                    <Text style={styles.resultCrownValue}>{result.crown}</Text>
                  </View>
                </View>

                {result.isExtrapolated && (
                  <View style={styles.resultWarning}>
                    <Text style={styles.resultWarningText}>
                      ⚠ EXTRAPOLATED — {result.extrapolatedAbove
                        ? `Above maximum tested (${result.maxTested}mm)`
                        : `Below minimum tested (${result.minTested}mm)`}. Use with caution.
                    </Text>
                  </View>
                )}

                {result.isExact && (
                  <View style={styles.resultExact}>
                    <Text style={styles.resultExactText}>✓ Exact match from test data</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Toggle Chart */}
        <TouchableOpacity
          onPress={() => setShowChart(!showChart)}
          style={styles.chartToggle}
        >
          <Text style={styles.chartToggleText}>
            {showChart ? '▼' : '▶'} Correction Curve
          </Text>
        </TouchableOpacity>

        {/* Chart Data Display */}
        {showChart && chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartTable}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartHeaderCell}>Bend (mm)</Text>
                <Text style={styles.chartHeaderCell}>Correction (°)</Text>
                <Text style={styles.chartHeaderCell}>Crown</Text>
              </View>
              <ScrollView style={styles.chartBody} nestedScrollEnabled>
                {chartData.slice(0, 10).map((item, idx) => (
                  <View key={idx} style={styles.chartRow}>
                    <Text style={styles.chartCell}>{item.bendLength}</Text>
                    <Text style={styles.chartCell}>{item.correction}</Text>
                    <Text style={styles.chartCell}>{item.crown}</Text>
                  </View>
                ))}
                {chartData.length > 10 && (
                  <View style={styles.chartRow}>
                    <Text style={styles.chartCell}>...</Text>
                    <Text style={styles.chartCell}>{chartData.length} total</Text>
                    <Text style={styles.chartCell}>points</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Lookups</Text>
              <TouchableOpacity onPress={() => setHistory([])}>
                <Text style={styles.historyClear}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
              {history.map(entry => (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => loadFromHistory(entry)}
                  style={styles.historyEntry}
                >
                  <View>
                    <Text style={styles.historyValue}>
                      {entry.bendLength}mm × {entry.flange}mm flange
                    </Text>
                    <Text style={styles.historyMeta}>
                      {entry.timestamp} {!entry.isExact && '• interpolated'}
                    </Text>
                  </View>
                  <View style={styles.historyResult}>
                    <Text style={styles.historyCorrection}>{entry.correction}°</Text>
                    <Text style={styles.historyCrown}>↕ {entry.crown}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Manage Data */}
        <View style={styles.manageDataRow}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => {
              setAddNewFormState(getDefaultAddNewState());
              setShowAddNewModal(true);
            }}
          >
            <Text style={styles.manageButtonText}>+ Add Correction</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Data: 2mm/12ga 3003 Aluminum • More materials coming soon
        </Text>
      </ScrollView>

      {/* Add New Correction Modal */}
      <Modal visible={showAddNewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addNewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Correction</Text>
              <TouchableOpacity onPress={() => setShowAddNewModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modaNalContent}>
              {/* Material */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Material</Text>
                <DropdownPicker
                  options={materialOptions}
                  selectedValue={addNewFormState.selectedMaterialKey}
                  onSelect={(val) => {
                    const defaultFlange = val === '__new__'
                      ? '__new__'
                      : (Object.keys(db[val]?.flanges || {}).map(Number).sort((a, b) => a - b)[0]?.toString() ?? '__new__');
                    setAddNewFormState({ ...addNewFormState, selectedMaterialKey: val, selectedFlange: defaultFlange });
                  }}
                />
              </View>

              {addNewFormState.selectedMaterialKey === '__new__' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Material Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 3mm Steel"
                      value={addNewFormState.newMaterialName}
                      onChangeText={(text) => setAddNewFormState({ ...addNewFormState, newMaterialName: text })}
                    />
                  </View>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Thickness</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="3"
                        keyboardType="decimal-pad"
                        value={addNewFormState.newMaterialThickness}
                        onChangeText={(text) => setAddNewFormState({ ...addNewFormState, newMaterialThickness: text })}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.label}>Unit</Text>
                      <View style={styles.unitToggle}>
                        {(['mm', 'gauge'] as const).map(u => (
                          <TouchableOpacity
                            key={u}
                            style={[styles.unitButton, addNewFormState.newMaterialUnit === u && styles.unitButtonActive]}
                            onPress={() => setAddNewFormState({ ...addNewFormState, newMaterialUnit: u })}
                          >
                            <Text style={[styles.unitButtonText, addNewFormState.newMaterialUnit === u && styles.unitButtonTextActive]}>
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
                  options={addFormFlangeOptions}
                  selectedValue={addNewFormState.selectedFlange}
                  onSelect={(val) => setAddNewFormState({ ...addNewFormState, selectedFlange: val })}
                />
              </View>

              {addNewFormState.selectedFlange === '__new__' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>New Flange Height (mm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 25"
                    keyboardType="decimal-pad"
                    value={addNewFormState.newFlangeHeight}
                    onChangeText={(text) => setAddNewFormState({ ...addNewFormState, newFlangeHeight: text })}
                  />
                </View>
              )}

              <View style={styles.formDivider} />

              {/* Data point */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bend Length (mm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  keyboardType="decimal-pad"
                  value={addNewFormState.bendLength}
                  onChangeText={(text) => setAddNewFormState({ ...addNewFormState, bendLength: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Correction (°)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5.5"
                  keyboardType="decimal-pad"
                  value={addNewFormState.bendCorrection}
                  onChangeText={(text) => setAddNewFormState({ ...addNewFormState, bendCorrection: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Crown (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={addNewFormState.crown}
                  onChangeText={(text) => setAddNewFormState({ ...addNewFormState, crown: text })}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddNewCorrection}
              >
                <Text style={styles.submitButtonText}>Add Correction</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
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
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 24,
    color: '#f59e0b',
  },
  selectionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selectionItem: {
    flex: 1,
  },
  selectionLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#252542',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    padding: 14,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
  },
  flangeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  flangeButton: {
    backgroundColor: '#252542',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flangeButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  flangeButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  flangeButtonTextActive: {
    color: '#1a1a2e',
  },
  inputDisplay: {
    backgroundColor: '#0d0d1a',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
    minHeight: 50,
    fontFamily: 'monospace',
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  numpadButton: {
    width: `${(100 / 4) - 3}%`,
    aspectRatio: 1,
    backgroundColor: '#252542',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    minHeight: 44,
  },
  numpadButtonGO: {
    width: `${(100 / 2) - 3}%`,
    backgroundColor: '#10b981',
  },
  numpadButtonClear: {
    backgroundColor: '#dc2626',
  },
  numpadButtonDelete: {
    backgroundColor: '#6366f1',
  },
  numpadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resultContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resultSuccess: {
    backgroundColor: '#1f2d1f',
    borderWidth: 2,
    borderColor: '#3d5c3d',
  },
  resultError: {
    backgroundColor: '#2d1f1f',
    borderWidth: 2,
    borderColor: '#5c3d3d',
  },
  resultErrorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  resultErrorIcon: {
    fontSize: 32,
    color: '#ef4444',
  },
  resultErrorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ef4444',
  },
  resultErrorReason: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  resultErrorText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSuggestion: {
    color: '#fbbf24',
    fontSize: 14,
    marginTop: 8,
  },
  resultHint: {
    backgroundColor: '#3d2020',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  resultHintText: {
    fontSize: 13,
    color: '#fbbf24',
  },
  bold: {
    fontWeight: '700',
  },
  resultValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultCorrection: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4ade80',
    marginTop: 4,
  },
  resultCrown: {
    alignItems: 'flex-end',
  },
  resultCrownValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#60a5fa',
    marginTop: 4,
  },
  resultWarning: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#4a3000',
    borderWidth: 1,
    borderColor: '#854d0e',
    borderRadius: 8,
  },
  resultWarningText: {
    fontSize: 12,
    color: '#fbbf24',
  },
  resultInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#252542',
    borderRadius: 8,
  },
  resultInfoText: {
    fontSize: 12,
    color: '#a5a5c5',
  },
  resultExact: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#1a3d1a',
    borderRadius: 8,
  },
  resultExactText: {
    fontSize: 12,
    color: '#4ade80',
  },
  chartToggle: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#252542',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 10,
    marginBottom: 16,
  },
  chartToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#0d0d1a',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTable: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    backgroundColor: '#252542',
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  chartHeaderCell: {
    flex: 1,
    padding: 10,
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartBody: {
    maxHeight: 150,
  },
  chartRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4d',
  },
  chartCell: {
    flex: 1,
    padding: 10,
    color: '#e8e8e8',
    fontSize: 12,
    textAlign: 'center',
  },
  historyContainer: {
    backgroundColor: '#0d0d1a',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyClear: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  historyList: {
    gap: 8,
  },
  historyEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d4d',
    borderRadius: 8,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e8e8e8',
  },
  historyMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  historyResult: {
    alignItems: 'flex-end',
  },
  historyCorrection: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ade80',
  },
  historyCrown: {
    fontSize: 12,
    color: '#60a5fa',
  },
  manageDataRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#a5a5c5',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#555',
    marginTop: 4,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  addNewModal: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '90%',
  },
  importModal: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
  },
  modaNalContent: {
    padding: 20,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
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
    height: 150,
    textAlignVertical: 'top',
  },
  csvHint: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#3d3d5c',
    marginBottom: 16,
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
});
