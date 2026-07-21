<script setup lang="ts">
// ============================================================
// HotkeyMapDialog.vue — 熱鍵對映表編輯視窗。
//
// 掛載於 App.vue 頂層，透過 Teleport 渲染至 <body>；由 useHotkeyMapDialog 單例
// 控制開合，內容即時寫入 useHotkeyMap（無「確定 / 取消」的暫存草稿）。
//
// 職責（見 DesignDocument/HotkeyInputMode.md §4）：
//   - 每條條目一列：label 文字欄 + 按鍵擷取欄 + pressType 切換 + 刪除鈕。
//   - 底部「新增條目」與「還原預設」。
//   - 錄入時擋保留鍵（RESERVED_CODES）、即時偵測衝突（同 hotkey + pressType）。
//
// 設計決策：
//   - 擷取以 window capture-phase 一次性監聽 keydown，stopImmediatePropagation
//     擋住全域快捷鍵（否則錄入時按下的鍵會誤觸 App 快捷鍵，如 F 進入熱鍵模式）。
//   - 鍵位比對用 event.code；顯示走 formatHotkey。
//   - 滑鼠鍵擷取（MouseLeft/Right）與其模式輸入一起留待 Stage 3；此處僅鍵盤。
//   - 衝突＝同鍵同 pressType 的既有條目：以 dialog.confirm 詢問「覆蓋」
//     （新條目取得該鍵、原持有者清空鍵位）或「取消」（不變更）。
//   - 介面字串暫以繁中字面量（沿用 Stage 1 慣例，Stage 4 統一進 i18n）。
// ============================================================

import { ref, onUnmounted } from 'vue'
import { useHotkeyMapDialog } from '@/composables/state/useHotkeyMapDialog'
import { useHotkeyMap } from '@/composables/state/useHotkeyMap'
import { useDialog } from '@/composables/state/useDialog'
import { RESERVED_CODES, formatHotkey } from '@/constants/hotkeyMap'
import type { PressType } from '@/types/hotkey'

const { isOpen, close } = useHotkeyMapDialog()
const { entries, addEntry, updateEntry, removeEntry, resetToDefaults, findConflict } = useHotkeyMap()
const dialog = useDialog()

// 正在擷取鍵位的條目 id（null＝無）。
const capturingId = ref<string | null>(null)
// 擷取時的即時錯誤提示（保留鍵）；切換條目或成功即清除。
const captureError = ref<string>('')

/** 開始擷取某條目的鍵位：掛一次性 window capture-phase 監聽。 */
function startCapture(id: string): void {
  if (capturingId.value !== null) stopCapture()
  capturingId.value = id
  captureError.value = ''
  window.addEventListener('keydown', onCaptureKeydown, { capture: true })
}

/** 結束擷取：解除監聽、清狀態。 */
function stopCapture(): void {
  window.removeEventListener('keydown', onCaptureKeydown, { capture: true })
  capturingId.value = null
  captureError.value = ''
}

/** 擷取中的 keydown：讀 event.code，擋保留鍵、偵測衝突後寫入。 */
async function onCaptureKeydown(event: KeyboardEvent): Promise<void> {
  // 擋住全域快捷鍵與瀏覽器預設（錄入期間按鍵只作錄入用途）。
  event.preventDefault()
  event.stopImmediatePropagation()

  const id = capturingId.value
  if (id === null) return

  // Escape：取消擷取（Escape 本為保留鍵，一律當退出錄入）。
  if (event.code === 'Escape') {
    stopCapture()
    return
  }
  // 純修飾鍵單獨按下：忽略，繼續等待實體鍵。
  if (RESERVED_CODES.has(event.code)) {
    captureError.value = `「${formatHotkey(event.code)}」為保留鍵，不可綁定`
    return
  }

  const entry = entries.value.find((e) => e.id === id)
  if (!entry) {
    stopCapture()
    return
  }

  // 衝突偵測：同鍵同 pressType 的既有條目。
  const conflict = findConflict(event.code, entry.pressType, id)
  if (conflict) {
    // 先解除擷取監聽再問（confirm 期間不再吃鍵）。
    stopCapture()
    const ok = await dialog.confirm({
      title: '鍵位衝突',
      message: `「${formatHotkey(event.code)}」已綁定給「${conflict.label || '（未命名）'}」。`
        + '要改綁到這一條嗎？原條目的鍵位會被清空。',
      confirmText: '覆蓋',
      cancelText: '取消',
    })
    if (ok) {
      updateEntry(conflict.id, { hotkey: '' })
      updateEntry(id, { hotkey: event.code })
    }
    return
  }

  updateEntry(id, { hotkey: event.code })
  stopCapture()
}

