import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useBendData } from '@/src/context/BendDataContext';
import DropdownPicker from '@/components/ui/DropdownPicker';

function formatEnteredAt(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h = hours % 12 || 12;
  return `${month}/${day}/${year}\n${h}:${minutes}${ampm}`;
}

const ADMIN_PASSWORD = 'LUSA26';

export default function DataBrowserScreen() {
  const { db, editDataPoint, deleteDataPoint } = useBendData();
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = useMemo(() => makeStyles(isTablet), [isTablet]);

  // ── Material selection ────────────────────────────────────────────────────
  const materialOptions = useMemo(
    () => Object.keys(db).map(key => ({ label: db[key].name, value: key })),
    [db]
  );

  const [selectedMaterialKey, setSelectedMaterialKey] = useState(
    () => Object.keys(db)[0] ?? ''
  );
  const material = db[selectedMaterialKey];

  const availableFlanges = useMemo(() => {
    if (!material) return [];
    return Object.keys(material.flanges).map(Number).sort((a, b) => a - b);
  }, [material]);

  const [selectedFlange, setSelectedFlange] = useState(() => {
    const flanges = Object.keys(db[Object.keys(db)[0] ?? '']?.flanges ?? {})
      .map(Number)
      .sort((a, b) => a - b);
    return flanges.includes(10) ? 10 : (flanges[0] ?? 0);
  });

  const handleMaterialChange = (key: string) => {
    setSelectedMaterialKey(key);
    const flanges = Object.keys(db[key]?.flanges ?? {})
      .map(Number)
      .sort((a, b) => a - b);
    setSelectedFlange(flanges.includes(10) ? 10 : (flanges[0] ?? 0));
  };

  const flangeData = material?.flanges[selectedFlange] ?? [];
  const validData = flangeData.filter(d => d.correction !== null);

  const stats = useMemo(() => {
    if (validData.length === 0) return null;
    const lengths = validData.map(d => d.bendLength);
    return { count: validData.length, min: Math.min(...lengths), max: Math.max(...lengths) };
  }, [validData]);

  // ── Admin ─────────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAdmin) {
      adminTimerRef.current = setTimeout(() => setIsAdmin(false), 15 * 60 * 1000);
    } else {
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    }
    return () => { if (adminTimerRef.current) clearTimeout(adminTimerRef.current); };
  }, [isAdmin]);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<{
    bendLength: number;
    enteredAt: number;
    correction: string;
    crown: string;
  } | null>(null);

  const handleEditOpen = (bendLength: number, enteredAt: number | undefined, correction: number | null, crown: number | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditModal({
      bendLength,
      enteredAt: enteredAt ?? 0,
      correction: correction !== null ? String(correction) : '',
      crown: crown !== null ? String(crown) : '',
    });
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    const correction = parseFloat(editModal.correction);
    const crown = parseFloat(editModal.crown);
    if (isNaN(correction)) {
      Alert.alert('Invalid', 'Please enter a valid correction value.');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await editDataPoint(selectedMaterialKey, selectedFlange, editModal.bendLength, editModal.enteredAt, correction, isNaN(crown) ? 0 : crown);
      setEditModal(null);
    } catch (e: any) {
      if (e.message === 'EXACT_DUPLICATE') {
        Alert.alert('No Change', 'Another reading with these exact values already exists.');
      } else {
        Alert.alert('Error', 'Failed to save. Please try again.');
      }
    }
  };

  const openLogin = () => {
    setPasswordInput('');
    setPasswordError(false);
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleDelete = (bendLength: number, enteredAt: number | undefined) => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    Alert.alert(
      'Delete Data Point',
      `Remove this ${bendLength}mm reading from the ${selectedFlange}mm flange?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDataPoint(selectedMaterialKey, selectedFlange, bendLength, enteredAt ?? 0),
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BROWSE DATA</Text>
        </View>
        {isAdmin ? (
          <TouchableOpacity style={styles.adminBadge} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsAdmin(false); }}>
            <Text style={styles.adminBadgeText}>✓ ADMIN</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.adminButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openLogin(); }}>
            <Text style={styles.adminButtonText}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Material + Flange selectors */}
      <View style={styles.selectorRow}>
        <View style={styles.selectorItem}>
          <Text style={styles.sectionLabel}>Material</Text>
          <DropdownPicker
            options={materialOptions}
            selectedValue={selectedMaterialKey}
            onSelect={handleMaterialChange}
          />
        </View>
        <View style={styles.selectorItem}>
          <Text style={styles.sectionLabel}>Flange Height</Text>
          <DropdownPicker
            options={availableFlanges.map(f => ({ label: `${f}mm`, value: f.toString() }))}
            selectedValue={selectedFlange.toString()}
            onSelect={(val) => setSelectedFlange(Number(val))}
          />
        </View>
      </View>

      {/* Stats bar */}
      {stats ? (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DATA POINTS</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>MIN LENGTH</Text>
            <Text style={styles.statValue}>{stats.min}mm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>MAX LENGTH</Text>
            <Text style={styles.statValue}>{stats.max}mm</Text>
          </View>
        </View>
      ) : (
        <View style={styles.statsBar}>
          <Text style={styles.noDataText}>No data for {selectedFlange}mm flange</Text>
        </View>
      )}

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.colBendLength]}>Bend (mm)</Text>
        <Text style={[styles.tableHeaderCell, styles.colCorrection]}>Correction</Text>
        <Text style={[styles.tableHeaderCell, styles.colCrown]}>Crown</Text>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>Date Added</Text>
        {isAdmin && <View style={styles.colEdit} />}
        {isAdmin && <View style={styles.colDelete} />}
      </View>

      {/* Table rows */}
      <ScrollView style={styles.tableBody} contentContainerStyle={styles.tableBodyContent}>
        {flangeData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No data for {selectedFlange}mm flange height</Text>
          </View>
        ) : (
          flangeData.map((point, idx) => (
            <View
              key={`${point.bendLength}-${idx}`}
              style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}
            >
              <Text style={[styles.tableCell, styles.colBendLength, styles.cellBendLength]}>
                {point.bendLength}
              </Text>
              <Text style={[
                styles.tableCell,
                styles.colCorrection,
                point.correction !== null ? styles.cellCorrection : styles.cellNull,
              ]}>
                {point.correction !== null ? `${point.correction}°` : '—'}
              </Text>
              <Text style={[
                styles.tableCell,
                styles.colCrown,
                point.crown !== null ? styles.cellCrown : styles.cellNull,
              ]}>
                {point.crown !== null ? point.crown : '—'}
              </Text>
              <Text style={[styles.tableCell, styles.colDate, styles.cellDate]}>
                {formatEnteredAt(point.enteredAt)}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditOpen(point.bendLength, point.enteredAt, point.correction, point.crown)}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(point.bendLength, point.enteredAt)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={styles.tableFooter} />
      </ScrollView>

      {/* Admin login modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLoginModal(false)}
        >
          <View style={styles.loginBox}>
            <Text style={styles.loginTitle}>Admin Login</Text>
            <TextInput
              style={[styles.loginInput, passwordError && styles.loginInputError]}
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry
              value={passwordInput}
              onChangeText={(t) => { setPasswordInput(t); setPasswordError(false); }}
              onSubmitEditing={handleLogin}
              autoCapitalize="none"
              autoFocus
            />
            {passwordError && <Text style={styles.loginError}>Incorrect password</Text>}
            <TouchableOpacity style={styles.loginButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleLogin(); }}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Edit modal */}
      <Modal visible={!!editModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setEditModal(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.loginBox}>
              <Text style={styles.loginTitle}>Edit Data Point</Text>
              {editModal && (
                <Text style={[styles.loginTitle, { fontSize: 14, marginTop: -12, marginBottom: 16, color: '#888' }]}>
                  {editModal.bendLength}mm
                </Text>
              )}
              <Text style={styles.editFieldLabel}>Correction (°)</Text>
              <TextInput
                style={styles.loginInput}
                placeholder="e.g. 7.5"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                value={editModal?.correction ?? ''}
                onChangeText={(t) => setEditModal(prev => prev ? { ...prev, correction: t } : null)}
              />
              <Text style={[styles.editFieldLabel, { marginTop: 12 }]}>Crown</Text>
              <TextInput
                style={styles.loginInput}
                placeholder="e.g. 0.15"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                value={editModal?.crown ?? ''}
                onChangeText={(t) => setEditModal(prev => prev ? { ...prev, crown: t } : null)}
              />
              <TouchableOpacity style={styles.loginButton} onPress={handleEditSave}>
                <Text style={styles.loginButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(t: boolean) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },

  // Header
  header: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: t ? 16 : 10,
    margin: t ? 16 : 12,
    marginBottom: t ? 12 : 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerTitle: {
    fontSize: t ? 24 : 16,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: t ? 12 : 11,
    color: '#1a1a2e',
    opacity: 0.8,
    marginTop: 2,
    maxWidth: 220,
  },
  adminButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  adminButtonText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
  },
  adminBadge: {
    backgroundColor: '#166534',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  adminBadgeText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '700',
  },

  // Selectors
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: t ? 16 : 12,
    marginBottom: t ? 12 : 8,
  },
  selectorItem: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#252542',
    marginHorizontal: t ? 16 : 12,
    borderRadius: 10,
    padding: t ? 12 : 8,
    marginBottom: t ? 12 : 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: t ? 18 : 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  statDivider: {
    width: 1,
    height: t ? 32 : 24,
    backgroundColor: '#3d3d5c',
  },
  noDataText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3d3d5c',
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
  },
  tableBodyContent: {
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e35',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#111125',
  },
  tableCell: {
    fontSize: 14,
    color: '#e8e8e8',
  },
  colBendLength: { flex: 2 },
  colCorrection: { flex: 2 },
  colCrown:      { flex: 1.5 },
  colDate:       { flex: 2.5 },
  colEdit:       { width: 36 },
  colDelete:     { width: 36 },
  cellBendLength: {
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace',
  },
  cellCorrection: {
    color: '#4ade80',
    fontWeight: '700',
  },
  cellCrown: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  cellNull: {
    color: '#ef4444',
    fontWeight: '700',
  },
  cellDate: {
    color: '#555577',
    fontSize: 11,
    lineHeight: 16,
  },
  editButton: {
    width: 28,
    height: 28,
    backgroundColor: '#1a2e3d',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  editButtonText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  editFieldLabel: {
    color: '#888',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    width: 28,
    height: 28,
    backgroundColor: '#3d1515',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#555',
    fontSize: 14,
  },
  tableFooter: {
    height: 20,
  },

  // Login modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginInput: {
    backgroundColor: '#0d0d1a',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  loginInputError: {
    borderColor: '#ef4444',
  },
  loginError: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: '700',
  },
  })
}
