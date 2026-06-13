// ============================================================
// characters.ts
// 鳴潮角色名單常數。
// 收錄 1.0 至當前版本實裝之所有共鳴者角色。
// ============================================================

import type { Character } from '../types/character';

/**
 * WUWA_CHARACTERS：鳴潮全角色預設名單。
 *
 * themeColor 依照角色的屬性（元素）配色設定：
 * 氣動 → 翠綠色系  (#10B981)
 * 冷凝 → 冰藍色系  (#38BDF8)
 * 導電 → 紫黃色系  (#A78BFA)
 * 湮滅 → 暗紅色系  (#F87171)
 * 衍射 → 金黃色系  (#FBBF24)
 * 熱熔 → 橘紅色系  (#FB923C)
 */
export const WUWA_CHARACTERS: Character[] = [
  // ── 氣動 ──────────────────────────────────────────
  { id: 'jiyan', nameZh: '忌炎', nameEn: 'Jiyan', themeColor: '#10B981', element: '氣動' },
  { id: 'yangyang', nameZh: '秧秧', nameEn: 'Yangyang', themeColor: '#34D399', element: '氣動' },
  { id: 'jianxin', nameZh: '鑒心', nameEn: 'Jianxin', themeColor: '#059669', element: '氣動' },
  { id: 'aalto', nameZh: '秋水', nameEn: 'Aalto', themeColor: '#6EE7B7', element: '氣動' },
  { id: 'rover-aero', nameZh: '漂泊者・氣動', nameEn: 'Rover (Aero)', themeColor: '#047857', element: '氣動' },
  { id: 'qiuyuan', nameZh: '仇遠', nameEn: 'Qiuyuan', themeColor: '#A7F3D0', element: '氣動' },
  { id: 'yuno', nameZh: '尤諾', nameEn: 'Yuno', themeColor: '#10B981', element: '氣動' },
  { id: 'xiakong', nameZh: '夏空', nameEn: 'Xiakong', themeColor: '#34D399', element: '氣動' },
  { id: 'katishia', nameZh: '卡提希婭', nameEn: 'Katisia', themeColor: '#059669', element: '氣動' },
  { id: 'sigrika', nameZh: '西格莉卡', nameEn: 'Sigrika', themeColor: '#6EE7B7', element: '氣動' },

  // ── 冷凝 ──────────────────────────────────────────
  { id: 'lingyang', nameZh: '凌陽', nameEn: 'Lingyang', themeColor: '#38BDF8', element: '冷凝' },
  { id: 'baizhi', nameZh: '白芷', nameEn: 'Baizhi', themeColor: '#BAE6FD', element: '冷凝' },
  { id: 'zhezhi', nameZh: '折枝', nameEn: 'Zhezhi', themeColor: '#0EA5E9', element: '冷凝' },
  { id: 'sanhua', nameZh: '散華', nameEn: 'Sanhua', themeColor: '#7DD3FC', element: '冷凝' },
  { id: 'youhu', nameZh: '釉瑚', nameEn: 'Youhu', themeColor: '#0284C7', element: '冷凝' },
  { id: 'carlotta', nameZh: '珂萊塔', nameEn: 'Carlotta', themeColor: '#0369A1', element: '冷凝' },
  { id: 'hiyuki', nameZh: '緋雪', nameEn: 'Hiyuki', themeColor: '#38BDF8', element: '冷凝' },
  { id: 'lucilla', nameZh: '洛瑟菈', nameEn: 'Lucilla', themeColor: '#BAE6FD', element: '冷凝' },

  // ── 導電 ──────────────────────────────────────────
  { id: 'calcharo', nameZh: '卡卡羅', nameEn: 'Calcharo', themeColor: '#A78BFA', element: '導電' },
  { id: 'yinlin', nameZh: '吟霖', nameEn: 'Yinlin', themeColor: '#C4B5FD', element: '導電' },
  { id: 'xiangli-yao', nameZh: '相里要', nameEn: 'Xiangli Yao', themeColor: '#8B5CF6', element: '導電' },
  { id: 'yuanwu', nameZh: '淵武', nameEn: 'Yuanwu', themeColor: '#7C3AED', element: '導電' },
  { id: 'lumi', nameZh: '燈燈', nameEn: 'Lumi', themeColor: '#DDD6FE', element: '導電' },
  { id: 'augusta', nameZh: '奧古斯塔', nameEn: 'Augusta', themeColor: '#6D28D9', element: '導電' },
  { id: 'buling', nameZh: '卜靈', nameEn: 'Buling', themeColor: '#4C1D95', element: '導電' },
  { id: 'rebecca', nameZh: '麗貝卡', nameEn: 'Rebecca', themeColor: '#A78BFA', element: '導電' },

  // ── 湮滅 ──────────────────────────────────────────
  { id: 'rover-havoc', nameZh: '漂泊者・湮滅', nameEn: 'Rover (Havoc)', themeColor: '#EF4444', element: '湮滅' },
  { id: 'danjin', nameZh: '丹瑾', nameEn: 'Danjin', themeColor: '#F87171', element: '湮滅' },
  { id: 'taoqi', nameZh: '桃祁', nameEn: 'Taoqi', themeColor: '#DC2626', element: '湮滅' },
  { id: 'camellya', nameZh: '椿', nameEn: 'Camellya', themeColor: '#B91C1C', element: '湮滅' },
  { id: 'phrolova', nameZh: '弗洛洛', nameEn: 'Phrolova', themeColor: '#991B1B', element: '湮滅' },
  { id: 'cantarella', nameZh: '坎特蕾拉', nameEn: 'Cantarella', themeColor: '#FCA5A5', element: '湮滅' },
  { id: 'rococo', nameZh: '洛可可', nameEn: 'Rococo', themeColor: '#EF4444', element: '湮滅' },
  { id: 'chisaki', nameZh: '千咲', nameEn: 'Chisaki', themeColor: '#F87171', element: '湮滅' },

  // ── 衍射 ──────────────────────────────────────────
  { id: 'rover-spectro', nameZh: '漂泊者・衍射', nameEn: 'Rover (Spectro)', themeColor: '#FDE68A', element: '衍射' },
  { id: 'jinhsi', nameZh: '今汐', nameEn: 'Jinhsi', themeColor: '#FCD34D', element: '衍射' },
  { id: 'verina', nameZh: '維里奈', nameEn: 'Verina', themeColor: '#FBBF24', element: '衍射' },
  { id: 'shorekeeper', nameZh: '守岸人', nameEn: 'Shorekeeper', themeColor: '#F59E0B', element: '衍射' },
  { id: 'phoebe', nameZh: '菲比', nameEn: 'Phoebe', themeColor: '#D97706', element: '衍射' },
  { id: 'luuk', nameZh: '陸·赫斯', nameEn: 'Luuk Herssen', themeColor: '#B45309', element: '衍射' },
  { id: 'linnae', nameZh: '琳奈', nameEn: 'Linnae', themeColor: '#FDE68A', element: '衍射' },
  { id: 'lucy', nameZh: '露西', nameEn: 'Lucy', themeColor: '#FCD34D', element: '衍射' },

  // ── 熱熔 ──────────────────────────────────────────
  { id: 'chixia', nameZh: '熾霞', nameEn: 'Chixia', themeColor: '#FB923C', element: '熱熔' },
  { id: 'encore', nameZh: '安可', nameEn: 'Encore', themeColor: '#F97316', element: '熱熔' },
  { id: 'mortefi', nameZh: '莫特斐', nameEn: 'Mortefi', themeColor: '#EA580C', element: '熱熔' },
  { id: 'changli', nameZh: '長離', nameEn: 'Changli', themeColor: '#C2410C', element: '熱熔' },
  { id: 'brant', nameZh: '布蘭特', nameEn: 'Brant', themeColor: '#9A3412', element: '熱熔' },
  { id: 'denia', nameZh: '達妮婭', nameEn: 'Denia', themeColor: '#FDBA74', element: '熱熔' },
  { id: 'mornye', nameZh: '莫寧', nameEn: 'Mornye', themeColor: '#FB923C', element: '熱熔' },
  { id: 'amis', nameZh: '愛彌斯', nameEn: 'Amis', themeColor: '#F97316', element: '熱熔' },
  { id: 'gabelina', nameZh: '嘉貝莉娜', nameEn: 'Gabelina', themeColor: '#EA580C', element: '熱熔' },
  { id: 'lupa', nameZh: '露帕', nameEn: 'Lupa', themeColor: '#C2410C', element: '熱熔' },
];

/**
 * CHARACTER_MAP：以 id 為鍵的角色查找表。
 * 時間複雜度 O(1) 的角色查找，避免在渲染迴圈中使用 Array.find()。
 */
export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  WUWA_CHARACTERS.map((c) => [c.id, c])
);