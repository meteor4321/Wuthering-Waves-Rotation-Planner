// ============================================================
// defaultBlocks.ts
// 系統預設的七個基礎招式區塊常數。
// 這些區塊在側邊欄的「預設區塊」區域中永久顯示，不可刪除。
// ============================================================

import type { DefaultBlock } from '../types/block';

/**
 * DEFAULT_BLOCKS：七個基礎招式的預設區塊定義。
 *
 * 設計決策：
 * - id 使用 'default-{skill}' 的靜態格式，不使用 UUID，
 * 方便在任何地方直接比對來源，也避免每次重新整理產生不同 id。
 * - color 使用中性的深色，讓使用者清楚知道這是「系統預設」而非角色專屬。
 * - characterId 固定為 null，代表通用，不綁定任何角色。
 */
export const DEFAULT_BLOCKS: DefaultBlock[] = [
  {
    id: 'default-A',
    label: 'A',
    color: '#64748B', // Slate-500：中性灰藍
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-Z',
    label: 'Z',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-E',
    label: 'E',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-R',
    label: 'R',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-Q',
    label: 'Q',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-D',
    label: '閃',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
  {
    id: 'default-SWAP',
    label: '變奏',
    color: '#64748B',
    characterId: null,
    source: 'default',
    tags: [],
  },
];

/**
 * DEFAULT_BLOCK_MAP：以 id 為鍵的查找表，O(1) 查找效率。
 */
export const DEFAULT_BLOCK_MAP: Record<string, DefaultBlock> =
  Object.fromEntries(DEFAULT_BLOCKS.map((b) => [b.id, b]));