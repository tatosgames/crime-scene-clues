export type CellId = string; // "r,c"

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type ObjectType =
  | "car"
  | "chair"
  | "bed"
  | "tv"
  | "shelf"
  | "box"
  | "table"
  | "shrub"
  | "custom";

export interface AreaDefinition {
  id: string;
  name: string;
  colorVar: string; // CSS var like --area-kitchen
  cellIds: CellId[];
  labelCellId?: CellId;
}

export interface BoardObject {
  id: string;
  type: ObjectType;
  name: string;
  cellIds: CellId[];
  occupiable: boolean;
  blocksPlacement: boolean;
  areaId?: string;
}

export type Role = "suspect" | "victim";
export type Gender = "male" | "female" | "unknown";

export interface CharacterDefinition {
  id: string;
  name: string;
  role: Role;
  gender?: Gender;
  initials: string;
  accent: string; // tailwind color class for the badge
  clueIds: string[];
}

export type ClueType =
  | "in_area"
  | "not_in_area"
  | "in_row"
  | "in_column"
  | "on_object"
  | "beside_object"
  | "not_beside_object"
  | "area_contains_object"
  | "area_contains_character_matching"
  | "same_area_as_character"
  | "different_area_than_character"
  | "direction_from_object"
  | "direction_from_character"
  | "alone_with_victim";

export interface ClueDefinition {
  id: string;
  characterId: string;
  type: ClueType;
  text: string;
  params: Record<string, unknown>;
}

export interface SolutionDefinition {
  placements: Record<string, CellId>; // characterId -> cell
  victimId: string;
  murdererId: string;
}

export interface RuleConfig {
  onePerRow: boolean;
  onePerColumn: boolean;
  besideSameAreaRequired: boolean;
}

export interface Level {
  id: string;
  title: string;
  difficulty: Difficulty;
  grid: { rows: number; cols: number };
  areas: AreaDefinition[];
  objects: BoardObject[];
  characters: CharacterDefinition[];
  clues: ClueDefinition[];
  solution: SolutionDefinition;
  rules: RuleConfig;
}

export type Tool = "select" | "x" | "erase";

export type Mark = "x";

export interface GameState {
  selectedTool: Tool;
  selectedCharacterId: string | null;
  placements: Record<string, CellId>; // characterId -> cell
  cellMarks: Record<CellId, Mark>; // cell -> mark
  history: GameSnapshot[];
  status: "playing" | "solved" | "incorrect";
  feedback: string[];
}

export interface GameSnapshot {
  placements: Record<string, CellId>;
  cellMarks: Record<CellId, Mark>;
  selectedCharacterId: string | null;
  selectedTool: Tool;
}