// ============================================
// Workflows Service — Template, run, and command data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import { MOCK_WORKFLOW_TEMPLATES, MOCK_WORKFLOW_RUNS, MOCK_WORKFLOW_COMMANDS } from '~/data/mock-workflows';
import type { WorkflowTemplate, WorkflowRun, WorkflowCommand } from './types';

/** Returns all workflow templates as an array. */
export async function getTemplates(): Promise<WorkflowTemplate[]> {
  return Object.values(MOCK_WORKFLOW_TEMPLATES);
}

/** Returns a single template by ID, or null if not found. */
export async function getTemplate(id: string): Promise<WorkflowTemplate | null> {
  return MOCK_WORKFLOW_TEMPLATES[id] ?? null;
}

/** Returns a single workflow run by ID, or null if not found. */
export async function getRun(id: string): Promise<WorkflowRun | null> {
  return MOCK_WORKFLOW_RUNS[id] ?? null;
}

/** Returns all runs for a given template ID. */
export async function getRunsForTemplate(templateId: string): Promise<WorkflowRun[]> {
  return Object.values(MOCK_WORKFLOW_RUNS).filter((run) => run.templateId === templateId);
}

/** Returns all workflow runs as a Record keyed by runId. */
export async function getAllRuns(): Promise<Record<string, WorkflowRun>> {
  return { ...MOCK_WORKFLOW_RUNS };
}

/** Returns all available workflow slash commands. */
export async function getCommands(): Promise<WorkflowCommand[]> {
  return [...MOCK_WORKFLOW_COMMANDS];
}

/** Finds the chat thread ID linked to a given template's most recent run. */
export function findRunThread(templateId: string): string | null {
  for (const run of Object.values(MOCK_WORKFLOW_RUNS)) {
    if (run.templateId === templateId && run.threadId) return run.threadId;
  }
  return null;
}
