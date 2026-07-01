// ============================================================
// uuid.ts — UUID v4 生成。
//
// 原理：優先用原生 crypto.randomUUID()（現代瀏覽器，0 依賴、隨機性佳）；
//       不支援時以 crypto.getRandomValues() 手動組裝 v4 作為回退。
// ============================================================

/** 產生 RFC 4122 UUID v4 字串。 */
export function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // 回退：手動組裝。version 位設 4、variant 高兩位設 10。
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

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
