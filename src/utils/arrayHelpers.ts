// ============================================================
// arrayHelpers.ts
// 1D 輸出軸陣列的純函式操作工具。
//
// 【設計原則】
// 所有函式均為「純函式（Pure Function）」：
//   - 不直接修改傳入的陣列（Immutable）
//   - 相同輸入必定產生相同輸出
//   - 無副作用（Side Effect）
// ============================================================

import type { RotationEntry } from '../types/rotation';

/**
 * insertEntryAfterIndex：在指定索引之後插入一個新條目。
 */
export function insertEntryAfterIndex(
  entries: RotationEntry[],
  newEntry: RotationEntry,
  afterIndex: number
): RotationEntry[] {
  const result = [...entries];
  const insertAt = afterIndex === -1 ? 0 : afterIndex + 1;
  result.splice(insertAt, 0, newEntry);
  return result;
}

/**
 * removeEntryById：從陣列中移除指定 id 的條目。
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param id - 要移除的泛用 id
 * @returns 移除後的新陣列
 */
export function removeEntryById(
  entries: RotationEntry[],
  id: string
): RotationEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

/**
 * removeEntriesByIds：批量移除多個條目。
 * 轉換為 Set 確保 O(1) 的極速查找。
 *
 * @param entries - 現有的 1D 陣列
 * @param ids - 要移除的 id 陣列
 * @returns 移除後的新陣列
 */
export function removeEntriesByIds(
  entries: RotationEntry[],
  ids: string[]
): RotationEntry[] {
  const idSet = new Set(ids);
  return entries.filter((entry) => !idSet.has(entry.id));
}

/**
 * moveEntry：將陣列中的某個條目移動到指定位置。
 */
export function moveEntry(
  entries: RotationEntry[],
  fromIndex: number,
  toInsertAfterIndex: number
): RotationEntry[] {
  if (fromIndex < 0 || fromIndex >= entries.length) {
    console.warn(
      `[arrayHelpers.moveEntry] fromIndex ${fromIndex} 超出陣列範圍`
    );
    return [...entries];
  }

  const result = [...entries];
  const [movedEntry] = result.splice(fromIndex, 1);

  const correctedInsertAfter =
    toInsertAfterIndex >= fromIndex
      ? toInsertAfterIndex - 1
      : toInsertAfterIndex;

  const insertAt = correctedInsertAfter === -1 ? 0 : correctedInsertAfter + 1;
  result.splice(insertAt, 0, movedEntry);

  return result;
}

/**
 * findEntryIndexById：透過 id 查找條目在陣列中的索引。
 *
 * @param entries - 要搜尋的 1D 陣列
 * @param id - 目標的 id
 * @returns 條目索引，未找到時回傳 -1
 */
export function findEntryIndexById(
  entries: RotationEntry[],
  id: string
): number {
  return entries.findIndex((entry) => entry.id === id);
}

/**
 * getEntriesBySlot：篩選出屬於特定泳道的所有條目。
 */
export function getEntriesBySlot(
  entries: RotationEntry[],
  slotIndex: 0 | 1 | 2
): RotationEntry[] {
  return entries.filter((entry) => entry.slotIndex === slotIndex);
}

/**
 * appendEntry：將新條目追加到陣列最後方（全局尾端吸附預設行為）。
 */
export function appendEntry(
  entries: RotationEntry[],
  newEntry: RotationEntry
): RotationEntry[] {
  return [...entries, newEntry];
}