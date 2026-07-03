// ============================================================
// reducedMotion.ts — 「減少動態效果」偏好偵測（單一來源）。
//
// 供 JS 端決定是否略過動畫（CSS 端各自用 @media 查詢即可）。
// 即時查詢而非模組載入時快取：使用者中途切換系統設定也能立即生效。
// ============================================================

/** 使用者是否偏好減少動態效果（prefers-reduced-motion: reduce）。 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
