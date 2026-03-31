import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { bendDatabase } from '@/src/database';
import { predictBendCorrection } from '@/src/utils/interpolation';
import { BendDataset, PredictionResult } from '@/src/types';

export default function LookupScreen() {
  const [datasets, setDatasets] = useState<BendDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<BendDataset | null>(null);
  const [bendLength, setBendLength] = useState<string>('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<string[]>([]);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const allDatasets = await bendDatabase.getAllDatasets();
      setDatasets(allDatasets);

      const mats = await bendDatabase.getMaterials();
      setMaterials(mats);

      // Auto-select first dataset if available
      if (allDatasets.length > 0) {
        setSelectedDataset(allDatasets[0]);
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
      Alert.alert('Error', 'Failed to load bend correction data');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = () => {
    if (!selectedDataset || !bendLength) {
      Alert.alert('Input Required', 'Please select a material and enter a bend length');
      return;
    }

    try {
      const length = parseFloat(bendLength);
      if (isNaN(length) || length < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid bend length');
        return;
      }

      const result = predictBendCorrection(length, selectedDataset.data);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting:', error);
      Alert.alert('Error', 'Failed to predict bend correction');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading bend data...</Text>
      </View>
    );
  }

  if (datasets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No bend data available</Text>
        <Text style={styles.errorSubtext}>Please import bend correction data first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Bend Correction Lookup</Text>

      {/* Material Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Material & Thickness</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datasetList}>
          {datasets.map(dataset => (
            <TouchableOpacity
              key={dataset.id}
              style={[
                styles.datasetButton,
                selectedDataset?.id === dataset.id && styles.datasetButtonSelected,
              ]}
              onPress={() => {
                setSelectedDataset(dataset);
                setPrediction(null);
                setBendLength('');
              }}
            >
              <Text
                style={[
                  styles.datasetButtonText,
                  selectedDataset?.id === dataset.id && styles.datasetButtonTextSelected,
                ]}
              >
                {dataset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Dataset Info */}
      {selectedDataset && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Current Dataset</Text>
          <Text style={styles.infoText}>{selectedDataset.label}</Text>
          <Text style={styles.infoSubtext}>
            Data points: {selectedDataset.data.length}
          </Text>
          <Text style={styles.infoSubtext}>
            Range: {selectedDataset.data[0]?.bendLength}mm - {selectedDataset.data[selectedDataset.data.length - 1]?.bendLength}mm
          </Text>
        </View>
      )}

      {/* Bend Length Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Bend Length (mm)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 500"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          value={bendLength}
          onChangeText={setBendLength}
        />
        <TouchableOpacity style={styles.button} onPress={handleLookup}>
          <Text style={styles.buttonText}>Look Up Correction</Text>
        </TouchableOpacity>
      </View>

      {/* Prediction Results */}
      {prediction && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>Prediction Results</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Bend Length:</Text>
            <Text style={styles.resultValue}>{prediction.bendLength.toFixed(1)} mm</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Bend Correction:</Text>
            <Text style={styles.resultValue}>{prediction.estimatedBendCorrection.toFixed(3)}°</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Crown Correction:</Text>
            <Text style={styles.resultValue}>{prediction.estimatedCrown.toFixed(4)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color: prediction.confidence === 'exact' ? '#34C759' : '#FF9500',
                },
              ]}
            >
              {prediction.confidence === 'exact' ? 'Exact Match' : 'Interpolated'}
            </Text>
          </View>

          {prediction.confidence === 'interpolated' && prediction.nearestDataPoints && (
            <View style={styles.nearbyBox}>
              <Text style={styles.nearbyTitle}>Nearby Data Points</Text>
              {prediction.nearestDataPoints.below && (
                <Text style={styles.nearbyText}>
                  Below: {prediction.nearestDataPoints.below.bendLength}mm →{' '}
                  {prediction.nearestDataPoints.below.bendCorrection.toFixed(2)}°
                </Text>
              )}
              {prediction.nearestDataPoints.above && (
                <Text style={styles.nearbyText}>
                  Above: {prediction.nearestDataPoints.above.bendLength}mm →{' '}
                  {prediction.nearestDataPoints.above.bendCorrection.toFixed(2)}°
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  datasetList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  datasetButton: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  datasetButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  datasetButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  datasetButtonTextSelected: {
    color: '#FFF',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 12,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  resultsBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  nearbyBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 6,
  },
  nearbyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  nearbyText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
