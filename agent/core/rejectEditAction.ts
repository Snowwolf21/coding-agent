import { agentState } from "../state.js";

/**
 * Reject AI suggested edit
 */
export function rejectEdit(id: number) {
  const exists = agentState.project.suggestions.some(
    (e) => e.id === id
  );

  if (!exists) {
    return `❌ Edit ${id} not found`;
  }

  agentState.project.suggestions =
    agentState.project.suggestions.filter(
      (e) => e.id !== id
    );

  console.log(`❌ Rejected edit ${id}`);

  return `Rejected edit ${id}`;
}