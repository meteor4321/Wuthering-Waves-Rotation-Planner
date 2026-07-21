// ============================================================
// useHotkeyMap.ts — 熱鍵對映表（module 單例，LocalStorage 持久化）。
//
// 定位：熱鍵輸入模式的「鍵位→區塊文字」全域唯一對映表（不分角色）。
//   - 首次載入以 HOTKEY_SEED_SOURCE（由通用區塊播種）為種子寫入。
//   - 之後使用者於設定頁自由增刪改；全程 LocalStorage 持久化。
//   - 「清除資料」時 resetToDefaults 回種子。
//
// 設計決策（見 DesignDocument/HotkeyInputMode.md §2）：
//   - 與 useSettings 同為 state 單例（非 Pinia store），共用「載入即補種子 + deep
//     watch 持久化」的體系，符合「掛進 useSettings 體系」的既定方向。
//   - 衝突單位＝hotkey + pressType：同一實體鍵可並存 tap／hold 兩條；
//     同鍵同型別重複才算衝突（findConflict）。
//   - 鍵位比對一律用 hotkey 欄（event.code 或 MouseLeft/Right），不綁模板 id。
// ============================================================

import { ref, watch } from 'vue';
import type { HotkeyMapEntry, PressType } from '@/types/hotkey';
import { HOTKEY_SEED_SOURCE } from '@/constants/hotkeyMap';
import { generateUUID } from '@/utils/uuid';

const STORAGE_KEY = 'wuwa-rotation-hotkey-map';

/** 由種子來源生成帶 id 的完整對映條目（種子與 resetToDefaults 共用）。 */
function seedEntries(): HotkeyMapEntry[] {
  return HOTKEY_SEED_SOURCE.map((s) => ({ id: generateUUID(), ...s }));
}

/** 正規化為合法條目（防手改 localStorage：補 id、夾 pressType）。 */
function normalize(e: Partial<HotkeyMapEntry>): HotkeyMapEntry {
  return {
    id: typeof e.id === 'string' && e.id ? e.id : generateUUID(),
    label: typeof e.label === 'string' ? e.label : '',
    hotkey: typeof e.hotkey === 'string' ? e.hotkey : '',
    pressType: e.pressType === 'hold' ? 'hold' : 'tap',
  };
}

/** 首次（無儲存鍵）以種子播種；之後沿用使用者內容（含清空）。 */
function loadFromStorage(): HotkeyMapEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return seedEntries();
    const parsed = JSON.parse(raw) as Partial<HotkeyMapEntry>[];
    return Array.isArray(parsed) ? parsed.map(normalize) : seedEntries();
  } catch (e) {
    console.warn('[useHotkeyMap] 讀取失敗，改用種子', e);
    return seedEntries();
  }
}

// 模組層級單例：整個 App 共用同一份對映表。
const entries = ref<HotkeyMapEntry[]>(loadFromStorage());

// 首次（無儲存鍵）立即寫入種子，讓儲存鍵永遠存在、行為確定（比照 useGeneralBlockStore）。
if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value));
  } catch (e) {
    console.warn('[useHotkeyMap] 種子寫入失敗', e);
  }
}

// 變動自動持久化（deep watch 以捕捉條目內部欄位變更）。
watch(
  entries,
  (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch (e) {
      console.warn('[useHotkeyMap] 寫入失敗', e);
    }
  },
  { deep: true },
);

export function useHotkeyMap() {
  /** 新增一條空白條目（無鍵位、pressType=tap），回傳其 id。 */
  function addEntry(): string {
    const entry: HotkeyMapEntry = { id: generateUUID(), label: '', hotkey: '', pressType: 'tap' };
    entries.value = [...entries.value, entry];
    return entry.id;
  }

  /** 局部更新一條條目（label / hotkey / pressType）。 */
  function updateEntry(id: string, patch: Partial<Omit<HotkeyMapEntry, 'id'>>): void {
    entries.value = entries.value.map((e) => (e.id === id ? { ...e, ...patch } : e));
  }

  /** 刪除一條條目。 */
  function removeEntry(id: string): void {
    entries.value = entries.value.filter((e) => e.id !== id);
  }

  /** 還原為預設種子（設定頁「還原預設」與「清除資料」共用）。 */
  function resetToDefaults(): void {
    entries.value = seedEntries();
  }

  /**
   * 找出與 (hotkey, pressType) 衝突的既有條目（同鍵同型別）；exceptId 排除自己。
   * hotkey 為空（尚未錄入）不算衝突。回傳第一條衝突條目或 null。
   */
  function findConflict(hotkey: string, pressType: PressType, exceptId?: string): HotkeyMapEntry | null {
    if (!hotkey) return null;
    return (
      entries.value.find(
        (e) => e.id !== exceptId && e.hotkey === hotkey && e.pressType === pressType,
      ) ?? null
    );
  }

  /**
   * 依 code 找出模式輸入要插入的條目（Stage 2 僅鍵盤 tap）。
   * 優先取 pressType='tap'；label 全空白者不算（呼叫端不動作）。
   */
  function resolveByCode(code: string): HotkeyMapEntry | null {
    const hits = entries.value.filter((e) => e.hotkey === code && e.label.trim() !== '');
    return hits.find((e) => e.pressType === 'tap') ?? hits[0] ?? null;
  }

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    resetToDefaults,
    findConflict,
    resolveByCode,
  };
}
