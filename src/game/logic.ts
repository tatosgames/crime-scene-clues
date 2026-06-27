import type {
  BoardObject,
  CellId,
  CharacterDefinition,
  ClueDefinition,
  ClueType,
  Level,
} from "./types";


export const SUPPORTED_CLUE_TYPES = [
  "in_area",
  "not_in_area",
  "in_row",
  "in_column",
  "on_object",
  "beside_object",
  "not_beside_object",
  "area_contains_object",
  "area_contains_character_matching",
  "same_area_as_character",
  "different_area_than_character",
  "alone_with_victim",
] as const satisfies readonly ClueType[];

export const parseCell = (id: CellId): [number, number] => {
  const [r, c] = id.split(",").map(Number);
  return [r, c];
};
export const cellId = (r: number, c: number): CellId => `${r},${c}`;

export const getAreaOfCell = (level: Level, id: CellId): string | undefined =>
  level.areas.find((a) => a.cellIds.includes(id))?.id;

export const getObjectsAtCell = (level: Level, id: CellId): BoardObject[] =>
  level.objects.filter((o) => o.cellIds.includes(id));

export const isCellOccupiable = (level: Level, id: CellId): boolean => {
  const objs = getObjectsAtCell(level, id);
  if (objs.length === 0) return true; // empty area cell is fine
  // If any blocking & non-occupiable object is on this cell, can't stand here.
  if (objs.some((o) => o.blocksPlacement && !o.occupiable)) return false;
  // If there's an occupiable object, ok.
  return true;
};

export const cellExists = (level: Level, id: CellId): boolean => {
  const [r, c] = parseCell(id);
  return r >= 0 && c >= 0 && r < level.grid.rows && c < level.grid.cols;
};

const orthogonalNeighbors = (id: CellId): CellId[] => {
  const [r, c] = parseCell(id);
  return [cellId(r - 1, c), cellId(r + 1, c), cellId(r, c - 1), cellId(r, c + 1)];
};

export const isBesideObject = (
  level: Level,
  cell: CellId,
  objectType: string,
  requireSameArea: boolean
): boolean => {
  const cellArea = getAreaOfCell(level, cell);
  const targets = level.objects.filter((o) => o.type === objectType);
  for (const obj of targets) {
    for (const ocell of obj.cellIds) {
      if (!orthogonalNeighbors(cell).includes(ocell)) continue;
      if (requireSameArea) {
        const oArea = getAreaOfCell(level, ocell);
        if (oArea !== cellArea) continue;
      }
      return true;
    }
  }
  return false;
};

export interface EvaluationContext {
  level: Level;
  placements: Record<string, CellId>;
}

export const evaluateClue = (
  clue: ClueDefinition,
  ctx: EvaluationContext
): boolean => {
  const { level, placements } = ctx;
  const cell = placements[clue.characterId];
  if (!cell) return false;
  const [r, c] = parseCell(cell);
  const area = getAreaOfCell(level, cell);
  const requireSameArea = level.rules.besideSameAreaRequired;

  switch (clue.type) {
    case "in_area":
      return area === clue.params.areaId;
    case "not_in_area":
      return area !== clue.params.areaId;
    case "in_row":
      return r === clue.params.row;
    case "in_column":
      return c === clue.params.col;
    case "on_object": {
      const objs = getObjectsAtCell(level, cell);
      return objs.some((o) => o.type === clue.params.objectType && o.occupiable);
    }
    case "beside_object":
      return isBesideObject(level, cell, String(clue.params.objectType), requireSameArea);
    case "not_beside_object":
      return !isBesideObject(level, cell, String(clue.params.objectType), requireSameArea);
    case "area_contains_object": {
      const objType = String(clue.params.objectType);
      const inArea = level.objects.some(
        (o) => o.type === objType && o.cellIds.some((id) => getAreaOfCell(level, id) === area)
      );
      if (!inArea) return false;
      if (clue.params.andNotBeside) {
        return !isBesideObject(level, cell, objType, requireSameArea);
      }
      return true;
    }
    case "same_area_as_character": {
      const other = placements[String(clue.params.characterId)];
      if (!other) return false;
      return getAreaOfCell(level, other) === area;
    }
    case "different_area_than_character": {
      const other = placements[String(clue.params.characterId)];
      if (!other) return false;
      return getAreaOfCell(level, other) !== area;
    }
    case "area_contains_character_matching": {
      const targetGender = clue.params.gender as string | undefined;
      const onObjectType = clue.params.onObjectType as string | undefined;
      const besideObjectType = clue.params.besideObjectType as string | undefined;
      // find any other character placed in the same area satisfying constraints
      for (const ch of level.characters) {
        if (ch.id === clue.characterId) continue;
        const ocell = placements[ch.id];
        if (!ocell) continue;
        if (getAreaOfCell(level, ocell) !== area) continue;
        if (targetGender && ch.gender !== targetGender) continue;
        if (onObjectType) {
          const objs = getObjectsAtCell(level, ocell);
          if (!objs.some((o) => o.type === onObjectType && o.occupiable)) continue;
        }
        if (besideObjectType) {
          if (!isBesideObject(level, ocell, besideObjectType, requireSameArea)) continue;
        }
        return true;
      }
      return false;
    }
    case "alone_with_victim": {
      // For the victim's own clue: exactly one suspect in victim's area
      return resolveMurderer(level, placements).status === "resolved";
    }
    default:
      throw new Error(`Unsupported clue type: ${String(clue.type)}`);
  }
};

