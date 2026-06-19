<script setup lang="ts">
// ============================================================
// Swimlane.vue
// 單一角色的橫向時間軸軌道。
//
// Phase 4.3 異動：
//   1. 引入 <VueDraggable> 包裹區塊序列，取代純 v-for 靜態渲染。
//   2. 使用 v-model 綁定「本地緩衝陣列」localEntries（非 props.entries
//      本身）：vue-draggable-plus 無論是否用 v-model，內部都會直接
//      mutate 綁定的陣列物件，若直接綁定唯讀的 props.entries 會與
//      Vue 的渲染追蹤脫鉤。localEntries 由本元件自己持有，放給套件
//      自由操作；真正的真相來源仍是 useRotationStore——@add/@update
//      會呼叫 useBlockDrag 的 handler 換算全域索引並寫回 store，
//      待 store 更新、props.entries 重新計算後，watch 會立即把
//      localEntries 校正回真相內容（詳見下方 localEntries 宣告處註解）。
//   3. group / put（角色匹配）/ ghostClass 等規則統一由
//      useBlockDrag.getRotationSortableOptions(slotIndex) 提供，
//      本元件不重複定義拖曳規則。
// ============================================================

import { ref, computed, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import RotationBlock from '@/components/rotation/RotationBlock.vue'
import { useRotationStore } from '@/stores/useRotationStore'
import { useBlockDrag, type SortableEventLike } from '@/composables/useBlockDrag'
import type { Character } from '@/types/character'
import type { RotationEntry } from '@/types/rotation'

// ── Props ────────────────────────────────────────────────────

interface Props {
  /** 此泳道對應的角色。null 代表槽位尚未選角，Header 顯示佔位狀態。 */
  character: Character | null
  /** 槽位索引（0 / 1 / 2） */
  slotIndex: 0 | 1 | 2
  /** 此泳道的區塊序列（已由父層 RotationBoard 依 slotIndex 過濾完畢） */
  entries: RotationEntry[]
}

const props = defineProps<Props>()

// ── Store / Composable ──────────────────────────────────────

const rotationStore = useRotationStore()
const {
  dragState,
  onRotationDragStart,
  handleSidebarToLaneDrop,
  handleSameLaneDrop,
  handleDragEnd,
  getRotationSortableOptions,
} = useBlockDrag()

/**
 * localEntries：VueDraggable 實際操作的「本地緩衝陣列」。
 */
const localEntries = ref<RotationEntry[]>([...props.entries])

watch(
  () => props.entries,
  (newEntries) => {
    localEntries.value = [...newEntries]
  }
)

/**
 * dragOptions：本泳道專屬的 SortableJS 設定（group/put/ghostClass...）。
 * 直接透傳 useBlockDrag 集中管理的規則，本元件不重複定義。
 */
const dragOptions = computed(
  (): Record<string, unknown> => getRotationSortableOptions(props.slotIndex)
)

/**
 * getEntryFromDragEvent：依 SortableJS 事件的舊索引反查對應的 RotationEntry。
 *
 * 僅在「同泳道內拖曳起點（@start）」場景使用：
 * 此時尚未發生任何 splice，localEntries 內容等同本泳道原始序列，
 * 故 event.oldDraggableIndex（不計入不可拖曳元素時優先採用）
 * 或 event.oldIndex 可直接對應 localEntries 的陣列索引，
 * 不需要再做全域換算（全域換算交由 useBlockDrag 內部處理）。
 */
function getEntryFromDragEvent(event: SortableEventLike): RotationEntry | undefined {
  const localIndex = event.oldDraggableIndex ?? event.oldIndex ?? -1
  return localEntries.value[localIndex]
}

// ── 事件處理 ──────────────────────────────────────────────────

/**
 * handleDragStart：拖曳起點。
 * 僅當拖曳來源為「本泳道既有區塊」時才需要記錄；
 * 從側邊欄拖入的起點記錄已在 sidebar 欄位元件呼叫 onSidebarDragStart 完成。
 */
function handleDragStart(event: SortableEventLike): void {
  const entry = getEntryFromDragEvent(event)
  if (entry) onRotationDragStart(entry)
}

/** handleAdd：側邊欄拖入本泳道（onAdd） */
function handleAdd(event: SortableEventLike): void {
  handleSidebarToLaneDrop(event, props.slotIndex)
}

/** handleUpdate：本泳道內排序（onUpdate） */
function handleUpdate(event: SortableEventLike): void {
  handleSameLaneDrop(event, props.slotIndex)
}

/** handleEnd：拖曳結束的統一決策點（序列化 / 拖曳刪除 / 安全過關），交由 useBlockDrag 分流 */
function handleEnd(): void {
  handleDragEnd()
}

// ── 既有邏輯（Phase 4.2，未變動）──────────────────────────────

const insertAfterIndex = computed<number>(() => {
  const globalEntries = rotationStore.entries
  for (let i = globalEntries.length - 1; i >= 0; i--) {
    if (globalEntries[i].slotIndex === props.slotIndex) {
      return i
    }
  }
  return globalEntries.length - 1
})

function handleAddBlock(): void {
  if (!props.character) return
  rotationStore.addFreeformBlock(
    '',
    props.character.themeColor,
    props.slotIndex,
    props.character.id,
    insertAfterIndex.value,
  )
}

function handleTrackClick(): void {
  rotationStore.clearSelection()
}
</script>

<template>
  <div
    class="swimlane"
    :class="`swimlane--slot-${slotIndex}`"
    :aria-label="character ? `${character.nameZh} 的輸出軸` : `槽位 ${slotIndex + 1}（未選角）`"
  >

    <!-- ── 左側：固定 Header ────────────────────────────────── -->
    <div
      class="swimlane__header"
      :style="character ? { '--lane-color': character.themeColor } : {}"
      aria-hidden="false"
    >
      <div
        class="header__color-bar"
        :style="{ backgroundColor: character?.themeColor ?? 'rgba(255,255,255,0.15)' }"
        aria-hidden="true"
      />

      <div class="header__info">
        <span
          class="header__dot"
          :style="{ backgroundColor: character?.themeColor ?? 'rgba(255,255,255,0.25)' }"
          aria-hidden="true"
        />
        <span
          class="header__name"
          :class="{ 'header__name--empty': !character }"
        >
          {{ character?.nameZh ?? '未選角' }}
        </span>
      </div>

      <span
        v-if="character"
        class="header__element"
        :style="{ color: character.themeColor }"
        aria-label="`屬性：${character.element}`"
      >
        {{ character.element }}
      </span>
    </div>

    <!-- ── 右側：可橫向捲動的區塊軌道 ─────────────────────── -->
    <div
      class="swimlane__track"
      role="list"
      :aria-label="character ? `${character.nameZh} 的區塊序列` : '區塊序列'"
      @click="handleTrackClick"
    >
      <div class="track__inner">

        <div
          v-if="!character"
          class="track__empty-hint"
          aria-label="請先於上方選擇角色"
        >
          請先選擇角色
        </div>

        <template v-else>
          <!--
            拖曳區塊序列：
            - v-model 綁定本元件自己持有的 localEntries（緩衝陣列），
              而非父層傳入的唯讀 props.entries，避免套件直接 mutate
              非自有參考導致 VDOM/真實 DOM 脫鉤。
            - item-key 對應 RotationEntry.id，確保 Vue keyed-diff
              在 watch 校正 localEntries 後能正確比對、平滑過渡。
            - class="track__draggable" 搭配 display: contents，
              讓拖曳容器在版面上「消失」，子層 RotationBlock 直接
              參與 .track__inner 的 flex 排列，不多一層盒模型。
          -->
          <VueDraggable
            v-model="localEntries"
            item-key="id"
            tag="div"
            class="track__draggable"
            v-bind="dragOptions"
            @start="handleDragStart"
            @add="handleAdd"
            @update="handleUpdate"
            @end="handleEnd"
          >
            <RotationBlock
              v-for="entry in localEntries"
              :key="entry.id"
              :entry-id="entry.id"
              :label="entry.block.label"
              :color="entry.block.color || character.themeColor"
              role="listitem"
            />
          </VueDraggable>

          <!--
            空泳道拖放提示：
            僅在「正在拖曳中」且「本泳道目前沒有任何區塊」時顯示，
            對應 SDD 預期落點提示：「如果該輸出軸為空，就在輸出軸上呈現提示效果」。
          -->
          <div
            v-if="localEntries.length === 0 && dragState.isDragging"
            class="track__empty-dropzone"
            aria-hidden="true"
          >
            拖放至此
          </div>

          <div class="track__tail">
            <button
              class="track__add-btn"
              type="button"
              :aria-label="`在 ${character.nameZh} 的輸出軸末尾新增區塊`"
              :title="`新增區塊至 ${character.nameZh}`"
              @click.stop="handleAddBlock"
            >
              ＋
            </button>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── CSS 自訂屬性 ────────────────────────────────────────── */
.swimlane {
  --header-width: 6rem;
  --lane-height: 3.5rem;
  --lane-color: rgba(255, 255, 255, 0.18);
  --track-gap: 0.375rem;
  --track-px: 0.75rem;

  display: flex;
  align-items: stretch;
  height: var(--lane-height);
  width: 100%;

  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.swimlane:last-child {
  border-bottom: none;
}

.swimlane--slot-0 { background: rgba(255, 255, 255, 0.020); }
.swimlane--slot-1 { background: rgba(255, 255, 255, 0.013); }
.swimlane--slot-2 { background: rgba(255, 255, 255, 0.006); }

/* ══════════════════════════════════════════════════════════
   左側 Header
   ══════════════════════════════════════════════════════════ */
.swimlane__header {
  position: relative;
  flex-shrink: 0;
  width: var(--header-width);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.125rem;
  padding: 0 0.625rem;

  border-right: 1px solid rgba(255, 255, 255, 0.07);

  z-index: 1;
  background: inherit;
}

.header__color-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  transition: background-color 0.25s ease;
}

.header__info {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  width: 100%;
  overflow: hidden;
}

.header__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.25s ease;
}

