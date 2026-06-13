// ============================================================
// block.ts
// 定義「區塊（Block）」相關的所有介面與型別。
// 區塊是本專案最核心的資料單位。
// ============================================================

/**
 * 區塊的來源分類。
 * - 'default'  ：系統內建的基礎招式區塊（不可修改、不可刪除）
 * - 'template' ：使用者自訂並儲存在側邊欄的模板區塊
 * - 'instance' ：主時間軸上的實體區塊（包含從模板拖入或直接新增的空白區塊）
 */
export type BlockSource = 'default' | 'template' | 'instance';

/**
 * 區塊顏色設定。
 * 使用 Tailwind CSS 的任意值語法相容的 hex 字串，例如 '#7C3AED'。
 * 預設區塊使用系統預設色，自訂區塊可由使用者自由指定。
 */
export type BlockColor = string;

/**
 * BlockBase：所有區塊共用的基礎欄位。
 * 拔除了原先綁定的基礎招式限制，回歸純文字與視覺呈現。
 */
export interface BlockBase {
  /** 區塊顯示文字，例如 'A'、'3AE'，或是使用者自由輸入的任意文字 */
  label: string;

  /** 區塊的背景顏色（hex 字串），由使用者或系統指定 */
  color: BlockColor;

  /** 此區塊所屬的角色 ID（對應 Character.id）。
   * null 代表預設通用區塊，不綁定任何角色。 */
  characterId: string | null;

  /**
   * 預留標籤欄位，供未來實作 Buff 狀態標記與 Tooltip 使用。
   */
  tags: string[];
}

/**
 * DefaultBlock：系統預設的基礎招式區塊。
 * source 固定為 'default'，不參與排序也不可被刪除。
 */
export interface DefaultBlock extends BlockBase {
  id: string; // 靜態 ID，例如 'default-A'
  source: 'default';
  characterId: null;
}

/**
 * TemplateBlock：使用者自訂並存放在側邊欄的模板區塊。
 * source 固定為 'template'。
 */
export interface TemplateBlock extends BlockBase {
  id: string; // 統一使用泛用 id（UUID）
  source: 'template';
  /** 模板所屬角色，不可為 null（自訂模板一定屬於某一角色） */
  characterId: string;
  /** 建立時間戳，用於側邊欄排序顯示 */
  createdAt: number;
}

/**
 * InstanceBlock：主時間軸上的實體區塊。
 * 無論是從側邊欄拖入的模板，還是使用者在主軸直接新增的空白區塊，都屬於此類別。
 */
export interface InstanceBlock extends BlockBase {
  id: string; // 統一使用泛用 id（UUID）
  source: 'instance';
  characterId: string;
  /**
   * 追蹤此實體來源於哪個模板（templateId）或預設區塊（defaultBlockId）。
   * 若為使用者在主軸上直接新增的空白/自訂區塊，則此欄位為 null。
   */
  originId: string | null;
}

/**
 * Block：主時間軸 1D 陣列中儲存的聯合型別。
 * 主軸上的元素一定是 InstanceBlock。
 */
export type Block = InstanceBlock;

/**
 * AnyBlock：涵蓋所有來源的區塊聯合型別。
 * 用於需要同時處理側邊欄與主軸區塊的通用函式（例如渲染元件）。
 */
export type AnyBlock = DefaultBlock | TemplateBlock | InstanceBlock;