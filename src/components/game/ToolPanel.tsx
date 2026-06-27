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
    "flex-1 min-w-[56px] flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border text-xs font-medium cell-focus",
    "transition-colors",
    active
      ? "bg-accent text-accent-foreground border-accent shadow-sm"
      : "bg-paper text-ink border-ink/10 hover:bg-paper/80"
  );

export const ToolPanel = ({ tool, onTool, onUndo, onReset, onSubmit, canUndo }: Props) => {
  return (
    <div className="paper p-2.5 space-y-2 w-full max-w-2xl sticky bottom-2 z-20 shadow-xl sm:static sm:shadow-md">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button type="button" className={toolBtn(tool === "select")} onClick={() => onTool("select")} aria-pressed={tool === "select"} aria-label="Select character tool">
          <MousePointer2 className="h-4 w-4" /> <span>Select</span>
        </button>
        <button type="button" className={toolBtn(tool === "x")} onClick={() => onTool("x")} aria-pressed={tool === "x"} aria-label="Mark impossible cell">
          <X className="h-4 w-4" /> <span>Mark X</span>
        </button>
        <button type="button" className={toolBtn(tool === "erase")} onClick={() => onTool("erase")} aria-pressed={tool === "erase"} aria-label="Eraser tool">
          <Eraser className="h-4 w-4" /> <span>Erase</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <Button type="button" variant="secondary" size="sm" className="min-w-0 px-2" onClick={onUndo} disabled={!canUndo} aria-label="Undo last action">
          <Undo2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Undo</span>
        </Button>
        <Button type="button" variant="secondary" size="sm" className="min-w-0 px-2" onClick={onReset} aria-label="Reset board">
          <RotateCcw className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button type="button" size="sm" className="min-w-0 px-2 bg-primary hover:bg-primary/90" onClick={onSubmit} aria-label="Submit board for verification">
          <Check className="h-4 w-4 sm:mr-1" /> <span>Submit</span>
        </Button>
      </div>
    </div>
  );
};
