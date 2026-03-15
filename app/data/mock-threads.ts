// ============================================
// MOCK DATA — CHAT THREADS
// ============================================
// All 8 chat threads with full message content.
// Source of truth: index.html from the vanilla prototype
// + CLAUDE.md mock conversation scripts for threads 6-8.

import type { Thread } from '~/services/types';

/**
 * Display order for threads in the sidebar.
 * Workflow-linked threads appear in the "Active Runs" section
 * when their linked run is running/waiting.
 */
export const MOCK_THREAD_ORDER: string[] = [
  'fund3',
  'hilgard',
  'q4lp',
  'k1',
  'erabor',
  'wf-run-rentroll-047',
  'tener-batch-12',
  'wf-create-dd',
];

/**
 * All chat threads keyed by thread ID.
 * Each thread contains full message arrays with content,
 * attachments, artifacts, and gate status.
 */
export const MOCK_THREADS: Record<string, Thread> = {
  // ============================================
  // Thread 1: Fund III — Allocation Drift
  // ============================================
  fund3: {
    id: 'fund3',
    title: 'Fund III — Allocation Drift',
    preview: 'Pull the current allocation for Fund III and compare it against the IPS mandate.',
    timestamp: 'Today, 2:31 PM',
    model: 'Analyst',
    indicators: [],
    hasFiles: false,
    keywords: 'fund allocation drift ips mandate rebalance trim large cap equity',
    messages: [
      {
        id: 'fund3-m1',
        type: 'user',
        content: 'Pull the current allocation for Fund III and compare it against the IPS mandate. Flag anything drifting more than 200bps. Show me a table.',
        timestamp: '2:31 PM',
      },
      {
        id: 'fund3-m2',
        type: 'ai',
        content: '<p><strong>Primary issue:</strong> US Large Cap is up 3.2 points since June, driven by the tech rally. International Developed is the mirror underweight.</p><p><strong>Recommendation:</strong> Paired trade — trim the S&P 500 position and rotate into the EAFE sleeve. I\'ve drafted the rebalancing memo for the IC. Want me to pull it up, or look at tax implications first?</p>',
        model: 'Analyst',
        timestamp: '2:32 PM',
        artifacts: [
          {
            title: 'Fund III — Allocation Drift Analysis',
            type: 'table',
            data: {
              headers: ['Sector', 'Mandate', 'Current', 'Drift', 'Action'],
              rows: [
                ['US Large Cap', '35.0%', '38.2%', '+3.2%', 'Trim $2.4M'],
                ['Intl Developed', '20.0%', '17.1%', '−2.9%', 'Add $2.1M'],
                ['EM Equity', '10.0%', '11.4%', '+1.4%', 'Trim $1.0M'],
                ['Fixed Income', '25.0%', '23.8%', '−1.2%', 'Add $0.9M'],
                ['Alternatives', '10.0%', '9.5%', '−0.5%', 'Hold'],
              ],
            },
          },
        ],
      },
      {
        id: 'fund3-m3',
        type: 'user',
        content: 'Let\'s see the tax impact first. And flag anything that would trigger a wash sale.',
        timestamp: '2:35 PM',
      },
      {
        id: 'fund3-m4',
        type: 'ai',
        content: '<p>Lot-level analysis against the 30-day wash sale window complete. Two positions flagged:</p><p><strong>MSFT — SAFE:</strong> Loss harvested August 8. Repurchase window closes March 7. Safe to include in the rebalance.</p><p><strong>AAPL — CAUTION:</strong> Loss harvested September 14. Window open until October 14. Trim + index reconstitution risks wash sale on ~$340K of harvested losses. Recommend excluding AAPL lots and trimming through other large-cap names.</p><p><strong>Tax Summary:</strong> ST Gains: $18.2K | LT Losses Avail: $42.6K | Net Tax Benefit: ~$24.4K</p>',
        model: 'Expert',
        timestamp: '2:35 PM',
      },
      {
        id: 'fund3-m5',
        type: 'user',
        content: 'Here are the updated holdings and NAV for the rebalance. Can you run the allocation against these and confirm the drift numbers still hold?',
        timestamp: '2:38 PM',
        attachments: [
          { name: 'Q1_Holdings_Report.pdf', type: 'pdf', size: '2.4 MB', pages: 24 },
          { name: 'Fund_III_NAV_032026.xlsx', type: 'xlsx', size: '840 KB', sheets: ['Summary', 'Holdings', 'NAV'] },
        ],
      },
    ],
  },

  // ============================================
  // Thread 2: Hilgard — Fee Analysis
  // ============================================
  hilgard: {
    id: 'hilgard',
    title: 'Hilgard — Fee Analysis',
    preview: 'Build me a management fee analysis for Hilgard Properties — Fund II.',
    timestamp: 'Feb 22, 4:15 PM',
    model: 'Analyst',
    indicators: [{ type: 'ready', label: 'Ready' }],
    hasFiles: true,
    keywords: 'hilgard fee analysis management committed capital offset',
    messages: [
      {
        id: 'hilgard-m1',
        type: 'user',
        content: 'Build me a management fee analysis for Hilgard Properties — Fund II. Use the committed capital basis of $86M at 1.75% annual, with a step-down to 1.25% after Year 4. Include quarterly breakdowns for 2025 and 2026, and flag where the offset provisions from portfolio company fees should apply. Output as xlsx.',
        timestamp: '4:15 PM',
      },
      {
        id: 'hilgard-m2',
        type: 'ai',
        content: '<p>Fee analysis complete. Key findings:</p><p><strong>Pre-step-down (Q1 2025 – Q4 2025):</strong> Quarterly fee of $376,250 on $86M committed at 1.75%. Annual total: $1,505,000.</p><p><strong>Post-step-down (Q1 2026 onward):</strong> Rate drops to 1.25%, reducing quarterly fee to $268,750. Annual total: $1,075,000 — a $430K annual saving for LPs.</p><p><strong>Offset provisions:</strong> Q2 and Q3 2025 have portfolio company monitoring fees of $42,000 and $18,500 respectively that should offset against the management fee per the LPA. Net fees adjusted in the output.</p>',
        model: 'Analyst',
        timestamp: '4:16 PM',
        attachments: [
          { name: 'Hilgard_Fund_II_Fee_Analysis.xlsx', type: 'xlsx', size: '84 KB' },
        ],
      },
      {
        id: 'hilgard-m3',
        type: 'user',
        content: 'Looks good. Can you double-check the offset amounts against the monitoring fee schedule we uploaded last week?',
        timestamp: '4:18 PM',
      },
      {
        id: 'hilgard-m4',
        type: 'ai',
        content: '<p>Cross-referenced against <strong>Hilgard_Monitoring_Fees_2025.pdf</strong> from your Feb 15 upload. Both offset amounts match — $42,000 (Q2, Brightfield advisory) and $18,500 (Q3, Crestline consulting). The xlsx is accurate. No discrepancies found.</p>',
        model: 'Analyst',
        timestamp: '4:19 PM',
      },
    ],
  },

  // ============================================
  // Thread 3: Q4 LP Distribution Waterfall
  // ============================================
  q4lp: {
    id: 'q4lp',
    title: 'Q4 LP Distribution Waterfall',
    preview: 'Run the Q4 distribution waterfall for Fund III.',
    timestamp: 'Yesterday, 11:20 AM',
    model: 'Analyst',
    indicators: [],
    hasFiles: false,
    keywords: 'q4 lp distribution waterfall carry preferred return',
    messages: [
      {
        id: 'q4lp-m1',
        type: 'user',
        content: 'Run the Q4 distribution waterfall for Fund III. Use the standard 8% pref, 50/50 catch-up, and 20% carried interest structure. I need the LP-level breakdown across all three tiers — show me who gets what.',
        timestamp: '11:20 AM',
      },
      {
        id: 'q4lp-m2',
        type: 'ai',
        content: '<p><em>Cosimo is thinking...</em></p>',
        model: 'Assistant',
        timestamp: '11:20 AM',
      },
    ],
  },

  // ============================================
  // Thread 4: K-1 Document Extraction
  // ============================================
  k1: {
    id: 'k1',
    title: 'K-1 Document Extraction',
    preview: 'Pull the 2024 K-1s for the Ridgeline Capital fund.',
    timestamp: 'Feb 20, 9:45 AM',
    model: 'Expert',
    indicators: [{ type: 'error', label: 'Error' }],
    hasFiles: false,
    keywords: 'k1 k-1 tax document extraction partner allocation ridgeline',
    messages: [
      {
        id: 'k1-m1',
        type: 'user',
        content: 'Pull the 2024 K-1s for the Ridgeline Capital fund and extract all partner allocations — ordinary income, capital gains, Section 199A, and any guaranteed payments. Map each against our internal capital account balances and flag any discrepancies above $5,000.',
        timestamp: '9:45 AM',
      },
      {
        id: 'k1-m2',
        type: 'ai',
        content: '<p><strong>Unable to complete request</strong></p><p>Connection to Ridgeline Capital document vault timed out after 30s. The K-1 extraction pipeline could not retrieve the source documents. This may be due to an expired API token or a temporary outage on the custodian\'s end.</p><p><em>Error 504 · Gateway Timeout · Vault Integration · Feb 20, 9:46 AM</em></p>',
        model: 'Expert',
        timestamp: '9:45 AM',
      },
    ],
  },

  // ============================================
  // Thread 5: Erabor Partnership Terms
  // ============================================
  erabor: {
    id: 'erabor',
    title: 'Erabor Partnership Terms',
    preview: 'Pull the Erabor partnership agreement and summarize the key economic terms.',
    timestamp: 'Feb 18, 3:30 PM',
    model: 'Expert',
    indicators: [],
    hasFiles: false,
    keywords: 'erabor partnership terms gp commit clawback side letter marcus',
    messages: [
      {
        id: 'erabor-m1',
        type: 'user',
        content: 'Pull the Erabor partnership agreement and summarize the key economic terms. I need to understand the GP commit, fee structure, clawback provisions, and any side letter concessions before the Thursday call with Marcus. Cross-reference against our standard Fund III terms and flag anything non-standard.',
        timestamp: '3:30 PM',
      },
      {
        id: 'erabor-m2',
        type: 'ai',
        content: '<p>I\'ve pulled the executed Erabor Partners LP Agreement dated December 14, 2024 and cross-referenced all economic terms against our Fund III standard template. The agreement covers a $200M closed-end vehicle with a 7-year investment period and two 1-year extensions at GP discretion, subject to advisory committee consent.</p>' +
          '<p>Overall, the structure is largely in line with institutional norms for a fund of this size and strategy. However, I\'ve identified three provisions that deviate from our standard terms in ways that could create friction or optionality issues down the road. I\'ve detailed each section below with flagged items highlighted.</p>',
        model: 'Expert',
        timestamp: '3:30 PM',
        artifacts: [
          {
            title: 'Erabor Partnership — Economic Terms',
            type: 'metadata',
            data: {
              entries: [
                { label: 'GP Commitment — Amount', value: '$7.0M (3.5% of $200M)' },
                { label: 'GP Commitment — Fund III Standard', value: '2.5% ($5.0M equivalent)' },
                { label: 'GP Commitment — Funding Schedule', value: 'Pro rata with LP capital calls' },
                { label: 'GP Commitment — Source', value: 'Cash only — no management fee waiver notes permitted' },
                { label: 'GP Commitment — Status', value: 'Above standard — favorable to LPs, signals strong GP alignment' },
                { label: 'Fee Structure — Investment Period', value: '2.0% on committed capital' },
                { label: 'Fee Structure — Post-Year 5', value: '1.5% on invested capital (step-down)' },
                { label: 'Fee Structure — Organizational Exp', value: 'Capped at $1.5M, borne by fund' },
                { label: 'Fee Structure — Offset Provisions', value: '100% of transaction, monitoring, and break-up fees offset against management fee' },
                { label: 'Fee Structure — Fee Commencement', value: 'First close date (not final close)' },
                { label: 'Fee Structure — Status', value: 'Standard — matches Fund III template' },
                { label: 'Carry — Rate', value: '20% above 8% preferred return' },
                { label: 'Carry — Preferred Return', value: '8% compounded annually, net of fees and expenses' },
                { label: 'Carry — Catch-up', value: '50/50 GP/LP split until 20% GP share achieved' },
                { label: 'Carry — Waterfall Type', value: 'European (whole-fund) — carry calculated on aggregate, not deal-by-deal' },
                { label: 'Carry — Crystallization', value: 'Upon each distribution event, subject to clawback' },
                { label: 'Carry — Status', value: 'Standard' },
                { label: 'Clawback — Type', value: 'Interim clawback with annual true-up' },
                { label: 'Clawback — GP Obligation', value: '100% of excess carry distributions' },
                { label: 'Clawback — Escrow', value: '30% of carried interest held for 24 months post-final distribution' },
                { label: 'Clawback — GP Guarantee', value: 'Joint and several personal guarantee from named GPs' },
                { label: 'Clawback — Tax Adjustment', value: 'Net of taxes actually paid — GP provides annual tax cert' },
                { label: 'Clawback — Status', value: 'Standard — matches Fund III' },
                { label: 'Side Letters — Northgate Capital', value: 'MFN on fees + co-invest priority on deals >$50M' },
                { label: 'Side Letters — Westbridge RE', value: 'Enhanced quarterly reporting + advisory committee seat' },
                { label: 'Side Letters — Redacted Entity', value: 'Fee waiver on first $10M committed — unusual, requires follow-up with counsel' },
                { label: 'Side Letters — MFN Sunset', value: 'Northgate MFN applies only to LPs committing >$25M at first close' },
                { label: 'Side Letters — Disclosure', value: 'Redacted entity side letter not disclosed to advisory committee — potential compliance issue' },
                { label: 'Key Person — Named Persons', value: 'Marcus Tilden (Managing Partner), David Chen (CIO)' },
                { label: 'Key Person — Trigger', value: 'Single-trigger suspension — if either departs, investment period suspends automatically' },
                { label: 'Key Person — Fund III Standard', value: 'Dual-trigger (both must depart)' },
                { label: 'Key Person — Cure Period', value: '90 days to appoint replacement approved by advisory committee' },
                { label: 'Key Person — Devotion Clause', value: 'Each key person must devote "substantially all" business time — no defined threshold' },
                { label: 'Key Person — LP Vote to Resume', value: '66.7% in interest required to lift suspension' },
                { label: 'Reporting — Auditor', value: 'Ernst & Young LLP' },
                { label: 'Reporting — Frequency', value: 'Quarterly NAV + annual audited financials within 120 days of fiscal year-end' },
                { label: 'Reporting — Advisory Committee', value: '5 members, LP-appointed, conflict approval + valuation oversight' },
                { label: 'Reporting — LP Transfer Rights', value: 'Subject to GP consent (not to be unreasonably withheld), minimum $5M transfer' },
                { label: 'Reporting — LPAC Meeting Freq', value: 'Semi-annual in-person, quarterly written updates' },
              ],
            },
          },
        ],
      },
    ],
  },

  // ============================================
  // Thread 6: Rent Roll Extraction — Q4 Batch
  // (Workflow run thread — completed)
  // ============================================
  'wf-run-rentroll-047': {
    id: 'wf-run-rentroll-047',
    title: 'Rent Roll Extraction — Q4 Batch',
    preview: 'Starting Rent Roll Extraction on 3 files.',
    timestamp: 'Today, 12:15 PM',
    model: 'Workflow',
    workflowRunId: 'wf-run-rentroll-047',
    indicators: [{ type: 'ready', label: 'Ready' }],
    hasFiles: false,
    keywords: 'rent roll extraction q4 batch 245 park marina heights berkshire',
    messages: [
      {
        id: 'wf-rr-m1',
        type: 'user',
        content: '',
        timestamp: '12:15 PM',
        commandChip: '/rent-roll',
        attachments: [
          { name: '245-Park-Ave-RentRoll.pdf', type: 'pdf' },
          { name: 'Marina-Heights-Q4.pdf', type: 'pdf' },
          { name: 'Berkshire-Units-Dec.pdf', type: 'pdf' },
        ],
      },
      {
        id: 'wf-rr-m2',
        type: 'ai',
        content: '<p>Starting Rent Roll Extraction on 3 files. I\'ll extract unit-level data and standardize to your output schema.</p>',
        model: 'Workflow',
        timestamp: '12:15 PM',
        artifacts: [
          {
            title: 'Workflow Run — Rent Roll Extraction',
            type: 'metadata',
            data: {
              entries: [
                { label: 'Template', value: 'Rent Roll Extraction' },
                { label: 'Input', value: '3 PDF files' },
                { label: 'Output', value: 'xlsx → /Finance/CRE/Processed/' },
                { label: 'Status', value: 'Running' },
              ],
            },
          },
        ],
      },
      {
        id: 'wf-rr-m3',
        type: 'ai',
        content: '<p>Extracted 142 units across 3 properties. All fields mapped successfully. Two units at Marina Heights had ambiguous floor data — I inferred Floor 2 from unit numbers 201–208. Confidence: 94%.</p>',
        model: 'Workflow',
        timestamp: '12:16 PM',
      },
      {
        id: 'wf-rr-m4',
        type: 'ai',
        content: '<p>Output ready: <strong>Q4-2025-RentRoll-Standardized.xlsx</strong> saved to /Finance/CRE/Processed/Rent Rolls/. Here\'s a preview:</p>',
        model: 'Workflow',
        timestamp: '12:16 PM',
        artifacts: [
          {
            title: 'Q4-2025-RentRoll-Standardized.xlsx',
            type: 'table',
            data: {
              headers: ['Unit', 'Floor', 'Tenant', 'Lease Start', 'Lease End', 'Monthly Rent', 'Sq Ft', 'Status'],
              rows: [
                ['101', '1', 'Meridian Capital LLC', 'Jan 2024', 'Dec 2028', '$14,200', '2,400', 'Occupied'],
                ['205', '2', 'Apex Realty Group', 'Mar 2023', 'Feb 2026', '$11,800', '1,850', 'Occupied'],
                ['312', '3', '—', '—', '—', '—', '1,200', 'Vacant'],
                ['418', '4', 'Crossharbor Partners', 'Jun 2025', 'May 2030', '$18,500', '3,100', 'Occupied'],
                ['507', '5', 'BGC Partners Inc.', 'Sep 2024', 'Aug 2027', '$9,750', '1,600', 'Notice'],
              ],
            },
          },
        ],
      },
      {
        id: 'wf-rr-m5',
        type: 'user',
        content: 'Looks good, thanks',
        timestamp: '12:18 PM',
      },
    ],
  },

  // ============================================
  // Thread 7: Tener — Valuation Filing Batch 12
  // (Workflow run thread — waiting at gate)
  // ============================================
  'tener-batch-12': {
    id: 'tener-batch-12',
    title: 'Tener — Valuation Filing Batch 12',
    preview: 'Starting Valuation Filing workflow on Batch 12 — 47 property files.',
    timestamp: 'Today, 10:42 AM',
    model: 'Workflow',
    workflowRunId: 'wf-run-tener-12',
    indicators: [{ type: 'waiting', label: 'Waiting' }],
    hasFiles: false,
    keywords: 'tener valuation filing batch 12 parcel assessment',
    messages: [
      {
        id: 'tener-m1',
        type: 'user',
        content: '',
        timestamp: '9:42 AM',
        commandChip: '/valuation',
        attachments: [
          { name: 'Batch-12-Parcels/', type: 'folder', fileCount: 47 },
        ],
      },
      {
        id: 'tener-m2',
        type: 'ai',
        content: '<p>Starting Valuation Filing workflow on Batch 12 — 47 property files. I\'ll extract parcel IDs, assessed values, and filing deadlines.</p>',
        model: 'Workflow',
        timestamp: '9:42 AM',
        artifacts: [
          {
            title: 'Workflow Run — Valuation Filing',
            type: 'metadata',
            data: {
              entries: [
                { label: 'Template', value: 'Tener Valuation Filing' },
                { label: 'Run', value: '#012' },
                { label: 'Input', value: '47 files (Batch-12-Parcels/)' },
                { label: 'Output', value: 'Filing package → /Tener/Filings/' },
                { label: 'Status', value: 'Running' },
              ],
            },
          },
        ],
      },
      {
        id: 'tener-m3',
        type: 'ai',
        content: '<p>Processed 44 of 47 files successfully. 3 files need your attention:</p>',
        model: 'Workflow',
        timestamp: '9:48 AM',
        isGate: true,
        gateStatus: 'resolved',
        artifacts: [
          {
            title: 'Exceptions — Batch 12',
            type: 'table',
            data: {
              headers: ['File', 'Issue', 'Suggestion', 'Confidence'],
              rows: [
                ['Parcel-2847-Assessment.pdf', 'Conflicting assessed values (p.3: $4.2M, p.7: $4.8M)', 'Use page 7 (amended)', '—'],
                ['Parcel-3102-Notice.pdf', 'Poor OCR quality — 3 fields uncertain', 'Manual review needed', '67%'],
                ['Parcel-4411-Filing.tiff', 'Unexpected format (TIFF scan, not PDF)', 'Convert and retry', '—'],
              ],
            },
          },
        ],
      },
      {
        id: 'tener-m4',
        type: 'ai',
        content: '<p>Specifically: <strong>Parcel-2847-Assessment.pdf</strong> has two conflicting assessed values on pages 3 and 7 ($4.2M vs $4.8M). Which should I use, or should I flag both in the output?</p>',
        model: 'Workflow',
        timestamp: '9:48 AM',
        isGate: true,
        gateStatus: 'awaiting',
      },
      {
        id: 'tener-m5',
        type: 'user',
        content: 'Use the page 7 value, that\'s the amended assessment',
        timestamp: '9:55 AM',
      },
      {
        id: 'tener-m6',
        type: 'ai',
        content: '<p>Got it — using $4.8M for Parcel 2847. Resuming processing on remaining exceptions...</p>',
        model: 'Workflow',
        timestamp: '9:55 AM',
      },
      {
        id: 'tener-m7',
        type: 'ai',
        content: '<p>All 47 files processed. Output saved to <strong>/Tener/Filings/Batch-12/</strong>. 3 parcels were flagged for manual values — I\'ve noted your corrections in the audit trail.</p>',
        model: 'Workflow',
        timestamp: '9:58 AM',
      },
    ],
  },

  // ============================================
  // Thread 8: New Workflow: Due Diligence
  // (Workflow creation conversation)
  // ============================================
  'wf-create-dd': {
    id: 'wf-create-dd',
    title: 'New Workflow: Due Diligence',
    preview: 'I want to create a workflow for due diligence on new investments.',
    timestamp: 'Yesterday, 3:15 PM',
    model: 'Cosimo',
    workflowRunId: null,
    indicators: [],
    hasFiles: false,
    keywords: 'due diligence workflow create new investment real estate',
    messages: [
      {
        id: 'wf-dd-m1',
        type: 'user',
        content: 'I want to create a workflow for due diligence on new investments',
        timestamp: '3:42 PM',
      },
      {
        id: 'wf-dd-m2',
        type: 'ai',
        content: '<p>Great — let\'s set up a DD workflow. A few questions to get the shape right. What kind of documents will typically be involved? And is this for a specific asset class or general?</p>',
        model: 'Cosimo',
        timestamp: '3:42 PM',
      },
      {
        id: 'wf-dd-m3',
        type: 'user',
        content: 'Real estate acquisitions. We usually get a data room with financials, rent rolls, environmental reports, title docs, and zoning info. I want Cosimo to pull key metrics from each doc type and flag any red flags.',
        timestamp: '3:44 PM',
      },
      {
        id: 'wf-dd-m4',
        type: 'ai',
        content: '<p>Here\'s what I\'m thinking for the flow:</p>',
        model: 'Cosimo',
        timestamp: '3:45 PM',
        artifacts: [
          {
            title: 'Proposed Workflow — Due Diligence',
            type: 'flow-graph',
            data: {
              templateId: 'due-diligence',
              compact: false,
            },
          },
        ],
      },
      {
        id: 'wf-dd-m5',
        type: 'user',
        content: 'Add a step that cross-references the rent roll numbers against the financials to check for consistency',
        timestamp: '3:47 PM',
      },
      {
        id: 'wf-dd-m6',
        type: 'ai',
        content: '<p>Added a cross-reference validation step after the extraction branches merge. Here\'s the updated flow:</p>',
        model: 'Cosimo',
        timestamp: '3:48 PM',
        artifacts: [
          {
            title: 'Updated Workflow — Due Diligence',
            type: 'flow-graph',
            data: {
              templateId: 'due-diligence',
              compact: false,
            },
          },
        ],
      },
      {
        id: 'wf-dd-m7',
        type: 'ai',
        content: '<p>What should trigger this? I\'d suggest a chat command — you\'d type <code>/due-diligence [company name]</code> to kick it off and point it at the target\'s data room.</p>',
        model: 'Cosimo',
        timestamp: '3:48 PM',
      },
      {
        id: 'wf-dd-m8',
        type: 'user',
        content: 'Perfect. Let\'s call it /dd for short',
        timestamp: '3:49 PM',
      },
      {
        id: 'wf-dd-m9',
        type: 'ai',
        content: '<p>Done. Your DD workflow is set up with the command <span class="wf-command-chip">/dd</span>. You can run it now or find it in the Workflows library.</p>',
        model: 'Cosimo',
        timestamp: '3:49 PM',
        commandChip: '/dd',
      },
    ],
  },
};
