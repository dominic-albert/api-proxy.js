import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Building2, CalendarClock, Mic, Package, MapPin, SlidersHorizontal, ArrowUpDown, Plus, Check, CalendarHeart, Wand2, Trash2, GripVertical, Loader2, AlertTriangle, Sparkles, CalendarDays, Clock, ChevronRight, Share2, Download, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlanItemAction } from "@/components/PlanItemAction";
import { createInitialEventPlan, updateEventPlan, requiresShowPlannerRemovalConfirmation } from "@/lib/event-plan-state";

type Item = { title: string; meta: string[]; body: string; tag?: string; sub?: string };

const tabs: { key: string; label: string; icon: typeof Building2; items: Item[] }[] = [
  {
    key: "exhibitors", label: "Exhibitors", icon: Building2,
    items: [
      { title: "Nexa Cardio Systems", tag: "must-meet", meta: ["Stand ME610"], body: "Its wearable ECG patch and remote monitoring platform match your focus on connected cardiac care, and the team is open to hospital pilot partnerships this year. Their clinical team can share outcomes from three NHS trusts already using the platform, giving you real evidence on patient adherence and alert accuracy before committing." },
      { title: "Lumen Imaging", tag: "must-meet", meta: ["Stand ME624"], body: "AI-assisted ultrasound with FDA and CE clearance — a strong fit for your objective of reducing diagnostic wait times in outpatient clinics. Visiting their stand lets you see live scans on the device, compare image quality with your current systems and discuss evaluation-unit terms with the medical affairs team." },
      { title: "Veritas Surgical Robotics", meta: ["Stand ME602"], body: "Compact robotic arm for minimally invasive orthopaedics, relevant to your interest in day-surgery efficiency and shorter recovery times. Their compact footprint fits existing theatres without major refurbishment, and they offer leasing models that could suit your capital budget cycle." },
      { title: "CareLoop Digital Health", meta: ["Stand ME631"], body: "Patient engagement app with EHR integration (Epic, Cerner), aligned with your objective to improve post-discharge follow-up. They have published readmission data from European hospitals, which will help you build the business case for a digital follow-up programme." },
      { title: "Sterion Infection Control", meta: ["Stand ME645"], body: "UV-C disinfection robots with published hospital outcome data, useful for your infection-prevention sourcing brief. Their units log every disinfection cycle automatically, supporting audit and compliance reporting that your infection-control team currently does by hand." },
      { title: "Helix Diagnostics", meta: ["Stand ME658"], body: "Point-of-care molecular testing with 20-minute results, a good match for your interest in decentralised diagnostics. Their compact analysers need minimal lab training, making them a practical option for community hubs and urgent care centres in your network." },
    ],
  },
  {
    key: "meetings", label: "Meetings", icon: CalendarClock,
    items: [
      { title: "Remote cardiac monitoring pilot scope", sub: "Day 1 (Tue 17) · 10:15–11:00", meta: ["ME610", "Nexa Cardio Systems — clinical partnerships lead"], body: "Review pilot design, patient cohort size, data security and reimbursement pathways. Confirm integration requirements with your existing telemetry setup before discussing pricing. Come prepared with your target patient numbers and current telemetry vendor so the conversation moves quickly to timelines." },
      { title: "AI ultrasound clinical evidence review", sub: "Day 1 (Tue 17) · 13:30–14:15", meta: ["ME624", "Lumen Imaging — medical affairs director"], body: "Walk through validation studies, sensitivity and specificity data, and training needs for sonographers. Request a site demo and evaluation-unit terms. Bring a sonography lead if possible, as the discussion will cover workflow changes and training time in detail." },
      { title: "Day-surgery robotics business case", sub: "Day 2 (Wed 18) · 11:00–11:30", meta: ["ME602", "Veritas Surgical Robotics — health economics manager"], body: "Discuss cost per procedure, theatre-time savings and leasing versus purchase models for a two-theatre rollout. Ask for reference sites of a similar size and request a draft cost model you can share with your finance team after the show." },
      { title: "EHR-integrated patient follow-up", sub: "Day 2 (Wed 18) · 14:00–14:45", meta: ["ME631", "CareLoop Digital Health — implementation lead"], body: "Agree integration timelines, data-protection compliance (GDPR) and readmission metrics for a 90-day trial. Confirm who owns patient data and how alerts route to clinical staff, as these are common blockers in procurement sign-off." },
    ],
  },
  {
    key: "sessions", label: "Sessions", icon: Mic,
    items: [
      { title: "AI in Diagnostics: From Pilot to Practice", tag: "Digital Health", sub: "Day 1 (Tue 17) · 09:30–10:00", meta: ["Main Stage", "Dr. Leila Mansour, chief medical information officer"], body: "Sets context on real-world AI adoption before your imaging meetings, covering validation, clinician trust and regulatory hurdles. The speaker leads AI adoption at a major teaching hospital and will share what worked, what failed and how long real rollouts take." },
      { title: "Navigating EU MDR for Connected Devices", tag: "Regulatory", sub: "Day 1 (Tue 17) · 15:00–15:45", meta: ["Regulatory Forum", "Daniel Reed, regulatory affairs adviser"], body: "Essential for assessing supplier compliance as you evaluate wearables and software-as-a-medical-device vendors. You will leave with a practical checklist to test vendor claims about certification, post-market surveillance and software updates." },
      { title: "The Hospital at Home Revolution", tag: "Care Models", sub: "Day 2 (Wed 18) · 10:00–10:45", meta: ["Main Stage", "Prof. Omar Haddad, health systems researcher"], body: "Directly supports your remote-monitoring objective with outcome data from large hospital-at-home programmes. The session includes cost and staffing comparisons that are directly useful when planning a remote-care service in your region." },
      { title: "Cybersecurity for Medical Devices", tag: "Digital Health", sub: "Day 2 (Wed 18) · 12:00–12:30", meta: ["Innovation Theatre", "Sara Klein, healthcare security consultant"], body: "Gives you questions to ask vendors about device security, patching and data handling before procurement. Recent incidents have made device security a board-level issue, and this talk explains what good looks like in plain terms." },
      { title: "Value-Based Procurement in Medtech", tag: "Procurement", sub: "Day 2 (Wed 18) · 16:00–16:45", meta: ["Procurement Forum", "James Patel, NHS procurement adviser"], body: "Helps you structure outcome-based contracts that tie supplier payment to measurable patient results. Expect case studies showing how hospitals linked payments to readmission rates and procedure outcomes without slowing purchasing." },
    ],
  },
  {
    key: "products", label: "Products", icon: Package,
    items: [
      { title: "Nexa CardioPatch 14-Day ECG Monitor", meta: ["Nexa Cardio Systems", "Stand ME610"], body: "Single-lead wearable ECG with cloud analytics — a direct match for your remote cardiac monitoring brief. It is waterproof, needs no charging during wear and sends reports straight to clinicians, reducing repeat appointments for patients." },
      { title: "Lumen Vision AI Ultrasound", meta: ["Lumen Imaging", "Stand ME624"], body: "Handheld ultrasound with real-time AI guidance, helping non-specialist staff capture diagnostic-quality images. The device pairs with standard tablets and guides probe placement step by step, making it suitable for wards, GP surgeries and ambulances." },
      { title: "Veritas Ortho Compact Robot", meta: ["Veritas Surgical Robotics", "Stand ME602"], body: "Space-saving surgical robot designed for day-surgery theatres, supporting faster patient turnover. Setup takes under fifteen minutes and it supports knee and hip procedures, helping theatres run more cases each day." },
      { title: "CareLoop Recovery App", meta: ["CareLoop Digital Health", "Stand ME631"], body: "Post-discharge app with symptom tracking and nurse alerts, aimed at reducing 30-day readmissions. Patients get reminders and exercise plans, while nurses see a single dashboard of who needs a call, saving time on routine check-ins." },
      { title: "Sterion UV-C Autonomous Unit", meta: ["Sterion Infection Control", "Stand ME645"], body: "Self-navigating disinfection robot that logs every cycle for infection-control audit trails. It maps rooms on first use and then runs unattended overnight cycles, freeing cleaning staff for other high-touch areas." },
    ],
  },
];

