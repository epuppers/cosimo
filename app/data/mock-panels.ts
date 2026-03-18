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

export const MOCK_SPREADSHEETS: Record<string, SpreadsheetData> = {
  'Hilgard_Fund_II_Fee_Analysis.xlsx': {
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
  },

  'Fund_III_NAV_032026.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
    headers: ['Holding', 'Sector', 'Cost Basis', 'Fair Value', 'NAV %', 'Δ QoQ'],
    rows: [
      { row: 1, cells: ['Holding', 'Sector', 'Cost Basis', 'Fair Value', 'NAV %', 'Δ QoQ'] },
      { row: 2, cells: ['Halcyon Towers', 'Office', '$18,500,000', '$21,200,000', '28.4%', '+4.2%'] },
      { row: 3, cells: ['Meridian Plaza', 'Mixed-Use', '$14,000,000', '$15,800,000', '21.2%', '+1.8%'] },
      { row: 4, cells: ['Lakeshore Logistics', 'Industrial', '$10,200,000', '$12,400,000', '16.6%', '+6.1%'] },
      { row: 5, cells: ['Beacon Hill Resi', 'Multifamily', '$8,600,000', '$9,100,000', '12.2%', '-0.5%'] },
      { row: 6, cells: ['Sunset Medical', 'Healthcare', '$6,800,000', '$7,900,000', '10.6%', '+2.3%'] },
      { row: 7, cells: ['Park Avenue Retail', 'Retail', '$5,200,000', '$4,800,000', '6.4%', '-3.1%'] },
      { row: 8, cells: ['Reserve (Cash)', 'Cash', '$3,400,000', '$3,400,000', '4.6%', '0.0%'] },
      { row: 9, cells: ['', '', '', '', '', ''] },
      { row: 10, cells: ['TOTAL', '', '$66,700,000', '$74,600,000', '100.0%', '+2.4%'],
        formulas: [null, null, '=SUM(C2:C8)', '=SUM(D2:D8)', null, null] },
    ],
  },

  'Q1_Holdings_Report.pdf': {
    columns: ['A', 'B', 'C', 'D', 'E'],
    headers: ['Fund', 'Vintage', 'Committed', 'Called', 'DPI'],
    rows: [
      { row: 1, cells: ['Fund', 'Vintage', 'Committed', 'Called', 'DPI'] },
      { row: 2, cells: ['Medici Fund I', '2019', '$125,000,000', '$118,750,000', '1.42x'] },
      { row: 3, cells: ['Medici Fund II', '2021', '$200,000,000', '$172,000,000', '0.85x'] },
      { row: 4, cells: ['Medici Fund III', '2023', '$310,000,000', '$186,000,000', '0.31x'] },
      { row: 5, cells: ['Medici Fund IV', '2025', '$400,000,000', '$60,000,000', '0.00x'] },
      { row: 6, cells: ['', '', '', '', ''] },
      { row: 7, cells: ['TOTAL', '', '$1,035,000,000', '$536,750,000', '0.62x'],
        formulas: [null, null, '=SUM(C2:C5)', '=SUM(D2:D5)', null] },
    ],
  },

  // Cloud drive files
  'Fee Analysis - Hilgard Fund II.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    headers: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'],
    rows: [
      { row: 1, cells: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'] },
      { row: 2, cells: ['2025', 'Q1', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$376,250'] },
      { row: 3, cells: ['2025', 'Q2', '$86,000,000', '1.75%', '$376,250', '$42,000', '$334,250', '$710,500'] },
      { row: 4, cells: ['2025', 'Q3', '$86,000,000', '1.75%', '$376,250', '$18,500', '$357,750', '$1,068,250'] },
      { row: 5, cells: ['2025', 'Q4', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$1,444,500'] },
      { row: 6, cells: ['', '', '', '', '', '', '', ''] },
      { row: 7, cells: ['TOTAL', '', '', '', '$1,505,000', '$60,500', '$1,444,500', ''] },
    ],
  },

  'March 2026 NAV Report.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
    headers: ['Holding', 'Sector', 'Cost Basis', 'Fair Value', 'NAV %', 'Δ QoQ'],
    rows: [
      { row: 1, cells: ['Holding', 'Sector', 'Cost Basis', 'Fair Value', 'NAV %', 'Δ QoQ'] },
      { row: 2, cells: ['Halcyon Towers', 'Office', '$18,500,000', '$21,200,000', '28.4%', '+4.2%'] },
      { row: 3, cells: ['Meridian Plaza', 'Mixed-Use', '$14,000,000', '$15,800,000', '21.2%', '+1.8%'] },
      { row: 4, cells: ['Lakeshore Logistics', 'Industrial', '$10,200,000', '$12,400,000', '16.6%', '+6.1%'] },
      { row: 5, cells: ['Beacon Hill Resi', 'Multifamily', '$8,600,000', '$9,100,000', '12.2%', '-0.5%'] },
      { row: 6, cells: ['Sunset Medical', 'Healthcare', '$6,800,000', '$7,900,000', '10.6%', '+2.3%'] },
      { row: 7, cells: ['', '', '', '', '', ''] },
      { row: 8, cells: ['TOTAL', '', '$66,700,000', '$74,600,000', '100.0%', '+2.4%'] },
    ],
  },

  'Budget.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E'],
    headers: ['Category', 'Q1 Actual', 'Q1 Budget', 'Variance', 'YTD %'],
    rows: [
      { row: 1, cells: ['Category', 'Q1 Actual', 'Q1 Budget', 'Variance', 'YTD %'] },
      { row: 2, cells: ['Management Fees', '$1,505,000', '$1,500,000', '+$5,000', '100.3%'] },
      { row: 3, cells: ['Personnel', '$820,000', '$850,000', '-$30,000', '96.5%'] },
      { row: 4, cells: ['Office & Admin', '$142,000', '$150,000', '-$8,000', '94.7%'] },
      { row: 5, cells: ['Legal & Compliance', '$275,000', '$200,000', '+$75,000', '137.5%'] },
      { row: 6, cells: ['Technology', '$98,000', '$110,000', '-$12,000', '89.1%'] },
      { row: 7, cells: ['Travel & BD', '$64,000', '$80,000', '-$16,000', '80.0%'] },
      { row: 8, cells: ['', '', '', '', ''] },
      { row: 9, cells: ['TOTAL', '$2,904,000', '$2,890,000', '+$14,000', '100.5%'] },
    ],
  },

  'LP Contact List.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E'],
    headers: ['LP Name', 'Type', 'Commitment', 'Contact', 'Status'],
    rows: [
      { row: 1, cells: ['LP Name', 'Type', 'Commitment', 'Contact', 'Status'] },
      { row: 2, cells: ['CalPERS', 'Public Pension', '$25,000,000', 'J. Martinez', 'Active'] },
      { row: 3, cells: ['Ontario Teachers', 'Public Pension', '$20,000,000', 'S. Chen', 'Active'] },
      { row: 4, cells: ['Leland Family Office', 'Family Office', '$15,000,000', 'J. Leland', 'Active'] },
      { row: 5, cells: ['Swiss Re', 'Insurance', '$12,000,000', 'M. Weber', 'Active'] },
      { row: 6, cells: ['Yale Endowment', 'Endowment', '$10,000,000', 'R. Patel', 'Committed'] },
      { row: 7, cells: ['Harbinger Capital', 'Fund of Funds', '$8,000,000', 'A. Kim', 'In DD'] },
    ],
  },

  'Waterfall Calc Model.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
    headers: ['Tier', 'Threshold', 'GP Split', 'LP Split', 'GP Amount', 'LP Amount'],
    rows: [
      { row: 1, cells: ['Tier', 'Threshold', 'GP Split', 'LP Split', 'GP Amount', 'LP Amount'] },
      { row: 2, cells: ['Return of Capital', '1.0x', '0%', '100%', '$0', '$86,000,000'] },
      { row: 3, cells: ['Preferred Return', '8%', '0%', '100%', '$0', '$6,880,000'] },
      { row: 4, cells: ['GP Catch-Up', '100% to GP', '100%', '0%', '$1,720,000', '$0'] },
      { row: 5, cells: ['Carried Interest', 'Above pref', '20%', '80%', '$3,480,000', '$13,920,000'] },
      { row: 6, cells: ['', '', '', '', '', ''] },
      { row: 7, cells: ['TOTAL', '', '', '', '$5,200,000', '$106,800,000'] },
    ],
  },

  'YTD Dashboard.xlsx': {
    columns: ['A', 'B', 'C', 'D', 'E'],
    headers: ['Metric', 'Current', 'Prior Month', 'Δ', 'YTD'],
    rows: [
      { row: 1, cells: ['Metric', 'Current', 'Prior Month', 'Δ', 'YTD'] },
      { row: 2, cells: ['Total AUM', '$1.24B', '$1.21B', '+2.5%', '+8.7%'] },
      { row: 3, cells: ['Net IRR (Fund III)', '14.2%', '13.8%', '+0.4%', '14.2%'] },
      { row: 4, cells: ['Distributions', '$4.8M', '$2.1M', '+128.6%', '$12.4M'] },
      { row: 5, cells: ['Capital Called', '$18.0M', '$0', 'N/A', '$60.0M'] },
      { row: 6, cells: ['Active Deals', '12', '11', '+1', '—'] },
      { row: 7, cells: ['Pipeline', '$340M', '$290M', '+17.2%', '—'] },
    ],
  },
};

/** @deprecated Use MOCK_SPREADSHEETS instead */
export const MOCK_SPREADSHEET: SpreadsheetData = MOCK_SPREADSHEETS['Hilgard_Fund_II_Fee_Analysis.xlsx'];
