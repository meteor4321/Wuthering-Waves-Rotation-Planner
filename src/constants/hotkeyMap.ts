// ============================================================
// hotkeyMap.ts — 熱鍵對映表的預設種子、保留鍵與鍵名格式化。
//
// 設計決策（見 DesignDocument/HotkeyInputMode.md §2）：
//   - 種子由通用區塊 GENERAL_BLOCKS 播種：每個通用招式配一個合理預設物理鍵。
//     配鍵沿用 Stage 1 寫死方案（label 字母＝同名物理鍵，Intro→S），已與使用者確認。
//   - 保留鍵禁止綁定：模式已徵用（Esc/1-2-3/Delete/Backspace）、修飾鍵本身（Ctrl/Meta）。
//     錄入 UI 與衝突偵測都以此清單擋下。（F 為模式進入鍵但仍可綁定：僅在未進入模式時進入，
//     進入後 F 走 handleModeKeydown 當一般熱鍵，兩狀態互斥不衝突。）
//   - 鍵位一律以 event.code 比對；此處另備友善顯示名（設定頁擷取欄用）。
// ============================================================

import { GENERAL_BLOCKS } from './generalBlocks';
import type { HotkeyMapEntry, IntroHotkeyEntry } from '../types/hotkey';

/** 通用區塊 label → 預設物理鍵（event.code）。未列到的 label 種子時略過配鍵。 */
const SEED_KEY_BY_LABEL: Record<string, string> = {
  A: 'KeyA',
  Z: 'KeyZ',
  E: 'KeyE',
  R: 'KeyR',
  Q: 'KeyQ',
  D: 'KeyD',
  Intro: 'KeyS',
};

/**
 * 預設對映種子：由 GENERAL_BLOCKS 依 label 配上預設鍵，全部 pressType='tap'。
 * id 於播種當下生成（見 useHotkeyMap.seedEntries，避免此處引入 uuid 相依）。
 */
export const HOTKEY_SEED_SOURCE: ReadonlyArray<Pick<HotkeyMapEntry, 'label' | 'hotkey' | 'pressType'>> =
  GENERAL_BLOCKS.filter((b) => SEED_KEY_BY_LABEL[b.label] !== undefined).map((b) => ({
    label: b.label,
    hotkey: SEED_KEY_BY_LABEL[b.label],
    pressType: 'tap' as const,
  }));

/**
 * 入場技長按捷徑的預設種子（三條，對應 Digit1/2/3）。
 * label 預設沿用通用區塊的「Intro」；預設啟用（此功能的用途即在此）。
 * hotkey 恆為 `Digit{slot}`、pressType 恆為 hold，故不入結構（由消費端固定推導）。
 */
export const INTRO_HOTKEY_SEED: ReadonlyArray<IntroHotkeyEntry> = [
  { slot: 1, label: 'Intro', enabled: true },
  { slot: 2, label: 'Intro', enabled: true },
  { slot: 3, label: 'Intro', enabled: true },
];

/**
 * 保留鍵（禁止綁定）的 event.code 集合。
 * Escape / Digit1-3 / Delete / Backspace / Ctrl・Meta（修飾鍵本身）。
 * 滾輪不是 keydown 事件、無 code，於錄入 UI 另行忽略。
 */
export const RESERVED_CODES: ReadonlySet<string> = new Set([
  'Escape',
  'Digit1',
  'Digit2',
  'Digit3',
  'Delete',
  'Backspace',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
  'AltLeft',
  'AltRight',
  'ShiftLeft',
  'ShiftRight',
]);

/** 滑鼠鍵的保留字（存進 hotkey 欄）。 */
export const MOUSE_LEFT = 'MouseLeft';
export const MOUSE_RIGHT = 'MouseRight';

/** 判斷 hotkey 是否為滑鼠鍵。 */
export function isMouseHotkey(hotkey: string): boolean {
  return hotkey === MOUSE_LEFT || hotkey === MOUSE_RIGHT;
}

/** formatHotkey 用的翻譯函式型別（僅取 vue-i18n `t` 的最小簽章，避免相依整包 i18n）。 */
type Translate = (key: string, named?: Record<string, unknown>) => string;

/**
 * 把 event.code / 滑鼠保留字轉成擷取欄顯示的友善名。
 * 常見前綴（KeyX→X、DigitN→N）直接去前綴；其餘回傳原字串（已足夠辨識）。
 * 滑鼠左右鍵與數字鍵盤有語系差異，經 t 翻譯（呼叫端傳入 useI18n 的 t）。
 */
export function formatHotkey(hotkey: string, t: Translate): string {
  if (!hotkey) return '';
  if (hotkey === MOUSE_LEFT) return t('hotkey.mouseLeft');
  if (hotkey === MOUSE_RIGHT) return t('hotkey.mouseRight');
  if (hotkey.startsWith('Key')) return hotkey.slice(3);
  if (hotkey.startsWith('Digit')) return hotkey.slice(5);
  if (hotkey.startsWith('Numpad')) return t('hotkey.numpad', { n: hotkey.slice(6) });
  if (hotkey.startsWith('Arrow')) return hotkey.slice(5);
  return hotkey;
}
