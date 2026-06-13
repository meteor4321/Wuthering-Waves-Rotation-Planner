// ============================================================
// arrayHelpers.ts
// 1D 輸出軸陣列的純函式操作工具。
//
// 【設計原則】
// 所有函式均為「純函式（Pure Function）」：
//   - 不直接修改傳入的陣列（Immutable）
//   - 相同輸入必定產生相同輸出
//   - 無副作用（Side Effect）
//
// 這樣設計的好處：
//   1. 方便單元測試（不需要 mock store 或全域狀態）
//   2. 與 Pinia store 解耦，store 只負責呼叫這些函式並更新狀態
//   3. 未來若需要 undo/redo，可以直接對陣列快照進行操作
// ============================================================

import type { RotationEntry } from '../types/rotation';

/**
 * insertEntryAfterIndex：在指定索引之後插入一個新條目。
 *
 * 【視覺對應】
 * 這是「全局尾端吸附」與「兩區塊之間插入」的核心函式。
 * 拖曳放開時，依據 DragPayload.targetInsertAfterIndex 呼叫此函式。
 *
 * 範例：
 *   原陣列：[A, B, C]（索引 0, 1, 2）
 *   insertEntryAfterIndex(arr, newEntry, 1) → [A, B, newEntry, C]
 *   insertEntryAfterIndex(arr, newEntry, -1) → [newEntry, A, B, C]（插入最前方）
 *   insertEntryAfterIndex(arr, newEntry, 2) → [A, B, C, newEntry]（插入最後方）
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param newEntry - 要插入的新條目
 * @param afterIndex - 插入在此索引之後；-1 代表插入最前方
 * @returns 插入新條目後的新陣列（Immutable）
 */
export function insertEntryAfterIndex(
  entries: RotationEntry[],
  newEntry: RotationEntry,
  afterIndex: number
): RotationEntry[] {
  // 建立陣列的淺拷貝，避免直接修改原陣列
  const result = [...entries];

  // afterIndex 為 -1 時，插入在陣列最前方（splice 插入位置為 0）
  // 否則插入位置為 afterIndex + 1
  const insertAt = afterIndex === -1 ? 0 : afterIndex + 1;

  // splice(insertAt, 0, newEntry)：在 insertAt 位置插入 newEntry，不刪除任何元素
  result.splice(insertAt, 0, newEntry);

  return result;
}

/**
 * removeEntryById：從陣列中移除指定 id 的條目。
 *
 * 對應「刪除機制」：鍵盤 Delete/Backspace 或拖曳到無效放置區。
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param instanceId - 要移除的 InstanceBlock.instanceId
 * @returns 移除後的新陣列；若 id 不存在，回傳與原陣列內容相同的新陣列
 */
export function removeEntryById(
  entries: RotationEntry[],
  instanceId: string
): RotationEntry[] {
  // 使用 filter 建立不含目標 id 的新陣列（Immutable 操作）
  return entries.filter((entry) => entry.id !== instanceId);
}

/**
 * removeEntriesByIds：批量移除多個條目。
 *
 * 對應「多重選取後刪除」的快捷鍵操作（Ctrl+左鍵或框選後按 Delete）。
 * 先將 ids 轉成 Set 以達成 O(1) 查找，避免在大型陣列中使用 includes() 的 O(n²)。
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param instanceIds - 要移除的 instanceId 陣列
 * @returns 移除後的新陣列
 */
export function removeEntriesByIds(
  entries: RotationEntry[],
  instanceIds: string[]
): RotationEntry[] {
  // 轉換為 Set，讓 has() 查找的時間複雜度從 O(n) 降至 O(1)
  const idSet = new Set(instanceIds);
  return entries.filter((entry) => !idSet.has(entry.id));
}