export type MurdererResolution =
  | { status: "resolved"; murdererId: string }
  | { status: "none"; reason: string }
  | { status: "multiple"; suspectIds: string[] };

export const resolveMurderer = (
  level: Level,
  placements: Record<string, CellId>
): MurdererResolution => {
  const victim = level.characters.find((c) => c.role === "victim");
  if (!victim) return { status: "none", reason: "No victim defined." };
  const vCell = placements[victim.id];
  if (!vCell) return { status: "none", reason: "Victim is not placed." };
  const vArea = getAreaOfCell(level, vCell);
  if (!vArea) return { status: "none", reason: "Victim is not in any area." };
  const suspects = level.characters.filter((c) => c.role === "suspect");
  const inArea = suspects.filter((s) => {
    const cell = placements[s.id];
    return cell && getAreaOfCell(level, cell) === vArea;
  });
  if (inArea.length === 1) return { status: "resolved", murdererId: inArea[0].id };
  if (inArea.length === 0) return { status: "none", reason: "No suspect shares the victim's area." };
  return { status: "multiple", suspectIds: inArea.map((s) => s.id) };
};

export interface CandidateInfo {
  cellId: CellId;
  occupiable: boolean;
}

export const getCandidateCells = (level: Level): CandidateInfo[] => {
  const out: CandidateInfo[] = [];
  for (let r = 0; r < level.grid.rows; r++) {
    for (let c = 0; c < level.grid.cols; c++) {
      const id = cellId(r, c);
      out.push({ cellId: id, occupiable: isCellOccupiable(level, id) });
    }
  }
  return out;
};

export interface ValidationResult {
  ok: boolean;
  feedback: string[];
  solved: boolean;
  murdererId?: string;
}

export const validateBoard = (
  level: Level,
  placements: Record<string, CellId>
): ValidationResult => {
  const feedback: string[] = [];

  // 1. all characters placed
  const missing = level.characters.filter((c) => !placements[c.id]);
  if (missing.length > 0) {
    feedback.push(`Not yet — these are still missing: ${missing.map((m) => m.name).join(", ")}.`);
  }

  // 2. cells exist & 3. occupiable & 4. no duplicates
  const cellsUsed: Record<CellId, string[]> = {};
  for (const [chId, cell] of Object.entries(placements)) {
    if (!cellExists(level, cell)) feedback.push(`${nameOf(level, chId)} is on a cell that does not exist.`);
    if (!isCellOccupiable(level, cell)) feedback.push(`${nameOf(level, chId)} is on a cell that cannot be occupied.`);
    (cellsUsed[cell] ||= []).push(chId);
  }
  for (const [cell, list] of Object.entries(cellsUsed)) {
    if (list.length > 1) feedback.push(`Two people share a cell (${list.map((id) => nameOf(level, id)).join(" & ")}).`);
  }

  // 5 & 6. row/column
  if (level.rules.onePerRow) {
    const byRow: Record<number, string[]> = {};
    for (const [chId, cell] of Object.entries(placements)) {
      const [r] = parseCell(cell);
      (byRow[r] ||= []).push(chId);
    }
    for (const [r, list] of Object.entries(byRow)) {
      if (list.length > 1) feedback.push(`Row ${Number(r) + 1} contains more than one person.`);
    }
  }
  if (level.rules.onePerColumn) {
    const byCol: Record<number, string[]> = {};
    for (const [chId, cell] of Object.entries(placements)) {
      const [, c] = parseCell(cell);
      (byCol[c] ||= []).push(chId);
    }
    for (const [c, list] of Object.entries(byCol)) {
      if (list.length > 1) feedback.push(`Column ${Number(c) + 1} contains more than one person.`);
    }
  }

  // Early exit if structural problems and missing characters
  if (missing.length > 0) {
    return { ok: false, feedback, solved: false };
  }

  // 7. clues
  const ctx = { level, placements };
  const failingClues: ClueDefinition[] = [];
  for (const clue of level.clues) {
    try {
      if (!evaluateClue(clue, ctx)) failingClues.push(clue);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      feedback.push(`${clue.id} cannot be evaluated: ${message}.`);
    }
  }
  if (failingClues.length > 0) {
    feedback.push(`${failingClues.length} clue${failingClues.length > 1 ? "s are" : " is"} not satisfied. Re-check your deductions.`);
  }

  // 8/9. murderer
  const m = resolveMurderer(level, placements);
  if (m.status === "none") feedback.push("The victim is not alone with a single suspect — the murderer cannot be determined yet.");
  if (m.status === "multiple") feedback.push("More than one suspect shares the victim's area — the murderer is ambiguous.");

  if (feedback.length === 0 && m.status === "resolved") {
    return { ok: true, feedback: [], solved: true, murdererId: m.murdererId };
  }
  return { ok: false, feedback, solved: false };
};

const nameOf = (level: Level, id: string) =>
  level.characters.find((c) => c.id === id)?.name ?? id;

export const findCharacterAt = (
  placements: Record<string, CellId>,
  cell: CellId
): string | undefined =>
  Object.entries(placements).find(([, c]) => c === cell)?.[0];