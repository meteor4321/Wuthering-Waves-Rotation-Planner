// ============================================================
// useLaneReorder.ts — 泳道垂直拖曳重排（自製，重構 R5）。
//
// 拖把手 → 來源泳道留空、浮起分身跟游標、插入提示線；放開改 laneOrder，
// 由 TransitionGroup 平滑滑到新位。全程不動 entries/slotIndex/欄位對齊
// → 區塊資料零變動。拖曳期間其餘泳道位置固定，故起始量一次幾何即可。
// ============================================================

import { reactive, onBeforeUnmount, type Ref } from 'vue';
import { useLaneOrder } from '@/composables/useLaneOrder';
import { useCharacterStore } from '@/stores/useCharacterStore';
import { getElementColor } from '@/constants/elements';
import type { SlotIndex } from '@/types/character';

interface LaneGeom { slotIndex: SlotIndex; top: number; height: number; mid: number }

export function useLaneReorder(boardRef: Ref<HTMLElement | null>) {
  const { laneOrder, setOrderByMove } = useLaneOrder();
  const characterStore = useCharacterStore();

  const laneDrag = reactive({
    active: false,
    slotIndex: null as SlotIndex | null,
    cloneTop: 0, // 分身上緣（相對 board）
    cloneWidth: 0,
    cloneHeight: 0,
    cloneColor: '#888888',
    cloneName: '',
    cloneElement: '',
    lineTop: null as number | null, // 插入提示線 Y（相對 board）；null = 隱藏
    targetIndex: 0, // 來源在「其餘泳道」中的最終插入位置
  });

  let _boardTop = 0;
  let _otherGeoms: LaneGeom[] = []; // 非來源泳道（顯示序），拖曳期間位置固定
  let _sourceDisplayIndex = 0;
  let _pointerOffsetY = 0; // 抓取點到來源上緣的距離

  function _readLaneGeoms(): LaneGeom[] {
    const boardEl = boardRef.value;
    if (!boardEl) return [];
    const boardRect = boardEl.getBoundingClientRect();
    _boardTop = boardRect.top;
    const out: LaneGeom[] = [];
    laneOrder.value.forEach((si) => {
      const el = boardEl.querySelector<HTMLElement>(`.swimlane[data-slot-index="${si}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = r.top - boardRect.top;
      out.push({ slotIndex: si, top, height: r.height, mid: top + r.height / 2 });
    });
    return out;
  }

  function onLaneDragStart(payload: { slotIndex: SlotIndex; event: MouseEvent }): void {
    const geoms = _readLaneGeoms();
    const source = geoms.find((g) => g.slotIndex === payload.slotIndex);
    if (!source) return;
    _sourceDisplayIndex = laneOrder.value.indexOf(payload.slotIndex);
    _otherGeoms = geoms.filter((g) => g.slotIndex !== payload.slotIndex);
    _pointerOffsetY = payload.event.clientY - (_boardTop + source.top);

    const char = characterStore.slots[payload.slotIndex].character;
    laneDrag.active = true;
    laneDrag.slotIndex = payload.slotIndex;
    laneDrag.cloneWidth = boardRef.value?.clientWidth ?? 0;
    laneDrag.cloneHeight = source.height;
    laneDrag.cloneColor = getElementColor(char?.element ?? null);
    laneDrag.cloneName = char?.nameZh ?? `槽位 ${payload.slotIndex + 1}`;
    laneDrag.cloneElement = char?.element ?? '';
    _updateTarget(payload.event.clientY);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  function _updateTarget(clientY: number): void {
    const relY = clientY - _boardTop;
    laneDrag.cloneTop = relY - _pointerOffsetY; // 分身跟游標（扣抓取偏移）
    // 來源在「其餘泳道」中的插入位置＝中點在游標之上的其餘泳道數
    let idx = 0;
    for (const g of _otherGeoms) {
      if (g.mid < relY) idx++;
      else break;
    }
    laneDrag.targetIndex = idx;
    // 插入線 Y
    if (_otherGeoms.length === 0) {
      laneDrag.lineTop = null;
    } else if (idx <= 0) {
      laneDrag.lineTop = _otherGeoms[0].top;
    } else if (idx >= _otherGeoms.length) {
      const last = _otherGeoms[_otherGeoms.length - 1];
      laneDrag.lineTop = last.top + last.height;
    } else {
      laneDrag.lineTop = _otherGeoms[idx].top;
    }
  }

  function onMove(event: MouseEvent): void {
    if (!laneDrag.active) return;
    _updateTarget(event.clientY);
  }

  function onEnd(): void {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    if (laneDrag.active) {
      // 來源在「其餘泳道」插到 targetIndex → 即最終顯示序索引
      setOrderByMove(_sourceDisplayIndex, laneDrag.targetIndex);
    }
    laneDrag.active = false;
    laneDrag.slotIndex = null;
    laneDrag.lineTop = null;
  }

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
  });

  return { laneDrag, onLaneDragStart };
}
