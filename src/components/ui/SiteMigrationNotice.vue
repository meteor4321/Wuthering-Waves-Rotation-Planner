<script setup lang="ts">
// 舊站專用的搬遷公告：首次對話框關閉後保留右下角入口。
import { useSiteMigrationNotice } from '@/composables/state/useSiteMigrationNotice'

const { isLegacyHost, isInitialDialogOpen, closeInitialDialog, goToNewSite } = useSiteMigrationNotice()
</script>

<template>
  <Teleport v-if="isLegacyHost" to="body">
    <Transition name="migration-dialog">
      <div v-if="isInitialDialogOpen" class="migration-overlay" @click.self="closeInitialDialog">
        <section class="migration-dialog" role="dialog" aria-modal="true" aria-labelledby="migration-title" @keydown.esc.prevent="closeInitialDialog">
          <h2 id="migration-title" class="migration-dialog__title">{{ $t('migration.title') }}</h2>
          <p class="migration-dialog__message">{{ $t('migration.message') }}</p>
          <div class="migration-dialog__actions">
            <button type="button" class="migration-button" @click="closeInitialDialog">{{ $t('migration.confirm') }}</button>
            <button type="button" class="migration-button migration-button--primary" @click="goToNewSite">{{ $t('migration.goToNewSite') }}</button>
          </div>
        </section>
      </div>
    </Transition>

    <aside class="migration-reminder" role="status" aria-live="polite">
      <p class="migration-reminder__title">{{ $t('migration.reminderTitle') }}</p>
      <p class="migration-reminder__message">{{ $t('migration.reminderMessage') }}</p>
      <div class="migration-reminder__actions">
        <button type="button" class="migration-reminder__link" @click="isInitialDialogOpen = true">{{ $t('migration.learnMore') }}</button>
        <button type="button" class="migration-reminder__link migration-reminder__link--primary" @click="goToNewSite">{{ $t('migration.goToNewSite') }}</button>
      </div>
    </aside>
  </Teleport>
</template>

<style scoped>
.migration-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 1rem; background: rgba(5, 8, 16, .62); backdrop-filter: blur(2px); }
.migration-dialog { width: min(100%, 28rem); padding: 1.25rem; border: 1px solid rgba(34, 211, 238, .45); border-radius: 6px; background: #0D1526; color: rgba(240, 244, 248, .9); box-shadow: 0 16px 48px rgba(0, 0, 0, .6); font-family: var(--app-font-mono, 'JetBrains Mono', 'Fira Code', ui-monospace, monospace); }
.migration-dialog__title { margin: 0 0 .6rem; color: rgba(34, 211, 238, .95); font-size: .9375rem; }
.migration-dialog__message, .migration-reminder__message { margin: 0; color: rgba(240, 244, 248, .82); font-size: .8125rem; line-height: 1.55; white-space: pre-line; }
.migration-dialog__actions, .migration-reminder__actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1rem; }
.migration-button, .migration-reminder__link { border: 1px solid rgba(255, 255, 255, .18); border-radius: 4px; padding: .42rem .75rem; background: #131b2e; color: rgba(240, 244, 248, .78); font: inherit; font-size: .75rem; cursor: pointer; }
.migration-button--primary, .migration-reminder__link--primary { border-color: rgba(34, 211, 238, .5); color: rgba(34, 211, 238, .98); }
.migration-reminder { position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 100; width: min(calc(100vw - 2rem), 22rem); padding: .875rem; border: 1px solid rgba(245, 166, 35, .42); border-radius: 4px; background: #1b2740; box-shadow: 0 8px 24px rgba(0, 0, 0, .48); font-family: var(--app-font-mono, 'JetBrains Mono', 'Fira Code', ui-monospace, monospace); }
.migration-reminder__title { margin: 0 0 .4rem; color: #f5a623; font-size: .8125rem; font-weight: 700; }
.migration-reminder__actions { margin-top: .75rem; }
.migration-reminder__link { padding: .3rem .5rem; background: transparent; }
.migration-dialog-enter-active, .migration-dialog-leave-active { transition: opacity .18s ease; }
.migration-dialog-enter-from, .migration-dialog-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .migration-dialog-enter-active, .migration-dialog-leave-active { transition-duration: .01ms; } }
</style>
