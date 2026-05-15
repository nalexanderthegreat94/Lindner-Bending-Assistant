import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialsDatabase, BendDataPoint } from '../types';
import { MATERIALS_DB } from '../database/sampleData';

const USER_DATA_KEY = '@bending_assistant/user_data';
const DELETED_POINTS_KEY = '@bending_assistant/deleted_points';

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
          if (!existing.some(p => p.bendLength === pt.bendLength && p.enteredAt === pt.enteredAt)) {
            existing.push(pt);
          }
        }
        existing.sort((a, b) => a.bendLength - b.bendLength);
      }
    }
  }

  return result;
}

function applyDeletions(merged: MaterialsDatabase, deleted: Set<string>): MaterialsDatabase {
  if (deleted.size === 0) return merged;
  const result: MaterialsDatabase = JSON.parse(JSON.stringify(merged));
  for (const matKey of Object.keys(result)) {
    for (const flangeStr of Object.keys(result[matKey].flanges)) {
      const flange = Number(flangeStr);
      result[matKey].flanges[flange] = result[matKey].flanges[flange].filter(
        (p: BendDataPoint) =>
          !deleted.has(`${matKey}::${flange}::${p.bendLength}`) &&
          !deleted.has(`${matKey}::${flange}::${p.bendLength}::${p.enteredAt}`)
      );
    }
  }
  return result;
}

function buildDB(base: MaterialsDatabase, additions: MaterialsDatabase, deleted: Set<string>): MaterialsDatabase {
  return applyDeletions(mergeDB(base, additions), deleted);
}

function liftTombstonesForBendLengths(deleted: Set<string>, materialKey: string, flange: number, bendLengths: number[]): Set<string> {
  const result = new Set(deleted);
  for (const bl of bendLengths) {
    const legacy = `${materialKey}::${flange}::${bl}`;
    result.delete(legacy);
    for (const key of [...result]) {
      if (key.startsWith(`${legacy}::`)) result.delete(key);
    }
  }
  return result;
}

interface MaterialMeta {
  name: string;
  thickness: number;
  unit: 'mm' | 'gauge';
}

export interface ImportResult {
  imported: number;
  skipped: number;
}

interface BendDataContextValue {
  db: MaterialsDatabase;
  addDataPoint: (materialKey: string, flange: number, point: BendDataPoint, meta?: MaterialMeta) => Promise<void>;
  editDataPoint: (materialKey: string, flange: number, bendLength: number, enteredAt: number, newCorrection: number, newCrown: number) => Promise<void>;
  importCSV: (materialKey: string, flange: number, csvText: string, meta?: MaterialMeta) => Promise<ImportResult>;
  importFullDB: (incoming: MaterialsDatabase) => Promise<ImportResult>;
  deleteDataPoint: (materialKey: string, flange: number, bendLength: number, enteredAt: number) => Promise<void>;
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

