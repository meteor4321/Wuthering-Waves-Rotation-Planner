// ============================================================
// deepClone.ts — 可序列化物件的深拷貝。
//
// 用途：從側邊欄拖入主軸時，讓每個 InstanceBlock 成為獨立記憶體物件，
//       避免共用參考導致互相污染。
// 原理：優先 structuredClone；遇 Vue reactive proxy 丟 DataCloneError 時，
//       退回 JSON 序列化（可「讀穿」proxy，本專案資料皆純 JSON 可序列化）。
// ============================================================

/** 深拷貝任意可序列化物件。 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch {
      return JSON.parse(JSON.stringify(obj)) as T;
    }
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}
