import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Target, X } from "lucide-react";
import type { ValidationIssue } from "@/game/logic";

interface Props {
  solved: boolean;
  murdererName?: string | null;
  victimName?: string | null;
  areaName?: string | null;
  issues: ValidationIssue[];
  onJumpTo: (issue: ValidationIssue) => void;
  onDismiss: () => void;
}

export const FeedbackBanner = ({
  solved,
  murdererName,
  victimName,
  areaName,
  issues,
  onJumpTo,
  onDismiss,
}: Props) => {
  const visible = solved || issues.length > 0;
  const primary = issues[0];
  const extra = issues.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={solved ? "solved" : primary?.message ?? "issue"}
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-xl sm:static sm:inset-auto sm:mx-0 sm:w-full sm:max-w-xl"
        >
          {solved ? (
            <div className="paper relative flex items-start gap-3 rounded-xl border-2 border-accent p-3 sm:p-4 shadow-2xl">
              <motion.span
                initial={{ rotate: -12, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-accent"
              >
                <CheckCircle2 className="h-5 w-5" />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="ink-heading text-[10px] uppercase tracking-widest text-ink/60">
                  Case Closed
                </p>
                <h2 className="ink-heading text-lg sm:text-2xl font-bold leading-tight text-ink">
                  The murderer is{" "}
                  <span className="text-destructive">{murdererName}</span>.
                </h2>
                {areaName && victimName && (
                  <p className="mt-1 text-xs sm:text-sm text-ink/70">
                    Alone with {victimName} in the {areaName}.
                  </p>
                )}
              </div>
              <button
                onClick={onDismiss}
                aria-label="Dismiss"
                className="rounded-md p-1 text-ink/60 hover:bg-ink/10 cell-focus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            primary && (
              <div className="paper relative flex items-start gap-3 rounded-xl border-l-4 border-destructive p-3 shadow-2xl">
                <motion.span
                  animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
                  transition={{ duration: 0.5 }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive"
                >
                  <AlertTriangle className="h-4 w-4" />
                </motion.span>
                <div className="min-w-0 flex-1">
                  <p className="ink-heading text-sm font-semibold text-ink leading-snug">
                    {primary.short}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/70 line-clamp-2">
                    {primary.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {(primary.focusCell || primary.focusCharacterId) && (
                      <button
                        onClick={() => onJumpTo(primary)}
                        className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-paper hover:bg-ink/85 cell-focus"
                      >
                        <Target className="h-3 w-3" />
                        Go to {primary.focusCell ? "cell" : "character"}
                      </button>
                    )}
                    {extra > 0 && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/60">
                        +{extra} more issue{extra === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onDismiss}
                  aria-label="Dismiss"
                  className="rounded-md p-1 text-ink/60 hover:bg-ink/10 cell-focus"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};