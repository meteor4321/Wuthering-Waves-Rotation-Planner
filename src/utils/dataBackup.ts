/**
 * Portable, origin-independent backup for the application's browser data.
 *
 * localStorage is scoped to an origin, so this deliberately stores only the
 * keys owned by this app in a JSON file.  Do not replace this with a dump of
 * every localStorage key: other applications may share the same origin.
 */
export const BACKUP_FORMAT = 'wuwa-rotation-planner-backup' as const
export const BACKUP_VERSION = 1 as const

export const BACKUP_STORAGE_KEYS = [
  'wuwa-rotation-saved-teams',
  'wuwa-rotation-current-team',
  'wuwa-rotation-templates',
  'wuwa-rotation-general-blocks',
  'wuwa-rotation-settings',
  'wuwa-rotation-hotkey-map',
  'wuwa-rotation-hotkey-intro',
  'wuwa-rotation-tour-seen',
  'wuwa-rotation-hotkey-tour-seen',
] as const

type BackupStorageKey = (typeof BACKUP_STORAGE_KEYS)[number]

export interface DataBackup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  data: Record<BackupStorageKey, string | null>
}

export class BackupValidationError extends Error {}

export function createDataBackup(): DataBackup {
  const data = {} as Record<BackupStorageKey, string | null>
  for (const key of BACKUP_STORAGE_KEYS) data[key] = localStorage.getItem(key)
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data }
}

export function downloadDataBackup(): void {
  const blob = new Blob([JSON.stringify(createDataBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  link.href = url
  link.download = `wuwa-rotation-backup-${stamp}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parse and validate completely before touching the current browser data. */
export function parseDataBackup(json: string): DataBackup {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    throw new BackupValidationError('The selected file is not valid JSON.')
  }
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION || !isRecord(value.data)) {
    throw new BackupValidationError('This is not a compatible WuWa Rotation Planner backup.')
  }

  const data = {} as Record<BackupStorageKey, string | null>
  for (const key of BACKUP_STORAGE_KEYS) {
    const item = value.data[key]
    if (item !== null && typeof item !== 'string') {
      throw new BackupValidationError('The backup contains invalid application data.')
    }
    data[key] = item ?? null
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : '',
    data,
  }
}

/** Replaces only the app-owned keys. Reload after this so stores read the new values. */
export function restoreDataBackup(backup: DataBackup): void {
  for (const key of BACKUP_STORAGE_KEYS) {
    const value = backup.data[key]
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  }
}
