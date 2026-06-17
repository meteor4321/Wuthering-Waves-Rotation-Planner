<script setup lang="ts">
// ============================================================
// Swimlane.vue
// 單一角色的橫向時間軸軌道。
//
// 版面結構：
//   ┌──────────┬─────────────────────────────────────────────────┐
//   │  Header  │  Track（可橫向捲動）                              │
//   │  角色名稱 │  [RotationBlock] [RotationBlock] …  [tail: ＋]  │
//   │  屬性色點 │                                                 │
//   └──────────┴─────────────────────────────────────────────────┘
//
// 職責（Phase 4.2）：
//   1. 左側 Header 固定顯示角色名稱（nameZh）與屬性色點（themeColor）。
//   2. 右側 Track 橫向排列 RotationBlock，超出寬度時可橫向捲動。
//   3. 接收父層（RotationBoard）已過濾的 entries，不自行存取 store。
//   4. Track 尾端的「＋」按鈕呼叫 store.addFreeformBlock，
//      並計算正確的插入位置（afterIndex），確保新區塊緊接在本泳道末尾。
//   5. 點擊軌道背景清除全域選取。
//
// 嚴格限制：
//   拖曳邏輯由後續 Phase 統一注入，本元件不處理。
// ============================================================

import { computed } from 'vue'
import RotationBlock from '@/components/rotation/RotationBlock.vue'
import { useRotationStore } from '@/stores/useRotationStore'
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
   * 此泳道的區塊序列（已由父層 RotationBoard 依 slotIndex 過濾完畢）。
   * Phase 4.2 起為必填：靜態 STUB_ENTRIES 已移除。
   */
  entries: RotationEntry[]
}

const props = defineProps<Props>()

// ── Store ────────────────────────────────────────────────────

const rotationStore = useRotationStore()

// ── Computed ─────────────────────────────────────────────────

/**
 * insertAfterIndex：「＋」按鈕觸發時，新區塊應插入的位置。
 *
 * 邏輯：
 *   從全域 1D 陣列末端往前掃，找到最後一個屬於本泳道（slotIndex）的 entry。
 *   取得其全局索引作為 afterIndex，讓新區塊緊接在本泳道現有序列之後。
 *
 *   若本泳道目前沒有任何 entry（空泳道），則回傳 entries.length - 1，
 *   等同呼叫 addFreeformBlock 的預設行為（追加至全局末尾）。
 *
 * 為何不直接用 props.entries.length - 1？
 *   props.entries 是過濾後的子陣列，其索引與全局 1D 陣列不同。
 *   必須在全局陣列中定位，才能讓 insertEntryAfterIndex 放到正確位置。
 */
const insertAfterIndex = computed<number>(() => {
  const globalEntries = rotationStore.entries
  for (let i = globalEntries.length - 1; i >= 0; i--) {
    if (globalEntries[i].slotIndex === props.slotIndex) {
      return i
    }
  }
  // 泳道為空：預設追加至全局末尾
  return globalEntries.length - 1
})

// ── Actions ──────────────────────────────────────────────────

/**
 * handleAddBlock：點擊「＋」按鈕時，於本泳道末尾新增空白區塊。
 *
 * 傳入空字串 label，由使用者後續編輯。
 * color 使用角色主題色，保持視覺一致性。
 * 若 character 為 null（未選角），按鈕不應顯示，此處加一道保險。
 */
function handleAddBlock(): void {
  if (!props.character) return

  rotationStore.addFreeformBlock(
    '',                          // label：空白，等待使用者輸入
    props.character.themeColor,  // color：角色主題色
    props.slotIndex,             // slotIndex：本泳道
    props.character.id,          // characterId：本泳道角色
    insertAfterIndex.value,      // afterIndex：本泳道現有序列末尾
  )
}

/**
 * handleTrackClick：點擊軌道背景時清除全域選取。
 * RotationBlock 內部已 stopPropagation，此事件僅在點擊空白處時觸發。
 */
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
      @click="handleTrackClick"
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

        <!-- 有角色：渲染區塊序列（來自父層 RotationBoard 過濾後的 entries） -->
        <template v-else>
          <RotationBlock
            v-for="entry in entries"
            :key="entry.id"
            :entry-id="entry.id"
            :label="entry.block.label"
            :color="entry.block.color || character.themeColor"
            role="listitem"
          />

          <!--
            尾端區：
            - 右側呼吸空間（固定 12px padding）
            - 「＋」新增按鈕：僅在有角色時顯示，點擊呼叫 handleAddBlock
          -->
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
/* Phase 4.2：RotationBlock 內部已使用 display: contents，
   此包裝層已移除；樣式保留為後續 Phase 拖曳擴充的錨點。 */

/* 尾端容器：呼吸空間 + 「＋」新增按鈕 */
.track__tail {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 0.25rem;   /* 與最後一個 Chip 的間距 */
  padding-right: var(--track-px);
}

/* 「＋」新增區塊按鈕 */
.track__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 1.5rem;            /* 24px */
  height: 1.5rem;
  border-radius: 4px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: transparent;
  color: rgba(255, 255, 255, 0.28);

  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;

  /* 入場過渡 */
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