.header__name {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
  line-height: 1;
}

.header__name--empty {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 400;
  font-style: italic;
}

.header__element {
  font-size: 0.5625rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  opacity: 0.65;
  user-select: none;
  line-height: 1;
}

/* ══════════════════════════════════════════════════════════
   右側 Track（可橫向捲動）
   ══════════════════════════════════════════════════════════ */
.swimlane__track {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: none;
}

.swimlane__track::-webkit-scrollbar {
  display: none;
}

.track__inner {
  display: flex;
  align-items: center;
  gap: var(--track-gap);
  height: 100%;
  padding: 0 var(--track-px);
  width: max-content;
  min-width: 100%;
}

/*
  拖曳容器：display: contents 讓 <VueDraggable> 的根節點在版面上「消失」，
  子層 RotationBlock 直接參與 .track__inner 的 flex 排列。
  注意：display: contents 元素本身無盒模型，因此 SortableJS 動態掛載的
  ghostClass / chosenClass 若要顯示陰影或位移，必須作用在其「子層」
  （見全域 src/style.css 的 .sortable-chosen > * 等選擇器），
  不能直接對 .track__draggable 本身套用視覺樣式。
*/
.track__draggable {
  display: contents;
}

/* 空泳道拖放提示 */
.track__empty-dropzone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 0.5rem);
  margin: 0 0.25rem;
  border: 1px dashed rgba(125, 211, 252, 0.45);
  border-radius: 6px;
  background: rgba(125, 211, 252, 0.06);
  color: rgba(125, 211, 252, 0.65);
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  user-select: none;
  pointer-events: none;
}

.track__tail {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 0.25rem;
  padding-right: var(--track-px);
}

.track__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: transparent;
  color: rgba(255, 255, 255, 0.28);

  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;

  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;
}

.track__add-btn:hover {
  border-color: rgba(255, 255, 255, 0.45);
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
}

.track__add-btn:active {
  background: rgba(255, 255, 255, 0.10);
  transform: scale(0.93);
}

.track__empty-hint {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 0.05em;
  user-select: none;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .header__color-bar,
  .header__dot {
    transition: none;
  }
}
</style>
