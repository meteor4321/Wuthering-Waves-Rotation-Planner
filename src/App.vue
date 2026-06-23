<script setup lang="ts">
// App.vue — 整體組裝入口
// 待辦：角色選擇 UI（CharacterSelector）尚未串接，待決定放置位置後接上 useCharacterStore
import AppLayout from '@/components/layout/AppLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import RotationBoard from '@/components/rotation/RotationBoard.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useRotationStore } from '@/stores/useRotationStore'

const rotationStore = useRotationStore()

useKeyboardShortcuts()
</script>

<template>
  <div class="app-root" @click="rotationStore.clearSelection()">
    <AppLayout :sidebar-width="300" :header-height="64">
      <template #header>
        <AppHeader />
      </template>

      <template #sidebar>
        <SidebarPanel />
      </template>

      <template #main>
        <RotationBoard />
      </template>
    </AppLayout>

    <ToastNotification />
  </div>
</template>

<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0F1E; }

  .app-root {
  width: 100%;
  height: 100%;
  }
</style>