// ============================================================
// blockDrag/resolver.ts — 落點解析：hit-test 幾何與遲滯（重構 R4）。
//
// 單一職責：只回答「游標 x 對應的全域 after-index 是多少」。
// 讀即時 DOM（游標與區塊同幀讀取，捲動座標自動一致，免 baseline 補償）
// 與 rotationStore 的全域順序；唯一內部狀態是遲滯用的 _curAfter。
// ============================================================

import { useRotationStore } from '@/stores/useRotationStore';
import { dragStateInternal } from './state';

// 目前展開中的落點 after-index（遲滯狀態，跨多次評估保留）。null = 目前無落點。
// 含全部 entries 語意，與 store moveBlock/instantiateBlock 的 afterIndex 一致（-1=最前）。
let _curAfter: number | null = null;

/** 清除遲滯狀態（離開合法落點/拖曳結束時呼叫；再入時重新即時定位）。 */
export function clearHysteresis(): void {
  _curAfter = null;
}

// 即時讀各「非拖曳區塊」的中心 x（視窗座標），依全域順序回傳。
function _liveCentersByGlobalIndex(): { gi: number; center: number }[] {
  const draggingSet = new Set<string>(
    dragStateInternal.draggingIds.length
      ? dragStateInternal.draggingIds
      : dragStateInternal.draggingId
      ? [dragStateInternal.draggingId]
      : [],
  );
  const centerById = new Map<string, number>();
  document.querySelectorAll<HTMLElement>('.rotation-block[data-entry-id]').forEach((el) => {
    const id = el.getAttribute('data-entry-id');
    if (!id) return;
    const r = el.getBoundingClientRect();
    centerById.set(id, r.left + r.width / 2);
  });
  const out: { gi: number; center: number }[] = [];
  const rotationStore = useRotationStore();
  rotationStore.entries.forEach((e, gi) => {
    if (draggingSet.has(e.id)) return; // 被拖區塊已隱藏、無有效位置 → 跳過
    const center = centerById.get(e.id);
    if (center !== undefined) out.push({ gi, center });
  });
  return out;
}

// 即時定位：游標 x 對應到的全域 after-index（最後一個中心 < clientX 的非拖曳區塊全域索引；-1=最前）。
function _liveAfterIndexFromX(clientX: number): number {
  const list = _liveCentersByGlobalIndex();
  let k = -1;
  for (const { gi, center } of list) {
    if (center < clientX) k = gi;
    else break;
  }
  return k;
}

// 合法 after-index 落點集合（升冪）：-1（最前）＋各非拖曳區塊的全域索引（其後）。
function _insertionPoints(): number[] {
  return [-1, ..._liveCentersByGlobalIndex().map((c) => c.gi)];
}

// 遲滯解析：游標仍在 [左鄰中心 - M, 右鄰中心 + M] 之間就維持當前落點，跨出才換格。
// 界線用鄰居中心（非被拖物寬度）→ 消除窄拖寬/寬拖窄的不對稱閃爍；
// 兩側再各留 M px 緩衝帶，吸收游標停在中心附近的手抖/次像素位移，避免臨界來回跳格閃爍。
export function resolveAfterIndex(clientX: number): number {
  if (_curAfter === null) {
    _curAfter = _liveAfterIndexFromX(clientX);
    return _curAfter;
  }
  const list = _liveCentersByGlobalIndex();
  // 左鄰中心＝afterIndex 對應區塊中心（afterIndex=-1 則無左鄰）；
  // 右鄰中心＝afterIndex 之後第一個非拖曳區塊中心（超出陣列則無右鄰）。
  const cur = _curAfter as number;
  const leftCenter = list.find((c) => c.gi === cur)?.center;
  const rightCenter = list.find((c) => c.gi > cur)?.center;
  if (list.length === 0) {
    // 無任何鄰居可比對（例如整列都在拖曳中）→ 即時定位
    _curAfter = _liveAfterIndexFromX(clientX);
    return _curAfter;
  }
  // 維持區間 = [左鄰中心 - M, 右鄰中心 + M]：以鄰居中心為界、兩側各外擴 M px 緩衝帶。
  // 換格後游標會安穩落在新區間內、不立即反向跳回 → 消除臨界閃爍。
  const M = 2;
  const okLeft = leftCenter === undefined || clientX >= leftCenter - M;
  const okRight = rightCenter === undefined || clientX <= rightCenter + M;
  if (okLeft && okRight) {
    return _curAfter; // 游標仍在緩衝區間內 → 維持
  }
  const cand = _liveAfterIndexFromX(clientX);
  const pts = _insertionPoints();
  if (!okRight) {
    const next = pts.find((p) => p > cur);
    _curAfter = Math.max(cand, next ?? cur);
  } else {
    const prev = [...pts].reverse().find((p) => p < cur);
    _curAfter = Math.min(cand, prev ?? cur);
  }
  return _curAfter;
}
