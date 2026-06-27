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
        "paper text-left w-full p-3 flex gap-3 items-start transition-all cell-focus",
        "hover:translate-y-[-1px] hover:shadow-lg",
        selected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        placed && "opacity-70",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "h-12 w-12 shrink-0 rounded-full grid place-items-center text-ink font-bold ink-heading text-lg shadow-inner",
          character.accent
        )}
        aria-hidden="true"
      >
        {character.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="ink-heading font-semibold truncate">{character.name}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full",
              isVictim ? "bg-destructive text-destructive-foreground" : "bg-ink/10 text-ink"
            )}
          >
            {character.role}
          </span>
          {placed && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700">
              placed
            </span>
          )}
        </div>
        {clue && (
          <p className="text-sm text-ink/80 mt-1 leading-snug">
            <span className="opacity-60">“</span>
            {clue.text}
            <span className="opacity-60">”</span>
          </p>
        )}
      </div>
    </button>
  );
};