<script setup lang="ts">
// ============================================================
// App.vue（Phase 3 整合驗證版）
// 串接 AppLayout / AppHeader / CharacterSelector / ToastNotification，
// 確認元件之間的 Props、Slot、v-model 介面皆正確銜接。
// Phase 4 完成後，sidebar / main 區域將替換為真正的
// 側邊欄與主時間軸元件。
// ============================================================

import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import CharacterSelector from '@/components/character/CharacterSelector.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { showToast } from '@/composables/useToast'
import { WUWA_CHARACTERS } from '@/constants/characters'

// 三條泳道暫時各自用一個本地 ref 模擬選角狀態（Phase 4 會改接 useCharacterStore）
const slot1 = ref<string | null>(null)
const slot2 = ref<string | null>('jinhsi')
const slot3 = ref<string | null>(null)

function demoToast(): void {
  showToast('已新增至模板庫', 'success')
}
</script>

<template>
  <AppLayout :sidebar-width="300" :header-height="64">
    <template #header>
      <AppHeader />
    </template>

    <template #sidebar>
      <div class="sidebar-demo">
        <p class="sidebar-demo__label">角色槽（CharacterSelector 串接驗證）</p>
        <CharacterSelector v-model="slot1" :options="WUWA_CHARACTERS" placeholder="角色 1" />
        <CharacterSelector v-model="slot2" :options="WUWA_CHARACTERS" placeholder="角色 2" />
        <CharacterSelector v-model="slot3" :options="WUWA_CHARACTERS" placeholder="角色 3" />
      </div>
    </template>

    <template #main>
      <div class="main-demo">
        <button class="main-demo__btn" @click="demoToast">測試 Toast</button>
      </div>
    </template>
  </AppLayout>

  <ToastNotification />
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0A0F1E; }
</style>

<style scoped>
.sidebar-demo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.sidebar-demo__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: rgba(240, 244, 248, 0.45);
  margin-bottom: 0.25rem;
}

.main-demo {
  padding: 2rem;
}

.main-demo__btn {
  padding: 0.5rem 1rem;
  background: #22D3EE;
  color: #0A0F1E;
  border: none;
  border-radius: 3px;
  font-weight: 700;
  cursor: pointer;
}
</style>
