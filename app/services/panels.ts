// ============================================
// Panels Service — Header panel data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import { MOCK_TASKS, MOCK_CALENDAR, MOCK_USAGE, MOCK_SPREADSHEET } from '~/data/mock-panels';
import type { TaskData, CalendarData, UsageData, SpreadsheetData } from './types';

/** Returns the list of task items for the task panel. */
export async function getTasks(): Promise<TaskData[]> {
  return [...MOCK_TASKS];
}

/** Returns calendar data (month + events) for the calendar panel. */
export async function getCalendar(): Promise<CalendarData> {
  return MOCK_CALENDAR;
}

/** Returns usage statistics for the usage panel. */
export async function getUsage(): Promise<UsageData> {
  return MOCK_USAGE;
}

/** Returns spreadsheet data for the file panel demo. */
export async function getSpreadsheet(): Promise<SpreadsheetData> {
  return MOCK_SPREADSHEET;
}
