<script setup lang="ts">
// ============================================================
// SidebarPanel.vue
// 側邊欄主容器。
//
// 職責：
//   1. 提供 Segmented Control（分段控制項）在「預設」與「自訂」Tab 之間切換。
//   2. 在「預設」Tab 渲染 DefaultBlockField.vue。
//   3. 在「自訂」Tab 渲染 CustomBlockField.vue，並依槽位設定傳入 Props。
//   4. 轉發 CustomBlockField 的 deleteTemplate 事件至 useSidebarStore。
//
// 版面結構：
//   ┌─────────────────────────────┐
//   │  [預設]  [自訂]  ← Segmented Control  │
//   ├─────────────────────────────┤
//   │  DefaultBlockField          │  (Tab = 'default')
//   │  或                         │
//   │  CustomBlockField           │  (Tab = 'custom')
//   └─────────────────────────────┘
//
// 嚴格限制：
//   拖曳邏輯留給後續 Phase 注入，本元件只做靜態殼層與切換。
// ============================================================

import { ref } from 'vue'
import DefaultBlockField from '@/components/sidebar/DefaultBlockField.vue'
import CustomBlockField from '@/components/sidebar/CustomBlockField.vue'
import { useSidebarStore } from '@/stores/useSidebarStore'
import type { SlotIndex } from '@/types/character'

// ── 型別 ────────────────────────────────────────────────────

type TabId = 'default' | 'custom'

interface SlotConfig {
  slotIndex: SlotIndex
  characterId: string | null
  characterName: string | null
  themeColor: string | null
}

// ── Props ────────────────────────────────────────────────────

interface Props {
  /** 目前三個角色槽位的設定，由上層（App.vue 或 layout 元件）傳入 */
  slots: [SlotConfig, SlotConfig, SlotConfig]
}

const props = defineProps<Props>()

// ── Store ────────────────────────────────────────────────────

const sidebarStore = useSidebarStore()

// ── 本地狀態 ─────────────────────────────────────────────────

/** 目前顯示的 Tab */
const activeTab = ref<TabId>('default')

// ── Tab 設定 ─────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'default', label: '預設' },
  { id: 'custom',  label: '自訂' },
]

// ── 事件處理 ──────────────────────────────────────────────────

function handleDeleteTemplate(templateId: string): void {
  sidebarStore.deleteTemplate(templateId)
}
</script>

<template>
  <aside class="sidebar-panel" aria-label="區塊側邊欄">

    <!-- ── Segmented Control ────────────────────────────────── -->
    <div class="segmented-control" role="tablist" aria-label="切換區塊類型">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="segment-btn"
        :class="{ 'segment-btn--active': activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tabpanel-${tab.id}`"
        :id="`tab-${tab.id}`"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Tab 面板 ─────────────────────────────────────────── -->
    <div class="tab-content">

      <!-- 預設區塊面板 -->
      <div
        v-show="activeTab === 'default'"
        id="tabpanel-default"
        role="tabpanel"
        aria-labelledby="tab-default"
      >
        <DefaultBlockField />
      </div>

      <!-- 自訂模板面板 -->
      <div
        v-show="activeTab === 'custom'"
        id="tabpanel-custom"
        role="tabpanel"
        aria-labelledby="tab-custom"
      >
        <CustomBlockField
          :slots="props.slots"
          @delete-template="handleDeleteTemplate"
        />
      </div>

    </div>

  </aside>
</template>

<style scoped>
/* ── 側邊欄容器 ──────────────────────────────────────────── */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* 左右內距由此元件統一控制，子元件不設左右 padding */
  padding: 0.75rem 0.875rem;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── Segmented Control 外框 ────────────────────────────────── */
.segmented-control {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.875rem;  /* 14px，拉開與 Tab 內容的距離 */
  flex-shrink: 0;           /* 不因內容過多而被壓縮 */
}

/* ── 單個分段按鈕 ────────────────────────────────────────── */
.segment-btn {
  flex: 1;
  height: 1.75rem;           /* 28px */
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;

  font-size: 0.75rem;        /* 12px */
  font-weight: 500;
  letter-spacing: 0.04em;

  /* 預設（未選中）：透明底 + 淡色文字 */
  background: transparent;
  color: rgba(255, 255, 255, 0.38);

  /* 過渡 */
  transition:
    background 0.15s ease,
    color      0.15s ease,
    box-shadow 0.15s ease;
}

.segment-btn:hover:not(.segment-btn--active) {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.60);
}

/* ── 啟用分段（Active）──────────────────────────────────── */
.segment-btn--active {
  /* 凸起感：深色填充 + 細邊框 */
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.90);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ── Tab 內容區 ──────────────────────────────────────────── */
.tab-content {
  flex: 1;
  min-height: 0;
}

/* ── 無障礙：鍵盤 focus 樣式 ─────────────────────────────── */
.segment-btn:focus-visible {
  outline: 2px solid rgba(34, 211, 238, 0.60);
  outline-offset: 1px;
}

/* ── 無障礙：減少動畫 ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .segment-btn {
    transition: none;
  }
}
</style>
