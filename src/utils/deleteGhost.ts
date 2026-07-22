// ============================================================
// deleteGhost.ts — 刪除淡出克隆（delete-ghost）共用工具。
//
// 用途：區塊刪除採「狀態即刪」（版面立即收合、連刪不卡），消失動畫交給
//       脫離版面、固定在原螢幕位置的克隆補播；熱鍵模式與快捷鍵/剪下刪除共用。
// 技術：克隆 .rotation-block 掛到 body，套 .hotkey-delete-fade（style.css）
//       播淡出後自移除。reduce motion 則完全不播。
// ============================================================

import { prefersReducedMotion } from './reducedMotion';

/** 克隆的移除時限（與 style.css 的 .hotkey-delete-fade 動畫時長對齊＋保險餘裕）。 */
const DELETE_GHOST_MS = 520;

/** 為一組即將被刪除的區塊各播一個淡出克隆；必須在區塊自 DOM 移除「之前」呼叫。 */
export function playDeleteGhosts(entryIds: string[]): void {
  if (prefersReducedMotion()) return;
  for (const id of entryIds) {
    const el = document.querySelector<HTMLElement>(
      `.rotation-block[data-entry-id="${id}"]`,
    );
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const node = el.cloneNode(true) as HTMLElement;
    // 若刪的是剛插入、進場動畫未播畢的區塊，克隆會沿用 is-entering 而重播落下動畫，
    // 疊在淡出上形成「邊掉邊淡」的怪異畫面——移除該 class，讓克隆只單純淡出。
    node.classList.remove('is-entering');
    const wrapper = document.createElement('div');
    wrapper.className = 'hotkey-delete-fade';
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.top = `${rect.top}px`;
    wrapper.appendChild(node);
    document.body.appendChild(wrapper);
    window.setTimeout(() => wrapper.remove(), DELETE_GHOST_MS);
  }
}
