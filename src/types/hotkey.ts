// ============================================================
// hotkey.ts — 熱鍵輸入模式的對映表型別。
//
// 設計決策（見 DesignDocument/HotkeyInputMode.md §2）：
//   - 以 label 為準（非模板 id）：命中即插入自由區塊，免處理模板刪改的懸空引用。
//   - hotkey 一律存 KeyboardEvent.code（物理鍵，免疫 CapsLock／輸入法），
//     滑鼠鍵則用 'MouseLeft' / 'MouseRight' 兩個保留字。
//   - pressType 預留 tap/hold；Stage 2 僅用 tap，hold 判定於 Stage 3 接上。
//   - id 為本專案內部用（列表渲染 key／編輯定位）；非設計文件的三欄之一。
// ============================================================

/** 按法：單擊 / 長按。結構預留未來擴充（如 'double'）。 */
export type PressType = 'tap' | 'hold';

/** 單條熱鍵對映。衝突單位＝hotkey + pressType（見 useHotkeyMap.findConflict）。 */
export interface HotkeyMapEntry {
  /** 內部唯一鍵（列表渲染／編輯定位用）。 */
  id: string;
  /** 插入區塊時使用的文字。 */
  label: string;
  /** KeyboardEvent.code（如 'KeyE'）或 'MouseLeft' / 'MouseRight'。 */
  hotkey: string;
  /** 單擊 / 長按。 */
  pressType: PressType;
}
