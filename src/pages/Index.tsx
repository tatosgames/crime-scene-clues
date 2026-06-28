import { useCallback, useEffect, useMemo, useState } from "react";
import { Board } from "@/components/game/Board";
import { CharacterCard } from "@/components/game/CharacterCard";
import { FeedbackBanner } from "@/components/game/FeedbackBanner";
import { Legend } from "@/components/game/Legend";
import { MobileCharacterSelector } from "@/components/game/MobileCharacterSelector";
import { RuleHelper } from "@/components/game/RuleHelper";
import { ToolPanel } from "@/components/game/ToolPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { prepperLevel } from "@/game/level";
import { findCharacterAt, isCellOccupiable, validateBoard, type ValidationIssue } from "@/game/logic";
import { clearProgress, loadProgress, saveProgress } from "@/game/storage";
import type { CellId, GameSnapshot, Mark, Tool } from "@/game/types";
import { useToast } from "@/hooks/use-toast";

const level = prepperLevel;

const Index = () => {
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(level.characters[0].id);
  const [placements, setPlacements] = useState<Record<string, CellId>>({});
  const [cellMarks, setCellMarks] = useState<Record<CellId, Mark>>({});
  const [history, setHistory] = useState<GameSnapshot[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [highlightCell, setHighlightCell] = useState<CellId | null>(null);
  const [solvedMurderer, setSolvedMurderer] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  // Load progress
  useEffect(() => {
    const saved = loadProgress(level.id);
    if (saved) {
      if (saved.placements) setPlacements(saved.placements);
      if (saved.cellMarks) setCellMarks(saved.cellMarks);
      if (saved.selectedCharacterId !== undefined) setSelectedCharacterId(saved.selectedCharacterId);
      if (saved.selectedTool) setSelectedTool(saved.selectedTool);
    }
  }, []);

  // Save progress
  useEffect(() => {
    saveProgress(level.id, { placements, cellMarks, selectedCharacterId, selectedTool });
  }, [placements, cellMarks, selectedCharacterId, selectedTool]);

  const pushHistory = useCallback(() => {
    setHistory((h) => [
      ...h.slice(-49),
      { placements: { ...placements }, cellMarks: { ...cellMarks }, selectedCharacterId, selectedTool },
    ]);
  }, [placements, cellMarks, selectedCharacterId, selectedTool]);

  const handleCellClick = (cell: CellId) => {
    const occupantId = findCharacterAt(placements, cell);

    if (selectedTool === "erase") {
      if (cellMarks[cell] || occupantId) {
        pushHistory();
        setCellMarks((m) => {
          const n = { ...m };
          delete n[cell];
          return n;
        });
        if (occupantId) {
          setPlacements((p) => {
            const n = { ...p };
            delete n[occupantId];
            return n;
          });
        }
      }
      return;
    }

    if (selectedTool === "x") {
      if (occupantId) return; // don't X-mark on a placed token
      pushHistory();
      setCellMarks((m) => {
        const n = { ...m };
        if (n[cell]) delete n[cell];
        else n[cell] = "x";
        return n;
      });
      return;
    }

    // selectedTool === "select"
    if (occupantId) {
      // remove the occupant (allow re-placement)
      pushHistory();
      setPlacements((p) => {
        const n = { ...p };
        delete n[occupantId];
        return n;
      });
      setSelectedCharacterId(occupantId);
      return;
    }

    if (!selectedCharacterId) {
      toast({ title: "Pick a character first", description: "Select a card from the left panel to place them." });
      return;
    }

    if (!isCellOccupiable(level, cell)) {
      toast({ title: "Can't stand there", description: "This cell is blocked by an object." });
      return;
    }

    pushHistory();
    setPlacements((p) => {
      const n = { ...p };
      // move from old cell if previously placed
      n[selectedCharacterId] = cell;
      return n;
    });
    // also clear any X on that cell
    setCellMarks((m) => {
      if (!m[cell]) return m;
      const n = { ...m };
      delete n[cell];
      return n;
    });
    // auto-advance to next unplaced character
    const nextUnplaced = level.characters.find(
      (c) => c.id !== selectedCharacterId && !placements[c.id]
    );
    if (nextUnplaced) setSelectedCharacterId(nextUnplaced.id);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setPlacements(last.placements);
    setCellMarks(last.cellMarks);
    setSelectedCharacterId(last.selectedCharacterId);
    setSelectedTool(last.selectedTool);
    setFeedback([]);
    setIssues([]);
    setSolvedMurderer(null);
  };

  const handleReset = () => {
    setPlacements({});
    setCellMarks({});
    setHistory([]);
    setFeedback([]);
    setIssues([]);
    setSolvedMurderer(null);
    setSelectedCharacterId(level.characters[0].id);
    clearProgress(level.id);
    setResetOpen(false);
  };

  const handleSubmit = () => {
    const result = validateBoard(level, placements);
    if (result.solved && result.murdererId) {
      setSolvedMurderer(result.murdererId);
      setFeedback([]);
      setIssues([]);
    } else {
      setSolvedMurderer(null);
      setFeedback(result.feedback);
      setIssues(result.issues);
      if (result.issues[0]) {
        const t = result.issues[0];
        toast({
          title: t.short,
          description: t.message,
        });
      }
    }
  };

  const handleJumpTo = (issue: ValidationIssue) => {
    let target = issue.focusCell ?? null;
    if (!target && issue.focusCharacterId) {
      target = placements[issue.focusCharacterId] ?? null;
      setSelectedCharacterId(issue.focusCharacterId);
      setSelectedTool("select");
    }
    if (target) {
      setHighlightCell(target);
      window.setTimeout(() => setHighlightCell(null), 1800);
    }
    // dismiss banner so the player can act
    setIssues((arr) => arr.slice(1));
  };

  const dismissBanner = () => {
    setIssues([]);
    setFeedback([]);
    setSolvedMurderer(null);
  };

  const cluesById = useMemo(() => Object.fromEntries(level.clues.map((c) => [c.id, c])), []);

  const murdererName = solvedMurderer
    ? level.characters.find((c) => c.id === solvedMurderer)?.name
    : null;

  return (
    <div className="min-h-dvh text-foreground">
      <header className="border-b border-border/50 bg-secondary/40 backdrop-blur">
        <div className="mx-auto max-w-[92rem] px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="ink-heading text-xl sm:text-2xl font-bold text-foreground leading-tight">
              🕵 Murdoku <span className="text-accent">{level.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Place each suspect once per row/column. Make every clue hold.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
            <span className="rounded-full border border-ink/10 bg-paper px-2 py-1 uppercase tracking-wide font-semibold text-ink">
              {level.difficulty}
            </span>
            <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-1 font-semibold text-destructive">
              Victim: {level.characters.find((c) => c.role === "victim")?.name}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[92rem] px-3 sm:px-4 py-3 sm:py-4 grid gap-3 grid-cols-1 xl:grid-cols-[240px_minmax(540px,1fr)_250px] lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Character panel */}
        <section aria-label="Characters and clues" className="space-y-2 min-w-0 lg:max-h-[calc(100dvh-5.25rem)] lg:overflow-auto lg:pr-1 lg:order-1 order-2">
          <h2 className="ink-heading text-foreground font-semibold uppercase tracking-wider text-xs hidden lg:block">Characters</h2>

          {/* Mobile selector */}
          <div className="lg:hidden">
            <MobileCharacterSelector
              characters={level.characters}
              cluesById={cluesById}
              placements={placements}
              selectedCharacterId={selectedCharacterId}
              onSelect={(id) => {
                setSelectedCharacterId(id);
                setSelectedTool("select");
              }}
            />
          </div>

          {/* Desktop list */}
          <div className="hidden lg:block lg:space-y-2">
            {level.characters.map((ch) => (
              <CharacterCard
                key={ch.id}
                character={ch}
                clue={cluesById[ch.clueIds[0]]}
                selected={selectedCharacterId === ch.id}
                placed={Boolean(placements[ch.id])}
                onSelect={() => {
                  setSelectedCharacterId(ch.id);
                  setSelectedTool("select");
                }}
              />
            ))}
          </div>
        </section>

        {/* Board */}
        <section aria-label="Game board" className="flex flex-col items-center gap-3 lg:order-2 order-1 min-w-0">
          <div className="overflow-x-auto max-w-full p-1 rounded-xl bg-background/30">
            <Board
              level={level}
              placements={placements}
              marks={cellMarks}
              selectedCharacterId={selectedCharacterId}
              selectedTool={selectedTool}
              onCellClick={handleCellClick}
              highlightCell={highlightCell}
            />
          </div>

          <ToolPanel
            tool={selectedTool}
            onTool={setSelectedTool}
            onUndo={handleUndo}
            onReset={() => setResetOpen(true)}
            onSubmit={handleSubmit}
            canUndo={history.length > 0}
          />

          <FeedbackBanner
            solved={Boolean(solvedMurderer)}
            murdererName={murdererName}
            victimName={level.characters.find((c) => c.role === "victim")?.name}
            areaName={
              solvedMurderer
                ? level.areas.find((a) => a.cellIds.includes(placements[solvedMurderer]))?.name
                : null
            }
            issues={issues}
            onJumpTo={handleJumpTo}
            onDismiss={dismissBanner}
          />
        </section>

        {/* Right rail */}
        <aside aria-label="Reference panels" className="space-y-3 min-w-0 lg:order-3 order-3 lg:col-span-2 xl:col-span-1 xl:max-h-[calc(100dvh-5.25rem)] xl:overflow-auto">
          <RuleHelper />
          <Legend />
          <details className="paper p-3 text-xs text-ink/70 group">
            <summary className="ink-heading font-semibold text-ink text-sm uppercase tracking-wider cursor-pointer outline-none cell-focus">Tip</summary>
            <p className="mt-2">Click a placed token to pick the character back up. Use <strong>Mark X</strong> on cells you've ruled out to keep track.</p>
          </details>
        </aside>
      </main>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the board?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears every placement, mark, and undo history. There's no going back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
