export type EventPlanState = { ids: string[]; showPlannerIds: string[] };

export function createInitialEventPlan(): EventPlanState {
  const ids = ["exhibitors:0", "sessions:0"];
  return { ids, showPlannerIds: [...ids] };
}

export function updateEventPlan(state: EventPlanState, ids: string[]): EventPlanState {
  return { ids: [...new Set(ids)], showPlannerIds: state.showPlannerIds.filter((id) => ids.includes(id)) };
}

export function requiresShowPlannerRemovalConfirmation(state: EventPlanState, id: string): boolean {
  return state.ids.includes(id) && state.showPlannerIds.includes(id);
}