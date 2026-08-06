// 舊網站搬遷公告狀態：僅在指定的舊正式網域啟用。
import { computed, ref } from 'vue'

const LEGACY_HOSTNAME = 'wuthering-waves-rotation-planner.vercel.app'
const NEW_SITE_URL = 'https://www.wuwa-rotation.com/'

const isLegacyHost = computed(() => window.location.hostname === LEGACY_HOSTNAME)
const isInitialDialogOpen = ref(isLegacyHost.value)
let resolveInitialDialog: (() => void) | null = null
const initialDialogClosed = new Promise<void>((resolve) => { resolveInitialDialog = resolve })

/** 關閉首次公告，並讓可能等待中的首次導覽繼續。 */
function closeInitialDialog(): void {
  if (!isInitialDialogOpen.value) return
  isInitialDialogOpen.value = false
  resolveInitialDialog?.()
  resolveInitialDialog = null
}

/** 前往新網站；保留舊頁的瀏覽紀錄，讓使用者可回來完成備份。 */
function goToNewSite(): void {
  window.location.assign(NEW_SITE_URL)
}

export function useSiteMigrationNotice() {
  return { isLegacyHost, isInitialDialogOpen, closeInitialDialog, goToNewSite, initialDialogClosed }
}
