import AsyncStorage from '@react-native-async-storage/async-storage';
import { BendDataset } from '../types';

const STORAGE_KEY = '@bending_assistant/datasets';

/**
 * Database manager for bend correction data
 */
class BendDatabase {
  /**
   * Save a dataset
   */
  async saveDataset(dataset: BendDataset): Promise<void> {
    try {
      const existing = await this.getAllDatasets();
      const index = existing.findIndex(d => d.id === dataset.id);

      if (index >= 0) {
        existing[index] = dataset;
      } else {
        existing.push(dataset);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving dataset:', error);
      throw error;
    }
  }

  /**
   * Get a specific dataset by ID
   */
  async getDataset(id: string): Promise<BendDataset | null> {
    try {
      const datasets = await this.getAllDatasets();
      return datasets.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error getting dataset:', error);
      return null;
    }
  }

  /**
   * Get all datasets
   */
  async getAllDatasets(): Promise<BendDataset[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all datasets:', error);
      return [];
    }
  }

  /**
   * Get datasets by material
   */
  async getDatasetsByMaterial(material: string): Promise<BendDataset[]> {
    try {
      const datasets = await this.getAllDatasets();
      return datasets.filter(d => d.material === material);
    } catch (error) {
      console.error('Error getting datasets by material:', error);
      return [];
    }
  }

  /**
   * Get available materials
   */
  async getMaterials(): Promise<string[]> {
    try {
      const datasets = await this.getAllDatasets();
      const materials = new Set(datasets.map(d => d.material));
      return Array.from(materials).sort();
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  /**
   * Delete a dataset
   */
  async deleteDataset(id: string): Promise<void> {
    try {
      const existing = await this.getAllDatasets();
      const filtered = existing.filter(d => d.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  }

  /**
   * Clear all datasets
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Get dataset statistics
   */
  async getStats(): Promise<{
    totalDatasets: number;
    materials: string[];
    dataPoints: number;
  }> {
    try {
      const datasets = await this.getAllDatasets();
      const dataPoints = datasets.reduce((sum, d) => sum + d.data.length, 0);

      return {
        totalDatasets: datasets.length,
        materials: Array.from(new Set(datasets.map(d => d.material))).sort(),
        dataPoints,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDatasets: 0,
        materials: [],
        dataPoints: 0,
      };
    }
  }
}

export const bendDatabase = new BendDatabase();
