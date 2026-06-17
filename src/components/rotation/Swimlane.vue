<script setup lang="ts">
// ============================================================
// Swimlane.vue
// 單一角色的橫向時間軸軌道（靜態 UI 殼層）。
//
// 版面結構：
//   ┌──────────┬──────────────────────────────────────────────┐
//   │  Header  │  Track（可橫向捲動）                           │
//   │  角色名稱 │  [BlockChip] [BlockChip] [BlockChip] …       │
//   │  屬性色點 │                                              │
//   └──────────┴──────────────────────────────────────────────┘
//
// 職責：
//   1. 左側 Header 固定顯示角色名稱（nameZh）與屬性色點（themeColor）。
//   2. 右側 Track 橫向排列 BlockChip，超出寬度時可橫向捲動。
//   3. 純靜態殼層：不連接任何 store，不處理拖曳邏輯。
//      測試用的 BlockChip 以 hardcode 寫入，待後續 Phase 替換為動態資料。
//
// 嚴格限制：
//   本元件不引入任何 store 或 composable。
//   拖曳邏輯由後續 Phase 統一注入。
// ============================================================

import { computed } from 'vue'
import BlockChip from '@/components/ui/BlockChip.vue'
import type { Character } from '@/types/character'
import type { RotationEntry } from '@/types/rotation'

// ── Props ────────────────────────────────────────────────────

interface Props {
  /**
   * 此泳道對應的角色。
   * null 代表槽位尚未選角，Header 顯示佔位狀態。
   */
  character: Character | null

  /**
   * 槽位索引（0 / 1 / 2），用於視覺上區分三條軌道的背景深淺。
   */
  slotIndex: 0 | 1 | 2

  /**
   * 此泳道的區塊序列（已由父層過濾為僅屬於此 slotIndex 的條目）。
   * 未傳入時退回內建測試 STUB_BLOCKS，方便獨立開發時預覽。
   */
  entries?: RotationEntry[]
}

const props = defineProps<Props>()

// ── 測試用假資料（entries prop 未傳入時的 fallback）────────────

/**
 * STUB_ENTRIES：模擬 RotationEntry 結構的硬編碼資料。
 * RotationBoard 傳入真實 entries 後即不再使用。
 */
