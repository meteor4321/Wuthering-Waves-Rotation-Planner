<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataBackupDialog } from '@/composables/state/useDataBackupDialog'
import { useDialog } from '@/composables/state/useDialog'
import { showToast } from '@/composables/state/useToast'
import { BackupValidationError, downloadDataBackup, parseDataBackup, restoreDataBackup } from '@/utils/dataBackup'

const { isOpen, close } = useDataBackupDialog()
const { t } = useI18n()
const dialog = useDialog()
const inputRef = ref<HTMLInputElement | null>(null)
const isRestoring = ref(false)

function download(): void {
  downloadDataBackup()
  showToast(t('backup.exported'), 'success')
}

function chooseFile(): void {
  inputRef.value?.click()
}

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const backup = parseDataBackup(await file.text())
    const ok = await dialog.confirm({
      title: t('backup.restoreConfirmTitle'),
      message: t('backup.restoreConfirmMessage'),
      messageHighlight: t('backup.restoreConfirmHighlight'),
      confirmText: t('backup.restore'),
      cancelText: t('dialog.cancel'),
      danger: true,
    })
    if (!ok) return
    isRestoring.value = true
    restoreDataBackup(backup)
    window.location.reload()
  } catch (error) {
    const message = error instanceof BackupValidationError
      ? error.message
      : t('backup.restoreFailed')
    showToast(message, 'danger', 5000)
  } finally {
    isRestoring.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="backup-dialog">
      <div v-if="isOpen" class="backup-overlay" @click.self="close">
        <section class="backup-dialog" role="dialog" aria-modal="true" :aria-label="t('backup.title')" @keydown.esc.prevent="close">
          <button class="backup-close" type="button" :aria-label="t('backup.close')" @click="close">×</button>
          <h2 class="backup-dialog__title">{{ t('backup.title') }}</h2>
          <p class="backup-intro">{{ t('backup.description') }}</p>

          <div class="backup-action">
            <h3>{{ t('backup.exportTitle') }}</h3>
            <p>{{ t('backup.exportDescription') }}</p>
            <button type="button" class="backup-primary" @click="download">{{ t('backup.export') }}</button>
          </div>

          <div class="backup-action">
            <h3>{{ t('backup.restoreTitle') }}</h3>
            <input ref="inputRef" class="backup-file" type="file" accept="application/json,.json" @change="onFileSelected" />
            <button type="button" class="backup-secondary" :disabled="isRestoring" @click="chooseFile">{{ t('backup.chooseFile') }}</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backup-overlay { position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center; padding: 1rem; background: rgba(2, 6, 23, .72); }
.backup-dialog { position: relative; width: min(100%, 34rem); padding: 1.5rem; border: 1px solid rgba(148, 163, 184, .38); border-radius: .6rem; background: #111827; color: #e5e7eb; box-shadow: 0 24px 70px rgba(0,0,0,.48); }
.backup-dialog__title { margin: 0 0 .875rem; font-size: .9375rem; font-weight: 600; color: rgba(34, 211, 238, .95); letter-spacing: .02em; }
.backup-dialog h3 { margin: 0 0 .35rem; font-size: .95rem; color: #f8fafc; }
.backup-intro, .backup-action p { margin: 0; color: #aab6c8; font-size: .875rem; line-height: 1.55; }
.backup-action { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(148, 163, 184, .2); }
.backup-primary, .backup-secondary { margin-top: .75rem; padding: .48rem .8rem; border-radius: .28rem; border: 1px solid transparent; font: inherit; font-size: .85rem; cursor: pointer; }
.backup-primary { background: #06b6d4; color: #06232a; font-weight: 700; }
.backup-secondary { border-color: rgba(148, 163, 184, .45); background: transparent; color: #e5e7eb; }
.backup-primary:hover { background: #22d3ee; }.backup-secondary:hover { border-color: #67e8f9; color: #cffafe; }.backup-secondary:disabled { opacity: .6; cursor: wait; }
.backup-close { position: absolute; top: .7rem; right: .8rem; border: 0; background: transparent; color: #aab6c8; font-size: 1.5rem; line-height: 1; cursor: pointer; }.backup-close:hover { color: #fff; }
.backup-file { display: none; }
.backup-dialog-enter-active, .backup-dialog-leave-active { transition: opacity .16s ease; }.backup-dialog-enter-from, .backup-dialog-leave-to { opacity: 0; }
</style>
