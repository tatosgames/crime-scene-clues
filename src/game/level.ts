import type { Level, CellId } from "./types";

// Helper to make cell ids
const c = (r: number, col: number): CellId => `${r},${col}`;

// 9x9 grid. 8 areas. 9 characters (8 suspects + 1 victim).
const rect = (r0: number, r1: number, c0: number, c1: number): CellId[] => {
  const out: CellId[] = [];
  for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) out.push(c(r, cc));
  return out;
};

export const prepperLevel: Level = {
  id: "preppers-proto",
  title: "Preppers Prototype",
  difficulty: "medium",
  grid: { rows: 9, cols: 9 },
  rules: { onePerRow: true, onePerColumn: true, besideSameAreaRequired: true },

  areas: [
    { id: "kitchen", name: "Kitchen", colorVar: "--area-kitchen", cellIds: rect(0, 2, 0, 2), labelCellId: c(0, 0) },
    { id: "living", name: "Living Room", colorVar: "--area-living", cellIds: rect(0, 2, 3, 5), labelCellId: c(0, 3) },
    { id: "bathroom", name: "Bathroom", colorVar: "--area-bathroom", cellIds: rect(0, 2, 6, 8), labelCellId: c(0, 6) },
    { id: "bedroom", name: "Bedroom", colorVar: "--area-bedroom", cellIds: rect(3, 5, 0, 2), labelCellId: c(3, 0) },
    { id: "safe", name: "Safe Room", colorVar: "--area-safe", cellIds: rect(3, 5, 3, 5), labelCellId: c(3, 3) },
    { id: "supply", name: "Supply", colorVar: "--area-supply", cellIds: rect(3, 5, 6, 8), labelCellId: c(3, 6) },
    { id: "yard", name: "Yard", colorVar: "--area-yard", cellIds: rect(6, 8, 0, 5), labelCellId: c(6, 0) },
    { id: "stairs", name: "Secret Stairs", colorVar: "--area-stairs", cellIds: rect(6, 8, 6, 8), labelCellId: c(6, 6) },
  ],

  objects: [
    // Living Room
    { id: "obj-box-1", type: "box", name: "Box", cellIds: [c(0, 3)], occupiable: false, blocksPlacement: true, areaId: "living" },
    { id: "obj-tv-1", type: "tv", name: "TV", cellIds: [c(2, 3)], occupiable: false, blocksPlacement: true, areaId: "living" },
    { id: "obj-table-1", type: "table", name: "Table", cellIds: [c(1, 4)], occupiable: false, blocksPlacement: true, areaId: "living" },
    // Kitchen
    { id: "obj-table-2", type: "table", name: "Table", cellIds: [c(1, 1)], occupiable: false, blocksPlacement: true, areaId: "kitchen" },
    { id: "obj-shelf-2", type: "shelf", name: "Shelf", cellIds: [c(0, 2)], occupiable: false, blocksPlacement: true, areaId: "kitchen" },
    // Bathroom
    { id: "obj-shelf-3", type: "shelf", name: "Shelf", cellIds: [c(1, 8)], occupiable: false, blocksPlacement: true, areaId: "bathroom" },
    // Bedroom
    { id: "obj-bed-1", type: "bed", name: "Bed", cellIds: [c(3, 0)], occupiable: true, blocksPlacement: false, areaId: "bedroom" },
    { id: "obj-shelf-1", type: "shelf", name: "Shelf", cellIds: [c(3, 1)], occupiable: false, blocksPlacement: true, areaId: "bedroom" },
    // Safe Room
    { id: "obj-box-2", type: "box", name: "Box", cellIds: [c(5, 5)], occupiable: false, blocksPlacement: true, areaId: "safe" },
    // Supply
    { id: "obj-box-3", type: "box", name: "Box", cellIds: [c(4, 7)], occupiable: false, blocksPlacement: true, areaId: "supply" },
    { id: "obj-shelf-4", type: "shelf", name: "Shelf", cellIds: [c(3, 8)], occupiable: false, blocksPlacement: true, areaId: "supply" },
    // Yard
    { id: "obj-chair-1", type: "chair", name: "Chair", cellIds: [c(6, 3)], occupiable: true, blocksPlacement: false, areaId: "yard" },
    { id: "obj-car-1", type: "car", name: "Car", cellIds: [c(7, 0)], occupiable: true, blocksPlacement: false, areaId: "yard" },
    { id: "obj-shrub-1", type: "shrub", name: "Shrub", cellIds: [c(8, 5)], occupiable: false, blocksPlacement: true, areaId: "yard" },
    { id: "obj-shrub-2", type: "shrub", name: "Shrub", cellIds: [c(6, 5)], occupiable: false, blocksPlacement: true, areaId: "yard" },
    // Secret Stairs
    { id: "obj-table-3", type: "table", name: "Table", cellIds: [c(6, 8)], occupiable: false, blocksPlacement: true, areaId: "stairs" },
  ],

  characters: [
    { id: "angelo", name: "Angelo", role: "suspect", gender: "male", initials: "An", accent: "bg-orange-400", clueIds: ["clue-angelo"] },
    { id: "blake", name: "Blake", role: "suspect", gender: "male", initials: "Bl", accent: "bg-sky-400", clueIds: ["clue-blake"] },
    { id: "carolina", name: "Carolina", role: "suspect", gender: "female", initials: "Ca", accent: "bg-rose-400", clueIds: ["clue-carolina"] },
    { id: "daryl", name: "Daryl", role: "suspect", gender: "female", initials: "Da", accent: "bg-emerald-400", clueIds: ["clue-daryl"] },
    { id: "edna", name: "Edna", role: "suspect", gender: "female", initials: "Ed", accent: "bg-violet-400", clueIds: ["clue-edna"] },
    { id: "friedrich", name: "Friedrich", role: "suspect", gender: "male", initials: "Fr", accent: "bg-amber-400", clueIds: ["clue-friedrich"] },
    { id: "greg", name: "Greg", role: "suspect", gender: "male", initials: "Gr", accent: "bg-teal-400", clueIds: ["clue-greg"] },
    { id: "howie", name: "Howie", role: "suspect", gender: "male", initials: "Ho", accent: "bg-indigo-400", clueIds: ["clue-howie"] },
    { id: "vivianna", name: "Vivianna", role: "victim", gender: "female", initials: "Vi", accent: "bg-red-500", clueIds: ["clue-vivianna"] },
  ],

  clues: [
    { id: "clue-angelo", characterId: "angelo", type: "area_contains_object", text: "There was a box in his area. He was not beside any box.", params: { objectType: "box", andNotBeside: true } },
    { id: "clue-blake", characterId: "blake", type: "in_area", text: "He was in the Bedroom.", params: { areaId: "bedroom" } },
    { id: "clue-carolina", characterId: "carolina", type: "area_contains_character_matching", text: "There was a man on the bed in her area.", params: { gender: "male", onObjectType: "bed" } },
    { id: "clue-daryl", characterId: "daryl", type: "area_contains_character_matching", text: "Someone else was beside a shelf in her area.", params: { besideObjectType: "shelf" } },
    { id: "clue-edna", characterId: "edna", type: "in_row", text: "She was in the bottom row.", params: { row: 8 } },
    { id: "clue-friedrich", characterId: "friedrich", type: "beside_object", text: "He was beside a TV.", params: { objectType: "tv" } },
    { id: "clue-greg", characterId: "greg", type: "on_object", text: "He was sitting in a chair.", params: { objectType: "chair" } },
    { id: "clue-howie", characterId: "howie", type: "in_area", text: "He was in the Bathroom.", params: { areaId: "bathroom" } },
    { id: "clue-vivianna", characterId: "vivianna", type: "alone_with_victim", text: "She was alone with the murderer.", params: {} },
  ],

  solution: {
    victimId: "vivianna",
    murdererId: "edna",
    placements: {
      howie: c(0, 6),
      angelo: c(1, 5),
      friedrich: c(2, 4),
      blake: c(3, 0),
      carolina: c(4, 1),
      daryl: c(5, 2),
      greg: c(6, 3),
      vivianna: c(7, 7),
      edna: c(8, 8),
    },
  },
};