// ============================================================
// useSidebarDeleteKey.ts — 側邊欄面板的 Delete/Backspace 批量刪除攔截。
//
// 職責：以 capture 階段掛 window keydown——面板內有選取時優先刪面板項目，
//       並 stopPropagation 擋掉主軸全域快捷鍵（避免誤刪主軸選取區塊）；
//       卸載時移除監聽並清掉殘留選取。GeneralBlockField／CustomBlockField 共用。
// ============================================================

import { onMounted, onUnmounted } from 'vue';

interface SidebarDeleteKeyOptions {
  /** 面板目前是否有選取項目。 */
  hasSelection: () => boolean;
  /** 批量刪除選取項目。 */
  deleteSelected: () => void;
  /** 卸載時清掉殘留選取。 */
  clearSelection: () => void;
}

export function useSidebarDeleteKey(options: SidebarDeleteKeyOptions): void {
  function onKeydownCapture(event: KeyboardEvent): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    if (!options.hasSelection()) return;
    // 焦點在可輸入元素時放行（輸入框內的 Backspace 是在改字，不是刪項目）。
    const target = event.target as HTMLElement;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
    event.preventDefault();
    event.stopPropagation();
    options.deleteSelected();
  }

  onMounted(() => window.addEventListener('keydown', onKeydownCapture, true));
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydownCapture, true);
    options.clearSelection();
  });
}
