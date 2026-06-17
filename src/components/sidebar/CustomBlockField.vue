<script setup lang="ts">
// ============================================================
// CustomBlockField.vue
// 側邊欄「自訂模板」展示區。
//
// 職責：
//   讀取 useSidebarStore 中的自訂模板，
//   依照目前三個角色槽位（slot 0/1/2）分組渲染。
//   未選角色的槽位顯示分組標題與「尚未選角」佔位文字。
//   已有模板的角色顯示可刪除的 BlockChip 列表。
//
// 嚴格限制：
//   本元件為靜態展示層，不處理拖曳邏輯。
//   拖曳能力由後續 Phase 的父層統一注入。
// ============================================================

import { computed } from 'vue'
import BlockChip from '@/components/ui/BlockChip.vue'
import { useSidebarStore } from '@/stores/useSidebarStore'
import type { SlotIndex } from '@/types/character'

// ── Props ───────────────────────────────────────────────────

interface SlotConfig {
  slotIndex: SlotIndex
  characterId: string | null
  characterName: string | null
  /** 角色屬性顏色，用於分組標題左側色條 */
  themeColor: string | null
}

interface Props {
  /** 目前三個角色槽位的設定（來自父層 SidebarPanel / 上層 store） */
  slots: [SlotConfig, SlotConfig, SlotConfig]
}

const props = defineProps<Props>()

// ── Emits ───────────────────────────────────────────────────

const emit = defineEmits<{
  /** 使用者點擊模板的刪除按鈕 */
  deleteTemplate: [templateId: string]
}>()

// ── Store ───────────────────────────────────────────────────

const sidebarStore = useSidebarStore()

// ── Computed ─────────────────────────────────────────────────

/**
 * 三個槽位各自的模板列表。
 * 若槽位無角色（characterId 為 null），則回傳空陣列。
 */
const slotTemplates = computed(() =>
  props.slots.map((slot) =>
    slot.characterId
      ? sidebarStore.getTemplatesByCharacter(slot.characterId)
      : []
  )
)
</script>

<template>
  <section class="custom-block-field">

    <!--
      三個角色分組：依 slotIndex 0 / 1 / 2 順序渲染
    -->
    <div
      v-for="(slot, idx) in slots"
      :key="slot.slotIndex"
      class="character-group"
    >
      <!-- ── 分組標題列 ──────────────────────────── -->
      <div class="group-header">
        <!-- 角色屬性色條 -->
        <span
          class="group-color-bar"
          :style="{ backgroundColor: slot.themeColor ?? 'rgba(255,255,255,0.18)' }"
          aria-hidden="true"
        />

        <!-- 角色名稱 -->
        <span class="group-label">
          {{ slot.characterName ?? '角色 ' + (slot.slotIndex + 1) }}
        </span>

        <!-- 模板數量角標（有模板時才顯示） -->
        <span
          v-if="slotTemplates[idx].length > 0"
          class="group-count"
          aria-label="`共 ${slotTemplates[idx].length} 個模板`"
        >
          {{ slotTemplates[idx].length }}
        </span>
      </div>

      <!-- ── 尚未選角：空白佔位 ─────────────────── -->
      <div
        v-if="!slot.characterId"
        class="empty-placeholder"
        aria-label="尚未選角，無法顯示自訂模板"
      >
        <span class="empty-text">尚未選角</span>
      </div>

      <!-- ── 已選角色、無模板：提示新增 ─────────── -->
      <div
        v-else-if="slotTemplates[idx].length === 0"
        class="empty-placeholder empty-placeholder--hint"
        aria-label="此角色尚無自訂模板"
      >
        <span class="empty-text">從主軸拖回區塊以新增模板</span>
      </div>

      <!-- ── 已有模板：渲染 BlockChip 列表 ────────── -->
      <div
        v-else
        class="chip-row"
        :aria-label="`${slot.characterName} 的自訂模板`"
      >
        <div
          v-for="template in slotTemplates[idx]"
          :key="template.id"
          class="chip-wrapper"
        >
          <BlockChip
            :label="template.label"
            :color="template.color"
          />

          <!-- 刪除按鈕 -->
          <button
            class="delete-btn"
            :aria-label="`刪除模板 ${template.label}`"
            @click.stop="emit('deleteTemplate', template.id)"
          >
            <svg
              class="delete-icon"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 2L10 10M10 2L2 10"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 分組底部分隔線（最後一組不顯示） -->
      <div
        v-if="idx < slots.length - 1"
        class="group-divider"
        aria-hidden="true"
      />
    </div>

  </section>
</template>

<style scoped>
/* ── 外層容器 ────────────────────────────────────────────── */
.custom-block-field {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
}

/* ── 角色分組 ────────────────────────────────────────────── */
.character-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── 分組標題 ────────────────────────────────────────────── */
.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

/* 左側角色屬性色條 */
.group-color-bar {
  width: 2px;
  height: 0.875rem;          /* 14px，與文字同高 */
  border-radius: 1px;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

/* 角色名稱 */
.group-label {
  flex: 1;
  font-size: 0.6875rem;      /* 11px */
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.40);
  user-select: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 模板數量角標 */
.group-count {
  font-size: 0.625rem;       /* 10px */
  font-weight: 600;
  line-height: 1;
  padding: 0.1875rem 0.375rem;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0;
  flex-shrink: 0;
}

/* ── 空白佔位 ────────────────────────────────────────────── */
.empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;       /* 36px，與 BlockChip 高度接近 */
  border: 1px dashed rgba(255, 255, 255, 0.10);
  border-radius: 3px;
}

/* 提示版（已選角但無模板） */
.empty-placeholder--hint {
  border-color: rgba(255, 255, 255, 0.07);
}

.empty-text {
  font-size: 0.6875rem;      /* 11px */
  color: rgba(255, 255, 255, 0.22);
  user-select: none;
  letter-spacing: 0.03em;
}

/* ── 模板 Chip 列 ────────────────────────────────────────── */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;             /* 6px */
}

/* 每個 Chip 的相對定位包裝，用於放置刪除按鈕 */
.chip-wrapper {
  position: relative;
  display: inline-flex;
}

/* ── 刪除按鈕 ────────────────────────────────────────────── */
.delete-btn {
  /* 定位在 Chip 右上角 */
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 10;

  /* 尺寸 */
  width: 1.125rem;           /* 18px */
  height: 1.125rem;
  padding: 0;
  border-radius: 50%;

  /* 視覺：預設隱藏，hover 時顯示 */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  pointer-events: none;

  /* 樣式 */
  background: rgba(30, 30, 35, 0.92);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: rgba(239, 68, 68, 0.80);
  cursor: pointer;
}

/* chip-wrapper hover 時顯示刪除按鈕 */
.chip-wrapper:hover .delete-btn,
.chip-wrapper:focus-within .delete-btn {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.20);
  border-color: rgba(239, 68, 68, 0.70);
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.92);
}

.delete-icon {
  width: 0.5rem;             /* 8px */
  height: 0.5rem;
}

/* ── 分組分隔線 ──────────────────────────────────────────── */
.group-divider {
  height: 1px;
  margin: 0.75rem 0 0.5rem;
  background: rgba(255, 255, 255, 0.06);
}

/* ── 無障礙：減少動畫 ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .delete-btn {
    transition: opacity 0.1s ease;
    transform: scale(1) !important;
  }
  .group-color-bar {
    transition: none;
  }
}
</style>
