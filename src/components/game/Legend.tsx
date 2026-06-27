import { objectGlyph, objectLabel } from "./objectIcons";
import type { ObjectType } from "@/game/types";

const occupiable: ObjectType[] = ["car", "chair", "bed"];
const blocked: ObjectType[] = ["tv", "shelf", "box", "table", "shrub"];

export const Legend = () => (
  <details className="paper p-3 group">
    <summary className="ink-heading font-semibold text-ink text-sm uppercase tracking-wider cursor-pointer rounded-md outline-none cell-focus">
      Legend
      <span className="ml-2 text-[10px] font-sans normal-case tracking-normal text-ink/60 group-open:hidden">Open</span>
      <span className="ml-2 hidden text-[10px] font-sans normal-case tracking-normal text-ink/60 group-open:inline">Close</span>
    </summary>
    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-ink/70 text-xs mb-1 font-medium">Can be occupied</p>
        <ul className="space-y-1">
          {occupiable.map((t) => (
            <li key={t} className="flex items-center gap-2 text-ink">
              <span aria-hidden className="text-lg">{objectGlyph[t]}</span>
              <span>{objectLabel[t]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-ink/70 text-xs mb-1 font-medium">Blocks placement</p>
        <ul className="space-y-1">
          {blocked.map((t) => (
            <li key={t} className="flex items-center gap-2 text-ink">
              <span aria-hidden className="text-lg">{objectGlyph[t]}</span>
              <span>{objectLabel[t]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </details>
);
