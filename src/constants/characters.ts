// ============================================================
// characters.ts
// 鳴潮角色名單常數。
// 此處為 MVP 版本，收錄主要可用角色，日後可持續新增。
// ============================================================

import type { Character } from '../types/character';

/**
 * WUWA_CHARACTERS：鳴潮全角色預設名單。
 *
 * themeColor 依照角色的屬性（元素）配色設定：
 *   氣動 → 翠綠色系  (#10B981)
 *   冷凝 → 冰藍色系  (#38BDF8)
 *   導電 → 紫黃色系  (#A78BFA)
 *   湮滅 → 暗紅色系  (#F87171)
 *   繞射 → 金黃色系  (#FBBF24)
 *   熔毀 → 橘紅色系  (#FB923C)
 */
export const WUWA_CHARACTERS: Character[] = [
  // ── 氣動 ──────────────────────────────────────────
  {
    id: 'jiyan',
    nameZh: '忌炎',
    nameEn: 'Jiyan',
    themeColor: '#10B981',
    element: '氣動',
  },
  {
    id: 'yangyang',
    nameZh: '秧秧',
    nameEn: 'Yangyang',
    themeColor: '#34D399',
    element: '氣動',
  },
  {
    id: 'chixia',
    nameZh: '赤霞',
    nameEn: 'Chixia',
    themeColor: '#6EE7B7',
    element: '氣動',
  },
  {
    id: 'danjin',
    nameZh: '丹瑾',
    nameEn: 'Danjin',
    themeColor: '#059669',
    element: '氣動',
  },
  // ── 冷凝 ──────────────────────────────────────────
  {
    id: 'lingyang',
    nameZh: '凌陽',
    nameEn: 'Lingyang',
    themeColor: '#38BDF8',
    element: '冷凝',
  },
  {
    id: 'jianxin',
    nameZh: '鑒心',
    nameEn: 'Jianxin',
    themeColor: '#7DD3FC',
    element: '冷凝',
  },
  {
    id: 'baizhi',
    nameZh: '白芷',
    nameEn: 'Baizhi',
    themeColor: '#BAE6FD',
    element: '冷凝',
  },
  {
    id: 'zhezhi',
    nameZh: '折枝',
    nameEn: 'Zhezhi',
    themeColor: '#0EA5E9',
    element: '冷凝',
  },
  {
    id: 'shorekeeper',
    nameZh: '守岸人',
    nameEn: 'Shorekeeper',
    themeColor: '#0369A1',
    element: '冷凝',
  },
  // ── 導電 ──────────────────────────────────────────
  {
    id: 'calcharo',
    nameZh: '卡卡羅',
    nameEn: 'Calcharo',
    themeColor: '#A78BFA',
    element: '導電',
  },
  {
    id: 'yinlin',
    nameZh: '吟霖',
    nameEn: 'Yinlin',
    themeColor: '#C4B5FD',
    element: '導電',
  },
  {
    id: 'rover-spectro',
    nameZh: '漂泊者・繞射',
    nameEn: 'Rover (Spectro)',
    themeColor: '#FDE68A',
    element: '繞射',
  },
  {
    id: 'taoqi',
    nameZh: '桃祁',
    nameEn: 'Taoqi',
    themeColor: '#8B5CF6',
    element: '導電',
  },
  {
    id: 'aalto',
    nameZh: '阿爾托',
    nameEn: 'Aalto',
    themeColor: '#7C3AED',
    element: '導電',
  },
  // ── 湮滅 ──────────────────────────────────────────
  {
    id: 'encore',
    nameZh: '安可',
    nameEn: 'Encore',
    themeColor: '#F87171',
    element: '湮滅',
  },
  {
    id: 'rover-havoc',
    nameZh: '漂泊者・湮滅',
    nameEn: 'Rover (Havoc)',
    themeColor: '#EF4444',
    element: '湮滅',
  },
  {
    id: 'havoc-rover',
    nameZh: '今汐',
    nameEn: 'Jinhsi',
    themeColor: '#DC2626',
    element: '湮滅',
  },
  {
    id: 'camellya',
    nameZh: '卡蜜拉',
    nameEn: 'Camellya',
    themeColor: '#B91C1C',
    element: '湮滅',
  },
  // ── 繞射 ──────────────────────────────────────────
  {
    id: 'verina',
    nameZh: '維里奈',
    nameEn: 'Verina',
    themeColor: '#FBBF24',
    element: '繞射',
  },
  {
    id: 'mortefi',
    nameZh: '莫特斐',
    nameEn: 'Mortefi',
    themeColor: '#F59E0B',
    element: '繞射',
  },
  // ── 熔毀 ──────────────────────────────────────────
  {
    id: 'changli',
    nameZh: '長離',
    nameEn: 'Changli',
    themeColor: '#FB923C',
    element: '熔毀',
  },
  {
    id: 'xiangli-yao',
    nameZh: '相里要',
    nameEn: 'Xiangli Yao',
    themeColor: '#F97316',
    element: '熔毀',
  },
  {
    id: 'brant',
    nameZh: '布蘭特',
    nameEn: 'Brant',
    themeColor: '#EA580C',
    element: '熔毀',
  },
];

/**
 * CHARACTER_MAP：以 id 為鍵的角色查找表。
 * 時間複雜度 O(1) 的角色查找，避免在渲染迴圈中使用 Array.find()。
 *
 * 使用 Record<string, Character> 而非 Map，是為了讓 JSON 序列化時無損。
 */
export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  WUWA_CHARACTERS.map((c) => [c.id, c])
);