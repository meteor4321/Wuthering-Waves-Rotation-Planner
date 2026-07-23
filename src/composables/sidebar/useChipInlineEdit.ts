// ============================================================
// useChipInlineEdit.ts — 側邊欄 chip 的行內命名／重命名共用邏輯。
//
// 職責：編輯狀態（editingId/draft）、輸入框寬度估算、聚焦全選、
//       提交／取消／鍵盤分派。GeneralBlockField 與 CustomBlockField 共用；
//       實際寫入（更名／刪空塊）由呼叫端以 callback 注入。
// 前提：呼叫端模板須有 class 為 chip-edit 的輸入框（樣式見 chipFieldShared.css）。
// ============================================================

import { ref, computed, watch, nextTick, type Ref } from 'vue';

// 輸入框寬度隨草稿即時撐開；ch＝monospace 半形字寬，全形（CJK）約佔 2ch，
// 逐字加總估寬，另補 letter-spacing（0.03em/字）累積量；空字串保底 1ch。
const WIDE_CHAR_RE =
  /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;

interface ChipInlineEditOptions {
  /** 面板根元素（查詢 .chip-edit 輸入框聚焦用）。 */
  rootRef: Ref<HTMLElement | null>;
  /** 提交草稿（空字串＝刪除等語意由呼叫端／store 處理）。 */
  commit: (id: string, label: string) => void;
  /** 取消編輯的收尾（如：剛新增未命名的空塊順手刪除）。 */
  onCancel: (id: string) => void;
}

export function useChipInlineEdit(options: ChipInlineEditOptions) {
  const editingId = ref<string | null>(null);
  const draft = ref('');

  /** 輸入框行內樣式：寬度隨草稿逐字估算即時撐開。 */
  const editStyle = computed(() => {
    let ch = 0;
    for (const c of draft.value) ch += WIDE_CHAR_RE.test(c) ? 2 : 1;
    const spacing = (draft.value.length * 0.03).toFixed(2);
    return { width: `calc(${Math.max(ch, 1)}ch + ${spacing}em + 1.4rem)` };
  });

  // 進入編輯後聚焦輸入框並全選（DOM 更新後執行）。
  watch(editingId, (id) => {
    if (!id) return;
    void nextTick(() => {
      const el = options.rootRef.value?.querySelector<HTMLInputElement>('.chip-edit');
      el?.focus();
      el?.select();
    });
  });

  function startEdit(id: string, currentLabel: string): void {
    editingId.value = id;
    draft.value = currentLabel;
  }

  // 避免 Enter 提交後 blur 再次提交造成重複（提交會清 editing → 觸發 blur）。
  let finishing = false;
  function commitEdit(): void {
    if (finishing || editingId.value === null) return;
    finishing = true;
    options.commit(editingId.value, draft.value);
    editingId.value = null;
    finishing = false;
  }

  function cancelEdit(): void {
    if (finishing || editingId.value === null) return;
    finishing = true;
    const id = editingId.value;
    editingId.value = null;
    finishing = false;
    options.onCancel(id);
  }

  function onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  }

  return { editingId, draft, editStyle, startEdit, commitEdit, cancelEdit, onEditKeydown };
}
