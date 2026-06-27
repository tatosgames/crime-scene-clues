import { Button } from "@/components/ui/button";
import type { Tool } from "@/game/types";
import { cn } from "@/lib/utils";
import { MousePointer2, X, Eraser, Undo2, RotateCcw, Check } from "lucide-react";

interface Props {
  tool: Tool;
  onTool: (t: Tool) => void;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: () => void;
  canUndo: boolean;
}

const toolBtn = (active: boolean) =>
  cn(
    "flex-1 min-w-[64px] flex flex-col items-center gap-1 py-2 px-2 rounded-md border text-xs",
    "transition-colors",
    active
      ? "bg-accent text-accent-foreground border-accent"
      : "bg-paper text-ink border-ink/10 hover:bg-paper/80"
  );

export const ToolPanel = ({ tool, onTool, onUndo, onReset, onSubmit, canUndo }: Props) => {
  return (
    <div className="paper p-3 space-y-3">
      <div className="flex gap-2">
        <button type="button" className={toolBtn(tool === "select")} onClick={() => onTool("select")} aria-pressed={tool === "select"} aria-label="Select character tool">
          <MousePointer2 className="h-4 w-4" /> Select
        </button>
        <button type="button" className={toolBtn(tool === "x")} onClick={() => onTool("x")} aria-pressed={tool === "x"} aria-label="Mark impossible cell">
          <X className="h-4 w-4" /> Mark X
        </button>
        <button type="button" className={toolBtn(tool === "erase")} onClick={() => onTool("erase")} aria-pressed={tool === "erase"} aria-label="Eraser tool">
          <Eraser className="h-4 w-4" /> Erase
        </button>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={onUndo} disabled={!canUndo} aria-label="Undo last action">
          <Undo2 className="h-4 w-4 mr-1" /> Undo
        </Button>
        <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={onReset} aria-label="Reset board">
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
        <Button type="button" size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={onSubmit} aria-label="Submit board for verification">
          <Check className="h-4 w-4 mr-1" /> Submit
        </Button>
      </div>
    </div>
  );
};