const imgs = import.meta.glob("@/assets/cards/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const imgFor = (key: string, i: number) => imgs[`/src/assets/cards/${key[0]}${i + 1}.jpg`];
const spk = import.meta.glob("@/assets/speakers/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const presenters = ["Lumen Imaging", "Nexa Cardio Systems", "CareLoop Digital Health", "Sterion Infection Control", "Veritas Surgical Robotics"];
const people = tabs.find((t) => t.key === "sessions")!.items.map((it, i) => {
  const raw = it.meta[1] ?? ""; const c = raw.indexOf(",");
  return { name: c > 0 ? raw.slice(0, c) : raw, role: c > 0 ? raw.slice(c + 1).trim() : "", img: spk[`/src/assets/speakers/sp${i + 1}.jpg`] };
});
const sessionSpeakers = [[0], [1, 3], [2], [3, 0], [4, 1]];
const DAYS = [
  { key: "Day 1 (Tue 17)", wd: "Tue", d: "17" },
  { key: "Day 2 (Wed 18)", wd: "Wed", d: "18" },
];
const SLOT_GROUPS = [
  { label: "Morning", times: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
  { label: "Afternoon", times: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"] },
  { label: "Evening", times: ["16:00", "16:30", "17:00"] },
];
const addMin = (t: string, m: number) => { const [h, mm] = t.split(":").map(Number); const x = h! * 60 + mm! + m; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const fmt12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${String(((h! + 11) % 12) + 1).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h! < 12 ? "AM" : "PM"}`; };
// Made-up exhibitor availability: some slots are already taken
const isTaken = (idx: number, day: number, t: string) => (t.charCodeAt(0) + t.charCodeAt(1) + t.charCodeAt(3) + idx * 3 + day * 5) % 4 === 0;
function Speakers({ idx }: { idx: number }) {
  const list = (sessionSpeakers[idx] ?? [idx]).map((i) => people[i]!);
  return (
    <div>
      <h5 className="text-sm font-semibold text-foreground">{list.length > 1 ? "Speakers" : "Speaker"}</h5>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {list.map((sp) => (
          <div key={sp.name} className="flex items-center gap-3">
            <img src={sp.img} alt={sp.name} loading="lazy" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{sp.name}</p>
              <p className="truncate text-xs text-muted-foreground">{sp.role}</p>
              <button type="button" className="text-xs font-medium text-brand underline-offset-4 hover:underline">More info</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function PlanTabs() {
  const [active, setActive] = useState("exhibitors");
  useEffect(() => { const r = () => setActive("exhibitors"); window.addEventListener("recs-refreshed", r); return () => window.removeEventListener("recs-refreshed", r); }, []);
  const view = "list" as const;
  const [dayFilter, setDayFilter] = useState("all");
  const tab = tabs.find((t) => t.key === active)!;
  const items = tab.items;
  const [planState, setPlanState] = useState(createInitialEventPlan);
  const plan = planState.ids;
  const setPlan = (next: string[] | ((current: string[]) => string[])) => {
    setPlanState((state) => updateEventPlan(state, typeof next === "function" ? next(state.ids) : next));
  };
  const fromShowPlanner = (pid: string) => planState.showPlannerIds.includes(pid);
  const [planOpen, setPlanOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<string[]>([]);
  const id = (k: string, i: number) => `${k}:${i}`;
  const lookup = (pid: string) => {
    const [k = "", i = "0"] = pid.split(":");
    const t = tabs.find((x) => x.key === k)!;
    return { tab: t, item: t.items[+i]!, img: imgFor(k, +i) };
  };
  const planBtn = useRef<HTMLButtonElement>(null);
  const addFx = (pid: string, e: React.MouseEvent<HTMLElement>) => {
    const adding = !plan.includes(pid);
    toggle(pid);
    if (adding && !pid.startsWith("meetings:")) warnClash(pid);
    const target = planBtn.current;
    if (!adding || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const btn = e.currentTarget;
    const from = btn.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
    const hs = 40;
    Object.assign(ghost.style, { position: "fixed", left: `${from.left + from.width / 2 - hs / 2}px`, top: `${from.top + from.height / 2 - hs / 2}px`, width: `${hs}px`, height: `${hs}px`, display: "grid", placeItems: "center", borderRadius: "9999px", background: "var(--brand)", color: "var(--primary-foreground)", zIndex: "9999", pointerEvents: "none", boxShadow: "0 8px 20px -4px color-mix(in oklab, var(--brand) 60%, transparent)" });
    document.body.appendChild(ghost);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    ghost.animate([
      { transform: "translate(0,0) scale(0)", opacity: 0 },
      { transform: "translate(0,-10px) scale(1.3)", opacity: 1, offset: 0.15 },
      { transform: "translate(0,-10px) scale(1)", opacity: 1, offset: 0.25 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(0.9)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.5 },
    ], { duration: 850, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = () => {
      ghost.remove();
      target.animate([{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(0.95)" }, { transform: "scale(1)" }], { duration: 400, easing: "ease-out" });
    };
  };
  const toggle = (pid: string) => {
    if (requiresShowPlannerRemovalConfirmation(planState, pid)) {
      setPendingRemoval(pid);
      return;
    }
    setPlan((p) => (p.includes(pid) ? p.filter((x) => x !== pid) : [...p, pid]));
  };
  const [times, setTimes] = useState<Record<string, string>>({});
  const [planFilter, setPlanFilter] = useState("all");
  const [sched, setSched] = useState<{ pid: string; idx: number } | null>(null);
  const [sDay, setSDay] = useState(0);
  const [sTime, setSTime] = useState<string | null>(null);
  const openSched = (pid: string, idx: number) => {
    const cur = times[pid];
    const di = cur ? Math.max(0, DAYS.findIndex((d) => cur.startsWith(d.key))) : 0;
    setSDay(di);
    setSTime(cur ? cur.split(" · ")[1]!.split("–")[0]! : null);
    setSched({ pid, idx });
  };
  const confirmSched = (e: React.MouseEvent<HTMLElement>) => {
    if (!sched || !sTime) return;
    const slot = `${DAYS[sDay]!.key} · ${sTime}–${addMin(sTime, 30)}`;
    const fresh = !plan.includes(sched.pid);
    setTimes((t) => ({ ...t, [sched.pid]: slot }));
    warnClash(sched.pid, slot);
    if (fresh) addFx(sched.pid, e);
    setSched(null);
  };
  const cancelBooking = () => {
    if (!sched) return;
    const p0 = sched.pid;
    setPlan((p) => p.filter((x) => x !== p0));
    setTimes(({ [p0]: _, ...rest }) => rest);
    setSched(null);
  };
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h! * 60 + (m ?? 0); };
  const range = (slot?: string) => {
    if (!slot || !slot.startsWith("Day")) return null;
    const [day, tt = ""] = slot.split(" · ");
    const [a = "", b] = tt.split("–");
    if (!/^\d/.test(a)) return null;
    const s0 = toMin(a);
    return { day: day!, s: s0, e: b ? toMin(b) : s0 + 30 };
  };
  const slotOf = (pid: string, tm: Record<string, string> = times) => /^(exhibitors|products):/.test(pid) ? undefined : tm[pid] ?? (lookup(pid).item.sub?.startsWith("Day") ? lookup(pid).item.sub : undefined);
  const clashesWith = (slot: string | undefined, self: string, ids: string[] = plan, tm: Record<string, string> = times) => {
    const r = range(slot); if (!r) return [];
    return ids.filter((p) => { if (p === self) return false; const o = range(slotOf(p, tm)); return !!o && o.day === r.day && o.s < r.e && r.s < o.e; });
  };
  const planRows = () => {
    const rows = plan.map((p) => { const sl = slotOf(p); const { tab: t, item } = lookup(p); const [day = "", time = ""] = sl ? sl.split(" · ") : []; const grp = p.startsWith("products:") ? "Products to view" : "Exhibitors to visit"; return { p, day: day || grp, time, type: t.label.slice(0, -1), item, sl: sl ?? (p.startsWith("products:") ? "~2" : "~1") }; });
    return rows.sort((a, b) => (a.sl < b.sl ? -1 : a.sl > b.sl ? 1 : 0));
  };
  const planText = () => {
    let last = ""; const out = ["My event plan · ABC Paris, 16–18 April 2024", ""];
    planRows().forEach((r) => { const d = r.day || "Exhibitors to visit"; if (d !== last) { out.push(d.toUpperCase()); last = d; } out.push(`• ${r.time ? r.time + " · " : ""}${r.type}: ${r.item.title}`); });
    return out.join("\n");
  };
  const sharePlan = async () => {
    const text = planText();
    try {
      if (navigator.share) { await navigator.share({ title: "My event plan", text }); return; }
      await navigator.clipboard.writeText(text);
      toast.success("Plan copied", { description: "Paste it into an email or message to share." });
    } catch (e) { if ((e as Error).name !== "AbortError") toast.error("Couldn't share your plan"); }
  };
  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
    let y = M;
    const need = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text("My event plan", M, y); y += 20;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110); doc.text(`ABC Paris · 16–18 April 2024 · ${plan.length} items`, M, y); y += 24;
    let last = "";
    const details = (r: ReturnType<typeof planRows>[number]): string[] => {
      const k = r.p.split(":")[0]; const i = +r.p.split(":")[1]!; const m = r.item.meta;
      const stand = (m.find((x) => /ME\d/.test(x)) ?? "").replace(/^Stand:?\s*/i, "");
      if (k === "exhibitors") return [`Stand: ${stand}`, "Visit: anytime during show hours"];
      if (k === "meetings") return [`Stand: ${stand}`, `With: ${m[1] ?? ""}`, `Time: ${r.day} · ${r.time}`];
      if (k === "sessions") { const sp = (sessionSpeakers[i] ?? [i]).map((j) => people[j]!).map((x) => `${x.name}${x.role ? ` (${x.role})` : ""}`).join("; "); return [`Location: ${m[0] ?? ""}`, `Time: ${r.day} · ${r.time}`, ...(r.item.tag ? [`Topic: ${r.item.tag}`] : []), `Speaker${sp.includes(";") ? "s" : ""}: ${sp}`]; }
      return [`Exhibitor: ${m[0] ?? ""}`, `Stand: ${stand}`];
    };
    const TW = W - M * 2 - 30;
    planRows().forEach((r) => {
      const d = r.day;
      if (d !== last) { need(40); y += 8; doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(214, 30, 120); doc.text(d.toUpperCase(), M, y); y += 8; doc.setDrawColor(225); doc.line(M, y, W - M, y); y += 18; last = d; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); const title = doc.splitTextToSize(r.item.title, TW) as string[];
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); const det = details(r).flatMap((t) => doc.splitTextToSize(t, TW) as string[]);
      const body = doc.splitTextToSize(r.item.body, TW) as string[];
      const h = 13 + title.length * 14 + det.length * 12 + 16 + body.length * 12;
      need(h + 16);
      const top = y;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(120); doc.text(r.type.toUpperCase(), M + 14, y); y += 13;
      doc.setFontSize(11); doc.setTextColor(25); doc.text(title, M + 14, y); y += title.length * 14;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(60); doc.text(det, M + 14, y); y += det.length * 12 + 4;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(120); doc.text("WHY IT'S RECOMMENDED", M + 14, y); y += 12;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(90); doc.text(body, M + 14, y); y += body.length * 12;
      doc.setFillColor(214, 30, 120); doc.rect(M, top - 9, 3, y - top + 2, "F");
      y += 18;
    });
    doc.save("my-event-plan.pdf");
  };
  const warnClash = (pid: string, slot?: string) => {
    const c = clashesWith(slot ?? slotOf(pid), pid);
    if (c.length) toast.warning("Time clash in your plan", { description: `This overlaps with "${lookup(c[0]!).item.title}"${c.length > 1 ? ` and ${c.length - 1} more` : ""}. Open My event plan to sort it out.` });
  };
  const [aiTimes, setAiTimes] = useState<Record<string, string>>({});
  const slots = ["Day 1 (Tue 17) · 09:00", "Day 1 (Tue 17) · 11:30", "Day 1 (Tue 17) · 12:30", "Day 1 (Tue 17) · 16:00", "Day 2 (Wed 18) · 09:00", "Day 2 (Wed 18) · 11:45", "Day 2 (Wed 18) · 13:00", "Day 2 (Wed 18) · 15:00"];
  const [confirm, setConfirm] = useState(false);
  const surprise = () => {
    setConfirm(false);
    setAiOpen(true);
    setAiLoading(true);
    setTimeout(() => {
      const picks = tabs.flatMap((t) => {
        const idx = t.items.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 2).sort();
        return idx.map((i) => id(t.key, i));
      });
      const tm: Record<string, string> = {};
      let s = 0;
      picks.forEach((pid) => {
        const sub = lookup(pid).item.sub ?? "";
        if (sub.startsWith("Day")) tm[pid] = sub.split("–")[0]!; else if (pid.startsWith("meetings:")) tm[pid] = slots[s++ % slots.length]!;
      });
      picks.sort((a, b) => (tm[a] ?? "~").localeCompare(tm[b] ?? "~"));
      setAiPlan(picks);
      setAiTimes(tm);
      setAiLoading(false);
    }, 1400);
  };
  const applyAi = () => { setConfirm(false); setPlan(aiPlan); setTimes(aiTimes); setAiOpen(false); setPlanOpen(true); };
  const dragId = useRef<string | null>(null);
  const reorder = (from: string, to: string) => {
    if (from === to) return;
    const cur: Record<string, string> = { ...times };
    plan.forEach((p) => { const s = lookup(p).item.sub; if (!cur[p] && s?.startsWith("Day")) cur[p] = s; });
    const sorted = [...plan].sort((a, b) => (cur[a] ?? "~").localeCompare(cur[b] ?? "~"));
    const slotsInOrder = sorted.map((p) => cur[p]);
    const next = sorted.filter((p) => p !== from);
    next.splice(next.indexOf(to) + (sorted.indexOf(from) < sorted.indexOf(to) ? 1 : 0), 0, from);
    const tm: Record<string, string> = {};
    next.forEach((p, i) => { const t = slotsInOrder[i]; if (t) tm[p] = t; });
    setPlan(next);
    setTimes(tm);
  };
  const Timeline = ({ ids, tm: tm0, onRemove, draggable }: { ids: string[]; tm: Record<string, string>; onRemove?: (pid: string) => void; draggable?: boolean }) => {
    const tm: Record<string, string> = { ...tm0 };
    ids.forEach((p) => { const s = lookup(p).item.sub; if (!tm[p] && s?.startsWith("Day")) tm[p] = s; });
    ids.forEach((p) => { if (p.startsWith("exhibitors:")) tm[p] = "~1Exhibitors to visit · ~"; else if (p.startsWith("products:")) tm[p] = "~2Products to view · ~"; else if (!tm[p]) tm[p] = "~1Exhibitors to visit · ~"; });
    const sorted = [...ids].sort((a, b) => (tm[a]! < tm[b]! ? -1 : tm[a]! > tm[b]! ? 1 : 0));
    const groups: { day: string; items: string[] }[] = [];
    sorted.forEach((p) => { const d = tm[p]!.split(" · ")[0]!; const g = groups[groups.length - 1]; if (g && g.day === d) g.items.push(p); else groups.push({ day: d, items: [p] }); });
    return (
      <div className="space-y-4">
        {groups.map((g) => {
          const visit = g.day.startsWith("~");
          return (
            <section key={g.day} className="overflow-hidden rounded-xl border border-border bg-card">
              {(() => {
                const prod = g.day.startsWith("~2");
                const Ic = !visit ? CalendarDays : prod ? Package : Building2;
                const title = visit ? g.day.slice(2) : g.day.split(" (")[0];
                const sub = visit ? "Anytime during the show" : `${g.day.match(/\((.*)\)/)?.[1] ?? ""} April`;
                return (
                  <div className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-brand shadow-[0_1px_2px_var(--border)]"><Ic className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-tight text-foreground">{title}</h3>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{g.items.length}</span>
                  </div>
                );
              })()}
              <ul className="divide-y divide-border px-3">
                {g.items.map((pid) => {
                  const time = tm[pid]!.split(" · ")[1] ?? "";
                  const c = visit ? [] : clashesWith(slotOf(pid, tm0), pid, ids, tm0);
                  return (
                    <li key={pid} className={`flex gap-3 py-3 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
                      draggable={draggable}
                      onDragStart={(e) => { dragId.current = pid; e.dataTransfer.effectAllowed = "move"; e.currentTarget.style.opacity = "0.4"; }}
                      onDragEnd={(e) => { e.currentTarget.style.opacity = ""; }}
                      onDragOver={(e) => { if (draggable) e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); if (dragId.current) reorder(dragId.current, pid); dragId.current = null; }}>
                      {!visit && (
                        <div className="w-12 shrink-0 pt-0.5 text-xs tabular-nums">
                          <p className="font-semibold text-foreground">{time.split("–")[0]}</p>
                          {time.includes("–") && <p className="text-muted-foreground">{time.split("–")[1]}</p>}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <PlanRow pid={pid} onRemove={onRemove ? () => onRemove(pid) : undefined} />
                        {c.length > 0 && <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-tag"><AlertTriangle className="size-3.5" />Clashes with {lookup(c[0]!).item.title}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    );
  };
  const PlanRow = ({ pid, onRemove }: { pid: string; onRemove?: (() => void) | undefined }) => {
    const { tab: t, item, img } = lookup(pid);
    return (
      <div className="flex items-start gap-3">
        <img src={img} alt="" className="size-11 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.label.slice(0, -1)}</p>
          {fromShowPlanner(pid) && <span className="my-1 inline-flex rounded border border-provenance-border bg-provenance px-1.5 py-0.5 text-[10px] font-medium leading-tight text-provenance-foreground">Added from Show planner</span>}
          <p className="text-sm font-semibold leading-snug text-foreground">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        </div>
        {onRemove && <button onClick={onRemove} aria-label={`Remove ${item.title}`} className="-mr-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"><X className="size-4" /></button>}
      </div>
    );
  };
  return (
    <section className="mt-8">
      <div className="sticky top-0 z-30 -mx-4 bg-background px-4 pt-3 sm:-mx-6 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <h2 className="min-w-0 truncate text-xl font-semibold text-foreground sm:text-2xl sm:font-medium">Recommendations</h2>
        <button ref={planBtn} type="button" onClick={() => setPlanOpen(true)} className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-3.5 py-2 text-sm font-medium text-primary-foreground sm:px-4">
          <CalendarHeart className="size-4" />My event plan
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-border sm:gap-4">
        <div className="-mx-1 flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none] sm:mx-0 sm:gap-6">
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <button key={t.key} onClick={() => setActive(t.key)}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-2 py-3.5 text-sm font-medium transition-colors sm:py-4 ${on ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="hidden size-4 sm:block" />{t.label}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pb-1 text-sm sm:gap-2">
          <button type="button" aria-label="Filter" className="flex items-center rounded-full border border-border bg-card p-2.5 text-foreground">
            <SlidersHorizontal className="size-4" />
          </button>
          <button type="button" aria-label="Sort" className="flex items-center rounded-full border border-border bg-card p-2.5 text-foreground">
            <ArrowUpDown className="size-4" />
          </button>
        </div>
      </div>
      </div>
      {tab.key === "sessions" && (() => {
        const days = Array.from(new Set(items.map((it) => (it.sub ?? "").split(" · ")[0]!)));
        return (
          <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {["all", ...days].map((d) => {
              const n = d === "all" ? items.length : items.filter((it) => it.sub?.startsWith(d)).length;
              const on = dayFilter === d;
              return (
                <button key={d} type="button" onClick={() => setDayFilter(d)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? "border-brand bg-card text-brand" : "border-border bg-card text-foreground hover:border-brand/50"}`}>
                  {d === "all" ? "All days" : d}
                </button>
              );
            })}
          </div>
        );
      })()}
      {view === "list" && tab.key === "sessions" && (() => {
        const rows = items.map((it, idx) => ({ it, idx })).filter(({ it }) => dayFilter === "all" || it.sub?.startsWith(dayFilter));
        const groups: Record<string, typeof rows> = {};
        rows.forEach((r) => { const d = (r.it.sub ?? "").split(" · ")[0]!; (groups[d] ??= []).push(r); });
        return (
          <div className="mt-6 space-y-8">
            {Object.entries(groups).map(([day, list]) => (
              <section key={day}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
                  <CalendarDays className="size-4" />{day}
                  <span className="h-px flex-1 bg-border" />
                </h3>
                <ol className="relative space-y-4 border-l-2 border-brand/20 pl-4 sm:ml-14 sm:pl-6">
                  {list.map(({ it, idx }) => {
                    const pid = id(tab.key, idx); const on = plan.includes(pid);
                    const time = (it.sub ?? "").split(" · ")[1] ?? "";
                    return (
                      <li key={it.title} className="relative">
                        <span className="absolute -left-[23px] top-5 size-3 rounded-full border-2 border-background bg-brand sm:-left-[31px]" />
                        <span className="absolute -left-[88px] top-4 hidden w-14 text-right text-sm font-semibold sm:block">{time.split("–")[0]}</span>
                        <article className="overflow-hidden rounded-xl border border-border bg-card">
                          <div className="flex gap-4 p-4 sm:p-5">
                            <img src={imgFor(tab.key, idx)} alt={it.title} loading="lazy" width={112} height={112} className="size-20 shrink-0 rounded-lg object-cover sm:size-28" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                                    {it.tag && <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">{it.tag}</span>}
                                    {(idx % 3 === 0 || idx === 1) && <span className="rounded-full bg-tag/10 px-2 py-0.5 text-xs font-medium text-tag">Most recommended</span>}
                                  </div>
                                  <h4 className="font-semibold leading-snug sm:text-lg">{it.title}</h4>
                                </div>
                                <PlanItemAction added={on} fromShowPlanner={fromShowPlanner(pid)} onClick={(e) => addFx(pid, e)} className="hidden sm:block" />
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                                <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{time}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{it.meta[0]}</span>
                              </div>
                              <div className="mt-3 hidden sm:block"><h5 className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><Sparkles className="size-4 text-brand" />Reason for Recommendation</h5><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p></div>
                              <div className="mt-4 hidden sm:block"><Speakers idx={idx} /></div>
                            </div>
                          </div>
                          <div className="px-4 pb-3 sm:hidden"><h5 className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><Sparkles className="size-4 text-brand" />Reason for Recommendation</h5><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p></div>
                          <div className="px-4 pb-4 sm:hidden"><Speakers idx={idx} /></div>
                          <div className="flex px-4 pb-4 sm:hidden">
                            <PlanItemAction added={on} fromShowPlanner={fromShowPlanner(pid)} onClick={(e) => addFx(pid, e)} className="ml-auto" />
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        );
      })()}
      
{view === "list" && tab.key !== "sessions" && <div className="mt-4 space-y-3">
        {items.map((it, idx) => (
          <article key={it.title} className="flex gap-3 rounded-xl bg-card p-3 shadow-[0_1px_6px_var(--border)] sm:gap-4 sm:p-4">
            <img src={imgFor(tab.key, idx)} alt={it.title} loading="lazy" width={112} height={112} className="hidden size-28 shrink-0 rounded object-cover sm:block" />
            <div className="min-w-0 flex-1">
              {(() => { const pid = id(tab.key, idx); const on = plan.includes(pid); const stand = (it.meta.find((m) => /ME\d/.test(m)) ?? it.meta[0]!).replace(/^Stand:?\s*/i, ""); return (<>
              <div className="flex gap-3 sm:justify-between">
                <img src={imgFor(tab.key, idx)} alt="" loading="lazy" width={64} height={64} className="size-16 shrink-0 rounded-lg object-cover sm:hidden" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug sm:font-medium">{it.title}</h3>
                  {tab.key === "meetings" && <p className="mt-1 text-xs text-muted-foreground">{it.meta[1]}</p>}
                  {((tab.key !== "meetings" && it.sub?.startsWith("Day")) || it.tag || idx % 3 === 0) && <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:mt-2">
                    {tab.key !== "meetings" && it.sub?.startsWith("Day") && <span className="flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-foreground"><CalendarClock className="size-3.5" />{it.sub}</span>}
                    {(it.tag || idx % 3 === 0) && <span className="rounded-full bg-tag/10 px-2 py-0.5 text-xs font-medium text-tag">Most recommended</span>}
                  </div>}
                </div>
                {tab.key !== "meetings" && <PlanItemAction added={on} fromShowPlanner={fromShowPlanner(pid)} onClick={(e) => addFx(pid, e)} />}
                {tab.key === "meetings" && <button type="button" onClick={() => openSched(pid, idx)} className={`flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full px-3 text-sm font-medium transition-colors sm:px-4 ${on ? "bg-success/10 text-success" : "border border-brand/40 text-brand hover:bg-brand/5"}`}>
                  {on ? <Check className="size-4" /> : <CalendarClock className="size-4" />}<span className="hidden sm:inline">{on ? "Booked · Change" : "Schedule meeting"}</span><span className="sm:hidden">{on ? "Booked" : "Schedule"}</span>
                </button>}
              </div>
              <div className="mt-3"><h5 className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><Sparkles className="size-4 text-brand" />Reason for Recommendation</h5></div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">{it.body}</p>
              <div className="mt-4 flex w-fit max-w-full items-center gap-3 rounded-full border border-border bg-surface py-1 pl-1 pr-1">
                <span className="flex items-center gap-2 pl-1 pr-1">
                  <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stand</span>
                  <span className="text-sm font-semibold text-foreground">{stand}</span>
                </span>
                <span className="h-5 w-px bg-border" />
                <span className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-brand shadow-[0_1px_3px_var(--border)] transition-colors hover:bg-brand/5"><MapPin className="size-4" />Locate<ChevronRight className="size-3.5" /></span>
              </div>
              </>); })()}
            </div>
          </article>
        ))}
      </div>}

      <Dialog open={!!sched} onOpenChange={(o) => { if (!o) setSched(null); }}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-xl">
          {sched && (() => {
            const m = tabs.find((t) => t.key === "meetings")!.items[sched.idx]!;
            const exhibitor = (m.meta[1] ?? "").split(" — ")[0];
            const booked = plan.includes(sched.pid);
            return (<>
              <DialogHeader className="border-b border-border p-5 text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Schedule meeting</p>
                <DialogTitle className="text-xl">{exhibitor}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5"><MapPin className="size-4" />Stand {m.meta[0]} · {m.title}</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-5">
                <h4 className="text-sm font-semibold">Dates available</h4>
                <div className="mt-3 flex gap-2">
                  {DAYS.map((d, i) => (
                    <button key={d.key} type="button" onClick={() => { setSDay(i); setSTime(null); }} aria-pressed={sDay === i}
                      className={`flex w-16 flex-col items-center rounded-xl border py-2 transition-colors ${sDay === i ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card hover:border-brand"}`}>
                      <span className="text-xs">{d.wd}</span><span className="text-xl font-semibold leading-tight">{d.d}</span><span className="text-xs">Apr</span>
                    </button>
                  ))}
                </div>
                <h4 className="mt-6 text-sm font-semibold">Time slots available</h4>
                {SLOT_GROUPS.map((g) => (
                  <div key={g.label} className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{g.label}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {g.times.map((t) => {
                        const taken = isTaken(sched.idx, sDay, t);
                        const sel = sTime === t;
                        const clash = !taken && clashesWith(`${DAYS[sDay]!.key} · ${t}–${addMin(t, 30)}`, sched.pid).length > 0;
                        return (
                          <button key={t} type="button" disabled={taken} onClick={() => setSTime(t)} aria-pressed={sel} title={clash ? "Clashes with something in your plan" : undefined}
                            className={`relative h-10 rounded-lg border text-sm transition-colors ${taken ? "cursor-not-allowed border-transparent bg-surface text-muted-foreground/60 line-through" : sel ? "border-brand bg-brand/10 font-medium text-brand" : "border-border bg-card hover:border-brand"}`}>
                            {fmt12(t)}
                            {clash && <AlertTriangle className="absolute right-1 top-1 size-3 text-tag" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {sTime && (() => { const c = clashesWith(`${DAYS[sDay]!.key} · ${sTime}–${addMin(sTime, 30)}`, sched.pid); return c.length > 0 && (
                  <p className="mt-5 flex items-start gap-2 rounded-lg bg-tag/10 p-3 text-xs text-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tag" />
                    <span>This time clashes with <b>{lookup(c[0]!).item.title}</b>{c.length > 1 ? ` and ${c.length - 1} more` : ""} in your plan. You can still book it, or pick another time.</span>
                  </p>); })()}
              </div>
              <DialogFooter className="flex-row gap-2 border-t border-border p-4 sm:justify-between">
                {booked
                  ? <button type="button" onClick={cancelBooking} className="h-11 flex-1 rounded-full border border-destructive/40 text-sm font-medium text-destructive hover:bg-destructive/5">Cancel booking</button>
                  : <button type="button" onClick={() => setSched(null)} className="h-11 flex-1 rounded-full border border-border text-sm font-medium hover:bg-surface">Cancel</button>}
                <button type="button" disabled={!sTime} onClick={confirmSched} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-primary-foreground disabled:opacity-40">
                  <CalendarDays className="size-4" />{booked ? "Update" : "Confirm"}
                </button>
              </DialogFooter>
            </>);
          })()}
        </DialogContent>
      </Dialog>

      <Sheet open={planOpen} onOpenChange={setPlanOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {(() => {
            const count = (k: string) => plan.filter((p) => p.startsWith(k + ":")).length;
            const stats = [
              { key: "exhibitors", label: "Exhibitors", n: count("exhibitors"), icon: Building2, c: "text-type-exhibitor" },
              { key: "meetings", label: "Meetings", n: count("meetings"), icon: CalendarDays, c: "text-type-meeting" },
              { key: "sessions", label: "Sessions", n: count("sessions"), icon: Mic, c: "text-type-session" },
              { key: "products", label: "Products", n: count("products"), icon: Package, c: "text-type-product" },
            ];
            return (
              <SheetHeader className="space-y-3 border-b border-border px-5 py-4 pr-14 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle>My event plan</SheetTitle>
                    {plan.length === 0 ? <SheetDescription className="mt-0.5">Nothing added yet</SheetDescription> : (
                      <SheetDescription className="sr-only">Your saved event items</SheetDescription>)}
                  </div>
                  {plan.length > 0 && (<div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={sharePlan} aria-label="Share plan" title="Share" className="grid size-9 place-items-center rounded-full text-foreground hover:bg-surface"><Share2 className="size-4" /></button>
                    <button type="button" onClick={downloadPdf} aria-label="Download PDF" title="Download PDF" className="grid size-9 place-items-center rounded-full text-foreground hover:bg-surface"><Download className="size-4" /></button>

                  </div>)}
                </div>
                {plan.length > 0 && (
                  <div className="-mx-5 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
                    {[{ key: "all", label: "All", n: plan.length, icon: CalendarHeart }, ...stats.map((x) => ({ key: x.key, label: x.label, n: x.n, icon: x.icon }))].filter((x) => x.n).map((x) => {
                      const on = planFilter === x.key;
                      return (
                        <button key={x.key} type="button" onClick={() => setPlanFilter(x.key)} aria-pressed={on}
                          className={`flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs transition-colors ${on ? "border-brand bg-card font-medium text-brand" : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                          {x.label}<span className="tabular-nums opacity-70">{x.n}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {(() => { const n = plan.filter((p) => clashesWith(slotOf(p), p).length > 0).length; return n > 0 && (
                  <p className="flex items-center gap-2 rounded-lg bg-tag/10 px-3 py-2 text-xs text-foreground">
                    <AlertTriangle className="size-4 shrink-0 text-tag" />
                    <span>{n} items overlap in time</span>
                  </p>); })()}
              </SheetHeader>
            );
          })()}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {plan.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-14 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand"><CalendarHeart className="size-7" /></span>
                <p className="mt-4 font-semibold text-foreground">Your plan is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Tap "Add to plan" on any recommendation, schedule a meeting, or let us build one for you.</p>
              </div>
            ) : (
              <>
                {(() => { const f = planFilter !== "all" && plan.some((p) => p.startsWith(planFilter + ":")) ? planFilter : "all"; return <Timeline ids={f === "all" ? plan : plan.filter((p) => p.startsWith(f + ":"))} tm={times} onRemove={toggle} draggable={f === "all"} />; })()}
              </>
            )}
          </div>
          <div className="flex gap-2 border-t border-border p-4">
            {plan.length > 0 && (<>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button" className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-destructive hover:bg-destructive/5"><Trash2 className="size-4" />Clear all</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear your event plan?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove all {plan.length} item{plan.length === 1 ? "" : "s"}{plan.filter((p) => p.startsWith("meetings:")).length > 0 ? `, including ${plan.filter((p) => p.startsWith("meetings:")).length} booked meeting${plan.filter((p) => p.startsWith("meetings:")).length === 1 ? "" : "s"}` : ""}.{planState.showPlannerIds.length > 0 ? " Items added from Show planner will also be removed from Show planner." : ""} This can't be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Keep my plan</AlertDialogCancel>
                          <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { setPlan([]); setTimes({}); }}>Clear all</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
            </>)}
            <button onClick={surprise} className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium ${plan.length === 0 ? "bg-brand text-primary-foreground" : "border border-brand text-brand hover:bg-brand/5"}`}>
              <Wand2 className="size-4" />{plan.length === 0 ? "Build a Tailored Plan" : "Rebuild with AI"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={pendingRemoval !== null} onOpenChange={(open) => { if (!open) setPendingRemoval(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from both planners?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval ? `“${lookup(pendingRemoval).item.title}”` : "This item"} was added from Show planner. Removing it from My event plan will also remove it from Show planner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep item</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              if (!pendingRemoval) return;
              const pid = pendingRemoval;
              setPlan((p) => p.filter((x) => x !== pid));
              setTimes(({ [pid]: _, ...rest }) => rest);
              setPendingRemoval(null);
            }}>Remove from both</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="size-5 text-brand" />Your tailored event plan</DialogTitle>
            <DialogDescription>Built from your show objective and registration info.</DialogDescription>
          </DialogHeader>
          {aiLoading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground"><Loader2 className="size-6 animate-spin text-brand" />Creating your plan…</div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto pr-1"><Timeline ids={aiPlan} tm={aiTimes} /></div>
              {confirm && (
                <p className="flex items-start gap-2 rounded-md bg-surface p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tag" />
                  This will replace your existing event plan ({plan.length} item{plan.length === 1 ? "" : "s"}). This can't be undone.
                </p>
              )}
              <DialogFooter className="gap-2">
                <button onClick={() => (confirm ? setConfirm(false) : setAiOpen(false))} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
                <button onClick={() => (plan.length > 0 && !confirm ? setConfirm(true) : applyAi())} className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-primary-foreground">{confirm ? "Yes, replace my plan" : "Make this my event plan"}</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
