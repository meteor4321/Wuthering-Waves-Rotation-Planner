<script lang="ts">
// 模組層級計數器：確保畫面上同時存在多個 CharacterSelector
// （三條泳道各一個）時，ARIA id 仍能保持全域唯一。
let uidCounter = 0
</script>

<script setup lang="ts">
// ============================================================
// CharacterSelector.vue
// 角色選擇下拉選單。
//
// 設計決策（已與使用者確認）：
// 1. options 直接使用 Character[] 型別，元件與角色領域耦合，
//    顯示文字採用 nameZh。
// 2. 自訂 div-based 下拉選單（非原生 <select>），以完全控制
//    色點／發光樣式，確保跨瀏覽器呈現一致。
// 3. 每個選項旁顯示對應角色 themeColor 色點，強化辨識度。
//
// 互動模式採用 ARIA combobox pattern：焦點始終停留在觸發按鈕，
// 透過 aria-activedescendant 標示目前鍵盤高亮的選項，
// 不將焦點移入 listbox 本身。
// ============================================================

import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import type { Character } from '@/types/character'

export interface Props {
  /** 目前選中的角色 ID；null 代表該槽位尚未選擇角色 */
  modelValue: string | null
  /** 可選角色清單 */
  options: Character[]
  /** 尚未選擇時顯示的提示文字 */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '選擇角色',
})

const emit = defineEmits<{
  /** 選中某個角色時觸發，value 一定是 options 中某個角色的 id */
  (e: 'update:modelValue', value: string): void
}>()

// ── ARIA 唯一 ID ─────────────────────────────────────────
const instanceId = ++uidCounter
const listboxId = `char-selector-listbox-${instanceId}`

// ── 內部狀態（互動狀態，非業務資料，元件自行管理開合與高亮） ──
const isOpen = ref(false)
const highlightedIndex = ref(0)
const rootRef = ref<HTMLElement | null>(null)
const optionRefs: (HTMLLIElement | null)[] = []

function setOptionRef(el: Element | null, index: number): void {
  optionRefs[index] = el as HTMLLIElement | null
}

// ── 衍生資料 ─────────────────────────────────────────────
const selectedCharacter = computed<Character | null>(
  () => props.options.find((o) => o.id === props.modelValue) ?? null
)

