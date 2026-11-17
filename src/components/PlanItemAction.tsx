import type { MouseEvent } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanItemAction({ added, fromShowPlanner, onClick, className = "" }: {
  added: boolean;
  fromShowPlanner: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  return (
    <div className={`flex shrink-0 flex-col items-end self-start ${className}`}>
      <Button type="button" variant="ghost" onClick={onClick}
        aria-label={added ? "Remove from plan" : "Add to plan"}
        className={`h-9 gap-1.5 rounded-full px-3 text-sm sm:px-4 ${added ? "bg-success/10 text-success hover:bg-success/15 hover:text-success" : "border border-brand/40 text-brand hover:bg-brand/5 hover:text-brand"}`}>
        {added ? <Check /> : <Plus />}<span className="hidden sm:inline">{added ? "Added" : "Add to plan"}</span><span className="sm:hidden">{added ? "Added" : "Add"}</span>
      </Button>
      {added && fromShowPlanner && <p className="mt-1.5 w-fit rounded border border-provenance-border bg-provenance px-1.5 py-0.5 text-[10px] font-medium leading-tight text-provenance-foreground sm:text-[11px]">via Show planner</p>}
    </div>
  );
}