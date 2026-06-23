<script setup lang="ts">
// ============================================================
// App.vue
// 整體組裝入口。AppLayout 負責版面骨架，Header/Sidebar/Main 皆已接上真正元件。
//
// 待辦（尚未串接，需要對應元件介面才能完成）：
//   - 角色選擇 UI（CharacterSelector）目前沒有任何地方在用，
//     需要決定要放在 Header 還是 main 區域上方，再接上 useCharacterStore
//     （RotationBoard 內部暫時保留 onMounted 開發用 stub 自動指派測試角色）
// ============================================================

import AppLayout from '@/components/layout/AppLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import RotationBoard from '@/components/rotation/RotationBoard.vue'
</script>

<template>
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
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0A0F1E; }
</style>