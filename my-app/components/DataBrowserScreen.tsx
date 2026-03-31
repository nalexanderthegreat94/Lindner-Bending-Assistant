import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { bendDatabase } from '@/src/database';
import { BendDataset, BendDataPoint } from '@/src/types';

export default function DataBrowserScreen() {
  const [datasets, setDatasets] = useState<BendDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const allDatasets = await bendDatabase.getAllDatasets();
      setDatasets(allDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (datasets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No bend correction datasets available</Text>
      </View>
    );
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  // Prepare data for SectionList
  const sections = selectedDataset.data.map((point: BendDataPoint, index: number) => ({
    title: `Bend Length: ${point.bendLength.toFixed(0)} mm`,
    data: [point],
    key: `point-${index}`,
  }));

  return (
    <View style={styles.container}>
      {/* Dataset Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datasetSelectorContainer}
        contentContainerStyle={styles.datasetSelectorContent}
      >
        {datasets.map(dataset => (
          <TouchableOpacity
            key={dataset.id}
            style={[
              styles.datasetTab,
              selectedDataset.id === dataset.id && styles.datasetTabActive,
            ]}
            onPress={() => setSelectedDatasetId(dataset.id)}
          >
            <Text
              style={[
                styles.datasetTabText,
                selectedDataset.id === dataset.id && styles.datasetTabTextActive,
              ]}
            >
              {dataset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dataset Info */}
      <View style={styles.infoBar}>
        <Text style={styles.infoBarText}>
          Data Points: {selectedDataset.data.length}
        </Text>
        <Text style={styles.infoBarText}>
          Range: {selectedDataset.data[0]?.bendLength}mm - {selectedDataset.data[selectedDataset.data.length - 1]?.bendLength}mm
        </Text>
      </View>

      {/* Data Table */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <DataPointRow point={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

function DataPointRow({ point }: { point: BendDataPoint }) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.dataCell}>
        <Text style={styles.dataCellLabel}>Bend Correction</Text>
        <Text style={styles.dataCellValue}>{point.bendCorrection.toFixed(3)}°</Text>
      </View>
      <View style={styles.dataCell}>
        <Text style={styles.dataCellLabel}>Crown</Text>
        <Text style={styles.dataCellValue}>{point.crown.toFixed(4)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  datasetSelectorContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#FFF',
  },
  datasetSelectorContent: {
    paddingHorizontal: 8,
  },
  datasetTab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  datasetTabActive: {
    borderBottomColor: '#007AFF',
  },
  datasetTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  datasetTabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  infoBar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoBarText: {
    fontSize: 12,
    color: '#555',
    marginVertical: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#333',
    marginTop: 1,
  },
  dataRow: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dataCell: {
    flex: 1,
  },
  dataCellLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  dataCellValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
  },
});
