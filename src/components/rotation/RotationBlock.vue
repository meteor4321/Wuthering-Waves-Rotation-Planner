<script setup lang="ts">
// ============================================================
// RotationBlock.vue
// 主時間軸區塊的「智慧層（Smart Wrapper）」。
//
// 職責：
//   1. 對接 useRotationStore，透過 computed 監聽自身 entryId
//      是否存在於全域 selectedIds，藉此驅動 BlockChip 的選中視覺。
//   2. 封裝 mouseenter / mouseleave，本地管理 isHovered 狀態。
//   3. 封裝點擊選取邏輯：
//      - 單擊（Click）      → 清除其他選取，僅選中自身。
//      - Ctrl/Meta + Click  → 切換自身的選取狀態（多選）。
//   4. 將 isHovered / isSelected / isDanger 向下注入 BlockChip（嚴格無狀態）。
//
// 嚴格限制：
//   本元件只負責「選取」與「懸停」兩類互動。
//   拖曳邏輯（isDanger、elevation）由後續 Phase 在此元件上擴充。
//   刪除快捷鍵不在本元件處理，由全域 useKeyboardShortcuts 在 App.vue 統一監聽。
// ============================================================

import { ref, computed } from 'vue'
import BlockChip from '@/components/ui/BlockChip.vue'
import { useRotationStore } from '@/stores/useRotationStore'

// ── Props ────────────────────────────────────────────────────

interface Props {
  /** 對應 RotationEntry.id（=== InstanceBlock.id），用於查詢選取狀態 */
  entryId: string
  /** 區塊顯示文字，直接透傳給 BlockChip */
  label: string
  /** 區塊背景色 hex，直接透傳給 BlockChip */
  color: string
  /**
   * 危險狀態（拖曳至無效放置區時的警告樣式）。
   * Phase 4.2 尚無拖曳，此 prop 保留供後續 Phase 擴充時由父層傳入。
   */
  isDanger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDanger: false,
})

// ── Store ────────────────────────────────────────────────────

const rotationStore = useRotationStore()

// ── 本地狀態 ─────────────────────────────────────────────────

/** isHovered：由 mouseenter / mouseleave 本地驅動 */
const isHovered = ref(false)

// ── Computed ─────────────────────────────────────────────────

/**
 * isSelected：訂閱全域 selectedIds，O(1) 查找。
 * selectedIds 是 Set，has() 操作不觸發不必要的深層依賴追蹤。
 *
 * 注意：selectedIds 本身是 ref<Set>，Vue 對 Set 的響應性追蹤
 * 在 Vue 3.2+ 已完整支援（reactive Set 的 has/add/delete 皆可追蹤）。
 */
const isSelected = computed(() => rotationStore.isSelected(props.entryId))

// ── 事件處理 ──────────────────────────────────────────────────

/**
 * handleClick：處理選取邏輯。
 *
 * - 單擊（無修飾鍵）：清除所有選取並選中自身。
 * - Ctrl / Meta + Click：切換自身選取狀態（多重選取）。
 *   Mac 使用 Meta（⌘），Windows/Linux 使用 Ctrl。
 *   與 useKeyboardShortcuts 的跨平台判斷邏輯保持一致。
 */
function handleClick(event: MouseEvent): void {
  // 阻止事件冒泡至 track 背景，防止意外觸發取消選取
  event.stopPropagation()

  const isMac = navigator.userAgent.toUpperCase().includes('MAC OS')
  const isMultiSelectKey = isMac ? event.metaKey : event.ctrlKey

  if (isMultiSelectKey) {
    // 多選模式：已選中則取消，未選中則加入
    if (isSelected.value) {
      rotationStore.deselectBlock(props.entryId)
    } else {
      rotationStore.selectBlock(props.entryId, /* isMultiSelect */ true)
    }
  } else {
    // 單選模式：一律清除舊選取並選中自身
    rotationStore.selectBlock(props.entryId, /* isMultiSelect */ false)
  }
}
</script>

<template>
  <!--
    外層 div 負責接收滑鼠事件，不設自訂樣式。
    BlockChip 的 cursor 已設為 grab，此層保持 display: contents
    讓 BlockChip 直接參與父層的 flex 排列（不多一層盒模型）。
  -->
  <div
    class="rotation-block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
  >
    <BlockChip
      :label="label"
      :color="color"
      :is-hovered="isHovered && !isSelected"
      :is-selected="isSelected"
      :is-danger="isDanger"
    />
  </div>
</template>

<style scoped>
/*
  display: contents 讓此包裝 div 在佈局上「消失」，
  BlockChip 直接作為 Swimlane track flex 容器的子元素參與排列，
  不引入額外的盒模型或間距。
*/
.rotation-block {
  display: contents;
}
</style>