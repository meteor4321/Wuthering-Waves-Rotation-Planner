// ============================================================
// block.ts
// 定義「區塊（Block）」相關的所有介面與型別。
// 區塊是本專案最核心的資料單位。
// ============================================================

/**
 * 基礎招式的聯合型別。
 * 對應鳴潮七種基礎操作，使用簡短的英文/中文縮寫作為識別碼。
 * 'SWAP' = 變奏技，'OUTRO' = 延奏技（保留供未來擴充）。
 */
export type BaseSkillKey =
  | 'A'      // 普攻
  | 'Z'      // 重擊
  | 'E'      // 共鳴技能
  | 'R'      // 共鳴解放
  | 'Q'      // 聲骸技能
  | 'D'      // 閃避
  | 'SWAP'   // 變奏技（換人出場觸發）
  | 'OUTRO'; // 延奏技（換人離場觸發，保留欄位）

/**
 * 區塊的來源分類。
 * - 'default'  : 系統內建的單一基礎招式區塊（不可修改、不可刪除）
 * - 'template' : 使用者自訂並儲存在側邊欄的模板區塊
 * - 'instance' : 從側邊欄拖入主時間軸後產生的實體（帶有唯一 UUID）
 */
export type BlockSource = 'default' | 'template' | 'instance';

/**
 * 區塊顏色設定。
 * 使用 Tailwind CSS 的任意值語法相容的 hex 字串，例如 '#7C3AED'。
 * 預設區塊使用系統預設色，自訂區塊可由使用者自由指定。
 */
export type BlockColor = string; // hex 色碼字串，例如 '#7C3AED'

/**
 * BlockBase：所有區塊共用的基礎欄位。
 * 不論來源為何，每個區塊都具備這些屬性。
 */
export interface BlockBase {
  /** 區塊顯示文字，例如 'A'、'3AE'、'AAZ' */
  label: string;

  /**
   * 組成此區塊的基礎招式序列。
   * 例如 '3AE' 對應 ['A', 'A', 'A', 'E']。
   * 預設的單一招式區塊此陣列長度為 1。
   * 保留供日後 Buff 標籤系統或技能解析使用。
   */
  skills: BaseSkillKey[];

  /** 區塊的背景顏色（hex 字串），由使用者或系統指定 */
  color: BlockColor;

  /** 此區塊所屬的角色 ID（對應 Character.id）。
   *  null 代表預設通用區塊（系統七個基礎招式），不綁定任何角色。 */
  characterId: string | null;

  /**
   * 預留標籤欄位，供未來實作 Buff 狀態標記與 Tooltip 使用。
   * 目前版本不使用，但在資料結構中明確保留，避免未來破壞性更新。
   */
  tags: string[];
}

/**
 * DefaultBlock：系統預設的七個基礎招式區塊。
 * source 固定為 'default'，不參與排序也不可被刪除。
 * 使用靜態 ID（如 'default-A'），不需要 UUID。
 */
export interface DefaultBlock extends BlockBase {
  id: string; // 靜態 ID，格式：'default-A' | 'default-Z' | ...
  source: 'default';
  characterId: null; // 預設區塊不屬於任何角色
}

/**
 * TemplateBlock：使用者自訂並存放在側邊欄的模板區塊。
 * source 固定為 'template'。
 * 從主軸拖回側邊欄時，透過深拷貝產生，賦予新的 templateId（UUID）。
 */
export interface TemplateBlock extends BlockBase {
  /** 模板唯一識別碼，格式：UUID v4 字串 */
  templateId: string;
  source: 'template';
  /** 模板所屬角色，不可為 null（自訂模板一定屬於某一角色） */
  characterId: string;
  /** 建立時間戳，用於側邊欄排序顯示 */
  createdAt: number;
}

/**
 * InstanceBlock：從側邊欄拖入主時間軸後產生的實體。
 * 每次拖入都是一次「深拷貝 + 賦予新 UUID」的操作，
 * 確保主軸上每個區塊都是獨立的實體，互不干擾。
 */
export interface InstanceBlock extends BlockBase {
  /** 實體唯一識別碼，格式：UUID v4 字串 */
  instanceId: string;
  source: 'instance';
  /** 此實體所屬的角色 ID，不可為 null */
  characterId: string;
  /**
   * 追蹤此實體來源於哪個模板（templateId）或預設區塊（defaultBlockId）。
   * 純粹用於除錯與日誌，排序邏輯不依賴此欄位。
   */
  originId: string;
}

/**
 * Block：主時間軸 1D 陣列中儲存的聯合型別。
 * 主軸上的元素一定是 InstanceBlock。
 * 此別名讓程式碼在語意上更清晰。
 */
export type Block = InstanceBlock;

/**
 * AnyBlock：涵蓋所有來源的區塊聯合型別。
 * 用於需要同時處理側邊欄與主軸區塊的通用函式（例如渲染元件）。
 */
export type AnyBlock = DefaultBlock | TemplateBlock | InstanceBlock;