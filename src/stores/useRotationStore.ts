// ============================================================
// useRotationStore.ts
// 核心 Pinia Store：管理整個 1D 輸出軸陣列（RotationArray）。
//
// 這是本專案最重要的 store，所有對主時間軸的增刪改查都在這裡。
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RotationArray, RotationEntry } from '../types/rotation';
import type { Block, AnyBlock, DefaultBlock, TemplateBlock } from '../types/block';
import type { SlotIndex } from '../types/character';
import { generateUUID } from '../utils/uuid';
import { deepClone } from '../utils/deepClone';
import {
  insertEntryAfterIndex,
  removeEntryById,
  removeEntriesByIds,
  moveEntry,
  findEntryIndexById,
  appendEntry,
} from '../utils/arrayHelpers';

export const useRotationStore = defineStore('rotation', () => {
  // ──────────────────────────────────────────
  // State（響應式狀態）
  // ──────────────────────────────────────────

  /**
   * entries：整個輸出軸的核心 1D 陣列。
   * 所有對時間軸的操作都以更新此陣列為最終目標。
   */
  const entries = ref<RotationArray>([]);

  /**
   * selectedIds：目前被選中的 instanceId 集合。
   * 使用 Set 確保不重複，並讓 has() 操作達到 O(1)。
   */
  const selectedIds = ref<Set<string>>(new Set());

  // ──────────────────────────────────────────
  // Computed（衍生狀態）
  // ──────────────────────────────────────────

  /**
   * totalBlockCount：主時間軸上的總區塊數。
   */
  const totalBlockCount = computed(() => entries.value.length);

  /**
   * selectedEntries：目前被選中的條目列表。
   * 維持在 1D 陣列中的相對時間順序。
   */
  const selectedEntries = computed(() =>
    entries.value.filter((e) => selectedIds.value.has(e.id))
  );

  // ──────────────────────────────────────────
  // Actions（操作方法）
  // ──────────────────────────────────────────

  /**
   * instantiateBlock：從側邊欄區塊建立一個新的 InstanceBlock 並加入時間軸。
   *
   * 這是「側邊欄 → 主軸」拖曳的核心操作，對應設計文件的「實例化（Instantiation）」章節。
   *
   * 操作流程：
   *  1. 對來源區塊資料進行深拷貝，確保不共用記憶體參考
   *  2. 賦予新的 UUID（instanceId），使其成為獨立實體
   *  3. 設定所屬泳道（slotIndex）與角色（characterId）
   *  4. 根據 afterIndex 決定插入位置（-1=最前，n=第n個之後，預設追加末尾）
   *
   * @param sourceBlock - 來源區塊（DefaultBlock 或 TemplateBlock）
   * @param targetSlotIndex - 要放置的泳道索引
   * @param targetCharacterId - 目標角色 ID
   * @param afterIndex - 插入在哪個索引之後（預設 -Infinity 代表追加末尾）
   */
  function instantiateBlock(
    sourceBlock: DefaultBlock | TemplateBlock,
    targetSlotIndex: SlotIndex,
    targetCharacterId: string,
    afterIndex: number = entries.value.length - 1
  ): void {
    // 步驟一：深拷貝來源資料，避免側邊欄的模板被意外修改
    const clonedData = deepClone(sourceBlock);

    // 步驟二：組裝 InstanceBlock，覆蓋來源資料的識別欄位
    const newBlock: Block = {
      ...clonedData,
      instanceId: generateUUID(), // 賦予全新的唯一識別碼
      source: 'instance',         // 標記來源為「主軸實體」
      characterId: targetCharacterId, // 覆蓋為目標角色
      // originId：記錄來源以便追蹤（使用 templateId 或 id）
      originId:
        sourceBlock.source === 'template'
          ? sourceBlock.templateId
          : sourceBlock.id,
      tags: deepClone(clonedData.tags), // 確保 tags 陣列也是獨立拷貝
    } as Block;

    // 步驟三：組裝 RotationEntry
    const newEntry: RotationEntry = {
      id: newBlock.instanceId,
      slotIndex: targetSlotIndex,
      block: newBlock,
    };

    // 步驟四：插入到指定位置（全局尾端吸附的預設值為陣列末尾）
    if (afterIndex >= entries.value.length - 1) {
      // 預設追加至末尾
      entries.value = appendEntry(entries.value, newEntry);
    } else {
      // 插入到指定位置
      entries.value = insertEntryAfterIndex(entries.value, newEntry, afterIndex);
    }
  }

  /**
   * moveBlock：在主時間軸內移動一個區塊（排序操作）。
   *
   * 對應設計文件「主時間軸」中的拖曳排序行為。
   * 注意：此函式允許跨泳道移動，但跨泳道時需額外更新 slotIndex。
   *
   * @param instanceId - 要移動的區塊的 instanceId
   * @param toInsertAfterIndex - 移動後要插入在哪個索引之後
   * @param newSlotIndex - 若跨泳道，提供新的泳道索引；不跨泳道則傳入 undefined
   * @param newCharacterId - 若跨泳道，提供新的角色 ID；不跨泳道則傳入 undefined
   */
  function moveBlock(
    instanceId: string,
    toInsertAfterIndex: number,
    newSlotIndex?: SlotIndex,
    newCharacterId?: string
  ): void {
    const fromIndex = findEntryIndexById(entries.value, instanceId);

    // 若找不到目標，記錄警告並提前返回
    if (fromIndex === -1) {
      console.warn(`[useRotationStore.moveBlock] 找不到 instanceId: ${instanceId}`);
      return;
    }

    // 執行移動（純函式，回傳新陣列）
    let newEntries = moveEntry(entries.value, fromIndex, toInsertAfterIndex);

    // 若有跨泳道，更新被移動條目的 slotIndex 與 characterId
    if (newSlotIndex !== undefined || newCharacterId !== undefined) {
      newEntries = newEntries.map((entry) => {
        if (entry.id !== instanceId) return entry;
        return {
          ...entry,
          slotIndex: newSlotIndex ?? entry.slotIndex,
          block: {
            ...entry.block,
            characterId: newCharacterId ?? entry.block.characterId,
          },
        };
      });
    }

    entries.value = newEntries;
  }

  /**
   * deleteBlock：從主時間軸刪除單一區塊。
   *
   * 對應鍵盤 Delete/Backspace 或拖曳至無效放置區。
   *
   * @param instanceId - 要刪除的 instanceId
   */
  function deleteBlock(instanceId: string): void {
    entries.value = removeEntryById(entries.value, instanceId);
    // 同步清除選取狀態，避免殘留已刪除 id
    selectedIds.value.delete(instanceId);
  }

  /**
   * deleteSelectedBlocks：批量刪除目前所有被選中的區塊。
   *
   * 對應 Ctrl+X（剪下）或多選後按 Delete 的行為。
   */
  function deleteSelectedBlocks(): void {
    const idsToDelete = [...selectedIds.value];
    entries.value = removeEntriesByIds(entries.value, idsToDelete);
    selectedIds.value.clear();
  }

  /**
   * selectBlock：選取指定區塊（支援多選模式）。
   *
   * @param instanceId - 要選取的 instanceId
   * @param isMultiSelect - 是否為多選模式（Ctrl+左鍵）；false 時清除其他選取
   */
  function selectBlock(instanceId: string, isMultiSelect: boolean = false): void {
    if (!isMultiSelect) {
      // 單選：清除所有其他選取，只選此一個
      selectedIds.value.clear();
    }
    selectedIds.value.add(instanceId);
  }

  /**
   * deselectBlock：取消選取指定區塊。
   *
   * @param instanceId - 要取消選取的 instanceId
   */
  function deselectBlock(instanceId: string): void {
    selectedIds.value.delete(instanceId);
  }

  /**
   * clearSelection：清除所有選取。
   * 點擊空白區域時呼叫。
   */
  function clearSelection(): void {
    selectedIds.value.clear();
  }

  /**
   * isSelected：檢查某個區塊是否處於選取狀態。
   *
   * @param instanceId - 要檢查的 instanceId
   * @returns 是否被選取
   */
  function isSelected(instanceId: string): boolean {
    return selectedIds.value.has(instanceId);
  }

  /**
   * clearRotation：清空整個時間軸（用於重置操作，保留供未來實作）。
   */
  function clearRotation(): void {
    entries.value = [];
    selectedIds.value.clear();
  }

  // ──────────────────────────────────────────
  // 回傳 store 的公開介面
  // ──────────────────────────────────────────
  return {
    // State
    entries,
    selectedIds,
    // Computed
    totalBlockCount,
    selectedEntries,
    // Actions
    instantiateBlock,
    moveBlock,
    deleteBlock,
    deleteSelectedBlocks,
    selectBlock,
    deselectBlock,
    clearSelection,
    isSelected,
    clearRotation,
  };
});