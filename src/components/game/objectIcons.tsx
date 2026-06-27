import type { ObjectType } from "@/game/types";

export const objectGlyph: Record<ObjectType, string> = {
  car: "🚗",
  chair: "🪑",
  bed: "🛏️",
  tv: "📺",
  shelf: "🗄️",
  box: "📦",
  table: "🍽️",
  shrub: "🌿",
  custom: "❔",
};

export const objectLabel: Record<ObjectType, string> = {
  car: "Car",
  chair: "Chair",
  bed: "Bed",
  tv: "TV",
  shelf: "Shelf",
  box: "Box",
  table: "Table",
  shrub: "Shrub",
  custom: "Object",
};