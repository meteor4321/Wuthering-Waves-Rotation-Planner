// ============================================================
// useLaneLayout.ts — 單線程 1D 陣列的泳道版面衍生資料（重構 R2）。
//
// 職責：把「1D entries」轉成渲染需要的兩份衍生資料：
//   - entriesBySlot：依 slotIndex 分流到三條泳道（各自維持時間順序）。
//   - idToColumn  ：id → 全域欄序（1D 陣列 index；三泳道共用同一時間欄）。
// RotationBoard（主面板）與 RotationExportView（匯出視圖）共用，
// 消除兩處各寫一份的重複邏輯。
// ============================================================

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import type { RotationEntry } from '@/types/rotation';
import type { SlotIndex } from '@/types/character';

export function useLaneLayout(entries: MaybeRefOrGetter<RotationEntry[]>): {
  entriesBySlot: ComputedRef<Record<SlotIndex, RotationEntry[]>>;
  idToColumn: ComputedRef<Map<string, number>>;
} {
  /** 依 slotIndex 把 entries 分到三條泳道（各自維持時間順序）。 */
  const entriesBySlot = computed<Record<SlotIndex, RotationEntry[]>>(() => {
    const map: Record<SlotIndex, RotationEntry[]> = { 0: [], 1: [], 2: [] };
    for (const entry of toValue(entries)) {
      map[entry.slotIndex as SlotIndex].push(entry);
    }
    return map;
  });

  /** id → 全域欄序（在 1D 陣列中的 index；欄位跨三泳道共用）。 */
  const idToColumn = computed<Map<string, number>>(() => {
    const map = new Map<string, number>();
    toValue(entries).forEach((entry, index) => map.set(entry.id, index));
    return map;
  });

  return { entriesBySlot, idToColumn };
}
