import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialsDatabase, BendDataPoint } from '../types';
import { MATERIALS_DB } from '../database/sampleData';

const USER_DATA_KEY = '@bending_assistant/user_data';

/**
 * Deep-merges user additions on top of the base MATERIALS_DB.
 * User data takes precedence: if a bend length already exists, it is overwritten.
 * All flange arrays remain sorted by bendLength after merge.
 */
function mergeDB(base: MaterialsDatabase, additions: MaterialsDatabase): MaterialsDatabase {
  const result: MaterialsDatabase = JSON.parse(JSON.stringify(base));

  for (const matKey of Object.keys(additions)) {
    if (!result[matKey]) {
      result[matKey] = JSON.parse(JSON.stringify(additions[matKey]));
      continue;
    }

    for (const flangeStr of Object.keys(additions[matKey].flanges)) {
      const flange = Number(flangeStr);
      const addPoints = additions[matKey].flanges[flange];

      if (!result[matKey].flanges[flange]) {
        result[matKey].flanges[flange] = [...addPoints];
      } else {
        const existing = result[matKey].flanges[flange];
        for (const pt of addPoints) {
          const idx = existing.findIndex(p => p.bendLength === pt.bendLength);
          if (idx >= 0) {
            existing[idx] = pt;
          } else {
            existing.push(pt);
          }
        }
        existing.sort((a, b) => a.bendLength - b.bendLength);
      }
    }
  }

  return result;
}

interface MaterialMeta {
  name: string;
  thickness: number;
  unit: 'mm' | 'gauge';
}

interface BendDataContextValue {
  db: MaterialsDatabase;
  addDataPoint: (materialKey: string, flange: number, point: BendDataPoint, meta?: MaterialMeta) => Promise<void>;
  importCSV: (materialKey: string, flange: number, csvText: string, meta?: MaterialMeta) => Promise<number>;
}

const BendDataContext = createContext<BendDataContextValue | null>(null);

export function BendDataProvider({ children }: { children: React.ReactNode }) {
  const [userAdditions, setUserAdditions] = useState<MaterialsDatabase>({});
  const [db, setDb] = useState<MaterialsDatabase>(MATERIALS_DB);

  useEffect(() => {
    AsyncStorage.getItem(USER_DATA_KEY)
      .then(stored => {
        if (stored) {
          const parsed: MaterialsDatabase = JSON.parse(stored);
          setUserAdditions(parsed);
          setDb(mergeDB(MATERIALS_DB, parsed));
        }
      })
      .catch(console.error);
  }, []);

  const persist = useCallback(async (next: MaterialsDatabase) => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(next));
    setUserAdditions(next);
    setDb(mergeDB(MATERIALS_DB, next));
  }, []);

  const addDataPoint = useCallback(
    async (materialKey: string, flange: number, point: BendDataPoint, meta?: MaterialMeta) => {
      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));

      if (!next[materialKey]) {
        const base = MATERIALS_DB[materialKey];
        next[materialKey] = {
          name: meta?.name || base?.name || materialKey,
          thickness: meta?.thickness ?? base?.thickness ?? 0,
          unit: meta?.unit || base?.unit || 'mm',
          flanges: {},
        };
      }

      if (!next[materialKey].flanges[flange]) {
        next[materialKey].flanges[flange] = [];
      }

      const pts = next[materialKey].flanges[flange];
      const idx = pts.findIndex(p => p.bendLength === point.bendLength);
      if (idx >= 0) {
        pts[idx] = point;
      } else {
        pts.push(point);
        pts.sort((a, b) => a.bendLength - b.bendLength);
      }

      await persist(next);
    },
    [userAdditions, persist]
  );

  const importCSV = useCallback(
    async (materialKey: string, flange: number, csvText: string, meta?: MaterialMeta): Promise<number> => {
      const lines = csvText.trim().split('\n');
      const points: BendDataPoint[] = [];

      for (const line of lines) {
        const parts = line.trim().split(',').map(p => p.trim());
        const bl = parseFloat(parts[0]);
        const corr = parseFloat(parts[1]);
        const crown = parts[2] ? parseFloat(parts[2]) : 0;

        // Skip header rows and invalid lines
        if (isNaN(bl) || isNaN(corr)) continue;

        points.push({
          bendLength: bl,
          correction: corr,
          crown: isNaN(crown) ? 0 : crown,
        });
      }

      if (points.length === 0) {
        throw new Error('No valid data rows found. Expected: bendLength,correction,crown');
      }

      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));

      if (!next[materialKey]) {
        const base = MATERIALS_DB[materialKey];
        next[materialKey] = {
          name: meta?.name || base?.name || materialKey,
          thickness: meta?.thickness ?? base?.thickness ?? 0,
          unit: meta?.unit || base?.unit || 'mm',
          flanges: {},
        };
      }

      if (!next[materialKey].flanges[flange]) {
        next[materialKey].flanges[flange] = [];
      }

      const pts = next[materialKey].flanges[flange];
      for (const pt of points) {
        const idx = pts.findIndex(p => p.bendLength === pt.bendLength);
        if (idx >= 0) {
          pts[idx] = pt;
        } else {
          pts.push(pt);
        }
      }
      pts.sort((a, b) => a.bendLength - b.bendLength);

      await persist(next);
      return points.length;
    },
    [userAdditions, persist]
  );

  return (
    <BendDataContext.Provider value={{ db, addDataPoint, importCSV }}>
      {children}
    </BendDataContext.Provider>
  );
}

export function useBendData(): BendDataContextValue {
  const ctx = useContext(BendDataContext);
  if (!ctx) throw new Error('useBendData must be used within BendDataProvider');
  return ctx;
}
