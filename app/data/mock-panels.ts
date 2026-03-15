// ============================================
// Mock Data — Header Panels + Spreadsheet
// ============================================
// Task panel, calendar panel, usage panel, and
// file panel spreadsheet data.

import type {
  TaskData,
  CalendarData,
  UsageData,
  SpreadsheetData,
} from '~/services/types';

// ============================================
// TASKS
// ============================================

export const MOCK_TASKS: TaskData[] = [
  { title: 'Review Halcyon Towers IC memo', meta: 'Due today \u00b7 Assigned by Sarah K.', urgent: true },
  { title: 'Approve row 14 rent roll change', meta: 'Due Mar 10 \u00b7 Spreadsheets', urgent: false },
  { title: 'Follow up \u2014 James Leland LP commitment', meta: 'Due Mar 12 \u00b7 CRM', urgent: false },
];

// ============================================
// CALENDAR
// ============================================

export const MOCK_CALENDAR: CalendarData = {
  month: 'March 2026',
  events: [
    { title: 'IC Vote \u2014 Halcyon Towers', meta: 'Mar 12, 10:00 AM', color: 'var(--violet-3)' },
    { title: 'LP Call \u2014 James Leland', meta: 'Mar 14, 2:00 PM', color: 'var(--blue-3)' },
    { title: 'Fund III Quarterly Review', meta: 'Mar 18, 9:00 AM', color: 'var(--green)' },
  ],
};

// ============================================
// USAGE
// ============================================

export const MOCK_USAGE: UsageData = {
  planLimit: '34.0M credits',
  used: '20.5M credits',
  remaining: '13.5M credits',
  percentUsed: '60.3%',
  overage: '$0.00',
  renews: 'Apr 1, 2026',
};

// ============================================
// SPREADSHEET (File Panel)
// ============================================

export const MOCK_SPREADSHEET: SpreadsheetData = {
  columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  headers: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'],
  rows: [
    { row: 1, cells: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'] },
    { row: 2, cells: ['2025', 'Q1', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$376,250'],
      formulas: [null, null, null, null, '=C2*D2/4', null, '=E2-F2', '=G2'] },
    { row: 3, cells: ['2025', 'Q2', '$86,000,000', '1.75%', '$376,250', '$42,000', '$334,250', '$710,500'],
      formulas: [null, null, null, null, '=C3*D3/4', null, '=E3-F3', '=H2+G3'] },
    { row: 4, cells: ['2025', 'Q3', '$86,000,000', '1.75%', '$376,250', '$18,500', '$357,750', '$1,068,250'],
      formulas: [null, null, null, null, '=C4*D4/4', null, '=E4-F4', '=H3+G4'] },
    { row: 5, cells: ['2025', 'Q4', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$1,444,500'],
      formulas: [null, null, null, null, '=C5*D5/4', null, '=E5-F5', '=H4+G5'] },
    { row: 6, cells: ['', '', '', '', '', '', '', ''], formulas: null },
    { row: 7, cells: ['2026', 'Q1', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$1,713,250'],
      formulas: [null, null, null, null, '=C7*D7/4', null, '=E7-F7', '=H5+G7'] },
    { row: 8, cells: ['2026', 'Q2', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$1,982,000'],
      formulas: [null, null, null, null, '=C8*D8/4', null, '=E8-F8', '=H7+G8'] },
    { row: 9, cells: ['2026', 'Q3', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$2,250,750'],
      formulas: [null, null, null, null, '=C9*D9/4', null, '=E9-F9', '=H8+G9'] },
    { row: 10, cells: ['2026', 'Q4', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$2,519,500'],
      formulas: [null, null, null, null, '=C10*D10/4', null, '=E10-F10', '=H9+G10'] },
    { row: 11, cells: ['', '', '', '', '', '', '', ''], formulas: null },
    { row: 12, cells: ['TOTAL', '', '', '', '$2,580,000', '$60,500', '$2,519,500', ''],
      formulas: [null, null, null, null, '=SUM(E2:E10)', '=SUM(F2:F10)', '=SUM(G2:G10)', null] },
  ],
};