const STUB_ENTRIES: RotationEntry[] = [
  { id: 's1',  slotIndex: props.slotIndex, block: { id: 's1',  label: 'A',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's2',  slotIndex: props.slotIndex, block: { id: 's2',  label: '3AE', color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's3',  slotIndex: props.slotIndex, block: { id: 's3',  label: 'E',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's4',  slotIndex: props.slotIndex, block: { id: 's4',  label: 'R',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's5',  slotIndex: props.slotIndex, block: { id: 's5',  label: 'A',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's6',  slotIndex: props.slotIndex, block: { id: 's6',  label: 'EQ',  color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's7',  slotIndex: props.slotIndex, block: { id: 's7',  label: 'Z',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's8',  slotIndex: props.slotIndex, block: { id: 's8',  label: '3A',  color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's9',  slotIndex: props.slotIndex, block: { id: 's9',  label: 'D',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
  { id: 's10', slotIndex: props.slotIndex, block: { id: 's10', label: 'R',   color: '', source: 'instance', characterId: '', originId: null, tags: [] } },
]

/** 實際渲染使用的條目：優先採用外部傳入的 entries */
const displayEntries = computed(() =>
  props.entries !== undefined ? props.entries : STUB_ENTRIES
)
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
      <!-- 頂端屬性色條（角色主題色） -->
      <div
        class="header__color-bar"
        :style="{ backgroundColor: character?.themeColor ?? 'rgba(255,255,255,0.15)' }"
        aria-hidden="true"
      />

      <!-- 角色資訊 -->
      <div class="header__info">
        <!-- 屬性色點 -->
        <span
          class="header__dot"
          :style="{ backgroundColor: character?.themeColor ?? 'rgba(255,255,255,0.25)' }"
          aria-hidden="true"
        />

        <!-- 角色名稱 / 未選角佔位 -->
        <span
          class="header__name"
          :class="{ 'header__name--empty': !character }"
        >
          {{ character?.nameZh ?? '未選角' }}
        </span>
      </div>

      <!-- 屬性標籤（有角色時顯示） -->
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
    >
      <!-- 軌道內層：撐開橫向寬度，允許捲動 -->
      <div class="track__inner">

        <!-- 無角色且無區塊：整條軌道顯示 Drop 引導提示 -->
        <div
          v-if="!character"
          class="track__empty-hint"
          aria-label="請先於上方選擇角色"
        >
          請先選擇角色
        </div>

        <!-- 有角色：渲染區塊序列（entries prop 有值時為真實資料，否則為 STUB） -->
        <template v-else>
          <div
            v-for="entry in displayEntries"
            :key="entry.id"
            class="track__chip-wrapper"
            role="listitem"
          >
            <BlockChip
              :label="entry.block.label"
              :color="entry.block.color || character.themeColor"
            />
          </div>

          <!-- 尾端空白佔位：確保最後一個 Chip 右側有呼吸空間，
               也作為未來「拖曳落點」的視覺錨點 -->
          <div class="track__tail" aria-hidden="true" />
        </template>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── CSS 自訂屬性 ────────────────────────────────────────── */
.swimlane {
  --header-width: 6rem;       /* 96px，固定 Header 寬度 */
  --lane-height: 3.5rem;      /* 56px，單條泳道高度 */
  --lane-color: rgba(255, 255, 255, 0.18); /* 預設色，由 :style 覆寫 */
  --track-gap: 0.375rem;      /* 6px，Chip 間距 */
  --track-px: 0.75rem;        /* 12px，軌道左右內距 */

  /* ── 版面：水平分欄 ─── */
  display: flex;
  align-items: stretch;
  height: var(--lane-height);
  width: 100%;

  /* ── 軌道間分隔線 ─── */
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 最後一條泳道不顯示底部分隔線 */
.swimlane:last-child {
  border-bottom: none;
}

/* 不同槽位的背景微差（製造深淺分層感） */
.swimlane--slot-0 { background: rgba(255, 255, 255, 0.020); }
.swimlane--slot-1 { background: rgba(255, 255, 255, 0.013); }
.swimlane--slot-2 { background: rgba(255, 255, 255, 0.006); }

/* ══════════════════════════════════════════════════════════
   左側 Header
   ══════════════════════════════════════════════════════════ */
.swimlane__header {
  position: relative;         /* 供頂端色條 absolute 定位 */
  flex-shrink: 0;
  width: var(--header-width);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.125rem;
  padding: 0 0.625rem;        /* 10px 左右內距 */

  /* 右側細線與軌道分隔 */
  border-right: 1px solid rgba(255, 255, 255, 0.07);

  /* 鎖定 Header，讓軌道水平捲動時它維持可見 */
  z-index: 1;
  background: inherit;         /* 繼承泳道背景（slot 微差色） */
}

/* 頂端角色屬性色條：絕對定位在 Header 最頂部 */
.header__color-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  transition: background-color 0.25s ease;
}

/* 角色名稱列（色點 + 文字橫排） */
.header__info {
  display: flex;
  align-items: center;
  gap: 0.3125rem;             /* 5px */
  width: 100%;
  overflow: hidden;
}

/* 屬性色點 */
.header__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.25s ease;
}

/* 角色名稱 */
.header__name {
  font-size: 0.75rem;         /* 12px */
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* 未選角狀態：文字更淡 */
.header__name--empty {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 400;
  font-style: italic;
}

/* 屬性標籤（如「氣動」「冷凝」） */
.header__element {
  font-size: 0.5625rem;       /* 9px */
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
  min-width: 0;               /* 防止 flex 子元素撐破父層 */
  overflow-x: auto;
  overflow-y: hidden;

  /* 隱藏捲軸但保留捲動能力（Webkit） */
  scrollbar-width: none;      /* Firefox */
}

.swimlane__track::-webkit-scrollbar {
  display: none;              /* Chrome / Safari */
}

/* 軌道內層：Flex 橫向排列，撐開寬度以啟用捲動 */
.track__inner {
  display: flex;
  align-items: center;
  gap: var(--track-gap);
  height: 100%;
  padding: 0 var(--track-px);
  width: max-content;         /* 讓內容自然撐開，觸發父層捲動 */
  min-width: 100%;            /* 空白時仍佔滿可視寬度 */
}

/* 每個 Chip 的包裝（後續 Phase 在此掛拖曳事件） */
.track__chip-wrapper {
  flex-shrink: 0;
}

/* 尾端空白：確保最後一個 Chip 右側有 12px 呼吸空間 */
.track__tail {
  flex-shrink: 0;
  width: var(--track-px);
}

/* 未選角提示文字 */
.track__empty-hint {
  font-size: 0.6875rem;       /* 11px */
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 0.05em;
  user-select: none;
  white-space: nowrap;
}

/* ── 無障礙：減少動畫 ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .header__color-bar,
  .header__dot {
    transition: none;
  }
}
</style>
