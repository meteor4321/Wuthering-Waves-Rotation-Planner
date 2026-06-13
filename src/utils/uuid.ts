// ============================================================
// uuid.ts
// UUID v4 生成工具。
//
// 【為什麼不用套件？】
// 現代瀏覽器（Chrome 92+、Firefox 90+、Safari 15.4+）原生支援
// crypto.randomUUID()，效能與隨機性均優於 Math.random() 的實作，
// 且無需引入額外依賴（0 bundle size）。
// ============================================================

/**
 * generateUUID：產生一個符合 RFC 4122 標準的 UUID v4 字串。
 *
 * 輸出格式範例：'110e8400-e29b-41d4-a716-446655440000'
 *
 * 【回退策略（Fallback）】
 * 若執行環境不支援 crypto.randomUUID()（極少數舊版瀏覽器），
 * 則使用 crypto.getRandomValues() 的手動實作作為回退，
 * 確保在所有目標環境中都能安全運行。
 *
 * @returns UUID v4 字串
 */
export function generateUUID(): string {
  // 優先使用原生 API（安全且高效）
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // 回退：使用 crypto.getRandomValues() 手動組裝 UUID v4
  // UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // 其中 '4' 代表版本號，'y' 的高兩位固定為 '10'（即 8、9、a、b 之一）
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 設定版本位（第 6 個 byte 的高 4 位設為 0100，即版本 4）
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // 設定變體位（第 8 個 byte 的高 2 位設為 10）
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // 將 16 個 byte 轉換為 hex 字串，並在正確位置插入連字號
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}