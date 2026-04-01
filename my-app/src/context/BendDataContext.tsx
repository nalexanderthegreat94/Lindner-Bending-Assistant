import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialsDatabase, BendDataPoint } from '../types';
import { MATERIALS_DB } from '../database/sampleData';

const USER_DATA_KEY = '@bending_assistant/user_data';
const DELETED_POINTS_KEY = '@bending_assistant/deleted_points';

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

/** Applies a set of tombstoned points on top of a merged db. */
function applyDeletions(merged: MaterialsDatabase, deleted: Set<string>): MaterialsDatabase {
  if (deleted.size === 0) return merged;
  const result: MaterialsDatabase = JSON.parse(JSON.stringify(merged));
  for (const matKey of Object.keys(result)) {
    for (const flangeStr of Object.keys(result[matKey].flanges)) {
      const flange = Number(flangeStr);
      result[matKey].flanges[flange] = result[matKey].flanges[flange].filter(
        (p: BendDataPoint) => !deleted.has(`${matKey}::${flange}::${p.bendLength}`)
      );
    }
  }
  return result;
}

function buildDB(base: MaterialsDatabase, additions: MaterialsDatabase, deleted: Set<string>): MaterialsDatabase {
  return applyDeletions(mergeDB(base, additions), deleted);
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
  deleteDataPoint: (materialKey: string, flange: number, bendLength: number) => Promise<void>;
}

const BendDataContext = createContext<BendDataContextValue | null>(null);

export function BendDataProvider({ children }: { children: React.ReactNode }) {
  const [userAdditions, setUserAdditions] = useState<MaterialsDatabase>({});
  const [deletedPoints, setDeletedPoints] = useState<Set<string>>(new Set());
  const [db, setDb] = useState<MaterialsDatabase>(MATERIALS_DB);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(USER_DATA_KEY),
      AsyncStorage.getItem(DELETED_POINTS_KEY),
    ]).then(([userData, deletedData]) => {
      const additions: MaterialsDatabase = userData ? JSON.parse(userData) : {};
      const deleted: Set<string> = deletedData ? new Set(JSON.parse(deletedData)) : new Set();
      setUserAdditions(additions);
      setDeletedPoints(deleted);
      setDb(buildDB(MATERIALS_DB, additions, deleted));
    }).catch(console.error);
  }, []);

  const persist = useCallback(async (next: MaterialsDatabase) => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(next));
    setUserAdditions(next);
    setDb(buildDB(MATERIALS_DB, next, deletedPoints));
  }, [deletedPoints]);

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

  const deleteDataPoint = useCallback(
    async (materialKey: string, flange: number, bendLength: number) => {
      const key = `${materialKey}::${flange}::${bendLength}`;
      const next = new Set([...deletedPoints, key]);
      await AsyncStorage.setItem(DELETED_POINTS_KEY, JSON.stringify([...next]));
      setDeletedPoints(next);
      setDb(buildDB(MATERIALS_DB, userAdditions, next));
    },
    [deletedPoints, userAdditions]
  );

  return (
    <BendDataContext.Provider value={{ db, addDataPoint, importCSV, deleteDataPoint }}>
      {children}
    </BendDataContext.Provider>
  );
}

export function useBendData(): BendDataContextValue {
  const ctx = useContext(BendDataContext);
  if (!ctx) throw new Error('useBendData must be used within BendDataProvider');
  return ctx;
}
