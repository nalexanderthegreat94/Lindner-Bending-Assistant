import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useBendData } from '@/src/context/BendDataContext';
import { BendDataPoint } from '@/src/types';
import DropdownPicker from '@/components/ui/DropdownPicker';

const MATERIAL_KEY = '2mm_aluminum';

export default function DataBrowserScreen() {
  const { db } = useBendData();
  const material = db[MATERIAL_KEY];

  const availableFlanges = useMemo(
    () => Object.keys(material.flanges).map(Number).sort((a, b) => a - b),
    [material]
  );

  const [selectedFlange, setSelectedFlange] = useState(() => {
    // Default to the flange with the most data points
    const flanges = Object.keys(material.flanges).map(Number).sort((a, b) => a - b);
    return flanges.includes(10) ? 10 : flanges[0];
  });

  const flangeData: BendDataPoint[] = material.flanges[selectedFlange] || [];
  const validData = flangeData.filter(d => d.correction !== null);

  const stats = useMemo(() => {
    if (validData.length === 0) return null;
    const lengths = validData.map(d => d.bendLength);
    return {
      count: validData.length,
      min: Math.min(...lengths),
      max: Math.max(...lengths),
    };
  }, [validData]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BROWSE DATA</Text>
          <Text style={styles.headerSubtitle}>{material.name}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>≡</Text>
        </View>
      </View>

      {/* Flange selector */}
      <View style={styles.flangeSection}>
        <Text style={styles.sectionLabel}>Flange Height</Text>
        <DropdownPicker
          options={availableFlanges.map(f => ({ label: `${f}mm`, value: f.toString() }))}
          selectedValue={selectedFlange.toString()}
          onSelect={(val) => setSelectedFlange(Number(val))}
        />
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
      </View>

      {/* Table rows */}
      <ScrollView style={styles.tableBody} contentContainerStyle={styles.tableBodyContent}>
        {flangeData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No data for {selectedFlange}mm flange</Text>
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
              <Text
                style={[
                  styles.tableCell,
                  styles.colCorrection,
                  point.correction !== null ? styles.cellCorrection : styles.cellNull,
                ]}
              >
                {point.correction !== null ? `${point.correction}°` : '—'}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colCrown,
                  point.crown !== null ? styles.cellCrown : styles.cellNull,
                ]}
              >
                {point.crown !== null ? point.crown : '—'}
              </Text>
              <Text style={[styles.tableCell, styles.colNote, styles.cellNote]}>
                {point.note || ''}
              </Text>
            </View>
          ))
        )}
        <View style={styles.tableFooter} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
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
    fontWeight: '700',
  },
  flangeSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3d3d5c',
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
  colBendLength: {
    flex: 2,
  },
  colCorrection: {
    flex: 2,
  },
  colCrown: {
    flex: 1.5,
  },
  colNote: {
    flex: 2,
  },
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
});