/** 切換 pressType（tap ↔ hold）。 */
function setPressType(id: string, pressType: PressType): void {
  updateEntry(id, { pressType })
}

/** label 輸入即時寫回（trim 留到使用；空 label 於模式輸入時自然不動作）。 */
function onLabelInput(id: string, event: Event): void {
  updateEntry(id, { label: (event.target as HTMLInputElement).value })
}

async function handleReset(): Promise<void> {
  const ok = await dialog.confirm({
    title: '還原預設對映',
    message: '將對映表還原為預設種子，你目前的自訂會全部消失。確定嗎？',
    confirmText: '還原',
    cancelText: '取消',
    danger: true,
  })
  if (ok) resetToDefaults()
}

/** 關閉視窗：一併結束擷取。 */
function handleClose(): void {
  stopCapture()
  close()
}

onUnmounted(stopCapture)
</script>

<template>
  <Teleport to="body">
    <Transition name="hkmap-map">
      <div v-if="isOpen" class="hkmap-overlay" @click.self="handleClose">
        <div
          class="hkmap-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="熱鍵對映表"
          @keydown.esc.prevent="handleClose"
        >
          <h2 class="hkmap-dialog__title">熱鍵對映表</h2>
          <p class="hkmap-dialog__desc">
            進入熱鍵輸入模式（<kbd>F</kbd>）後，按下這裡設定的鍵，即在選中泳道末尾插入對應區塊。
          </p>

          <!-- 表頭 -->
          <div class="hkmap-row hkmap-row--head" aria-hidden="true">
            <span class="hkmap-col hkmap-col--label">區塊文字</span>
            <span class="hkmap-col hkmap-col--key">按鍵</span>
            <span class="hkmap-col hkmap-col--press">按法</span>
            <span class="hkmap-col hkmap-col--del"></span>
          </div>

          <!-- 條目清單 -->
          <ul class="hkmap-list">
            <li v-for="entry in entries" :key="entry.id" class="hkmap-row">
              <!-- label -->
              <input
                class="hkmap-col hkmap-col--label hkmap-label-input"
                type="text"
                :value="entry.label"
                placeholder="（未命名）"
                maxlength="12"
                @input="onLabelInput(entry.id, $event)"
              />

              <!-- 按鍵擷取欄 -->
              <button
                type="button"
                class="hkmap-col hkmap-col--key hkmap-capture"
                :class="{ 'hkmap-capture--active': capturingId === entry.id }"
                @click="capturingId === entry.id ? stopCapture() : startCapture(entry.id)"
              >
                <template v-if="capturingId === entry.id">按下任意鍵…</template>
                <template v-else-if="entry.hotkey">{{ formatHotkey(entry.hotkey) }}</template>
                <template v-else>未設定</template>
              </button>

              <!-- pressType 切換 -->
              <div class="hkmap-col hkmap-col--press hkmap-press">
                <button
                  type="button"
                  class="hkmap-press__seg"
                  :class="{ 'hkmap-press__seg--on': entry.pressType === 'tap' }"
                  @click="setPressType(entry.id, 'tap')"
                >單擊</button>
                <button
                  type="button"
                  class="hkmap-press__seg"
                  :class="{ 'hkmap-press__seg--on': entry.pressType === 'hold' }"
                  @click="setPressType(entry.id, 'hold')"
                >長按</button>
              </div>

              <!-- 刪除 -->
              <button
                type="button"
                class="hkmap-col hkmap-col--del hkmap-del"
                title="刪除這條"
                aria-label="刪除這條"
                @click="removeEntry(entry.id)"
              >✕</button>
            </li>
          </ul>

          <!-- 擷取錯誤（保留鍵） -->
          <p v-if="captureError" class="hkmap-dialog__error">{{ captureError }}</p>

          <!-- 底部動作 -->
          <div class="hkmap-dialog__actions">
            <button type="button" class="hkmap-btn hkmap-btn--ghost" @click="addEntry()">＋ 新增條目</button>
            <button type="button" class="hkmap-btn hkmap-btn--ghost" @click="handleReset">還原預設</button>
            <span class="hkmap-dialog__spacer" />
            <button type="button" class="hkmap-btn hkmap-btn--confirm" @click="handleClose">完成</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hkmap-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(3, 6, 12, 0.62);
  backdrop-filter: blur(2px);
}

