// ============================================================
// useHotkeyInputMode.ts — 熱鍵輸入模式（module 單例）。
//
// 職責：模式開關狀態 ＋ 模式中的鍵盤輸入分派（插入區塊／切泳道／刪除／退出）。
// 設計決策（見 DesignDocument/HotkeyInputMode.md）：
//   - 對映以 label 為準（非模板 id）：命中即呼叫 addFreeformBlock 插入自由區塊，
//     不需處理模板刪改的懸空引用。
//   - 鍵位比對用 event.code（物理鍵），免疫 CapsLock 與輸入法。
//   - 泳道選中直接重用 rotationStore.selectedLaneIndex（沿用青色焦點環視覺）。
//   - 對映表改讀 useHotkeyMap（Stage 2：設定頁可編輯、LocalStorage 持久化）。
//   - 模式中既有快捷鍵全數停用：useKeyboardShortcuts 分派器見 active 即短路
//     改呼叫 handleModeKeydown。
// ============================================================

import { computed, ref } from 'vue';
import { useRotationStore } from '@/stores/useRotationStore';
import { useCharacterStore } from '@/stores/useCharacterStore';
import { useLaneOrder } from '@/composables/state/useLaneOrder';
import { useHistory } from '@/composables/state/useHistory';
import { useSidebarCollapse } from '@/composables/state/useSidebarCollapse';
import { useBoardScroll } from '@/composables/board/useBoardScroll';
import { useHotkeyMap } from '@/composables/state/useHotkeyMap';
import { useSettings } from '@/composables/state/useSettings';
import { getElementColor } from '@/constants/elements';
import { playDeleteGhosts } from '@/utils/deleteGhost';
import type { SlotIndex } from '@/types/character';
import type { PressType } from '@/types/hotkey';

