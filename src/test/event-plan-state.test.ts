import { describe, expect, it } from "vitest";
import { createInitialEventPlan, updateEventPlan, requiresShowPlannerRemovalConfirmation } from "@/lib/event-plan-state";

describe("Show planner items", () => {
  it("requires confirmation only when removing an existing Show planner item", () => {
    const initial = createInitialEventPlan();
    expect(requiresShowPlannerRemovalConfirmation(initial, "exhibitors:0")).toBe(true);
    expect(requiresShowPlannerRemovalConfirmation(initial, "sessions:0")).toBe(true);
    const removed = updateEventPlan(initial, ["sessions:0"]);
    expect(requiresShowPlannerRemovalConfirmation(removed, "exhibitors:0")).toBe(false);
    const readded = updateEventPlan(removed, ["sessions:0", "exhibitors:0"]);
    expect(requiresShowPlannerRemovalConfirmation(readded, "exhibitors:0")).toBe(false);
  });
  it("starts with exactly two existing items from Show planner", () => {
    const state = createInitialEventPlan();
    expect(state.ids).toEqual(["exhibitors:0", "sessions:0"]);
    expect(state.showPlannerIds).toEqual(state.ids);
  });
  it("removes an existing item and its source without removing the other item", () => {
    const state = updateEventPlan(createInitialEventPlan(), ["sessions:0"]);
    expect(state.ids).toEqual(["sessions:0"]);
    expect(state.showPlannerIds).toEqual(["sessions:0"]);
  });
  it("does not label an item re-added from recommendations as Show planner", () => {
    const removed = updateEventPlan(createInitialEventPlan(), ["sessions:0"]);
    const readded = updateEventPlan(removed, ["sessions:0", "exhibitors:0"]);
    expect(readded.ids).toContain("exhibitors:0");
    expect(readded.showPlannerIds).not.toContain("exhibitors:0");
  });
  it("clears all existing items and sources", () => {
    expect(updateEventPlan(createInitialEventPlan(), [])).toEqual({ ids: [], showPlannerIds: [] });
  });
  it("preserves the source of items retained during reordering or rebuilding", () => {
    expect(updateEventPlan(createInitialEventPlan(), ["sessions:0", "products:0", "exhibitors:0"]).showPlannerIds)
      .toEqual(["exhibitors:0", "sessions:0"]);
  });
});