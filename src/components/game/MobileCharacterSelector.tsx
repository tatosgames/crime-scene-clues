import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CellId, CharacterDefinition, ClueDefinition } from "@/game/types";

interface Props {
  characters: CharacterDefinition[];
  cluesById: Record<string, ClueDefinition>;
  placements: Record<string, CellId>;
  selectedCharacterId: string | null;
  onSelect: (id: string) => void;
}

export const MobileCharacterSelector = ({
  characters,
  cluesById,
  placements,
  selectedCharacterId,
  onSelect,
}: Props) => {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.initials.toLowerCase().includes(q),
    );
  }, [characters, query]);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId) ?? null;
  const selectedClue = selectedCharacter ? cluesById[selectedCharacter.clueIds[0]] : undefined;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
  }, [filtered]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !selectedCharacterId) return;
    const selectedEl = el.querySelector(`[data-character-id="${selectedCharacterId}"]`) as HTMLElement | null;
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedCharacterId]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      {/* Active character display */}
      <div
        className={cn(
          "paper p-3 flex gap-3 items-start transition-all",
          selectedCharacter ? "border-2 border-accent" : "border border-transparent",
        )}
      >
        {selectedCharacter ? (
          <>
            <div
              className={cn(
                "h-12 w-12 shrink-0 rounded-full grid place-items-center text-ink font-bold ink-heading text-lg shadow-inner ring-2 ring-accent ring-offset-2 ring-offset-background",
                selectedCharacter.accent,
              )}
              aria-hidden="true"
            >
              {selectedCharacter.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="ink-heading font-semibold truncate">{selectedCharacter.name}</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-ink/10 text-ink border-ink/10">
                  {selectedCharacter.role}
                </span>
                {placements[selectedCharacter.id] && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-700/20">
                    placed
                  </span>
                )}
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                  active
                </span>
              </div>
              {selectedClue && (
                <p className="text-xs text-ink/80 mt-1.5 leading-snug">
                  <span className="opacity-60">“</span>
                  {selectedClue.text}
                  <span className="opacity-60">”</span>
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-ink/70">Select a character from the strip below.</p>
        )}
      </div>

      {/* Search + horizontal selector */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a character..."
            className="paper w-full pl-9 pr-12 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/60 hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative -mx-3 px-3">
          {/* Left fade + arrow */}
          <div
            className={cn(
              "pointer-events-none absolute left-3 top-0 bottom-2 w-10 bg-gradient-to-r from-background to-transparent z-10 transition-opacity",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-paper text-ink shadow-md grid place-items-center cell-focus"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable strip */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-2 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-thin"
          >
            {filtered.map((ch) => {
              const isSelected = selectedCharacterId === ch.id;
              return (
                <button
                  key={ch.id}
                  data-character-id={ch.id}
                  type="button"
                  onClick={() => {
                    onSelect(ch.id);
                    setQuery("");
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${ch.name}, ${ch.role}. Clue: ${cluesById[ch.clueIds[0]]?.text ?? "none"}.`}
                  className={cn(
                    "paper shrink-0 snap-center flex flex-col items-center p-2.5 w-[5.5rem] transition-all cell-focus",
                    isSelected
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-[1.03]"
                      : "hover:translate-y-[-1px]",
                  )}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full grid place-items-center text-ink font-bold ink-heading text-base shadow-inner",
                        ch.accent,
                      )}
                      aria-hidden="true"
                    >
                      {ch.initials}
                    </div>
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground border-2 border-paper grid place-items-center">
                        <span className="block h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                    )}
                    {placements[ch.id] && !isSelected && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-paper" />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-semibold text-ink text-center leading-tight line-clamp-2">
                    {ch.name}
                  </span>
                  <span className="mt-0.5 text-[9px] uppercase tracking-wider text-ink/60">{ch.role}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-ink/60 py-4">No characters match your search.</p>
            )}
          </div>

          {/* Right fade + arrow */}
          <div
            className={cn(
              "pointer-events-none absolute right-3 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent z-10 transition-opacity",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-paper text-ink shadow-md grid place-items-center cell-focus"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
