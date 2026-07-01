// ============================================================
// characters.ts — 鳴潮全角色預設名單（收錄 1.0 至當前版本）。
//
// 設計原則：
//   - 顏色一律由 element 經 getElementColor 決定，資料不存主題色。
//   - 每位角色只記名稱、屬性、星級。
//   - 各屬性區塊內依星級排列（5★ 在 4★ 之前）。
// ============================================================

import type { Character } from '../types/character';

/** 鳴潮全角色預設名單。 */
export const WUWA_CHARACTERS: Character[] = [
  // ── 氣動 ──────────────────────────────────────────
  // 5★
  { id: 'jiyan', nameZh: '忌炎', element: '氣動', rarity: 5 },
  { id: 'jianxin', nameZh: '鑒心', element: '氣動', rarity: 5 },
  { id: 'rover-aero', nameZh: '漂泊者・氣動', element: '氣動', rarity: 5 },
  { id: 'qiuyuan', nameZh: '仇遠', element: '氣動', rarity: 5 },
  { id: 'yuno', nameZh: '尤諾', element: '氣動', rarity: 5 },
  { id: 'xiakong', nameZh: '夏空', element: '氣動', rarity: 5 },
  { id: 'katishia', nameZh: '卡提希婭', element: '氣動', rarity: 5 },
  { id: 'sigrika', nameZh: '西格莉卡', element: '氣動', rarity: 5 },
  // 4★
  { id: 'yangyang', nameZh: '秧秧', element: '氣動', rarity: 4 },
  { id: 'aalto', nameZh: '秋水', element: '氣動', rarity: 4 },

  // ── 冷凝 ──────────────────────────────────────────
  // 5★
  { id: 'lingyang', nameZh: '凌陽', element: '冷凝', rarity: 5 },
  { id: 'zhezhi', nameZh: '折枝', element: '冷凝', rarity: 5 },
  { id: 'carlotta', nameZh: '珂萊塔', element: '冷凝', rarity: 5 },
  { id: 'hiyuki', nameZh: '緋雪', element: '冷凝', rarity: 5 },
  { id: 'lucilla', nameZh: '洛瑟菈', element: '冷凝', rarity: 5 },
  // 4★
  { id: 'baizhi', nameZh: '白芷', element: '冷凝', rarity: 4 },
  { id: 'sanhua', nameZh: '散華', element: '冷凝', rarity: 4 },
  { id: 'youhu', nameZh: '釉瑚', element: '冷凝', rarity: 4 },

  // ── 導電 ──────────────────────────────────────────
  // 5★
  { id: 'calcharo', nameZh: '卡卡羅', element: '導電', rarity: 5 },
  { id: 'yinlin', nameZh: '吟霖', element: '導電', rarity: 5 },
  { id: 'xiangli-yao', nameZh: '相里要', element: '導電', rarity: 5 },
  { id: 'augusta', nameZh: '奧古斯塔', element: '導電', rarity: 5 },
  { id: 'rebecca', nameZh: '麗貝卡', element: '導電', rarity: 5 },
  // 4★
  { id: 'yuanwu', nameZh: '淵武', element: '導電', rarity: 4 },
  { id: 'lumi', nameZh: '燈燈', element: '導電', rarity: 4 },
  { id: 'buling', nameZh: '卜靈', element: '導電', rarity: 4 },

  // ── 湮滅 ──────────────────────────────────────────
  // 5★
  { id: 'rover-havoc', nameZh: '漂泊者・湮滅', element: '湮滅', rarity: 5 },
  { id: 'camellya', nameZh: '椿', element: '湮滅', rarity: 5 },
  { id: 'phrolova', nameZh: '弗洛洛', element: '湮滅', rarity: 5 },
  { id: 'cantarella', nameZh: '坎特蕾拉', element: '湮滅', rarity: 5 },
  { id: 'rococo', nameZh: '洛可可', element: '湮滅', rarity: 5 },
  { id: 'chisaki', nameZh: '千咲', element: '湮滅', rarity: 5 },
  // 4★
  { id: 'danjin', nameZh: '丹瑾', element: '湮滅', rarity: 4 },
  { id: 'taoqi', nameZh: '桃祈', element: '湮滅', rarity: 4 },

  // ── 衍射 ──────────────────────────────────────────
  // 5★
  { id: 'rover-spectro', nameZh: '漂泊者・衍射', element: '衍射', rarity: 5 },
  { id: 'jinhsi', nameZh: '今汐', element: '衍射', rarity: 5 },
  { id: 'verina', nameZh: '維里奈', element: '衍射', rarity: 5 },
  { id: 'shorekeeper', nameZh: '守岸人', element: '衍射', rarity: 5 },
  { id: 'phoebe', nameZh: '菲比', element: '衍射', rarity: 5 },
  { id: 'luuk', nameZh: '陸·赫斯', element: '衍射', rarity: 5 },
  { id: 'linnae', nameZh: '琳奈', element: '衍射', rarity: 5 },
  { id: 'lucy', nameZh: '露西', element: '衍射', rarity: 5 },
  { id: 'zani', nameZh: '贊妮', element: '衍射', rarity: 5 },

  // ── 熱熔 ──────────────────────────────────────────
  // 5★
  { id: 'encore', nameZh: '安可', element: '熱熔', rarity: 5 },
  { id: 'changli', nameZh: '長離', element: '熱熔', rarity: 5 },
  { id: 'brant', nameZh: '布蘭特', element: '熱熔', rarity: 5 },
  { id: 'denia', nameZh: '達妮婭', element: '熱熔', rarity: 5 },
  { id: 'mornye', nameZh: '莫寧', element: '熱熔', rarity: 5 },
  { id: 'amis', nameZh: '愛彌斯', element: '熱熔', rarity: 5 },
  { id: 'gabelina', nameZh: '嘉貝莉娜', element: '熱熔', rarity: 5 },
  { id: 'lupa', nameZh: '露帕', element: '熱熔', rarity: 5 },
  // 4★
  { id: 'chixia', nameZh: '熾霞', element: '熱熔', rarity: 4 },
  { id: 'mortefi', nameZh: '莫特斐', element: '熱熔', rarity: 4 },
];

/** 以 id 為鍵的角色查找表（O(1)，避免渲染迴圈用 Array.find）。 */
export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  WUWA_CHARACTERS.map((c) => [c.id, c])
);