.hkmap-dialog {
  width: min(34rem, 100%);
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  padding: 1.25rem 1.35rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: #111827;
  box-shadow: 0 18px 48px -12px rgba(0, 0, 0, 0.75);
  font-family: var(--app-font-mono, 'JetBrains Mono', 'Fira Code', ui-monospace, monospace);
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 211, 238, 0.25) transparent;
}

.hkmap-dialog__title {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(34, 211, 238, 0.95);
}
.hkmap-dialog__desc {
  margin: 0 0 0.85rem;
  font-size: 0.7rem;
  line-height: 1.5;
  color: rgba(240, 244, 248, 0.5);
}
.hkmap-dialog__desc kbd {
  padding: 0 0.3em;
  font-size: 0.65rem;
  color: rgba(240, 244, 248, 0.9);
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 3px;
}

/* 四欄格線：label 彈性、其餘固定寬。 */
.hkmap-row {
  display: grid;
  grid-template-columns: 1fr 6.5rem 6.5rem 1.6rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.hkmap-row--head {
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.25rem;
}
.hkmap-row--head .hkmap-col {
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(240, 244, 248, 0.4);
}

.hkmap-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 22rem;
  overflow-y: auto;
}

.hkmap-label-input {
  min-width: 0;
  padding: 0.3rem 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  background: #0d1320;
  color: rgba(240, 244, 248, 0.92);
  font-family: inherit;
  font-size: 0.78rem;
  outline: none;
}
.hkmap-label-input:focus {
  border-color: rgba(34, 211, 238, 0.6);
}

.hkmap-capture {
  padding: 0.3rem 0.4rem;
  border: 1px dashed rgba(255, 255, 255, 0.28);
  border-radius: 4px;
  background: #0d1320;
  color: rgba(240, 244, 248, 0.85);
  font-family: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}
.hkmap-capture:hover {
  border-color: rgba(34, 211, 238, 0.5);
}
/* 移除原生焦點外框（橘白虛線）；焦點提示改用青色實線邊框。 */
.hkmap-capture:focus {
  outline: none;
}
.hkmap-capture:focus-visible {
  border-style: solid;
  border-color: rgba(34, 211, 238, 0.7);
}
.hkmap-capture--active {
  border-style: solid;
  border-color: rgba(34, 211, 238, 0.8);
  color: rgba(34, 211, 238, 0.95);
  background: rgba(34, 211, 238, 0.08);
}

.hkmap-press {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  overflow: hidden;
}
.hkmap-press__seg {
  flex: 1;
  padding: 0.3rem 0;
  border: none;
  background: #0d1320;
  color: rgba(240, 244, 248, 0.55);
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}
.hkmap-press__seg + .hkmap-press__seg {
  border-left: 1px solid rgba(255, 255, 255, 0.14);
}
.hkmap-press__seg--on {
  background: rgba(34, 211, 238, 0.18);
  color: rgba(34, 211, 238, 0.95);
}

.hkmap-del {
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(240, 244, 248, 0.55);
  font-size: 0.7rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.hkmap-del:hover {
  border-color: rgba(248, 113, 113, 0.6);
  background: rgba(248, 113, 113, 0.12);
  color: rgba(248, 113, 113, 0.95);
}

.hkmap-dialog__error {
  margin: 0.5rem 0 0;
  font-size: 0.7rem;
  color: rgba(248, 113, 113, 0.9);
}

.hkmap-dialog__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.hkmap-dialog__spacer {
  flex: 1;
}

.hkmap-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.hkmap-btn--ghost {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(240, 244, 248, 0.8);
}
.hkmap-btn--ghost:hover {
  border-color: rgba(34, 211, 238, 0.5);
  color: rgba(34, 211, 238, 0.95);
}
.hkmap-btn--confirm {
  border: 1px solid rgba(34, 211, 238, 0.6);
  background: rgba(34, 211, 238, 0.16);
  color: rgba(34, 211, 238, 0.95);
}
.hkmap-btn--confirm:hover {
  background: rgba(34, 211, 238, 0.28);
}

/* 進出場：只動 opacity（沿用專案慣例，避免 transform 與其他層互動）。 */
.hkmap-map-enter-active,
.hkmap-map-leave-active {
  transition: opacity 0.14s ease;
}
.hkmap-map-enter-from,
.hkmap-map-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hkmap-map-enter-active,
  .hkmap-map-leave-active {
    transition: none;
  }
}
</style>
