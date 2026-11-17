import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import step1 from "@/assets/how/step1.png";
import step2 from "@/assets/how/step2.png";
import step3 from "@/assets/how/step3.png";

const steps = [
  { n: 1, title: "Understand Your Objective", body: "We use your answers to the registration questions to learn what you want from the show.", img: step1, bg: "bg-step-1/10", dot: "bg-step-1" },
  { n: 2, title: "Find the Right Exhibitors", body: "Our system searches exhibitor and product directories to identify those that align with your objective.", img: step2, bg: "bg-step-2/10", dot: "bg-step-2" },
  { n: 3, title: "Generate Your Recommendations", body: "We match your interests with relevant exhibitors to give you a personalised list to meet.", img: step3, bg: "bg-step-3/10", dot: "bg-step-3" },
];

export function HowDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl p-5 sm:max-w-4xl sm:p-8">
          <DialogHeader className="text-left">
            <DialogTitle className="pr-6 text-2xl font-semibold tracking-tight sm:text-3xl">How we personalise your event plan</DialogTitle>
            <DialogDescription className="text-base text-foreground">We follow three simple steps to craft your event plan:</DialogDescription>
          </DialogHeader>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((st) => (
              <li key={st.n} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className={`flex h-36 items-center justify-center p-4 ${st.bg}`}>
                  <img src={st.img} alt="" loading="lazy" className="max-h-full w-auto object-contain" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {st.n}</span>
                  <h3 className="mt-1 flex items-center gap-2 text-base font-semibold leading-tight text-foreground">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground ${st.dot}`}>{st.n}</span>{st.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Behind the scenes</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Your personalised event plan is created with generative AI using information from the event's official exhibitor and product directories and information provided about show objectives. The quality of the event plan may vary.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => onOpenChange(false)} className="h-11 rounded-full bg-brand px-8 text-sm font-medium text-primary-foreground">Understood</button>
          </div>
        </DialogContent>
      </Dialog>
  );
}
