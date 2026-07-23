<script setup lang="ts">
// GeneralBlockField.vue — 側邊欄「通用預設區塊」展示與管理區。
// 資料改由 useGeneralBlockStore 提供（可增刪改、持久化，見 store 註解）。
// 支援：拖到主軸、＋新增後即命名、雙擊重命名、點擊選取（Ctrl 多選）、
//       刪除鈕 / Delete 鍵刪除、多選整組拖曳。顏色固定中性灰、不可改。
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import BlockChip from '@/components/ui/BlockChip.vue'
import DragCountBadge from '@/components/ui/DragCountBadge.vue'
import { useGeneralBlockStore } from '@/stores/useGeneralBlockStore'
import { useSidebarDragList } from '@/composables/blockDrag/useSidebarDragList'
import { useChipInlineEdit } from '@/composables/sidebar/useChipInlineEdit'
import { useSidebarDeleteKey } from '@/composables/sidebar/useSidebarDeleteKey'
import type { GeneralBlock } from '@/types/block'

const store = useGeneralBlockStore()

// VueDraggable 需綁一份可寫副本（pull:'clone' 不會排序原清單）；與 store 同步。
const localBlocks = ref<GeneralBlock[]>([...store.blocks])
watch(
  () => store.blocks,
  (next) => { localBlocks.value = [...next] },
  { deep: true },
)

// 拖曳樣板共用 useSidebarDragList；結束時把本地副本自 store 重新同步。
const { dragOptions, cloneToPlaceholder, handleDragEnd, onSidebarDragStart } =
  useSidebarDragList({ restore: () => { localBlocks.value = [...store.blocks] } })

function handleDragStart(event: { oldIndex?: number }): void {
  const block = localBlocks.value[event.oldIndex ?? -1]
  if (!block) return
  // 抓起的區塊在多選集合且選取 >1 → 整組依選取先後順序一起拖；否則只拖這一個。
  if (store.isSelected(block.id) && store.selectedIds.size > 1) {
    const ordered = [...store.selectedIds]
      .map((id) => store.blocks.find((b) => b.id === id))
      .filter((b): b is GeneralBlock => !!b)
    onSidebarDragStart(block, ordered)
  } else {
    onSidebarDragStart(block)
  }
}

// ── 行內命名 / 重命名（共用 useChipInlineEdit）───────────────────
const rootRef = ref<HTMLElement | null>(null)
const { editingId, draft, editStyle, startEdit, commitEdit, onEditKeydown } =
  useChipInlineEdit({
    rootRef,
    commit: (id, label) => store.updateLabel(id, label), // 空字串＝刪除（store 內處理）
    // 若是剛新增卻未命名（store 內仍為空 label）→ 順手刪除避免殘留空塊。
    onCancel: (id) => {
      const b = store.blocks.find((x) => x.id === id)
      if (b && b.label.trim() === '') store.deleteBlock(id)
    },
  })

// ＋ 新增：建一個空 label 區塊，立即進入命名。
function addAndEdit(): void {
  const id = store.addBlock()
  startEdit(id, '')
}
// ── 點擊選取（Ctrl/Cmd 多選；再點同一個取消） ─────────────────
function handleClick(block: GeneralBlock, event: MouseEvent): void {
  if (editingId.value !== null) return
  store.toggleSelection(block.id, event.ctrlKey || event.metaKey)
}

function handleDelete(id: string): void {
  store.deleteBlock(id)
}

// Delete/Backspace 批量刪除（capture 攔截、卸載清選取）：共用 useSidebarDeleteKey。
useSidebarDeleteKey({
  hasSelection: () => store.selectedIds.size > 0,
  deleteSelected: () => store.deleteSelected(),
  clearSelection: () => store.clearSelection(),
})
</script>

<template>
  <section ref="rootRef" class="general-block-field">
    <h3 class="field-title">{{ $t('sidebar.generalBlocks') }}</h3>
    <div class="chip-row">
      <VueDraggable
        v-model="localBlocks"
        item-key="id"
        tag="div"
        class="chip-row__draggable"
        :clone="cloneToPlaceholder"
        v-bind="dragOptions"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <div
          v-for="block in localBlocks"
          :key="block.id"
          class="chip-wrapper"
          @click.stop="handleClick(block, $event)"
          @dblclick.stop="startEdit(block.id, block.label)"
        >
          <!-- 命名 / 重命名：以輸入框取代 chip。 -->
          <input
            v-if="editingId === block.id"
            v-model="draft"
            class="chip-edit"
            :style="editStyle"
            type="text"
            @keydown="onEditKeydown"
            @blur="commitEdit"
            @click.stop
            @dblclick.stop
            @mousedown.stop
            @pointerdown.stop
          />
          <template v-else>
            <BlockChip
              :label="block.label"
              :color="block.color"
              :is-selected="store.isSelected(block.id)"
              compact
            />
            <!-- 多選拖曳數量徽章：樣式與顯示機制見共用元件 DragCountBadge。 -->
            <DragCountBadge
              v-if="store.isSelected(block.id) && store.selectedIds.size > 1"
              :count="store.selectedIds.size"
            />

            <button
              class="delete-btn"
              :aria-label="$t('sidebar.deleteGeneralBlock', { label: block.label })"
              @click.stop="handleDelete(block.id)"
              @mousedown.stop
              @pointerdown.stop
            >
              <svg class="delete-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </template>
        </div>

        <!-- ＋ 新增鈕：非 .chip-wrapper 故不被當可拖項（draggable:'.chip-wrapper'）。 -->
        <button
          class="add-block-btn"
          type="button"
          :aria-label="$t('sidebar.addGeneralBlock')"
          :title="$t('sidebar.addGeneralBlock')"
          @click.stop="addAndEdit"
        >
          ＋
        </button>
      </VueDraggable>
    </div>
  </section>
</template>

<style scoped>
.general-block-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;         /* 標題與區塊列之間的間距 */
  padding: 0.75rem 0;  /* 上下呼吸空間，左右由父層 SidebarPanel 控制 */
}
/* ── 區塊標題 ── */
.field-title {
  margin: 0;
  font-size: 0.6875rem;    /* 11px，刻意縮小以不搶區塊視覺焦點 */
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);  /* 極淡，作為標籤而非主要內容 */
  user-select: none;
}
/* ── 橫向換行排列 ── */
.chip-row {
  display: flex;
  flex-wrap: wrap;    /* 超出寬度自動換行 */
  gap: 0.375rem;      /* 區塊間距：6px，緊湊但有呼吸感 */
}
/* 拖曳容器本身需有真實 layout box：display:contents 會移除盒模型，
   使 SortableJS forceFallback 的浮動分身定位數學算錯（分身幾乎不跟手，p7）。
   改用與 .chip-row 相同的 flex-wrap 排列，視覺一致但保有盒模型。
   align-items:center 讓 ＋ 鈕與 chip 垂直置中對齊。 */
.chip-row__draggable {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
}

/* chip 外層包裝：無 transform 盒模型（拖曳分身放大套在內層 chip 盒上），
   並作為刪除鈕的定位基準。 */
.chip-wrapper {
  position: relative;
  display: inline-flex;
}

/* 行內命名輸入框／＋新增鈕／刪除鈕樣式抽至共用 chipFieldShared.css。 */
</style>

<!-- 共用樣式：行內命名輸入框、＋新增鈕、刪除鈕（scoped 由本元件自帶）。 -->
<style scoped src="./chipFieldShared.css"></style>
