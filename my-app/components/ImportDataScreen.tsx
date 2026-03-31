import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { bendDatabase } from '@/src/database';
import { parseCSV } from '@/src/utils/csvParser';

interface ImportFormState {
  csvContent: string;
  material: string;
  thickness: string;
  thicknessUnit: 'mm' | 'gauge';
  flange: string;
}

export default function ImportDataScreen() {
  const [formState, setFormState] = useState<ImportFormState>({
    csvContent: '',
    material: 'Aluminum',
    thickness: '2',
    thicknessUnit: 'mm',
    flange: '20',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleImport = async () => {
    // Validate inputs
    if (!formState.csvContent.trim()) {
      Alert.alert('Error', 'Please provide CSV data');
      return;
    }

    if (!formState.material.trim()) {
      Alert.alert('Error', 'Please enter a material name');
      return;
    }

    if (!formState.thickness.trim()) {
      Alert.alert('Error', 'Please enter thickness');
      return;
    }

    if (!formState.flange.trim()) {
      Alert.alert('Error', 'Please enter flange length');
      return;
    }

    const thickness = parseFloat(formState.thickness);
    const flange = parseFloat(formState.flange);

    if (isNaN(thickness) || thickness <= 0) {
      Alert.alert('Error', 'Thickness must be a positive number');
      return;
    }

    if (isNaN(flange) || flange <= 0) {
      Alert.alert('Error', 'Flange must be a positive number');
      return;
    }

    setLoading(true);

    try {
      // Parse CSV
      const dataset = parseCSV(formState.csvContent, {
        material: formState.material,
        thickness,
        thicknessUnit: formState.thicknessUnit,
        flange,
      });

      // Validate we got data
      if (dataset.data.length === 0) {
        Alert.alert(
          'Error',
          'No valid data points found. Make sure CSV format is correct (columns: bendLength, bendCorrection, crown)'
        );
        setLoading(false);
        return;
      }

      // Save to database
      await bendDatabase.saveDataset(dataset);

      setSuccessMessage(
        `✓ Imported ${dataset.data.length} data points for ${dataset.label}`
      );

      // Reset form
      setFormState({
        csvContent: '',
        material: 'Aluminum',
        thickness: '2',
        thicknessUnit: 'mm',
        flange: '20',
      });

      Alert.alert('Success', `Dataset imported and saved!\n\n${dataset.label}\nData points: ${dataset.data.length}`);
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Import Bend Data</Text>

      <Text style={styles.instructionTitle}>Instructions</Text>
      <Text style={styles.instruction}>
        1. Format your test data as CSV with columns: bendLength, bendCorrection, crown{`\n`}
        2. Fill in the material details{`\n`}
        3. Paste the CSV data below{`\n`}
        4. Tap {`"Import Data"`}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Material Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Aluminum, Steel, Stainless Steel"
          value={formState.material}
          onChangeText={text => setFormState({ ...formState, material: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Thickness</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2"
            value={formState.thickness}
            keyboardType="decimal-pad"
            onChangeText={text => setFormState({ ...formState, thickness: text })}
          />
        </View>

        <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                formState.thicknessUnit === 'mm' && styles.unitButtonActive,
              ]}
              onPress={() => setFormState({ ...formState, thicknessUnit: 'mm' })}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  formState.thicknessUnit === 'mm' && styles.unitButtonTextActive,
                ]}
              >
                mm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                formState.thicknessUnit === 'gauge' && styles.unitButtonActive,
              ]}
              onPress={() => setFormState({ ...formState, thicknessUnit: 'gauge' })}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  formState.thicknessUnit === 'gauge' && styles.unitButtonTextActive,
                ]}
              >
                gauge
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Flange Length (mm)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 20"
          value={formState.flange}
          keyboardType="decimal-pad"
          onChangeText={text => setFormState({ ...formState, flange: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>CSV Data</Text>
        <Text style={styles.csvFormatHint}>
          Format (3 columns, comma-separated):{`\n`}
          bendLength,bendCorrection,crown{`\n`}
          100,5.9,0{`\n`}
          150,5.1,0{`\n`}
          ...
        </Text>
        <TextInput
          style={[styles.input, styles.csvInput]}
          placeholder="Paste your CSV data here (one data row per line)"
          value={formState.csvContent}
          onChangeText={text => setFormState({ ...formState, csvContent: text })}
          multiline
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleImport}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.buttonText}>Importing...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Import Data</Text>
        )}
      </TouchableOpacity>

      {successMessage && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <View style={styles.exampleBox}>
        <Text style={styles.exampleTitle}>Example CSV Format</Text>
        <Text style={styles.exampleText}>
          {`100,5.9,0
150,5.1,0
180,5.1,0
200,5.3,0
240,5.55,0
275,6,0
300,6.3,0`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  csvInput: {
    height: 150,
    textAlignVertical: 'top',
    fontFamily: 'Courier New',
    fontSize: 12,
  },
  csvFormatHint: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'Courier New',
    marginBottom: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  unitButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  unitButtonTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  successBox: {
    backgroundColor: '#D4EDDA',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  successText: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '500',
  },
  exampleBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 11,
    color: '#555',
    fontFamily: 'Courier New',
    lineHeight: 18,
  },
});