/**
 * moveEntry：將陣列中的某個條目移動到指定位置。
 *
 * 對應「主時間軸內拖曳排序」：在同一條泳道內或跨泳道移動區塊。
 * 移動操作等同於「先刪除原位、再插入新位」。
 *
 * 【注意】
 * 跨泳道移動時（fromSlotIndex !== toSlotIndex），此函式不會更新
 * entry.slotIndex，呼叫端（Pinia store）必須在呼叫此函式後，
 * 另外更新被移動條目的 slotIndex 與 block.characterId。
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param fromIndex - 要移動的條目目前在陣列中的索引
 * @param toInsertAfterIndex - 移動後插入在哪個索引之後（-1 代表最前方）
 * @returns 移動後的新陣列
 */
export function moveEntry(
  entries: RotationEntry[],
  fromIndex: number,
  toInsertAfterIndex: number
): RotationEntry[] {
  // 邊界檢查：若 fromIndex 超出範圍，回傳原陣列的淺拷貝，不做任何操作
  if (fromIndex < 0 || fromIndex >= entries.length) {
    console.warn(
      `[arrayHelpers.moveEntry] fromIndex ${fromIndex} 超出陣列範圍（長度 ${entries.length}）`
    );
    return [...entries];
  }

  // 步驟一：從陣列中取出要移動的條目
  const result = [...entries];
  const [movedEntry] = result.splice(fromIndex, 1);

  // 步驟二：計算在「刪除後的陣列」中，目標插入位置的修正值。
  // 若移動方向是向後（toInsertAfterIndex >= fromIndex），
  // 因為刪除操作使後方元素的索引各減 1，插入位置需跟著減 1。
  const correctedInsertAfter =
    toInsertAfterIndex >= fromIndex
      ? toInsertAfterIndex - 1
      : toInsertAfterIndex;

  // 步驟三：插入到修正後的目標位置
  const insertAt = correctedInsertAfter === -1 ? 0 : correctedInsertAfter + 1;
  result.splice(insertAt, 0, movedEntry);

  return result;
}

/**
 * findEntryIndexById：透過 instanceId 查找條目在陣列中的索引。
 *
 * 回傳 -1 代表未找到（與 Array.findIndex 行為一致）。
 *
 * @param entries - 要搜尋的 1D 陣列
 * @param instanceId - 目標的 instanceId
 * @returns 條目索引，未找到時回傳 -1
 */
export function findEntryIndexById(
  entries: RotationEntry[],
  instanceId: string
): number {
  return entries.findIndex((entry) => entry.id === instanceId);
}

/**
 * getEntriesBySlot：篩選出屬於特定泳道的所有條目。
 *
 * 用於泳道渲染：Swimlane.vue 呼叫此函式取得自身應渲染的區塊列表，
 * 同時保留在 1D 陣列中的相對順序（filter 不改變元素順序）。
 *
 * @param entries - 完整的 1D 陣列
 * @param slotIndex - 目標泳道索引（0 | 1 | 2）
 * @returns 屬於該泳道的條目陣列（保留時間順序）
 */
export function getEntriesBySlot(
  entries: RotationEntry[],
  slotIndex: 0 | 1 | 2
): RotationEntry[] {
  return entries.filter((entry) => entry.slotIndex === slotIndex);
}

/**
 * appendEntry：將新條目追加到陣列最後方。
 *
 * 對應「全局尾端吸附（Global Tail Snapping）」的預設行為：
 * 當使用者將區塊拖入主軸但沒有明確的插入位置時，預設追加到最後。
 *
 * @param entries - 現有的 1D 陣列（不會被修改）
 * @param newEntry - 要追加的新條目
 * @returns 追加後的新陣列
 */
export function appendEntry(
  entries: RotationEntry[],
  newEntry: RotationEntry
): RotationEntry[] {
  // 等同於 insertEntryAfterIndex(entries, newEntry, entries.length - 1)
  // 但語意更清晰，效能也略優（不需要計算 afterIndex）
  return [...entries, newEntry];
}