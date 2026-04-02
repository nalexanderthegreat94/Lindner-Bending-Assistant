import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBendData } from '@/src/context/BendDataContext';
import DropdownPicker from '@/components/ui/DropdownPicker';

const ADMIN_PASSWORD = 'admin';

export default function DataBrowserScreen() {
  const { db, deleteDataPoint } = useBendData();

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

  const handleDelete = (bendLength: number) => {
    Alert.alert(
      'Delete Data Point',
      `Remove ${bendLength}mm from the ${selectedFlange}mm flange?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDataPoint(selectedMaterialKey, selectedFlange, bendLength),
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BROWSE DATA</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {material?.name ?? ''}
          </Text>
        </View>
        {isAdmin ? (
          <TouchableOpacity style={styles.adminBadge} onPress={() => setIsAdmin(false)}>
            <Text style={styles.adminBadgeText}>✓ ADMIN</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.adminButton} onPress={openLogin}>
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
        <Text style={[styles.tableHeaderCell, styles.colNote]}>Note</Text>
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
              <Text style={[styles.tableCell, styles.colNote, styles.cellNote]}>
                {point.note || ''}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(point.bendLength)}
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
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },

  // Header
  header: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 12,
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
    paddingHorizontal: 16,
    marginBottom: 12,
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
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#f59e0b',
  },
  statDivider: {
    width: 1,
    height: 32,
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
  colNote:       { flex: 2 },
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
  cellNote: {
    color: '#f59e0b',
    fontSize: 12,
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
});
