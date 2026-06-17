<script setup lang="ts">
// ============================================================
// DefaultBlockField.vue
// 側邊欄「預設區塊」展示區。
//
// 職責：
//   單純讀取常數並渲染七個基礎招式區塊，不處理任何拖曳或狀態邏輯。
//   採橫向 flex-wrap 排列，超出側邊欄寬度時自動換行。
//
// 嚴格限制：
//   本元件為靜態展示層，禁止引入任何 store 或 composable，
//   拖曳能力將在 Phase 4 後續子階段由父層 SidebarPanel.vue 統一注入。
// ============================================================

import BlockChip from '@/components/ui/BlockChip.vue'
import { DEFAULT_BLOCKS } from '@/constants/defaultBlocks'
</script>

<template>
  <section class="default-block-field">

    <!-- 區塊標題 -->
    <h3 class="field-title">基礎招式</h3>

    <!-- 區塊清單：橫向排列，超出寬度自動換行 -->
    <div class="chip-row">
      <BlockChip
        v-for="block in DEFAULT_BLOCKS"
        :key="block.id"
        :label="block.label"
        :color="block.color"
      />
    </div>

  </section>
</template>

<style scoped>
.default-block-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;         /* 標題與區塊列之間的間距 */
  padding: 0.75rem 0;  /* 上下呼吸空間，左右由父層 SidebarPanel 控制 */
}

/* ── 區塊標題 ──────────────────────────────────────────────── */
.field-title {
  margin: 0;
  font-size: 0.6875rem;    /* 11px，刻意縮小以不搶區塊視覺焦點 */
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);  /* 極淡，作為標籤而非主要內容 */
  user-select: none;
}

/* ── 橫向換行排列 ──────────────────────────────────────────── */
.chip-row {
  display: flex;
  flex-wrap: wrap;    /* 超出寬度自動換行 */
  gap: 0.375rem;      /* 區塊間距：6px，緊湊但有呼吸感 */
}
</style>