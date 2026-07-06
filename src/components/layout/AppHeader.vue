<script setup lang="ts">
// ============================================================
// AppHeader.vue
// 頂部導覽列。顯示專案名稱「鳴潮排軸編輯器」，搭配科幻裝飾元素
// （發光指示燈、漸層分隔線、底部光暈細線）。
//
// 純展示元件，不持有任何狀態。右側保留 actions slot，
// 供未來功能（如匯出、復原/重做按鈕）擴充使用。
// ============================================================
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <span class="app-header__brand-icon" aria-hidden="true">
        <img src="/Phoebe.svg" alt="" draggable="false" />
      </span>
      <span class="app-header__divider" aria-hidden="true" />

      <div class="app-header__titles">
        <h1 class="app-header__title">{{ $t('header.title') }}</h1>
        <span class="app-header__eyebrow">WUWA · ROTATION PLANNER</span>
      </div>
    </div>

    <div class="app-header__actions">
      <slot name="actions" />
    </div>

    <div class="app-header__glow-line" aria-hidden="true" />
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1.5rem;
  background-color: #0A0F1E;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}

/* ── 左側品牌區 ─────────────────────────────────────────── */
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

/* 品牌圖示：取代原呼吸燈，顯示指定圖片。
   固定 36×36 顯示框 + overflow:hidden 作為裁切容器；
   內層圖片以 transform: scale 放大，把圖檔本身四周的透明空白裁掉，
   讓實際畫面填滿整個框。放大倍率與位移可視圖檔留白量微調。 */
.app-header__brand-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  overflow: hidden;
  border-radius: 6px;
  user-select: none;
}

.app-header__brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 放大以裁掉透明留白；1 = 不裁切，數字越大裁越多。 */
  transform: scale(1.4);
}

/* 細線分隔：上下漸隱，避免死板的純色直線 */
.app-header__divider {
  flex-shrink: 0;
  width: 1px;
  height: 1.5rem;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34, 211, 238, 0.45),
    transparent
  );
}

.app-header__titles {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  min-width: 0;
}

.app-header__title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(240, 244, 248, 0.95);
  white-space: nowrap;
}

/* Eyebrow：簡短的系統識別碼，呼應科幻 HUD 慣用排版 */
.app-header__eyebrow {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(34, 211, 238, 0.55);
  white-space: nowrap;
}

/* ── 右側動作區（保留擴充） ───────────────────────────────── */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* ── 底部發光細線：與主內容區的視覺分隔 ──────────────────────── */
.app-header__glow-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(34, 211, 238, 0.55) 18%,
    rgba(34, 211, 238, 0.15) 50%,
    transparent 100%
  );
}

</style>
