// ============================================================
// useSidebarStore.ts
// Pinia Store：管理側邊欄的自訂模板區塊。
//
// 功能：
//  1. 儲存各角色的自訂模板（TemplateBlock[]）
//  2. 序列化（從主軸拖回側邊欄時新增模板）
//  3. 刪除模板
//  4. LocalStorage 持久化（確保重新整理不遺失資料）
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { TemplateBlock, InstanceBlock } from '../types/block';
import { DEFAULT_BLOCKS } from '../constants/defaultBlocks';
import { generateUUID } from '../utils/uuid';
import { deepClone } from '../utils/deepClone';

/** LocalStorage 儲存鍵名 */
const STORAGE_KEY = 'wuwa-rotation-templates';

/**
 * 從 LocalStorage 讀取已存的模板資料。
 * 若讀取失敗（資料損壞或 key 不存在），回傳空陣列。
 *
 * @returns TemplateBlock[] 或空陣列
 */
function loadTemplatesFromStorage(): TemplateBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // JSON.parse 可能拋出 SyntaxError，使用 try-catch 防護
    return JSON.parse(raw) as TemplateBlock[];
  } catch (e) {
    console.warn('[useSidebarStore] LocalStorage 資料讀取失敗，使用空模板庫', e);
    return [];
  }
}

export const useSidebarStore = defineStore('sidebar', () => {
  // ──────────────────────────────────────────
  // State
  // ──────────────────────────────────────────

  /**
   * templates：所有角色的自訂模板，在同一個陣列中儲存（以 characterId 區分歸屬）。
   * 從 LocalStorage 初始化，確保頁面重整後資料不遺失。
   */
  const templates = ref<TemplateBlock[]>(loadTemplatesFromStorage());

  /**
   * toastMessage：「已新增至模板庫」的提示文字。
   * 空字串代表不顯示 Toast；設為字串後顯示，由 ToastNotification 元件監聽。
   */
  const toastMessage = ref<string>('');

  // ──────────────────────────────────────────
  // LocalStorage 自動同步
  // ──────────────────────────────────────────

  /**
   * 監聽 templates 的變化，自動同步至 LocalStorage。
   * 使用 deep watch 確保陣列內部物件的屬性變更也能觸發。
   * { immediate: false }：避免初始化時重複寫入（載入時已從 storage 讀取）。
   */
  watch(
    templates,
    (newTemplates) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
      } catch (e) {
        console.warn('[useSidebarStore] LocalStorage 寫入失敗', e);
      }
    },
    { deep: true }
  );

  // ──────────────────────────────────────────
  // Computed
  // ──────────────────────────────────────────

  /**
   * defaultBlocks：系統預設的七個基礎招式區塊（直接引用常數，不存在 store 狀態中）。
   * 包裝成 computed 讓元件使用時可以直接解構，保持介面一致性。
   */
  const defaultBlocks = computed(() => DEFAULT_BLOCKS);

  /**
   * getTemplatesByCharacter：依角色 ID 篩選對應的自訂模板。
   * 回傳函式（getter factory），供元件傳入不同 characterId 使用。
   *
   * 使用方式：
   *   const templates = sidebarStore.getTemplatesByCharacter('jiyan')
   */
  const getTemplatesByCharacter = computed(
    () => (characterId: string) =>
      templates.value
        .filter((t) => t.characterId === characterId)
        // 依建立時間由舊到新排序，讓最新加入的在下方
        .sort((a, b) => a.createdAt - b.createdAt)
  );

  // ──────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────

  /**
   * serializeToTemplate：將主軸上的 InstanceBlock 序列化為模板，加入側邊欄。
   *
   * 對應設計文件「序列化（Move & Serialization）」章節。
   *
   * 操作流程：
   *  1. 深拷貝 InstanceBlock 的資料
   *  2. 賦予新的 templateId（UUID）
   *  3. 設定 source 為 'template'，記錄建立時間
   *  4. 推入 templates 陣列（watch 會自動同步至 LocalStorage）
   *  5. 觸發 Toast 提示
   *
   * @param instance - 主軸上要序列化的 InstanceBlock
   * @returns 建立完成的 TemplateBlock（供觸發「閃爍」動畫使用）
   */
  function serializeToTemplate(instance: InstanceBlock): TemplateBlock {
    // 確保 characterId 不為 null（InstanceBlock 的 characterId 保證非 null）
    if (!instance.characterId) {
      throw new Error('[useSidebarStore.serializeToTemplate] InstanceBlock.characterId 不可為 null');
    }

    // 深拷貝，避免主軸上的資料與模板庫共用參考
    const clonedBlock = deepClone(instance);

    // 組裝 TemplateBlock
    const newTemplate: TemplateBlock = {
      ...clonedBlock,
      templateId: generateUUID(), // 賦予新的模板 ID
      source: 'template',
      characterId: instance.characterId, // TypeScript 已確保非 null
      createdAt: Date.now(),
    };

    // 推入模板陣列（watch 自動持久化）
    templates.value.push(newTemplate);

    // 觸發 Toast 提示
    showToast(`已新增至模板庫`);

    return newTemplate;
  }

  /**
   * deleteTemplate：從側邊欄刪除指定的自訂模板。
   *
   * @param templateId - 要刪除的 TemplateBlock.templateId
   */
  function deleteTemplate(templateId: string): void {
    templates.value = templates.value.filter(
      (t) => t.templateId !== templateId
    );
  }

  /**
   * showToast：顯示右下角的提示框。
   * Toast 顯示 2 秒後自動清除。
   *
   * @param message - 要顯示的訊息文字
   */
  function showToast(message: string): void {
    toastMessage.value = message;
    // 2000ms 後清除，讓 ToastNotification 元件執行淡出動畫
    setTimeout(() => {
      toastMessage.value = '';
    }, 2000);
  }

  return {
    // State
    templates,
    toastMessage,
    // Computed
    defaultBlocks,
    getTemplatesByCharacter,
    // Actions
    serializeToTemplate,
    deleteTemplate,
    showToast,
  };
});