import type { CharacterDefinition, ClueDefinition } from "@/game/types";
import { cn } from "@/lib/utils";

interface Props {
  character: CharacterDefinition;
  clue?: ClueDefinition;
  selected: boolean;
  placed: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const CharacterCard = ({ character, clue, selected, placed, onSelect, disabled }: Props) => {
  const isVictim = character.role === "victim";
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Select ${character.name}, ${character.role}. Clue: ${clue?.text ?? "none"}.`}
      className={cn(
        "paper text-left w-[13.5rem] sm:w-[14.5rem] lg:w-full shrink-0 p-2.5 flex gap-2.5 items-start transition-all cell-focus",
        "hover:translate-y-[-1px] hover:shadow-lg",
        selected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        placed && "opacity-80",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 shrink-0 rounded-full grid place-items-center text-ink font-bold ink-heading text-base shadow-inner",
          character.accent
        )}
        aria-hidden="true"
      >
        {character.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="ink-heading font-semibold truncate max-w-[7rem] lg:max-w-[8rem]">{character.name}</span>
          <span
            className={cn(
              "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
              isVictim ? "bg-destructive text-destructive-foreground border-destructive" : "bg-ink/10 text-ink border-ink/10"
            )}
          >
            {character.role}
          </span>
          {placed && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-700/20">
              placed
            </span>
          )}
        </div>
        {clue && (
          <>
            <p className={cn("text-xs text-ink/80 mt-1 leading-snug", selected ? "line-clamp-none" : "line-clamp-1")}>
              <span className="opacity-60">“</span>
              {clue.text}
              <span className="opacity-60">”</span>
            </p>
            <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-accent">
              {selected ? "Hide clue" : "Show clue"}
            </span>
          </>
        )}
      </div>
    </button>
  );
};