// 模組層級單例：模式開關（整個 App 共用同一份）。
const active = ref(false);
// 暫停接收輸入（視窗 blur／滑鼠移出視窗）：不退出模式，回焦即恢復（§3.1）。
const paused = ref(false);
// 控制列（底部提示膠囊）是否可顯示：待側欄收合過渡完成、幽靈格置中後才為 true。
// 避免在版面寬度過渡期間先渲染膠囊，導致提示文字換行抖動。
const controlsReady = ref(false);
// 進入模式前側邊欄是否已收合：退出時據此還原（模式自動收合側欄爭取軸面寬度）。
let _sidebarWasCollapsed = false;
// 單擊／長按閾值：keydown 起計、keyup 依按住時長判定（§3.3，寫死不設定）。
const HOLD_THRESHOLD_MS = 300;
// ── 快速連點合併（設定 hotkeyTapCombine 啟用時）────────────────
// 合併時間窗：每次 tap 落子（或新按壓開始）後重新起算；期間無新輸入才把
// 緩衝內容「直接串接」成單一區塊落下（落子最多延遲此毫秒數）。調整手感改這裡。
const TAP_COMBINE_WINDOW_MS = 200;
// 待合併的 tap label 緩衝（依輸入順序；空陣列＝無待合併內容）。
// 響應式：驅動 Swimlane 幽靈格的合併預顯文字。
const _tapBufferLabels = ref<string[]>([]);
// 合併結算計時器 id（每次 tap／起按重新起算；到期即結算落子）。
let _tapCombineTimer: number | null = null;
// 進行中的按壓：鍵位（event.code 或 MouseLeft/Right）→ 起按時刻（performance.now）。
// 模組層級共用：鍵盤 keydown/keyup 走 useKeyboardShortcuts、滑鼠走 overlay，
// 兩路各自 useHotkeyInputMode() 但共享此表，落子一律在 keyup/mouseup 判型別後。
const _pressStartAt = new Map<string, number>();
// 已於「達長按閾值時」把 hold label 入緩衝、待放開的鍵位（快速連點合併開啟時）。
// 長按一達閾值即入緩衝（依按壓順序落點），放開時 endPress 據此不重複入緩衝、僅起靜默窗。
// 用 Set（非單一 ref）以容忍同時按住多鍵（鍵盤＋滑鼠）各自越閾值。
const _holdCommitted = new Set<string>();
// 目前正被按住、且有對映的鍵位（同時只驅動一枚幽靈格長按進度動畫）。
// 為 null＝無按壓（幽靈格顯示鍵盤圖標）；非 null＝按壓中（顯示徑向進度環，見 §3.3 Stage 3-2）。
const _pressingHotkey = ref<string | null>(null);
// 長按即時預顯（§3.3）：按住超過閾值且該鍵有 hold 條目時，填入其 label，
// 讓使用者在放開前就知道會落哪一塊。為 null＝未達閾值或該鍵無 hold 條目。
const _holdPreviewLabel = ref<string | null>(null);
// 單擊即時預顯：起按瞬間顯示該鍵 tap 條目的 label（放開落子前就知道會落哪一塊）。
// 與合併緩衝預顯互補：關閉快速連點合併時落子不經緩衝，這是唯一的預顯來源。
// 達長按閾值即清（tap 窗已過：有 hold 條目換 hold 預顯；tap-only 鍵長按＝取消，無可預顯）。
const _tapPreviewLabel = ref<string | null>(null);
// 單擊落子後預顯續留時間：與合併緩衝窗同值，讓「關閉快速連點合併」時的淡入淡出
// 與「合併」路徑一致——快速一擊的按壓極短（數十毫秒），若隨放開即清，120ms 淡入
// 來不及完成就轉淡出，只會閃一下；續留此毫秒數再淡出，預顯才會完整呈現。
const TAP_PREVIEW_LINGER_MS = TAP_COMBINE_WINDOW_MS;
// 單擊落子後續留計時器 id（到期清 _tapPreviewLabel；新按壓／暫停／退出時提前清）。
let _tapPreviewLingerTimer: number | null = null;
// 達閾值計時器 id（跨鍵盤／滑鼠共用單一計時器；起按設、放開／暫停／退出清）。
let _holdTimer: number | null = null;
// 刪除訊號（遞增計數）：每次熱鍵刪除 +1，驅動垂直焦點框直柱閃紅一次
// （RotationBoard watch 此值；用計數而非 boolean 讓連刪能重複觸發）。
const _deleteFlashTick = ref(0);
// 檢視模式（Shift＋滾輪捲動檢視站位）：顯式狀態機——Shift 滾動置 true、
// 插入／刪除／undo（會重新置中的操作）置 false。true 期間：直柱隱藏
// （RotationBoard）、切泳道不觸發輸送帶捲動（useGhostConveyor）。
// 不用 scroll 事件來源推測（程式化與使用者捲動無法可靠區分，heuristic 已證不穩）。
const _inspecting = ref(false);
// 剛以熱鍵插入的區塊 id：驅動 RotationBlock 播一次「落下吸附」進場動畫（§3.2）。
// 動畫播畢即清（一次性）；下次插入覆蓋為新 id。
const _enteringId = ref<string | null>(null);
let _enterTimer: number | null = null;
// 進場動畫時長（與 RotationBlock 的 block-enter keyframes 對齊；含保險餘裕）。
const ENTER_ANIM_MS = 260;
// 側欄收合的欄寬過渡時長（AppLayout transition 0.25s）：進場置中捲動須等
// 版面定型後再算，否則以過渡中的寬度計算會偏。
const SIDEBAR_TRANSITION_MS = 300;

// 熱鍵導覽首訪旗標鍵（與 useSpotlightTour.HOTKEY_STORAGE_KEY 同值）：於「收合側欄前」
// 同步判斷是否讓行給導覽。導覽模組因循環相依只能動態 import，其 hasSeenHotkeyTour
// 取不到同步值；改直接讀 localStorage，避免非同步時序造成側欄開合抖動（見 enter()）。
const HOTKEY_TOUR_SEEN_KEY = 'wuwa-rotation-hotkey-tour-seen';
function _shouldAutoPlayHotkeyTour(): boolean {
  try {
    return localStorage.getItem(HOTKEY_TOUR_SEEN_KEY) !== 'true';
  } catch {
    return false; // localStorage 不可用 → 不自動播放，照常進入模式
  }
}