// ── 開合與高亮控制 ───────────────────────────────────────
function scrollHighlightedIntoView(): void {
  nextTick(() => {
    optionRefs[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function openDropdown(): void {
  const selectedIdx = props.options.findIndex((o) => o.id === props.modelValue)
  highlightedIndex.value = selectedIdx >= 0 ? selectedIdx : 0
  isOpen.value = true
  scrollHighlightedIntoView()
}

function closeDropdown(): void {
  isOpen.value = false
}

function toggleDropdown(): void {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function moveHighlight(delta: number): void {
  const len = props.options.length
  if (len === 0) return
  highlightedIndex.value = (highlightedIndex.value + delta + len) % len
  scrollHighlightedIntoView()
}

function selectOption(option: Character): void {
  emit('update:modelValue', option.id)
  closeDropdown()
}

function selectHighlighted(): void {
  const option = props.options[highlightedIndex.value]
  if (option) selectOption(option)
}

// ── 鍵盤操作（焦點全程停留在 trigger 按鈕上） ────────────────
function onTriggerKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      isOpen.value ? moveHighlight(1) : openDropdown()
      break
    case 'ArrowUp':
      event.preventDefault()
      isOpen.value ? moveHighlight(-1) : openDropdown()
      break
    case 'Home':
      if (isOpen.value) {
        event.preventDefault()
        highlightedIndex.value = 0
        scrollHighlightedIntoView()
      }
      break
    case 'End':
      if (isOpen.value) {
        event.preventDefault()
        highlightedIndex.value = props.options.length - 1
        scrollHighlightedIntoView()
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      isOpen.value ? selectHighlighted() : openDropdown()
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        closeDropdown()
      }
      break
    case 'Tab':
      // 允許瀏覽器預設的 Tab 移焦行為，僅收合選單
      closeDropdown()
      break
  }
}

// ── 點擊外部關閉 ─────────────────────────────────────────
function onDocumentMouseDown(event: MouseEvent): void {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
})
</script>

<template>
  <div ref="rootRef" class="char-selector">
    <button
      type="button"
      class="char-selector__trigger"
      :class="{ 'char-selector__trigger--open': isOpen }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="isOpen ? `${listboxId}-option-${highlightedIndex}` : undefined"
      @click="toggleDropdown"
      @keydown="onTriggerKeydown"
    >
      <span
        v-if="selectedCharacter"
        class="char-selector__swatch"
        :style="{ '--swatch-color': selectedCharacter.themeColor }"
        aria-hidden="true"
      />
      <span
        class="char-selector__value"
        :class="{ 'char-selector__value--placeholder': !selectedCharacter }"
      >
        {{ selectedCharacter ? selectedCharacter.nameZh : placeholder }}
      </span>
      <span class="char-selector__chevron" aria-hidden="true">▾</span>
    </button>

    <Transition name="dropdown">
      <ul
        v-if="isOpen"
        :id="listboxId"
        class="char-selector__listbox"
        role="listbox"
      >
        <li
          v-for="(option, index) in options"
          :id="`${listboxId}-option-${index}`"
          :key="option.id"
          :ref="(el) => setOptionRef(el as Element | null, index)"
          role="option"
          class="char-selector__option"
          :class="{
            'char-selector__option--highlighted': index === highlightedIndex,
            'char-selector__option--selected': option.id === modelValue,
          }"
          :aria-selected="option.id === modelValue"
          @mouseenter="highlightedIndex = index"
          @click="selectOption(option)"
        >
          <span
            class="char-selector__swatch"
            :style="{ '--swatch-color': option.themeColor }"
            aria-hidden="true"
          />
          <span class="char-selector__option-name">{{ option.nameZh }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.char-selector {
  position: relative;
  width: 100%;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}

/* ── 觸發按鈕 ───────────────────────────────────────────── */
.char-selector__trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  height: 2.75rem; /* 44px */
  padding: 0 0.75rem;
  background-color: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  color: rgba(240, 244, 248, 0.92);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.char-selector__trigger:hover {
  border-color: rgba(34, 211, 238, 0.35);
}

.char-selector__trigger:focus-visible {
  outline: none;
  border-color: rgba(34, 211, 238, 0.65);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.char-selector__trigger--open {
  border-color: rgba(34, 211, 238, 0.70);
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.18);
}

/* ── 色點（trigger 與 option 共用） ───────────────────────── */
.char-selector__swatch {
  flex-shrink: 0;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: var(--swatch-color, #6B7280);
  box-shadow: 0 0 6px var(--swatch-color, transparent);
}

/* ── 顯示文字 ───────────────────────────────────────────── */
.char-selector__value {
  flex: 1;
  overflow: hidden;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.char-selector__value--placeholder {
  color: rgba(240, 244, 248, 0.40);
  font-weight: 500;
}

.char-selector__chevron {
  flex-shrink: 0;
  font-size: 0.625rem;
  color: rgba(240, 244, 248, 0.45);
  transition: transform 0.18s ease, color 0.18s ease;
}

.char-selector__trigger--open .char-selector__chevron {
  color: rgba(34, 211, 238, 0.85);
  transform: rotate(180deg);
}

/* ── 下拉清單 ───────────────────────────────────────────── */
.char-selector__listbox {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 320px;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  overflow-y: auto;
  background-color: #111827;
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 4px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 0, 0, 0.20);
  transform-origin: top;
}

.char-selector__listbox::-webkit-scrollbar {
  width: 6px;
}
.char-selector__listbox::-webkit-scrollbar-track {
  background: transparent;
}
.char-selector__listbox::-webkit-scrollbar-thumb {
  background-color: rgba(34, 211, 238, 0.25);
  border-radius: 3px;
}

/* ── 選項 ───────────────────────────────────────────────── */
.char-selector__option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  height: 2.25rem;
  padding: 0 0.625rem;
  border-radius: 3px;
  font-size: 0.8125rem;
  color: rgba(240, 244, 248, 0.85);
  cursor: pointer;
  transition: background-color 0.10s ease;
}

.char-selector__option--highlighted {
  background-color: rgba(34, 211, 238, 0.12);
}

.char-selector__option--selected {
  color: #22D3EE;
  font-weight: 700;
}

.char-selector__option-name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ── 下拉開合過場（與 BlockChip 的 Spring Bounce 語言呼應） ──── */
.dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dropdown-leave-active {
  transition: opacity 0.10s ease, transform 0.10s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.96);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scaleY(0.98);
}

/* ── 無障礙：減少動畫模式 ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .char-selector__trigger,
  .char-selector__chevron,
  .char-selector__option {
    transition: none;
  }
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: opacity 0.10s ease;
  }
  .dropdown-enter-from,
  .dropdown-leave-to {
    transform: none;
  }
}
</style>
