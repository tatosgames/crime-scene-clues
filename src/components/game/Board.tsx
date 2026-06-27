import { useMemo } from "react";
import type { CellId, Level, Mark } from "@/game/types";
import { cellId, findCharacterAt, getAreaOfCell, getObjectsAtCell, isCellOccupiable, parseCell } from "@/game/logic";
import { cn } from "@/lib/utils";
import { objectGlyph } from "./objectIcons";

interface Props {
  level: Level;
  placements: Record<string, CellId>;
  marks: Record<CellId, Mark>;
  selectedCharacterId: string | null;
  selectedTool: "select" | "x" | "erase";
  onCellClick: (id: CellId) => void;
  highlightCell?: CellId | null;
}

export const Board = ({ level, placements, marks, selectedCharacterId, selectedTool, onCellClick }: Props) => {
  const { rows, cols } = level.grid;

  // Pre-index labels per area (one cell per area gets the label)
  const labelMap = useMemo(() => {
    const m: Record<CellId, string> = {};
    for (const a of level.areas) {
      const lbl = a.labelCellId ?? a.cellIds[0];
      if (lbl) m[lbl] = a.name;
    }
    return m;
  }, [level]);

  const areaOfCell = useMemo(() => {
    const m: Record<CellId, string | undefined> = {};
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const id = cellId(r, c);
        m[id] = getAreaOfCell(level, id);
      }
    return m;
  }, [level, rows, cols]);

  const areaById = useMemo(() => Object.fromEntries(level.areas.map((a) => [a.id, a])), [level]);

  return (
    <div
      role="grid"
      aria-label={`Crime scene board, ${rows} by ${cols}`}
      className="inline-grid bg-[hsl(var(--grid-wall))] p-[3px] gap-[1px] rounded-lg shadow-2xl max-w-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, clamp(2.35rem, 10.5vw, 4.25rem))`,
      }}
    >
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const id = cellId(r, c);
          const areaId = areaOfCell[id];
          const area = areaId ? areaById[areaId] : undefined;
          const objects = getObjectsAtCell(level, id);
          const occupiable = isCellOccupiable(level, id);
          const occupantId = findCharacterAt(placements, id);
          const occupant = occupantId ? level.characters.find((ch) => ch.id === occupantId) : undefined;
          const mark = marks[id];
          const label = labelMap[id];

          // thick walls between different areas
          const wall = (dr: number, dc: number) => {
            const nb = cellId(r + dr, c + dc);
            const nbArea = areaOfCell[nb];
            return nbArea && nbArea !== areaId ? true : false;
          };
          const topWall = r === 0 || wall(-1, 0);
          const leftWall = c === 0 || wall(0, -1);
          const rightWall = c === cols - 1 || wall(0, 1);
          const bottomWall = r === rows - 1 || wall(1, 0);

          const cellLabel = [
            `Row ${r + 1}, column ${c + 1}`,
            area ? `area ${area.name}` : "no area",
            objects.length ? `object ${objects.map((o) => o.name).join(", ")}` : null,
            occupant ? `occupied by ${occupant.name}` : null,
            mark ? "marked impossible" : null,
            !occupiable ? "not occupiable" : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <button
              key={id}
              role="gridcell"
              aria-label={cellLabel}
              onClick={() => onCellClick(id)}
              className={cn(
                "relative aspect-square min-w-0 cell-focus",
                "transition-colors text-ink",
                "hover:brightness-110",
                selectedTool === "select" && selectedCharacterId && occupiable && "cursor-crosshair",
                !occupiable && "cursor-not-allowed",
              )}
              style={{
                background: area ? `hsl(var(${area.colorVar}))` : "hsl(var(--muted))",
                boxShadow: [
                  topWall ? "inset 0 3px 0 hsl(var(--grid-wall))" : null,
                  bottomWall ? "inset 0 -3px 0 hsl(var(--grid-wall))" : null,
                  leftWall ? "inset 3px 0 0 hsl(var(--grid-wall))" : null,
                  rightWall ? "inset -3px 0 0 hsl(var(--grid-wall))" : null,
                ]
                  .filter(Boolean)
                  .join(", "),
              }}
            >
              {label && (
                <span className="absolute top-0.5 left-0.5 sm:left-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-ink/70 ink-heading pointer-events-none leading-none">
                  {label}
                </span>
              )}
              {objects.length > 0 && !occupant && (
                <span className="absolute inset-0 grid place-items-center text-base sm:text-2xl pointer-events-none" aria-hidden>
                  {objectGlyph[objects[0].type]}
                </span>
              )}
              {occupant && (
                <span
                  className={cn(
                    "absolute inset-1 grid place-items-center rounded-full font-bold ink-heading text-[11px] sm:text-sm shadow-md",
                    occupant.accent,
                    "text-ink ring-2",
                    occupant.role === "victim" ? "ring-destructive" : "ring-ink/30"
                  )}
                  aria-hidden
                >
                  {occupant.initials}
                </span>
              )}
              {mark && !occupant && (
                <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-destructive/80 pointer-events-none" aria-hidden>
                  ✕
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
};