export function useHotkeyInputMode() {
  const rotationStore = useRotationStore();
  const characterStore = useCharacterStore();
  const history = useHistory();
  const { laneOrder } = useLaneOrder();
  const sidebarCollapse = useSidebarCollapse();
  const { scrollSelectorIntoView } = useBoardScroll();
  const hotkeyMap = useHotkeyMap();
  const { settings } = useSettings();

  /** 可選中的泳道（已選角），依畫面上下顯示順序排列。 */
  const selectableLanes = computed<SlotIndex[]>(() =>
    laneOrder.value.filter((si) => characterStore.slots[si].character !== null),
  );

  /**
   * 補選泳道：維持「模式中永遠恰有一條泳道被選中」的不變量。
   * preferred 仍可選則沿用，否則落到第一條可選泳道；全空＝模式無意義，退出。
   * 進入模式與 undo/redo 後（useHistory._apply 會清空選取）都經此收斂。
   */
  function ensureLaneSelected(preferred: SlotIndex | null): void {
    const lanes = selectableLanes.value;
    if (lanes.length === 0) {
      exit();
      return;
    }
    const lane = preferred !== null && lanes.includes(preferred) ? preferred : lanes[0];
    rotationStore.selectLane(lane);
  }

  /** 把插入落點（幽靈格）水平置中——以「整個視窗」為基準（非軌道區中心，
   *  軌道區在側欄右側、其中心相對螢幕偏右），與輸送帶捲動的釘點一致。 */
  function centerGhostCell(): void {
    scrollSelectorIntoView('.track__ghost-cell', { centerOn: 'viewport' });
  }

  /** 進入模式：預設選中畫面上第一條有選角的泳道；全空則不進入。 */
  function enter(): void {
    if (active.value) return;
    if (selectableLanes.value.length === 0) return; // 無任何角色可插入 → 模式無意義，不進入
    // 首次進入 → 全權交給熱鍵導覽（導覽會自行注入示範資料並以乾淨狀態進入模式）。
    // 必須在「收合側欄之前」讓行：否則本函式先收合側欄，導覽 begin() 隨即退出模式
    // 還原側欄、再重新進入又收合 → 側欄開合抖動。旗標同步讀取（見 _shouldAutoPlayHotkeyTour）。
    if (_shouldAutoPlayHotkeyTour()) {
      // 動態 import 打破循環相依（導覽的示範腳本 useTourDemo 反向 import 本檔）。
      void import('@/composables/state/useSpotlightTour').then(({ useSpotlightTour }) => {
        const tour = useSpotlightTour();
        if (tour.isActive.value) return; // 導覽已在進行 → 不重複啟動
        void tour.startHotkeyTour();
      });
      return; // 本函式不進入模式、不動側欄；由導覽 begin() 內的 enter()（旗標已寫）走正常進入
    }
    active.value = true;
    _inspecting.value = false; // 進場重置檢視狀態
    controlsReady.value = false; // 進場先隱藏控制列，待版面定型後再顯示
    ensureLaneSelected(rotationStore.selectedLaneIndex);
    // 自動收合側邊欄爭取軸面寬度；退出時還原原本的收合狀態。
    _sidebarWasCollapsed = sidebarCollapse.collapsed.value;
    sidebarCollapse.collapsed.value = true;
    // 等欄寬過渡定型後，把插入落點置中（過渡中量測會以瞬時寬度計算而偏掉），
    // 再顯示底部控制列 → 膠囊只在最終寬度下佈局，不會於過渡中換行抖動。
    window.setTimeout(() => {
      if (!active.value) return;
      centerGhostCell();
      controlsReady.value = true;
    }, SIDEBAR_TRANSITION_MS);
  }

  /** 退出模式：清掉泳道選取、還原側欄收合狀態，回復一切既有行為。 */
  function exit(): void {
    if (!active.value) return;
    flushTapBuffer(); // 待合併內容先結算落子，再退出（不丟輸入）
    active.value = false;
    paused.value = false;
    _inspecting.value = false;
    controlsReady.value = false;
    _pressStartAt.clear(); // 清掉未放開的按壓，避免下次進入誤判
    _holdCommitted.clear(); // 清掉待放開的已入緩衝長按標記
    _pressingHotkey.value = null;
    _clearHoldPreview();
    rotationStore.selectLane(null);
    sidebarCollapse.collapsed.value = _sidebarWasCollapsed;
  }

  /** 切換至畫面上第 n 條（0-based 顯示序）泳道；未選角則跳過。回 true＝有切換。 */
  function setLaneByDisplayIndex(displayIndex: number): boolean {
    const slot = laneOrder.value[displayIndex];
    if (slot === undefined) return false;
    if (!selectableLanes.value.includes(slot)) return false;
    _inspecting.value = false; // 移動幽靈格＝結束檢視（conveyor 於此歸位重新置中、直柱淡回）
    flushTapBuffer(); // 切泳道前先結算待合併內容（落在原泳道）
    rotationStore.selectLane(slot);
    return true;
  }

  /** 上一條/下一條已選角泳道（依顯示順序循環）。 */
  function cycleLane(direction: 1 | -1): void {
    const lanes = selectableLanes.value;
    if (lanes.length === 0) return;
    const idx = lanes.indexOf(rotationStore.selectedLaneIndex as SlotIndex);
    const next = idx === -1 ? 0 : (idx + direction + lanes.length) % lanes.length;
    _inspecting.value = false; // 移動幽靈格＝結束檢視（conveyor 於此歸位重新置中、直柱淡回）
    flushTapBuffer(); // 切泳道前先結算待合併內容（落在原泳道）
    rotationStore.selectLane(lanes[next]);
  }

  /** 把一段文字作為新區塊插入選中泳道末尾（＝1D 陣列末尾）。 */
  function insertLabel(label: string): void {
    _inspecting.value = false; // 落子＝結束檢視（conveyor 於 entries 變化時重新置中）
    const lane = rotationStore.selectedLaneIndex;
    if (lane === null) return;
    const character = characterStore.slots[lane].character;
    if (!character) return;
    // addFreeformBlock 自帶 history.record() → 一鍵（或一次合併結算）一步 undo。
    const newId = rotationStore.addFreeformBlock(
      label,
      getElementColor(character.element),
      lane,
      character.id,
      rotationStore.entries.length - 1,
    );
    // 標記剛插入的區塊 → RotationBlock 播一次落下吸附進場動畫（一次性，播畢即清）。
    // 落點跟隨改由 useGhostConveyor 監聽 entries 數觸發（輸送帶捲動＋幽靈格釘中央），
    // 此處不再呼叫 centerGhostCell（兩套捲動會互搶）。
    _markEntering(newId);
  }

  /**
   * 立即結算連點合併緩衝：把累積的 label 直接串接成單一區塊落下。
   * 無緩衝內容＝no-op。除計時器到期外，任何會改變落點語意的操作
   * （切泳道／刪除／長按落子／undo·redo／暫停／退出）前都先呼叫本函式。
   */
  function flushTapBuffer(): void {
    if (_tapCombineTimer !== null) {
      clearTimeout(_tapCombineTimer);
      _tapCombineTimer = null;
    }
    if (_tapBufferLabels.value.length === 0) return;
    const combined = _tapBufferLabels.value.join('');
    _tapBufferLabels.value = [];
    insertLabel(combined);
  }

  /** 重新起算合併結算計時器（每次 tap 入緩衝、或按壓開始時延後結算）。 */
  function _restartTapCombineTimer(): void {
    if (_tapCombineTimer !== null) clearTimeout(_tapCombineTimer);
    _tapCombineTimer = window.setTimeout(() => {
      _tapCombineTimer = null;
      flushTapBuffer();
    }, TAP_COMBINE_WINDOW_MS);
  }

  /** 把一段 label 追加進合併緩衝（只入緩衝、不動計時器）；幽靈格同步預顯累積文字。 */
  function _appendTapLabel(label: string): void {
    _tapBufferLabels.value = [..._tapBufferLabels.value, label];
    // 幽靈格變寬的跟隨由 useGhostConveyor 監聽預顯文字觸發。
  }

  /** 把一次 tap 排入合併緩衝並重新計時（放開時的一般入緩衝路徑）。 */
  function bufferTap(label: string): void {
    _appendTapLabel(label);
    _restartTapCombineTimer();
  }

  /**
   * 起按：記錄該鍵位的起按時刻（keydown／mousedown 共用）。
   * 回 true＝此鍵位有對映（呼叫端據此 preventDefault）。暫停中或無對映不記。
   * 已在按住（含作業系統自動重複）則不覆蓋起按時刻。
   */
  function beginPress(hotkey: string): boolean {
    if (paused.value) return false;
    if (!hotkeyMap.hasHotkey(hotkey)) return false;
    if (!_pressStartAt.has(hotkey)) {
      _pressStartAt.set(hotkey, performance.now());
      // 按壓進行中凍結合併結算（同 OS 雙擊判定：分組只看「放開後的靜默間隔」，
      // 按壓多久都不切分）。清掉倒數計時器、暫停結算；放開時 endPress 再依 tap／hold
      // 重啟計時或結算。若不凍結，單次按壓時長落在合併窗（TAP_COMBINE_WINDOW_MS）~長按閾值（HOLD_THRESHOLD_MS）之間
      // 仍是合法 tap，計時器卻會在按住期間到期把緩衝提前拆成獨立塊。
      if (_tapCombineTimer !== null) {
        clearTimeout(_tapCombineTimer);
        _tapCombineTimer = null;
      }
      // 新一輪按壓起始：驅動幽靈格徑向進度環從 0 開始填（作業系統自動重複不覆蓋）。
      _pressingHotkey.value = hotkey;
      _scheduleHoldPreview(hotkey);
      // 單擊即時預顯：起按就顯示 tap 條目 label（hold-only 鍵與 Digit 入場技解析為 null 不顯示）。
      // 須在 _scheduleHoldPreview 之後設（其開頭的 _clearHoldPreview 會連同本值一起清）。
      const tapEntry = hotkeyMap.resolveByCodeAndPress(hotkey, 'tap');
      _tapPreviewLabel.value = tapEntry ? tapEntry.label : null;
    }
    return true;
  }

  /**
   * 排程長按辨識（達閾值時處理）：
   *   - 開啟快速連點合併：達閾值即把 hold label 入緩衝（依按壓順序落點，不等放開）。
   *     這是修正「放開才入緩衝」導致的落點順序錯亂／緩衝被拆塊——長按若晚於後續 tap
   *     才放開，原先會把 hold 補在末尾甚至獨立成塊。改於閾值（＝進度環填滿）當下入緩衝，
   *     所見即所得。按住期間不起靜默窗（比照 beginPress 凍結），放開由 endPress 起窗。
   *   - 關閉合併：僅顯示長按即時預顯，實際落子仍於放開時 insertLabel。
   */
  function _scheduleHoldPreview(hotkey: string): void {
    _clearHoldPreview();
    _holdTimer = window.setTimeout(() => {
      _holdTimer = null;
      if (_pressingHotkey.value !== hotkey) return; // 已放開／換鍵
      // 達閾值＝tap 窗已過：清掉單擊預顯（tap-only 鍵長按＝取消輸入，放開不落子）。
      _tapPreviewLabel.value = null;
      // 僅在「真的有 hold 條目」時處理（resolveByCodeAndPress('hold') 對 tap-only 鍵回 null）。
      const entry = hotkeyMap.resolveByCodeAndPress(hotkey, 'hold');
      if (!entry || entry.pressType !== 'hold' || entry.label.trim() === '') return;
      if (settings.value.hotkeyTapCombine) {
        // 達閾值即入緩衝；標記待放開，endPress 據此不重複入緩衝。預顯改由 tapCombineLabel
        // 承接（已含此 hold label），故不另設 _holdPreviewLabel。
        _appendTapLabel(entry.label);
        _holdCommitted.add(hotkey);
      } else {
        _holdPreviewLabel.value = entry.label;
      }
    }, HOLD_THRESHOLD_MS);
  }

  /** 清掉按壓預顯（長按計時器＋長按/單擊 label）。放開／暫停／退出／換鍵時呼叫。 */
  function _clearHoldPreview(): void {
    if (_holdTimer !== null) {
      clearTimeout(_holdTimer);
      _holdTimer = null;
    }
    _holdPreviewLabel.value = null;
    _tapPreviewLabel.value = null;
    if (_tapPreviewLingerTimer !== null) {
      clearTimeout(_tapPreviewLingerTimer);
      _tapPreviewLingerTimer = null;
    }
  }

  /**
   * 單擊落子後讓預顯續留一小段再淡出（關閉快速連點合併時使用）。
   * 與 endPress 同一同步流程中，_clearHoldPreview 先把 label 清為 null、本函式隨即
   * 再設回——同 tick 淨值不變，故不觸發離場，預顯自按壓起連續呈現至此續留結束才淡出。
   */
  function _lingerTapPreview(label: string): void {
    if (_tapPreviewLingerTimer !== null) clearTimeout(_tapPreviewLingerTimer);
    _tapPreviewLabel.value = label;
    _tapPreviewLingerTimer = window.setTimeout(() => {
      _tapPreviewLingerTimer = null;
      _tapPreviewLabel.value = null;
    }, TAP_PREVIEW_LINGER_MS);
  }

  /**
   * 放開：依按住時長判 tap/hold，解析對映條目後落子（keyup／mouseup 共用）。
   * 回 true＝有落子（呼叫端據此 preventDefault）。無對應起按或暫停中則不動作。
   */
  function endPress(hotkey: string): boolean {
    const start = _pressStartAt.get(hotkey);
    if (start === undefined) return false;
    _pressStartAt.delete(hotkey);
    // 此鍵的 hold 是否已於達閾值時入緩衝（合併模式）。
    const wasCommitted = _holdCommitted.delete(hotkey);
    if (_pressingHotkey.value === hotkey) {
      _pressingHotkey.value = null; // 放開＝停止進度環
      _clearHoldPreview();
    }

    if (wasCommitted) {
      // 長按已在達閾值時入緩衝，此處不重複入；放開才開始合併靜默窗
      //（按住期間凍結，見 _scheduleHoldPreview）。緩衝可能已被其他操作結算（如切泳道），
      // 故僅在仍有內容時起窗。
      if (_tapBufferLabels.value.length > 0) _restartTapCombineTimer();
      return true;
    }

    if (paused.value) return false;
    const pressType: PressType = performance.now() - start >= HOLD_THRESHOLD_MS ? 'hold' : 'tap';
    const entry = hotkeyMap.resolveByCodeAndPress(hotkey, pressType);
    if (!entry) {
      // 未落子（取消：tap-only 鍵長按／hold-only 鍵短按／無對映）。若緩衝有內容，
      // beginPress 起按時凍結的合併計時器須在此重啟，否則緩衝會卡著不自動結算。
      if (_tapBufferLabels.value.length > 0) _restartTapCombineTimer();
      return false;
    }
    if (settings.value.hotkeyTapCombine) {
      // 快速連點合併：tap／hold 一律先入緩衝，時間窗內無新輸入才串接落成一塊。
      // 長按亦入緩衝故可雙向串接（前後皆能接）；按住期間計時器由 beginPress 凍結，
      // 長按超過合併窗也不會被提前拆塊。
      bufferTap(entry.label);
    } else {
      // 關閉合併：先結算緩衝（防設定中途切換的殘留），再單獨插入。
      flushTapBuffer();
      insertLabel(entry.label);
      // 關閉快速連點合併時的單擊：落子後讓預顯續留再淡出，淡入淡出與合併路徑一致
      //（長按落子不續留：hold 預顯已於按住期間完整呈現，放開自全不透明淡出）。
      if (pressType === 'tap') _lingerTapPreview(entry.label);
    }
    return true;
  }

  /** 標記剛插入的區塊為「進場中」，排程於動畫時長後清除（一次性）。 */
  function _markEntering(id: string): void {
    if (_enterTimer !== null) clearTimeout(_enterTimer);
    _enteringId.value = id;
    _enterTimer = window.setTimeout(() => {
      _enterTimer = null;
      if (_enteringId.value === id) _enteringId.value = null;
    }, ENTER_ANIM_MS);
  }

  /** 刪除全時間軸的最後一個區塊（不分泳道；節奏遊戲式「倒帶一格」，幽靈格僅為插入指示）。 */
  function deleteLastBlock(): void {
    _inspecting.value = false; // 刪除＝結束檢視（conveyor 於 entries 變化時重新置中）
    flushTapBuffer(); // 先結算待合併內容再刪（刪除語意以已落子的末塊為準）
    const last = rotationStore.entries[rotationStore.entries.length - 1];
    if (last) {
      // 先克隆再即刪：版面立即收合（下一塊馬上成為新末塊，連按不卡），
      // 淡出由固定在原螢幕位置的克隆呈現，與版面脫鉤（共用 utils/deleteGhost）。
      playDeleteGhosts([last.id]);
      rotationStore.deleteBlock(last.id); // 落點跟隨由 useGhostConveyor 監聽 entries 數觸發
      _deleteFlashTick.value++; // 直柱閃紅提示（RotationBoard 監聽）
    }
  }

  /**
   * 模式中的 keydown 分派（由 useKeyboardShortcuts 短路轉呼叫）。
   * 僅保留：對映熱鍵／1-2-3 切泳道／Delete 刪末塊／Esc 退出／Ctrl+Z 系復原。
   * 未命中的按鍵不動作也不 preventDefault（瀏覽器原生行為如 F5 不受影響）。
   */
  function handleModeKeydown(event: KeyboardEvent): void {
    const isMac = navigator.userAgent.toUpperCase().includes('MAC OS');
    const isCtrl = isMac ? event.metaKey : event.ctrlKey;

    if (isCtrl) {
      const k = event.key.toLowerCase();
      if (k === 'z' || k === 'y') {
        event.preventDefault();
        // undo/redo 套用快照後會清空所有選取（useHistory._apply 防懸空參照），
        // 模式的泳道選取須自行補回：記住套用前的泳道、事後收斂補選。
        const laneBefore = rotationStore.selectedLaneIndex;
        _inspecting.value = false; // undo/redo＝結束檢視
        flushTapBuffer(); // 待合併內容先結算成一步，undo 語意才乾淨
        if (k === 'y' || event.shiftKey) history.redo();
        else history.undo();
        ensureLaneSelected(laneBefore); // 落點跟隨由 useGhostConveyor 監聽 entries 數觸發
      }
      return; // 其餘 Ctrl 組合：模式中一律不動作
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      exit();
      return;
    }

    if (event.code === 'Digit1' || event.code === 'Digit2' || event.code === 'Digit3') {
      event.preventDefault();
      // 作業系統長按自動重複：忽略（首擊已切軸並起計時，勿重複起按）。
      if (event.repeat) return;
      // keydown 立即切軸；成功切到有選角的泳道才起長按計時
      // → keyup 達閾值時於該軸末端插入入場技（beginPress 內另以 hasHotkey 過濾停用者）。
      const switched = setLaneByDisplayIndex(Number(event.code.slice(-1)) - 1);
      if (switched) beginPress(event.code);
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteLastBlock();
      return;
    }

    // Tab：模式中攔下瀏覽器原生焦點切換（模式為 modal，不讓焦點跳離軸面）。
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }

    // 長按不連發：忽略作業系統的鍵盤自動重複。
    if (event.repeat) return;
    if (event.altKey) return;

    // 對映鍵：起按只計時，落子留到 keyup（才知 tap／hold，見 §3.3）。
    if (beginPress(event.code)) event.preventDefault();
  }

  /** 模式中的 keyup 分派（由 useKeyboardShortcuts 短路轉呼叫）：對映鍵放開時落子。 */
  function handleModeKeyup(event: KeyboardEvent): void {
    if (endPress(event.code)) event.preventDefault();
  }

  /** 滑鼠鍵起按（MouseLeft／MouseRight）：由 overlay mousedown 轉呼叫。 */
  function pointerDown(hotkey: string): boolean {
    return beginPress(hotkey);
  }

  /** 滑鼠鍵放開：由 overlay mouseup 轉呼叫；回 true＝有落子。 */
  function pointerUp(hotkey: string): boolean {
    return endPress(hotkey);
  }

  /** 暫停接收輸入（視窗 blur／滑鼠移出視窗）：清掉未放開的按壓避免回焦誤觸。 */
  function pause(): void {
    flushTapBuffer(); // 失焦前結算待合併內容，避免緩衝跨暫停殘留
    paused.value = true;
    _pressStartAt.clear();
    _holdCommitted.clear(); // 失焦暫停：清掉待放開的已入緩衝長按標記
    _pressingHotkey.value = null; // 失焦暫停：停止進度環，避免回焦時殘留
    _clearHoldPreview();
  }

  /** 回焦恢復接收輸入。 */
  function resume(): void {
    paused.value = false;
  }

  // 幽靈格是否顯示長按進度環：有鍵正被按住、且該鍵有長按動作才顯示。
  // 只綁單擊的鍵不顯示進度環（長按該鍵＝取消輸入，無進度可示，見 §3.3）。
  const pressing = computed<boolean>(
    () => _pressingHotkey.value !== null && hotkeyMap.hasHold(_pressingHotkey.value),
  );
  // 長按即時預顯的 label（達閾值且有 hold 條目才非空）。驅動 Swimlane 幽靈格文字。
  const holdPreviewLabel = computed<string | null>(() => _holdPreviewLabel.value);
  // 單擊即時預顯的 label（按住 tap 鍵、未達長按閾值期間非空）。驅動 Swimlane 幽靈格文字。
  const tapPreviewLabel = computed<string | null>(() => _tapPreviewLabel.value);
  // 連點合併預顯：緩衝中累積的串接文字（無待合併內容為 null）。
  // 驅動 Swimlane 幽靈格顯示「即將合併落下的一塊」，寬度隨文字長度變化。
  const tapCombineLabel = computed<string | null>(() =>
    _tapBufferLabels.value.length > 0 ? _tapBufferLabels.value.join('') : null,
  );
  // 剛以熱鍵插入的區塊 id（進場動畫用；播畢為 null）。驅動 RotationBlock 落下吸附。
  const enteringId = computed<string | null>(() => _enteringId.value);

  return {
    active,
    paused,
    controlsReady,
    pressing,
    holdPreviewLabel,
    tapPreviewLabel,
    tapCombineLabel,
    enteringId,
    deleteFlashTick: _deleteFlashTick,
    inspecting: _inspecting,
    selectableLanes,
    enter,
    exit,
    cycleLane,
    handleModeKeydown,
    handleModeKeyup,
    pointerDown,
    pointerUp,
    pause,
    resume,
  };
}
