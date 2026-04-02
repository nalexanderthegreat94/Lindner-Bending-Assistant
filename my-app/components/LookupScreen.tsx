import React, { useState, useMemo } from 'react';
import { Image } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBendData } from '@/src/context/BendDataContext';
import { findCorrection } from '@/src/utils/interpolation';
import { CorrectionResult } from '@/src/types';
import DropdownPicker from '@/components/ui/DropdownPicker';
import CorrectionChart from '@/components/ui/CorrectionChart';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;

  const availableFlanges = useMemo(() => {
    const mat = db[material];
    if (!mat) return [];
    return Object.keys(mat.flanges).map(Number).sort((a, b) => a - b);
  }, [db, material]);

  const [flangeInput, setFlangeInput] = useState('10');
  const flangeLength = parseFloat(flangeInput) || 0;
  const [bendLengthInput, setBendLengthInput] = useState('');
  const [activeInput, setActiveInput] = useState<'bendLength' | 'flangeHeight'>('bendLength');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showChart, setShowChart] = useState(false);
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

  // For the chart, show the nearest tested flange when the entered value is between or above tested values
  const chartFlange = useMemo(() => {
    if (availableFlanges.length === 0) return 0;
    if (availableFlanges.includes(flangeLength)) return flangeLength;
    return availableFlanges.reduce((prev, curr) =>
      Math.abs(curr - flangeLength) < Math.abs(prev - flangeLength) ? curr : prev,
      availableFlanges[0]
    );
  }, [availableFlanges, flangeLength]);

  const chartData = useMemo(() => {
    const mat = db[material];
    if (!mat || !mat.flanges[chartFlange]) return [];
    return mat.flanges[chartFlange]
      .filter(d => d.correction !== null)
      .map(d => ({ bendLength: d.bendLength, correction: d.correction, crown: d.crown }));
  }, [db, material, chartFlange]);

  const handleNumpadPress = (value: string) => {
    if (value === 'GO') {
      calculateResult();
      return;
    }
    if (activeInput === 'flangeHeight') {
      if (value === 'C') {
        setFlangeInput('');
      } else if (value === '⌫') {
        setFlangeInput(prev => prev.slice(0, -1));
      } else {
        setFlangeInput(prev => prev + value);
      }
    } else {
      if (value === 'C') {
        setBendLengthInput('');
        setResult(null);
      } else if (value === '⌫') {
        setBendLengthInput(prev => prev.slice(0, -1));
      } else {
        setBendLengthInput(prev => prev + value);
      }
    }
  };

  const MACHINE_MAX_BEND = 4040;

  const calculateResult = () => {
    const bendLen = parseFloat(bendLengthInput);
    if (isNaN(bendLen) || bendLen <= 0) {
      setResult({ error: 'Enter a valid bend length' });
      return;
    }
    if (bendLen > MACHINE_MAX_BEND) {
      setResult({
        error: 'EXCEEDS MACHINE LIMIT',
        notPossible: true,
        maxBendLength: MACHINE_MAX_BEND,
      });
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
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setBendLengthInput(entry.bendLength.toString());
    setFlangeInput(entry.flange.toString());
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

  // ─── Render sections ──────────────────────────────────────────────────────

  const controlsSection = (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schroeder Bend Assistant</Text>
        <Image
          source={require('../assets/images/android-ui-icon.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      {/* Material */}
      <View style={styles.materialRow}>
        <Text style={styles.selectionLabel}>Material</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>{db[material]?.name}</Text>
        </TouchableOpacity>
      </View>

      {/* Dual Input: Bend Length + Flange Height */}
      <View style={styles.dualInputRow}>
        <TouchableOpacity
          style={[styles.inputDisplay, styles.inputDisplayHalf, activeInput === 'bendLength' && styles.inputDisplayActive]}
          onPress={() => setActiveInput('bendLength')}
          activeOpacity={1}
        >
          <Text style={styles.inputLabel}>Bend Length (mm)</Text>
          <Text style={styles.inputValue}>{bendLengthInput || '0'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.inputDisplay, styles.inputDisplayHalf, activeInput === 'flangeHeight' && styles.inputDisplayActive]}
          onPress={() => setActiveInput('flangeHeight')}
          activeOpacity={1}
        >
          <Text style={styles.inputLabel}>Flange Height (mm)</Text>
          <Text style={styles.inputValue}>{flangeInput || '0'}</Text>
        </TouchableOpacity>
      </View>

      {/* Numpad */}
      <View style={styles.numpadContainer}>
        {[['7','8','9'],['4','5','6'],['1','2','3'],['C','0','⌫']].map((row, rowIdx) => (
          <View key={rowIdx} style={styles.numpadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleNumpadPress(key)}
                style={[
                  styles.numpadButton,
                  isLandscape && styles.numpadButtonLandscape,
                  key === 'C' && styles.numpadButtonClear,
                  key === '⌫' && styles.numpadButtonDelete,
                ]}
              >
                <Text style={styles.numpadButtonText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity
          onPress={() => handleNumpadPress('GO')}
          style={[styles.numpadButtonCalculate, isLandscape && styles.numpadButtonLandscape]}
        >
          <Text style={styles.numpadButtonCalculateText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {result && (
        <View style={[
          styles.resultContainer,
          result.flangeNoData ? styles.resultNoData
            : result.error ? styles.resultError
            : styles.resultSuccess,
        ]}>
          {result.error ? (
            <View>
              {result.flangeNoData ? (
                <>
                  <View style={styles.resultErrorHeader}>
                    <Text style={styles.resultNoDataIcon}>?</Text>
                    <Text style={styles.resultNoDataTitle}>{result.error}</Text>
                  </View>
                  <Text style={styles.resultNoDataReason}>{result.reason}</Text>
                </>
              ) : result.notPossible ? (
                <>
                  <View style={styles.resultErrorHeader}>
                    <Text style={styles.resultErrorIcon}>⊘</Text>
                    <Text style={styles.resultErrorTitle}>{result.error}</Text>
                  </View>
                  {result.reason && (
                    <Text style={styles.resultErrorReason}>{result.reason}</Text>
                  )}
                  {result.maxBendLength && (
                    <View style={styles.resultHint}>
                      <Text style={styles.resultHintText}>
                        Max bend length for {flangeLength}mm flange:{' '}
                        <Text style={styles.bold}>{result.maxBendLength}mm</Text>
                      </Text>
                    </View>
                  )}
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
                    ⚠ {result.extrapolatedAbove
                      ? `Above maximum tested range (${result.maxTested}mm)`
                      : `Below minimum tested range (${result.minTested}mm)`}. Use with caution.
                  </Text>
                </View>
              )}
              {result.isFlangeInterpolated && result.flangeInterpolatedBetween && (
                <View style={styles.resultFlangeInfo}>
                  <Text style={styles.resultFlangeInfoText}>
                    ↕ Flange interpolated between {result.flangeInterpolatedBetween[0]}mm and {result.flangeInterpolatedBetween[1]}mm tested data
                  </Text>
                </View>
              )}
              {result.isFlangeCapped && result.flangeUsed !== undefined && (
                <View style={styles.resultFlangeInfo}>
                  <Text style={styles.resultFlangeInfoText}>
                    ↑ Flange above max tested ({result.flangeUsed}mm) — using {result.flangeUsed}mm data
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
    </>
  );

  const dataSection = (
    <>
      {/* Correction Curve */}
      <TouchableOpacity
        onPress={() => setShowChart(!showChart)}
        style={styles.chartToggle}
      >
        <Text style={styles.chartToggleText}>
          {showChart ? '▼' : '▶'} Correction Curve
          {chartFlange !== flangeLength && chartFlange > 0 ? ` (${chartFlange}mm flange)` : ''}
        </Text>
      </TouchableOpacity>
      {showChart && chartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartHint}>Touch or drag to inspect data points</Text>
          <CorrectionChart
            data={chartData}
            activeBendLength={result && !result.error ? parseFloat(bendLengthInput) : null}
          />
        </View>
      )}

      {/* Correction History */}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Correction History</Text>
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

      {/* Add Correction */}
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
    </>
  );

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {isLandscape ? (
        <View style={styles.landscapeContainer}>
          <ScrollView
            style={styles.landscapeLeft}
            contentContainerStyle={styles.scrollContent}
          >
            {controlsSection}
          </ScrollView>
          <View style={styles.landscapeDivider} />
          <ScrollView
            style={styles.landscapeRight}
            contentContainerStyle={styles.scrollContent}
          >
            {dataSection}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {controlsSection}
          {dataSection}
        </ScrollView>
      )}

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
              <TouchableOpacity style={styles.submitButton} onPress={handleAddNewCorrection}>
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
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeft: {
    flex: 5,
  },
  landscapeDivider: {
    width: 1,
    backgroundColor: '#2d2d4d',
  },
  landscapeRight: {
    flex: 6,
  },
  header: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
    flex: 1,
  },
  headerIcon: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
  },
  materialRow: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  inputDisplayHalf: {
    flex: 1,
    marginBottom: 0,
  },
  inputDisplayActive: {
    borderColor: '#f59e0b',
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
  numpadContainer: {
    gap: 6,
    marginBottom: 12,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numpadButton: {
    flex: 1,
    height: 64,
    backgroundColor: '#252542',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonLandscape: {
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonClear: {
    backgroundColor: '#dc2626',
  },
  numpadButtonDelete: {
    backgroundColor: '#6366f1',
  },
  numpadButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  numpadButtonCalculate: {
    height: 64,
    backgroundColor: '#4ade80',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonCalculateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
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
  resultNoData: {
    backgroundColor: '#1e1e2e',
    borderWidth: 2,
    borderColor: '#4a4a6a',
  },
  resultNoDataIcon: {
    fontSize: 32,
    color: '#a5b4fc',
    fontWeight: '800',
  },
  resultNoDataTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#a5b4fc',
  },
  resultNoDataReason: {
    color: '#c7d2fe',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
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
  resultFlangeInfo: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#1a1a3d',
    borderWidth: 1,
    borderColor: '#3d3d7c',
    borderRadius: 8,
  },
  resultFlangeInfoText: {
    fontSize: 12,
    color: '#a5b4fc',
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
    padding: 12,
    marginBottom: 16,
  },
  chartHint: {
    fontSize: 11,
    color: '#444466',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
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