  const persist = useCallback(async (next: MaterialsDatabase, nextDeleted?: Set<string>) => {
    const deleted = nextDeleted ?? deletedPoints;
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(next));
    if (nextDeleted) {
      await AsyncStorage.setItem(DELETED_POINTS_KEY, JSON.stringify([...nextDeleted]));
      setDeletedPoints(nextDeleted);
    }
    setUserAdditions(next);
    setDb(buildDB(MATERIALS_DB, next, deleted));
  }, [deletedPoints]);

  const addDataPoint = useCallback(
    async (materialKey: string, flange: number, point: BendDataPoint, meta?: MaterialMeta) => {
      const existing = db[materialKey]?.flanges[flange] ?? [];
      const isDuplicate = existing.some(p =>
        p.bendLength === point.bendLength &&
        p.correction === point.correction &&
        (p.crown ?? 0) === (point.crown ?? 0)
      );
      if (isDuplicate) throw new Error('EXACT_DUPLICATE');

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
      const stamped: BendDataPoint = { ...point, enteredAt: point.enteredAt ?? Date.now() };
      next[materialKey].flanges[flange].push(stamped);
      next[materialKey].flanges[flange].sort((a, b) => a.bendLength - b.bendLength);
      await persist(next);
    },
    [userAdditions, db, persist]
  );

  const editDataPoint = useCallback(
    async (materialKey: string, flange: number, bendLength: number, enteredAt: number, newCorrection: number, newCrown: number) => {
      const existing = db[materialKey]?.flanges[flange] ?? [];
      const isDuplicate = existing.some(p =>
        !(p.bendLength === bendLength && p.enteredAt === enteredAt) &&
        p.bendLength === bendLength &&
        p.correction === newCorrection &&
        (p.crown ?? 0) === newCrown
      );
      if (isDuplicate) throw new Error('EXACT_DUPLICATE');

      const isBuiltIn = MATERIALS_DB[materialKey]?.flanges[flange]?.some(
        p => p.bendLength === bendLength && p.enteredAt === enteredAt
      ) ?? false;

      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));

      if (next[materialKey]?.flanges[flange]) {
        const pts = next[materialKey].flanges[flange];
        const idx = pts.findIndex(p => p.bendLength === bendLength && p.enteredAt === enteredAt);
        if (idx >= 0) pts.splice(idx, 1);
      }

      if (!next[materialKey]) {
        const base = MATERIALS_DB[materialKey];
        next[materialKey] = {
          name: base?.name || materialKey,
          thickness: base?.thickness ?? 0,
          unit: base?.unit || 'mm',
          flanges: {},
        };
      }
      if (!next[materialKey].flanges[flange]) {
        next[materialKey].flanges[flange] = [];
      }
      next[materialKey].flanges[flange].push({
        bendLength,
        correction: newCorrection,
        crown: newCrown,
        enteredAt: Date.now(),
      });
      next[materialKey].flanges[flange].sort((a, b) => a.bendLength - b.bendLength);

      if (isBuiltIn) {
        const tombstoneKey = `${materialKey}::${flange}::${bendLength}::${enteredAt}`;
        const nextDeleted = new Set([...deletedPoints, tombstoneKey]);
        await persist(next, nextDeleted);
      } else {
        await persist(next);
      }
    },
    [userAdditions, db, deletedPoints, persist]
  );

  const importCSV = useCallback(
    async (materialKey: string, flange: number, csvText: string, meta?: MaterialMeta): Promise<ImportResult> => {
      const lines = csvText.trim().split('\n');
      const points: BendDataPoint[] = [];
      const importedAt = Date.now();

      for (const line of lines) {
        const parts = line.trim().split(',').map(p => p.trim());
        const bl = parseFloat(parts[0]);
        const corr = parseFloat(parts[1]);
        const crown = parts[2] ? parseFloat(parts[2]) : 0;
        if (isNaN(bl) || isNaN(corr)) continue;
        points.push({ bendLength: bl, correction: corr, crown: isNaN(crown) ? 0 : crown, enteredAt: importedAt });
      }

      if (points.length === 0) {
        throw new Error('No valid data rows found. Expected: bendLength,correction,crown');
      }

      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));
      const currentFlangeData = buildDB(MATERIALS_DB, next, deletedPoints)[materialKey]?.flanges[flange] ?? [];

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

      let imported = 0;
      let skipped = 0;
      const pts = next[materialKey].flanges[flange];
      for (const pt of points) {
        const isDuplicate = currentFlangeData.some(p =>
          p.bendLength === pt.bendLength &&
          p.correction === pt.correction &&
          (p.crown ?? 0) === (pt.crown ?? 0)
        );
        if (isDuplicate) { skipped++; continue; }
        pts.push(pt);
        imported++;
      }
      pts.sort((a, b) => a.bendLength - b.bendLength);

      const nextDeleted = liftTombstonesForBendLengths(deletedPoints, materialKey, flange, points.map(p => p.bendLength));
      await persist(next, nextDeleted);
      return { imported, skipped };
    },
    [userAdditions, deletedPoints, persist]
  );

  const importFullDB = useCallback(
    async (incoming: MaterialsDatabase): Promise<ImportResult> => {
      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));
      const currentDB = buildDB(MATERIALS_DB, next, deletedPoints);
      let imported = 0;
      let skipped = 0;
      const allBendLengthsToLift: { matKey: string; flange: number; bendLength: number }[] = [];

      for (const matKey of Object.keys(incoming)) {
        const incomingMat = incoming[matKey];
        if (!incomingMat?.flanges) continue;

        if (!next[matKey]) {
          next[matKey] = JSON.parse(JSON.stringify(incomingMat));
          for (const flangeStr of Object.keys(next[matKey].flanges)) {
            const f = Number(flangeStr);
            for (const pt of next[matKey].flanges[f] ?? []) {
              imported++;
              allBendLengthsToLift.push({ matKey, flange: f, bendLength: pt.bendLength });
            }
          }
          continue;
        }

        for (const flangeStr of Object.keys(incomingMat.flanges)) {
          const flange = Number(flangeStr);
          const addPoints = incomingMat.flanges[flange] ?? [];
          const currentFlangeData = currentDB[matKey]?.flanges[flange] ?? [];

          if (!next[matKey].flanges[flange]) {
            next[matKey].flanges[flange] = [];
          }

          const pts = next[matKey].flanges[flange];
          for (const pt of addPoints) {
            const isDuplicate = currentFlangeData.some(p =>
              p.bendLength === pt.bendLength &&
              p.correction === pt.correction &&
              (p.crown ?? 0) === (pt.crown ?? 0)
            );
            if (isDuplicate) { skipped++; continue; }
            pts.push(pt);
            imported++;
            allBendLengthsToLift.push({ matKey, flange, bendLength: pt.bendLength });
          }
          pts.sort((a, b) => a.bendLength - b.bendLength);
        }
      }

      let nextDeleted = new Set(deletedPoints);
      for (const { matKey, flange, bendLength } of allBendLengthsToLift) {
        nextDeleted = liftTombstonesForBendLengths(nextDeleted, matKey, flange, [bendLength]);
      }
      await persist(next, nextDeleted);
      return { imported, skipped };
    },
    [userAdditions, deletedPoints, persist]
  );

  const deleteDataPoint = useCallback(
    async (materialKey: string, flange: number, bendLength: number, enteredAt: number) => {
      const next: MaterialsDatabase = JSON.parse(JSON.stringify(userAdditions));
      let removedFromUser = false;

      if (next[materialKey]?.flanges[flange]) {
        const pts = next[materialKey].flanges[flange];
        const idx = pts.findIndex(p => p.bendLength === bendLength && p.enteredAt === enteredAt);
        if (idx >= 0) {
          pts.splice(idx, 1);
          removedFromUser = true;
        }
      }

      const isBuiltIn = MATERIALS_DB[materialKey]?.flanges[flange]?.some(
        p => p.bendLength === bendLength && p.enteredAt === enteredAt
      ) ?? false;

      if (isBuiltIn) {
        const tombstoneKey = `${materialKey}::${flange}::${bendLength}::${enteredAt}`;
        const nextDeleted = new Set([...deletedPoints, tombstoneKey]);
        await persist(removedFromUser ? next : userAdditions, nextDeleted);
      } else if (removedFromUser) {
        await persist(next);
      }
    },
    [deletedPoints, userAdditions, persist]
  );

  return (
    <BendDataContext.Provider value={{ db, addDataPoint, editDataPoint, importCSV, importFullDB, deleteDataPoint }}>
      {children}
    </BendDataContext.Provider>
  );
}

export function useBendData(): BendDataContextValue {
  const ctx = useContext(BendDataContext);
  if (!ctx) throw new Error('useBendData must be used within BendDataProvider');
  return ctx;
}
