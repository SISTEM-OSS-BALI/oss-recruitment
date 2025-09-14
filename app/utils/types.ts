export const DND_ITEM = {
  CANDIDATE: "CANDIDATE",
} as const;

export type DragItem = {
  type: typeof DND_ITEM.CANDIDATE;
  id: string;
  // index di "visible" list—hanya untuk hit test saat hover
  visibleIndex: number;
};
