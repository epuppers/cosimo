// ============================================
// MOCK DATA — THREADS
// ============================================
// ============================================
// MOCK DATA — WORKFLOW TEMPLATES
// ============================================
const MOCK_WORKFLOW_TEMPLATES = {
  'rent-roll': {
    id: 'rent-roll',
    title: 'Rent Roll Extraction',
    description: 'Extracts and standardizes rent roll data from uploaded PDFs into clean xlsx format with unit-level detail, floor mapping, and lease terms.',
    status: 'active',
    version: 3,
    createdBy: 'E. Puckett',
    createdDate: 'Jan 14, 2026',
    triggerType: 'folder-watch',
    triggerConfig: {
      watchPath: '/Finance/CRE/Incoming/Rent Rolls/',
      chatCommand: '/rent-roll'
    },
    linkedLessons: ['rent-roll-format'],
    linkedEntities: ['prop-berkshire', 'prop-marina', 'prop-hilgard-apt'],
    inputSchema: {
      description: 'PDF rent roll documents from property managers. Each file should contain unit-level lease data for a single property.',
      fields: [
        { name: 'Unit ID', type: 'string', required: true, description: 'Unique identifier for the rental unit' },
        { name: 'Tenant Name', type: 'string', required: true, description: 'Current tenant or lessee name' },
        { name: 'Lease Start', type: 'date', required: true, description: 'Lease commencement date' },
        { name: 'Lease End', type: 'date', required: true, description: 'Lease expiration date' },
        { name: 'Monthly Rent', type: 'currency', required: true, description: 'Current monthly rent amount' },
        { name: 'Sq Ft', type: 'number', required: false, description: 'Unit square footage' },
        { name: 'Floor', type: 'number', required: false, description: 'Floor number within building' },
        { name: 'Status', type: 'enum', required: true, description: 'Current occupancy status', options: ['Occupied', 'Vacant', 'Notice'] }
      ]
    },
    outputSchema: {
      format: 'xlsx',
      destination: '/Finance/CRE/Processed/Rent Rolls/',
      columns: ['Unit ID', 'Tenant Name', 'Lease Start', 'Lease End', 'Monthly Rent', 'Sq Ft', 'Floor', 'Status']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Ingest Files', description: 'Receive PDF rent roll documents', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'Extract & Parse', description: 'OCR and extract tabular data from PDFs', lesson: 'rent-roll-format', x: 0, y: 1 },
      { id: 'n3', type: 'branch', title: 'Confidence Check', description: 'Evaluate extraction confidence scores', lesson: null, x: 0, y: 2, conditions: [{ label: 'High Confidence', target: 'n5' }, { label: 'Low Confidence', target: 'n4' }] },
      { id: 'n4', type: 'gate', title: 'Manual Review', description: 'Human reviews low-confidence extractions', lesson: null, x: -1, y: 3 },
      { id: 'n5', type: 'action', title: 'Standardize & Enrich', description: 'Map fields to output schema, enrich with metadata', lesson: 'rent-roll-format', x: 0, y: 4 },
      { id: 'n6', type: 'action', title: 'Quality Check', description: 'Validate data completeness and consistency', lesson: null, x: 0, y: 5 },
      { id: 'n7', type: 'output', title: 'Export to xlsx', description: 'Save standardized rent roll to output folder', lesson: null, x: 0, y: 6 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: 'Low Confidence' },
      { from: 'n3', to: 'n5', label: 'High Confidence' },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6' },
      { from: 'n6', to: 'n7' }
    ],
    runs: {
      total: 47,
      successRate: 95.7,
      avgDuration: '12.4s',
      filesProcessed: 183
    },
    recentRuns: [
      { id: '#047', status: 'success', trigger: 'Manual \u2014 3 files', time: 'Today, 12:15 PM', duration: '11.2s', threadId: 'wf-run-rentroll-047' },
      { id: '#046', status: 'success', trigger: 'Folder watch \u2014 1 file', time: 'Yesterday, 6:00 AM', duration: '8.7s', threadId: null },
      { id: '#045', status: 'failed', trigger: 'Manual \u2014 5 files', time: 'Mar 10, 3:22 PM', duration: '4.1s', threadId: null },
      { id: '#044', status: 'success', trigger: 'Folder watch \u2014 2 files', time: 'Mar 9, 6:00 AM', duration: '14.3s', threadId: null },
      { id: '#043', status: 'success', trigger: 'Chat command', time: 'Mar 8, 11:45 AM', duration: '9.8s', threadId: null }
    ]
  },

  'k1-extract': {
    id: 'k1-extract',
    title: 'K-1 Document Processing',
    description: 'Parses K-1 tax documents, extracts allocations, and maps to fund accounting structure. Flags discrepancies against capital accounts.',
    status: 'active',
    version: 2,
    createdBy: 'E. Puckett',
    createdDate: 'Feb 3, 2026',
    triggerType: 'manual',
    triggerConfig: {
      chatCommand: '/k1'
    },
    linkedLessons: ['k1-extraction'],
    linkedEntities: ['fund-iii', 'k1-docs'],
    inputSchema: {
      description: 'K-1 tax documents (PDF). Supports multi-page and multi-partner documents.',
      fields: [
        { name: 'Partner Name', type: 'string', required: true, description: 'Limited partner name as shown on K-1' },
        { name: 'TIN', type: 'string', required: true, description: 'Taxpayer identification number (last 4 digits)' },
        { name: 'Ordinary Income', type: 'currency', required: true, description: 'Box 1 — Ordinary business income' },
        { name: 'Rental Income', type: 'currency', required: false, description: 'Box 2 — Net rental real estate income' },
        { name: 'Guaranteed Payments', type: 'currency', required: false, description: 'Box 4c — Guaranteed payments' },
        { name: 'Capital Account', type: 'currency', required: true, description: 'Ending capital account balance' }
      ]
    },
    outputSchema: {
      format: 'xlsx',
      destination: '/Tax/K-1/Processed/',
      columns: ['Partner Name', 'TIN (last 4)', 'Box 1', 'Box 2', 'Box 4c', 'Capital Account', 'State']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Receive K-1 Documents', description: 'Upload or ingest K-1 PDF files', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'Parse K-1 Forms', description: 'OCR and identify K-1 form structure', lesson: 'k1-extraction', x: 0, y: 1 },
      { id: 'n3', type: 'action', title: 'Extract Allocations', description: 'Pull partner allocations from each K-1', lesson: 'k1-extraction', x: 0, y: 2 },
      { id: 'n4', type: 'branch', title: 'Multi-State Check', description: 'Check if partner has multi-state filing requirements', lesson: null, x: 0, y: 3, conditions: [{ label: 'Multi-State', target: 'n5' }, { label: 'Single State', target: 'n6' }] },
      { id: 'n5', type: 'action', title: 'State Apportionment', description: 'Calculate state-level income apportionment', lesson: null, x: 1, y: 4 },
      { id: 'n6', type: 'action', title: 'Map to Fund Structure', description: 'Map extracted data to fund accounting structure', lesson: null, x: 0, y: 5 },
      { id: 'n7', type: 'gate', title: 'Discrepancy Review', description: 'Human reviews flagged discrepancies against capital accounts', lesson: null, x: 0, y: 6 },
      { id: 'n8', type: 'output', title: 'Export Results', description: 'Save processed K-1 data to output folder', lesson: null, x: 0, y: 7 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'Multi-State' },
      { from: 'n4', to: 'n6', label: 'Single State' },
      { from: 'n5', to: 'n6' },
      { from: 'n6', to: 'n7' },
      { from: 'n7', to: 'n8' }
    ],
    runs: {
      total: 23,
      successRate: 91.3,
      avgDuration: '18.6s',
      filesProcessed: 96
    },
    recentRuns: [
      { id: '#023', status: 'success', trigger: 'Chat command', time: 'Today, 9:30 AM', duration: '16.4s', threadId: null },
      { id: '#022', status: 'success', trigger: 'Manual \u2014 8 files', time: 'Mar 11, 2:15 PM', duration: '22.1s', threadId: null },
      { id: '#021', status: 'failed', trigger: 'Manual \u2014 2 files', time: 'Mar 8, 10:00 AM', duration: '5.3s', threadId: null }
    ]
  },

  'lp-waterfall': {
    id: 'lp-waterfall',
    title: 'LP Distribution Waterfall',
    description: 'Calculates LP/GP distribution splits across preferred return, catch-up, and carried interest tiers. Generates allocation schedules.',
    status: 'draft',
    version: 1,
    createdBy: 'E. Puckett',
    createdDate: 'Feb 20, 2026',
    triggerType: 'manual',
    triggerConfig: {},
    linkedLessons: ['waterfall-calc'],
    linkedEntities: ['fund-iii', 'fee-structure'],
    inputSchema: {
      description: 'Fund distribution data including committed capital, contributions, and distributable proceeds.',
      fields: [
        { name: 'Fund Name', type: 'string', required: true, description: 'Fund entity name' },
        { name: 'Vintage Year', type: 'string', required: true, description: 'Fund vintage year' },
        { name: 'Total Committed', type: 'currency', required: true, description: 'Total committed capital' },
        { name: 'Total Contributed', type: 'currency', required: true, description: 'Total capital contributed to date' },
        { name: 'Distributable Amount', type: 'currency', required: true, description: 'Amount available for distribution' },
        { name: 'Preferred Return Rate', type: 'number', required: true, description: 'Preferred return hurdle rate (%)' }
      ]
    },
    outputSchema: {
      format: 'xlsx',
      destination: '/Finance/Distributions/',
      columns: ['LP Name', 'Committed', 'Contributed', 'Return of Capital', 'Preferred Return', 'Catch-Up', 'Carry Split', 'Total Distribution']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Load Distribution Data', description: 'Ingest fund and LP commitment data', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'Load LPA Terms', description: 'Pull waterfall terms from partnership agreement', lesson: 'waterfall-calc', x: 0, y: 1 },
      { id: 'n3', type: 'action', title: 'Calculate Preferred Return', description: 'Compute 8% preferred return per LP', lesson: 'waterfall-calc', x: 0, y: 2 },
      { id: 'n4', type: 'action', title: 'Calculate Catch-Up', description: 'Compute GP catch-up tranche', lesson: null, x: 0, y: 3 },
      { id: 'n5', type: 'action', title: 'Calculate Carry Split', description: 'Compute carried interest 80/20 split', lesson: null, x: 0, y: 4 },
      { id: 'n6', type: 'gate', title: 'GP Review', description: 'GP reviews and approves distribution schedule', lesson: null, x: 0, y: 5 },
      { id: 'n7', type: 'action', title: 'Generate Schedule', description: 'Build final LP-by-LP allocation schedule', lesson: null, x: 0, y: 6 },
      { id: 'n8', type: 'output', title: 'Export Schedule', description: 'Save distribution schedule to output folder', lesson: null, x: 0, y: 7 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6' },
      { from: 'n6', to: 'n7' },
      { from: 'n7', to: 'n8' }
    ],
    runs: {
      total: 0,
      successRate: 0,
      avgDuration: '\u2014',
      filesProcessed: 0
    },
    recentRuns: []
  },

  'fee-calc': {
    id: 'fee-calc',
    title: 'Management Fee Calculator',
    description: 'Computes management fees across fund vehicles using committed/invested capital basis, step-downs, and offset provisions.',
    status: 'active',
    version: 4,
    createdBy: 'E. Puckett',
    createdDate: 'Dec 5, 2025',
    triggerType: 'schedule',
    triggerConfig: {
      schedule: 'Monthly, 1st at 9 AM',
      chatCommand: '/fees'
    },
    linkedLessons: ['fee-calc-rules'],
    linkedEntities: ['fund-iii', 'hilgard', 'erabor', 'fee-structure'],
    inputSchema: {
      description: 'Fund commitment and investment period data. Pulls from fund accounting system.',
      fields: [
        { name: 'Fund Name', type: 'string', required: true, description: 'Fund entity name' },
        { name: 'Committed Capital', type: 'currency', required: true, description: 'Total LP committed capital' },
        { name: 'Invested Capital', type: 'currency', required: true, description: 'Capital deployed to date' },
        { name: 'Fee Rate', type: 'number', required: true, description: 'Annual management fee rate (%)' },
        { name: 'Period', type: 'enum', required: true, description: 'Current fee period', options: ['Investment', 'Post-Investment'] },
        { name: 'Offset Amount', type: 'currency', required: false, description: 'Fee offset from portfolio company fees' }
      ]
    },
    outputSchema: {
      format: 'xlsx',
      destination: '/Finance/Fees/',
      columns: ['Fund', 'Quarter', 'Basis', 'Rate', 'Gross Fee', 'Offset', 'Net Fee']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Load Fund Data', description: 'Pull commitment and investment data', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'Load Commitments', description: 'Calculate fee basis per fund', lesson: 'fee-calc-rules', x: 0, y: 1 },
      { id: 'n3', type: 'action', title: 'Apply Fee Rates', description: 'Apply rate schedule with step-downs', lesson: 'fee-calc-rules', x: 0, y: 2 },
      { id: 'n4', type: 'action', title: 'Calculate Offsets', description: 'Apply portfolio company fee offsets', lesson: null, x: 0, y: 3 },
      { id: 'n5', type: 'output', title: 'Export Fee Schedule', description: 'Save fee calculations to output folder', lesson: null, x: 0, y: 4 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' }
    ],
    runs: {
      total: 31,
      successRate: 100,
      avgDuration: '6.2s',
      filesProcessed: 31
    },
    recentRuns: [
      { id: '#031', status: 'success', trigger: 'Schedule \u2014 monthly', time: 'Mar 1, 9:00 AM', duration: '5.8s', threadId: null },
      { id: '#030', status: 'success', trigger: 'Schedule \u2014 monthly', time: 'Feb 1, 9:00 AM', duration: '6.1s', threadId: null },
      { id: '#029', status: 'success', trigger: 'Chat command', time: 'Jan 28, 3:15 PM', duration: '6.5s', threadId: null }
    ]
  },

  'covenant': {
    id: 'covenant',
    title: 'Loan Covenant Monitor',
    description: 'Monitors DSCR, LTV, and debt yield covenants across the loan book. Alerts when metrics approach or breach thresholds.',
    status: 'paused',
    version: 2,
    createdBy: 'E. Puckett',
    createdDate: 'Jan 20, 2026',
    triggerType: 'schedule',
    triggerConfig: {
      schedule: 'Daily at 7 AM'
    },
    linkedLessons: [],
    linkedEntities: ['credit-ii'],
    inputSchema: {
      description: 'Loan portfolio data including outstanding balances, NOI, and property valuations.',
      fields: [
        { name: 'Loan ID', type: 'string', required: true, description: 'Unique loan identifier' },
        { name: 'Outstanding Balance', type: 'currency', required: true, description: 'Current loan balance' },
        { name: 'Property Value', type: 'currency', required: true, description: 'Current appraised value' },
        { name: 'NOI', type: 'currency', required: true, description: 'Net operating income (trailing 12 months)' },
        { name: 'Debt Service', type: 'currency', required: true, description: 'Annual debt service payments' },
        { name: 'Covenant DSCR', type: 'number', required: true, description: 'Minimum DSCR covenant threshold' },
        { name: 'Covenant LTV', type: 'number', required: true, description: 'Maximum LTV covenant threshold (%)' }
      ]
    },
    outputSchema: {
      format: 'pdf',
      destination: '/Finance/Covenants/Reports/',
      columns: ['Loan ID', 'DSCR', 'LTV', 'Debt Yield', 'Status', 'Action Required']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Pull Loan Data', description: 'Ingest loan portfolio from banking system', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'Pull Loan Data', description: 'Retrieve current balances and terms', lesson: null, x: 0, y: 1 },
      { id: 'n3', type: 'action', title: 'Calculate Ratios', description: 'Compute DSCR, LTV, and debt yield', lesson: null, x: 0, y: 2 },
      { id: 'n4', type: 'branch', title: 'Threshold Check', description: 'Evaluate metrics against covenant thresholds', lesson: null, x: 0, y: 3, conditions: [{ label: 'Breach', target: 'n5' }, { label: 'Warning', target: 'n6' }, { label: 'Clear', target: 'n7' }] },
      { id: 'n5', type: 'gate', title: 'Breach Alert', description: 'Immediate review — covenant breached', lesson: null, x: -1, y: 4 },
      { id: 'n6', type: 'gate', title: 'Warning Alert', description: 'Metrics approaching covenant limits', lesson: null, x: 0, y: 4 },
      { id: 'n7', type: 'action', title: 'Log Only', description: 'All covenants clear — log and continue', lesson: null, x: 1, y: 4 },
      { id: 'n8', type: 'output', title: 'Output Report', description: 'Generate covenant monitoring report', lesson: null, x: 0, y: 5 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'Breach' },
      { from: 'n4', to: 'n6', label: 'Warning' },
      { from: 'n4', to: 'n7', label: 'Clear' },
      { from: 'n5', to: 'n8' },
      { from: 'n6', to: 'n8' },
      { from: 'n7', to: 'n8' }
    ],
    runs: {
      total: 18,
      successRate: 88.9,
      avgDuration: '9.1s',
      filesProcessed: 18
    },
    recentRuns: [
      { id: '#018', status: 'success', trigger: 'Schedule \u2014 daily', time: 'Feb 15, 7:00 AM', duration: '8.4s', threadId: null },
      { id: '#017', status: 'success', trigger: 'Schedule \u2014 daily', time: 'Feb 14, 7:00 AM', duration: '9.2s', threadId: null },
      { id: '#016', status: 'failed', trigger: 'Schedule \u2014 daily', time: 'Feb 13, 7:00 AM', duration: '3.1s', threadId: null }
    ]
  },

  'tener-valuation': {
    id: 'tener-valuation',
    title: 'Tener Valuation Filing',
    description: 'Extracts parcel data from property assessment documents, validates against tax records, and generates filing packages.',
    status: 'active',
    version: 2,
    createdBy: 'E. Puckett',
    createdDate: 'Jan 28, 2026',
    triggerType: 'chat-command',
    triggerConfig: {
      chatCommand: '/valuation'
    },
    linkedLessons: [],
    linkedEntities: ['valuation-reports'],
    inputSchema: {
      description: 'Property assessment documents (PDF or image scans). Each file should contain parcel identification and valuation data.',
      fields: [
        { name: 'Parcel ID', type: 'string', required: true, description: 'County parcel identification number' },
        { name: 'Assessed Value', type: 'currency', required: true, description: 'Current assessed property value' },
        { name: 'Tax Year', type: 'string', required: true, description: 'Tax assessment year' },
        { name: 'Filing Deadline', type: 'date', required: true, description: 'Assessment appeal filing deadline' },
        { name: 'Property Address', type: 'string', required: true, description: 'Physical property address' },
        { name: 'Owner', type: 'string', required: false, description: 'Property owner or entity name' },
        { name: 'Tax Class', type: 'enum', required: false, description: 'Property tax classification', options: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Vacant Land'] }
      ]
    },
    outputSchema: {
      format: 'pdf',
      destination: '/Tener/Filings/',
      columns: ['Parcel ID', 'Address', 'Assessed Value', 'Tax Year', 'Filing Deadline', 'Tax Class', 'Status']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Receive Documents', description: 'Ingest assessment documents for processing', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'action', title: 'OCR & Extract', description: 'Optical character recognition and data extraction', lesson: null, x: 0, y: 1 },
      { id: 'n3', type: 'action', title: 'Identify Parcel Data', description: 'Locate and parse parcel identification fields', lesson: null, x: 0, y: 2 },
      { id: 'n4', type: 'branch', title: 'Data Quality Check', description: 'Evaluate extraction quality and completeness', lesson: null, x: 0, y: 3, conditions: [{ label: 'Clean', target: 'n5' }, { label: 'Issues Found', target: 'n6' }] },
      { id: 'n5', type: 'action', title: 'Map to Schema', description: 'Map clean data directly to output schema', lesson: null, x: -1, y: 4 },
      { id: 'n6', type: 'gate', title: 'Gate for Review', description: 'Human reviews data quality issues', lesson: null, x: 1, y: 4 },
      { id: 'n7', type: 'action', title: 'Validate Against Tax Records', description: 'Cross-reference with county tax database', lesson: null, x: 0, y: 5 },
      { id: 'n8', type: 'action', title: 'Generate Filing Package', description: 'Compile assessment appeal filing documents', lesson: null, x: 0, y: 6 },
      { id: 'n9', type: 'output', title: 'Export Filing', description: 'Save filing package to output destination', lesson: null, x: 0, y: 7 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'Clean' },
      { from: 'n4', to: 'n6', label: 'Issues Found' },
      { from: 'n5', to: 'n7' },
      { from: 'n6', to: 'n7' },
      { from: 'n7', to: 'n8' },
      { from: 'n8', to: 'n9' }
    ],
    runs: {
      total: 34,
      successRate: 94.1,
      avgDuration: '24.7s',
      filesProcessed: 412
    },
    recentRuns: [
      { id: '#034', status: 'success', trigger: 'Chat command \u2014 12 files', time: 'Today, 10:45 AM', duration: '28.3s', threadId: null },
      { id: '#033', status: 'success', trigger: 'Chat command \u2014 47 files', time: 'Yesterday, 2:00 PM', duration: '42.1s', threadId: 'tener-batch-12' },
      { id: '#032', status: 'success', trigger: 'Chat command \u2014 8 files', time: 'Mar 10, 9:15 AM', duration: '18.6s', threadId: null }
    ]
  },

  'due-diligence': {
    id: 'due-diligence',
    title: 'Due Diligence Review',
    description: 'Analyzes data room documents for real estate acquisitions. Extracts key metrics by document type and flags red flags across financials, rent rolls, environmental, title, and zoning.',
    status: 'draft',
    version: 1,
    createdBy: 'E. Puckett',
    createdDate: 'Mar 5, 2026',
    triggerType: 'chat-command',
    triggerConfig: {
      chatCommand: '/dd [company]'
    },
    linkedLessons: [],
    linkedEntities: ['due-diligence'],
    inputSchema: {
      description: 'Data room contents for a target acquisition. Documents should be organized by type: financials, rent rolls, environmental, title, and zoning.',
      fields: [
        { name: 'Target Name', type: 'string', required: true, description: 'Name of acquisition target' },
        { name: 'Property Type', type: 'enum', required: true, description: 'Asset class of the target', options: ['Multifamily', 'Office', 'Industrial', 'Retail', 'Mixed-Use'] },
        { name: 'Acquisition Price', type: 'currency', required: false, description: 'Proposed acquisition price' },
        { name: 'Data Room Path', type: 'string', required: true, description: 'Path to data room folder' }
      ]
    },
    outputSchema: {
      format: 'pdf',
      destination: '/Acquisitions/DD Reports/',
      columns: ['Category', 'Document', 'Key Findings', 'Red Flags', 'Confidence']
    },
    nodes: [
      { id: 'n1', type: 'input', title: 'Ingest Data Room', description: 'Load all documents from target data room', lesson: null, x: 0, y: 0 },
      { id: 'n2', type: 'branch', title: 'Sort by Doc Type', description: 'Classify and route documents by category', lesson: null, x: 0, y: 1, conditions: [{ label: 'Financials', target: 'n3' }, { label: 'Rent Rolls', target: 'n4' }, { label: 'Environmental', target: 'n5' }, { label: 'Title', target: 'n6' }, { label: 'Zoning', target: 'n7' }] },
      { id: 'n3', type: 'action', title: 'Analyze Financials', description: 'Extract revenue, expenses, NOI, cap rate', lesson: null, x: -2, y: 2 },
      { id: 'n4', type: 'action', title: 'Process Rent Rolls', description: 'Extract unit mix, occupancy, lease terms', lesson: 'rent-roll-format', x: -1, y: 2 },
      { id: 'n5', type: 'action', title: 'Review Environmental', description: 'Identify Phase I/II findings and risks', lesson: null, x: 0, y: 2 },
      { id: 'n6', type: 'action', title: 'Examine Title Docs', description: 'Review title commitments and exceptions', lesson: null, x: 1, y: 2 },
      { id: 'n7', type: 'action', title: 'Check Zoning', description: 'Verify zoning compliance and entitlements', lesson: null, x: 2, y: 2 },
      { id: 'n8', type: 'action', title: 'Cross-Reference Validation', description: 'Cross-reference rent roll numbers against financials', lesson: null, x: 0, y: 3 },
      { id: 'n9', type: 'gate', title: 'Red Flag Review', description: 'Human reviews all flagged issues before final report', lesson: null, x: 0, y: 4 },
      { id: 'n10', type: 'action', title: 'Generate DD Summary', description: 'Compile executive summary with findings', lesson: null, x: 0, y: 5 },
      { id: 'n11', type: 'output', title: 'Export DD Report', description: 'Save due diligence report to output folder', lesson: null, x: 0, y: 6 }
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3', label: 'Financials' },
      { from: 'n2', to: 'n4', label: 'Rent Rolls' },
      { from: 'n2', to: 'n5', label: 'Environmental' },
      { from: 'n2', to: 'n6', label: 'Title' },
      { from: 'n2', to: 'n7', label: 'Zoning' },
      { from: 'n3', to: 'n8' },
      { from: 'n4', to: 'n8' },
      { from: 'n5', to: 'n8' },
      { from: 'n6', to: 'n8' },
      { from: 'n7', to: 'n8' },
      { from: 'n8', to: 'n9' },
      { from: 'n9', to: 'n10' },
      { from: 'n10', to: 'n11' }
    ],
    runs: {
      total: 0,
      successRate: 0,
      avgDuration: '\u2014',
      filesProcessed: 0
    },
    recentRuns: []
  }
};

// ============================================
// MOCK DATA — WORKFLOW RUNS
// ============================================
const MOCK_WORKFLOW_RUNS = {
  'wf-run-rentroll-047': {
    templateId: 'rent-roll',
    runId: '#047',
    status: 'completed',
    triggerType: 'manual',
    triggeredBy: 'E. Puckett',
    startTime: 'Today, 12:15 PM',
    threadId: 'wf-run-rentroll-047',
    inputManifest: [
      { name: '245-Park-Ave-RentRoll.pdf', type: 'pdf', size: '2.1 MB' },
      { name: 'Marina-Heights-Q4.pdf', type: 'pdf', size: '1.8 MB' },
      { name: 'Berkshire-Units-Dec.pdf', type: 'pdf', size: '3.4 MB' }
    ],
    nodeStatuses: {
      'n1': 'completed',
      'n2': 'completed',
      'n3': 'completed',
      'n4': 'skipped',
      'n5': 'completed',
      'n6': 'completed',
      'n7': 'completed'
    },
    exceptions: [
      {
        nodeId: 'n5',
        type: 'inference',
        description: 'Inferred Floor 2 for units 201–208 at Marina Heights based on unit numbering convention.',
        confidence: 94
      }
    ],
    outputManifest: [
      { name: 'Q4-2025-RentRoll-Standardized.xlsx', path: '/Finance/CRE/Processed/Rent Rolls/', size: '84 KB' }
    ]
  },

  'wf-run-tener-12': {
    templateId: 'tener-valuation',
    runId: '#012',
    status: 'waiting',
    triggerType: 'chat-command',
    triggeredBy: 'E. Puckett',
    startTime: 'Yesterday, 2:00 PM',
    threadId: 'tener-batch-12',
    inputManifest: [
      { name: 'Batch-12-Parcels/', type: 'folder', fileCount: 47 }
    ],
    nodeStatuses: {
      'n1': 'completed',
      'n2': 'completed',
      'n3': 'completed',
      'n4': 'completed',
      'n5': 'completed',
      'n6': 'waiting',
      'n7': 'pending',
      'n8': 'pending',
      'n9': 'pending'
    },
    exceptions: [
      {
        nodeId: 'n6',
        type: 'conflicting-value',
        description: 'Parcel-2847-Assessment.pdf has conflicting assessed values — page 3 shows $4.2M, page 7 shows $4.8M (amended).',
        confidence: null
      },
      {
        nodeId: 'n6',
        type: 'low-confidence',
        description: 'Parcel-3102-Notice.pdf — poor OCR quality, 3 fields uncertain.',
        confidence: 67
      },
      {
        nodeId: 'n6',
        type: 'format-unknown',
        description: 'Parcel-4411-Filing.tiff — unexpected format (TIFF scan, not PDF). Needs conversion.',
        confidence: null
      }
    ],
    outputManifest: []
  }
};

// ============================================
// MOCK DATA — WORKFLOW COMMANDS
// ============================================
const MOCK_WORKFLOW_COMMANDS = [
  {
    command: '/rent-roll',
    label: 'Rent Roll Extraction',
    description: 'Extract and standardize rent roll data from PDFs',
    templateId: 'rent-roll'
  },
  {
    command: '/k1',
    label: 'K-1 Document Extraction',
    description: 'Parse K-1 forms and extract partner allocations',
    templateId: 'k1-extract'
  },
  {
    command: '/fees',
    label: 'Fee Calculation',
    description: 'Calculate management fees with commitment offsets',
    templateId: 'fee-calc'
  },
  {
    command: '/valuation',
    label: 'Valuation Filing',
    description: 'Extract parcel data and generate tax filing packages',
    templateId: 'tener-valuation'
  },
  {
    command: '/dd',
    label: 'Due Diligence',
    description: 'Run due diligence analysis on a target company',
    templateId: 'due-diligence',
    argPlaceholder: '[company name]'
  }
];

// ============================================
// MOCK DATA — SPREADSHEET
// ============================================
const MOCK_SPREADSHEET = {
  columns: ['A','B','C','D','E','F','G','H'],
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
  ]
};

// ============================================
// MOCK DATA — BRAIN MEMORY
// ============================================
const MOCK_MEMORY = {
  roleProfile: 'VP of Fund Accounting at a mid-market PE firm. I manage 12 funds across 3 vintages, primarily focused on real estate and infrastructure. I report to the CFO and work closely with investor relations.',
  selectedTraits: ['Direct', 'Detail-oriented', 'Professional'],
  presetTraits: ['Witty', 'Friendly', 'Formal', 'Direct', 'Cautious', 'Detail-oriented', 'Big-picture', 'Encouraging', 'Professional', 'Concise', 'Thorough'],
  facts: [
    { category: 'preference', text: 'Prefers IRR over MOIC when comparing fund performance across vintages.', source: 'Learned from conversation', date: 'Feb 14, 2026', linkedEntities: [] },
    { category: 'contact', text: 'Reports go to Sarah Chen (CFO) and Marcus Webb (COO). Sarah prefers executive summaries; Marcus wants full detail.', source: 'Learned from conversation', date: 'Feb 12, 2026', linkedEntities: [{name: 'Sarah Chen', type: 'person'}, {name: 'Marcus Webb', type: 'person'}] },
    { category: 'fund', text: 'Fund III has a 2/20 fee structure with European waterfall. GP commit is 5%. Preferred return is 8%.', source: 'Added by you', date: 'Feb 10, 2026', linkedEntities: [{name: 'Fund III', type: 'fund'}] },
    { category: 'style', text: 'Always include vintage year when referencing funds. Never abbreviate fund names in reports.', source: 'Learned from conversation', date: 'Feb 8, 2026', linkedEntities: [] },
    { category: 'workflow', text: 'Uses Yardi Voyager for property management data exports. Prefers CSV format over Excel for data imports.', source: 'Learned from conversation', date: 'Feb 6, 2026', linkedEntities: [{name: 'Yardi Voyager', type: 'document'}] },
    { category: 'preference', text: 'When building financial models, always start with assumptions tab, then build out to projections.', source: 'Learned from conversation', date: 'Feb 3, 2026', linkedEntities: [] },
    { category: 'contact', text: 'Primary auditor is Deloitte. Audit partner is James Whitfield. Fiscal year ends March 31.', source: 'Added by you', date: 'Jan 28, 2026', linkedEntities: [{name: 'Deloitte', type: 'person'}, {name: 'James Whitfield', type: 'person'}] },
    { category: 'fund', text: 'Hilgard Fund is a 2021 vintage focused on multifamily residential. 14 LP investors. Currently in harvest period.', source: 'Learned from conversation', date: 'Jan 22, 2026', linkedEntities: [{name: 'Hilgard Fund', type: 'fund'}] }
  ]
};

// ============================================
// MOCK DATA — HEADER PANELS (Tasks, Calendar, Usage)
// ============================================
const MOCK_TASKS = [
  { title: 'Review Halcyon Towers IC memo', meta: 'Due today · Assigned by Sarah K.', urgent: true },
  { title: 'Approve row 14 rent roll change', meta: 'Due Mar 10 · Spreadsheets', urgent: false },
  { title: 'Follow up — James Leland LP commitment', meta: 'Due Mar 12 · CRM', urgent: false }
];

const MOCK_CALENDAR = {
  month: 'March 2026',
  events: [
    { title: 'IC Vote — Halcyon Towers', meta: 'Mar 12, 10:00 AM', color: 'var(--violet-3)' },
    { title: 'LP Call — James Leland', meta: 'Mar 14, 2:00 PM', color: 'var(--blue-3)' },
    { title: 'Fund III Quarterly Review', meta: 'Mar 18, 9:00 AM', color: 'var(--green)' }
  ]
};

const MOCK_USAGE = {
  planLimit: '34.0M credits',
  used: '20.5M credits',
  remaining: '13.5M credits',
  percentUsed: '60.3%',
  overage: '$0.00',
  renews: 'Apr 1, 2026'
};

// ============================================
// MOCK DATA — BRAIN LESSONS
// ============================================
const MOCK_LESSONS = {
  'rent-roll-format': {
    title: 'Rent Roll Formatting Standards',
    scope: 'company',
    author: 'Sarah Chen',
    updated: 'Feb 28',
    usage: 23,
    lastUsed: '2d ago',
    preview: 'All rent rolls must follow the standardized column layout: Unit, Tenant, Lease Start, Lease End, Monthly Rent, Status. Column headers use title case...'
  },
  'k1-extraction': {
    title: 'K-1 Document Extraction Rules',
    scope: 'user',
    author: 'you',
    updated: 'Feb 22',
    usage: 18,
    lastUsed: '5d ago',
    preview: 'When extracting K-1 data, always pull: Partner name, TIN (last 4 only), ordinary income (Box 1), rental income (Box 2), guaranteed payments (Box 4c)...'
  },
  'waterfall-calc': {
    title: 'LP Distribution Waterfall Logic',
    scope: 'company',
    author: 'Marcus Webb',
    updated: 'Feb 15',
    usage: 14,
    lastUsed: '1w ago',
    preview: 'Distribution follows European waterfall: (1) Return of capital, (2) Preferred return at 8%, (3) GP catch-up to 20%, (4) 80/20 split above hurdle...'
  },
  'report-formatting': {
    title: 'Quarterly Report Formatting Guide',
    scope: 'user',
    author: 'you',
    updated: 'Feb 10',
    usage: 9,
    lastUsed: '3d ago',
    preview: 'Reports use DM Sans for body text, IBM Plex Mono for data tables. Primary color is #2D2D2E, accent is #74418F. Section headers are 16pt bold...'
  },
  'fee-calc-rules': {
    title: 'Management Fee Calculation Rules',
    scope: 'company',
    author: 'Sarah Chen',
    updated: 'Jan 30',
    usage: 7,
    lastUsed: '2w ago',
    preview: 'Management fees are calculated on committed capital during investment period, then on invested capital post-investment period. Rate is 2% per annum...'
  },
  'yardi-export': {
    title: 'Yardi Export Cleanup Process',
    scope: 'user',
    author: 'you',
    updated: 'Jan 18',
    usage: 4,
    lastUsed: '4d ago',
    preview: 'Yardi CSV exports need these corrections: (1) Remove the first 3 header rows, (2) Strip trailing whitespace from unit codes, (3) Convert dates from MM/DD/YYYY to ISO...'
  }
};

const MOCK_THREADS = {
  fund3: {
    title: 'Fund III — Allocation Drift',
    meta: 'Today, 2:31 PM',
    hasFiles: false,
    indicator: null,
    keywords: 'fund allocation drift ips mandate rebalance trim large cap equity'
  },
  hilgard: {
    title: 'Hilgard — Fee Analysis',
    meta: 'Feb 22, 4:15 PM',
    hasFiles: true,
    indicator: 'ready',
    keywords: 'hilgard fee analysis management committed capital offset'
  },
  q4lp: {
    title: 'Q4 LP Distribution Waterfall',
    meta: 'Yesterday, 11:20 AM',
    hasFiles: false,
    indicator: null,
    keywords: 'q4 lp distribution waterfall carry preferred return'
  },
  k1: {
    title: 'K-1 Document Extraction',
    meta: 'Feb 20, 9:45 AM',
    hasFiles: false,
    indicator: 'error',
    keywords: 'k1 k-1 tax document extraction partner allocation ridgeline'
  },
  erabor: {
    title: 'Erabor Partnership Terms',
    meta: 'Feb 18, 3:30 PM',
    hasFiles: false,
    indicator: null,
    keywords: 'erabor partnership terms gp commit clawback side letter marcus'
  },
  'wf-run-rentroll-047': {
    title: 'Rent Roll Extraction — Q4 Batch',
    meta: 'Today, 12:15 PM',
    hasFiles: false,
    indicator: 'ready',
    keywords: 'rent roll extraction q4 batch 245 park marina heights berkshire',
    workflowRunId: 'wf-run-rentroll-047'
  },
  'tener-batch-12': {
    title: 'Tener — Valuation Filing Batch 12',
    meta: 'Today, 10:42 AM',
    hasFiles: false,
    indicator: 'waiting',
    keywords: 'tener valuation filing batch 12 parcel assessment',
    workflowRunId: 'wf-run-tener-12'
  },
  'wf-create-dd': {
    title: 'New Workflow: Due Diligence',
    meta: 'Yesterday, 3:15 PM',
    hasFiles: false,
    indicator: null,
    keywords: 'due diligence workflow create new investment real estate',
    workflowRunId: null
  },
  new: {
    title: 'New Thread',
    meta: '',
    hasFiles: false,
    indicator: null,
    keywords: ''
  }
};

// ============================================
// PURPLE INTENSITY
// ============================================
const CONFIG_PURPLE_BASE_COLORS = {
  light: {
    '--berry-1': '#E0D0E1', '--berry-2': '#C4A6C5', '--berry-3': '#8B4F8D',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#D8C8E2', '--violet-2': '#A383B4', '--violet-3': '#74418F',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#D8CAD9', '--chinese-2': '#A891AD', '--chinese-3': '#7F6485',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E'
  },
  dark: {
    '--berry-1': '#2e1f2f', '--berry-2': '#5a3a5c', '--berry-3': '#a860aa',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#241a2f', '--violet-2': '#6a4a80', '--violet-3': '#8855a8',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#261a28', '--chinese-2': '#4e3854', '--chinese-3': '#8a6c92',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E'
  }
};

// Map: which tokens also need an RGB triplet companion
var CONFIG_RGB_COMPANIONS = {
  '--violet-3': '--violet-3-rgb',
  '--berry-3': '--berry-3-rgb'
};

var MOCK_GRAPH_DATA = {
  categories: [
    { id: 'funds', label: 'Funds', icon: '\u25C8', count: 11 },
    { id: 'contacts', label: 'Contacts', icon: '\u25CB', count: 18 },
    { id: 'documents', label: 'Documents', icon: '\u25A1', count: 16 },
    { id: 'workflows', label: 'Workflows', icon: '\u25B7', count: 12 },
    { id: 'systems', label: 'Systems', icon: '\u2699', count: 9 },
    { id: 'entities', label: 'Entities', icon: '\u25C7', count: 14 }
  ],
  nodes: {
    funds: [
      { id: 'fund-iii', label: 'Fund III', sub: '2019 Vintage', facts: [
        '2/20 fee structure with European waterfall',
        'GP commit is 5%, preferred return 8%',
        '14 LP investors, $420M committed capital',
        'Real estate focus — multifamily and industrial',
        'Currently in harvest period'
      ], related: ['sarah-chen', 'deloitte', 'k1-docs', 'hilgard', 'prop-berkshire', 'prop-marina'] },
      { id: 'hilgard', label: 'Hilgard Fund', sub: '2021 Vintage', facts: [
        '2021 vintage, multifamily residential focus',
        '14 LP investors across 3 institutions',
        'Currently in harvest period',
        'Managed by same team as Fund III'
      ], related: ['fund-iii', 'marcus-webb', 'rent-rolls', 'prop-hilgard-apt'] },
      { id: 'erabor', label: 'Erabor', sub: '2023 Vintage', facts: [
        '2023 vintage, infrastructure and energy',
        'Still in investment period',
        '$280M target, $190M committed so far',
        'European waterfall, 8% preferred return'
      ], related: ['sarah-chen', 'fund-iii', 'anna-kowalski'] },
      { id: 'opp-iv', label: 'Opportunity IV', sub: '2024 Vintage', facts: [
        'Newest fund, launched Q3 2024',
        'Opportunistic strategy across sectors',
        'Target $500M, first close at $150M'
      ], related: ['marcus-webb', 'erabor', 'david-park'] },
      { id: 'growth-i', label: 'Growth I', sub: '2020 Vintage', facts: [
        'Growth equity fund targeting tech-enabled services',
        '$310M committed, fully deployed',
        '11 portfolio companies',
        'American waterfall, 7% preferred'
      ], related: ['sarah-chen', 'lp-calpers', 'lp-harvardmc'] },
      { id: 'credit-ii', label: 'Credit II', sub: '2022 Vintage', facts: [
        'Private credit fund, mezzanine and senior secured',
        '$180M AUM, 12% target net return',
        'Quarterly distributions, current pay'
      ], related: ['elena-vasquez', 'deloitte', 'bank-svb'] },
      { id: 'infra-fund', label: 'Infra Fund', sub: '2023 Vintage', facts: [
        'Infrastructure — data centers, fiber, renewables',
        '$450M target, $290M first close',
        'Co-investment sidecar available'
      ], related: ['erabor', 'anna-kowalski', 'lp-adia'] },
      { id: 'co-invest-iii', label: 'Co-Invest III', sub: '2021 SPV', facts: [
        'Deal-by-deal co-investment vehicle',
        '8 completed deals, 2 in pipeline',
        'No management fee, 15% carry'
      ], related: ['opp-iv', 'david-park', 'lp-calpers'] },
      { id: 'secondaries', label: 'Secondaries I', sub: '2024 Vintage', facts: [
        'LP secondary and GP-led continuation fund',
        '$200M target, marketing phase',
        'Focus on NAV-discount opportunities'
      ], related: ['growth-i', 'credit-ii', 'rachel-kim'] },
      { id: 'seed-ventures', label: 'Seed Ventures', sub: '2022 Vintage', facts: [
        'Early-stage venture program',
        '$50M fund, 28 portfolio companies',
        'Follow-on reserve ratio 40%'
      ], related: ['growth-i', 'david-park', 'lp-tiger'] },
      { id: 'impact-i', label: 'Impact I', sub: '2024 ESG', facts: [
        'ESG-focused impact fund',
        '$150M target, Article 9 SFDR compliant',
        'Affordable housing and clean energy'
      ], related: ['infra-fund', 'anna-kowalski', 'lp-omers'] }
    ],
    contacts: [
      { id: 'sarah-chen', label: 'Sarah Chen', sub: 'CFO', facts: [
        'Chief Financial Officer',
        'Prefers executive summaries over detail',
        'Primary approver for quarterly reports',
        'Direct report of the CEO'
      ], related: ['fund-iii', 'erabor', 'deloitte', 'marcus-webb'] },
      { id: 'marcus-webb', label: 'Marcus Webb', sub: 'COO', facts: [
        'Chief Operating Officer',
        'Wants full detail in all reports',
        'Oversees workflow automation initiatives',
        'Reviews all LP communications'
      ], related: ['sarah-chen', 'hilgard', 'opp-iv'] },
      { id: 'james-whitfield', label: 'James Whitfield', sub: 'Audit Partner', facts: [
        'Deloitte audit partner',
        'Annual audit cycle ends March 31',
        'Has been partner for 3 years'
      ], related: ['deloitte', 'fund-iii', 'sarah-chen'] },
      { id: 'lp-group', label: 'LP Investors', sub: '32 Total', facts: [
        '32 LP investors across all funds',
        'Mix of institutions, family offices, HNW individuals',
        'Quarterly reporting cadence',
        'Annual meeting in September'
      ], related: ['fund-iii', 'hilgard', 'erabor'] },
      { id: 'elena-vasquez', label: 'Elena Vasquez', sub: 'Fund Controller', facts: [
        'Senior fund controller, manages NAV calculations',
        'Expert in waterfall modeling',
        'CPA, previously at PwC'
      ], related: ['credit-ii', 'sarah-chen', 'wf-nav-calc'] },
      { id: 'david-park', label: 'David Park', sub: 'IR Director', facts: [
        'Investor Relations director',
        'Manages LP communications and fundraising',
        'Joined from Goldman Sachs',
        'Runs annual LP meeting logistics'
      ], related: ['opp-iv', 'lp-group', 'qtr-reports', 'co-invest-iii'] },
      { id: 'anna-kowalski', label: 'Anna Kowalski', sub: 'VP Acquisitions', facts: [
        'VP of Acquisitions, infrastructure deals',
        'Manages deal pipeline and due diligence',
        'Sources deals in Europe and N. America'
      ], related: ['erabor', 'infra-fund', 'impact-i'] },
      { id: 'rachel-kim', label: 'Rachel Kim', sub: 'General Counsel', facts: [
        'General counsel and CCO',
        'Oversees LPA drafting and compliance',
        'SEC and CFTC reporting lead'
      ], related: ['lpa-docs', 'compliance-docs', 'secondaries'] },
      { id: 'tom-brennan', label: 'Tom Brennan', sub: 'CTO', facts: [
        'Chief Technology Officer',
        'Leads data infrastructure and integrations',
        'Driving AI adoption across firm'
      ], related: ['salesforce', 'yardi', 'snowflake', 'tableau'] },
      { id: 'lp-calpers', label: 'CalPERS', sub: 'Institutional LP', facts: [
        'California Public Employees Retirement System',
        '$8B PE allocation, $45M committed across 3 funds',
        'Annual re-up decisions in Q4'
      ], related: ['fund-iii', 'growth-i', 'co-invest-iii', 'david-park'] },
      { id: 'lp-harvardmc', label: 'Harvard MC', sub: 'Endowment LP', facts: [
        'Harvard Management Company',
        '$25M commitment in Growth I',
        'Requires ILPA-compliant reporting'
      ], related: ['growth-i', 'david-park', 'qtr-reports'] },
      { id: 'lp-adia', label: 'ADIA', sub: 'Sovereign LP', facts: [
        'Abu Dhabi Investment Authority',
        '$60M commitment to Infra Fund',
        'Requires Sharia-compliant structuring review'
      ], related: ['infra-fund', 'david-park'] },
      { id: 'lp-tiger', label: 'Tiger Global', sub: 'Crossover LP', facts: [
        'Crossover fund, $15M in Seed Ventures',
        'Co-investment rights on Series A+ deals',
        'Quarterly valuation mark reviews'
      ], related: ['seed-ventures', 'david-park'] },
      { id: 'lp-omers', label: 'OMERS', sub: 'Pension LP', facts: [
        'Ontario Municipal Employees Retirement System',
        '$30M commitment to Impact I',
        'ESG screening requirements'
      ], related: ['impact-i', 'david-park'] },
      { id: 'ext-counsel', label: 'Kirkland & Ellis', sub: 'External Counsel', facts: [
        'Primary external legal counsel',
        'Handles fund formation, LPA negotiation',
        'Partner: Margaret Hsu'
      ], related: ['rachel-kim', 'lpa-docs', 'secondaries'] },
      { id: 'auditor-kpmg', label: 'KPMG', sub: 'Tax Advisor', facts: [
        'Tax advisory and K-1 preparation',
        'Handles multi-state and international tax',
        'Annual engagement, Feb-Apr'
      ], related: ['k1-docs', 'deloitte', 'sarah-chen'] },
      { id: 'admin-citco', label: 'Citco', sub: 'Fund Admin', facts: [
        'Third-party fund administrator',
        'NAV calculation, investor statements, capital calls',
        'Administers Growth I and Credit II'
      ], related: ['growth-i', 'credit-ii', 'elena-vasquez'] },
      { id: 'broker-jll', label: 'JLL', sub: 'Broker', facts: [
        'Real estate broker for acquisitions',
        'Exclusive on industrial portfolio',
        'Market reports quarterly'
      ], related: ['fund-iii', 'hilgard', 'anna-kowalski'] }
    ],
    documents: [
      { id: 'k1-docs', label: 'K-1 Documents', sub: '48 Files', facts: [
        'Annual K-1 tax documents for all LP investors',
        'Extracted fields: partner name, TIN, Box 1-4c',
        'Processing via automated extraction workflow'
      ], related: ['fund-iii', 'lp-group', 'auditor-kpmg'] },
      { id: 'rent-rolls', label: 'Rent Rolls', sub: '24 Files', facts: [
        'Monthly rent roll exports from Yardi',
        'Standardized column format enforced',
        'Status color coding: green/amber/red'
      ], related: ['hilgard', 'yardi'] },
      { id: 'qtr-reports', label: 'Quarterly Reports', sub: '48 Files', facts: [
        'LP quarterly performance reports across all funds',
        'DM Sans body, IBM Plex Mono tables',
        'IRR and MOIC metrics included',
        'ILPA-compliant format for institutional LPs'
      ], related: ['sarah-chen', 'lp-group', 'fund-iii', 'david-park'] },
      { id: 'lpa-docs', label: 'LPAs', sub: '11 Files', facts: [
        'Limited Partnership Agreements for all funds',
        'Define fee structures, waterfall, GP terms',
        'Source of truth for fund economics'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'opp-iv', 'rachel-kim'] },
      { id: 'cap-call-docs', label: 'Capital Calls', sub: '86 Files', facts: [
        'Capital call notices across all active funds',
        'Includes wire instructions and due dates',
        'Average 10-day notice period'
      ], related: ['lp-group', 'elena-vasquez', 'admin-citco'] },
      { id: 'dist-notices', label: 'Distribution Notices', sub: '34 Files', facts: [
        'Distribution and return-of-capital notices',
        'Waterfall calculations attached',
        'Requires dual signoff (CFO + Controller)'
      ], related: ['sarah-chen', 'elena-vasquez', 'wf-waterfall'] },
      { id: 'compliance-docs', label: 'Compliance Filings', sub: '22 Files', facts: [
        'ADV, PF, CPO-PQR filings',
        'SEC annual amendment due March 31',
        'CFTC reporting quarterly'
      ], related: ['rachel-kim', 'deloitte'] },
      { id: 'board-decks', label: 'Board Decks', sub: '16 Files', facts: [
        'Quarterly advisory board presentations',
        'Fund performance, pipeline, market outlook',
        'Confidential — limited distribution'
      ], related: ['sarah-chen', 'marcus-webb', 'david-park'] },
      { id: 'due-diligence', label: 'DD Packages', sub: '28 Files', facts: [
        'Due diligence document packages for fundraising',
        'Includes track record, team bios, references',
        'Updated semi-annually'
      ], related: ['david-park', 'opp-iv', 'secondaries'] },
      { id: 'valuation-reports', label: 'Valuation Reports', sub: '44 Files', facts: [
        'Quarterly fair value reports per ASC 820',
        'Third-party valuations for Level 3 assets',
        'Reviewed by audit committee'
      ], related: ['elena-vasquez', 'deloitte', 'fund-iii', 'growth-i'] },
      { id: 'insurance-docs', label: 'Insurance Policies', sub: '8 Files', facts: [
        'D&O, E&O, Cyber, Property policies',
        'Annual renewal in November',
        'Broker: Marsh McLennan'
      ], related: ['rachel-kim', 'firm'] },
      { id: 'tax-opinions', label: 'Tax Opinions', sub: '6 Files', facts: [
        'FIRPTA, UBTI, and ECI analysis',
        'Blocker entity structuring opinions',
        'Updated per new fund formation'
      ], related: ['auditor-kpmg', 'lpa-docs', 'rachel-kim'] },
      { id: 'side-letters', label: 'Side Letters', sub: '42 Files', facts: [
        'LP-specific side letter agreements',
        'MFN provisions tracked centrally',
        'Key terms: fee discounts, co-invest, reporting'
      ], related: ['lpa-docs', 'rachel-kim', 'lp-calpers', 'lp-adia'] },
      { id: 'pitch-decks', label: 'Pitch Decks', sub: '14 Files', facts: [
        'Fundraising pitch materials by fund',
        'Version controlled, compliance-reviewed',
        'Includes tearsheets and one-pagers'
      ], related: ['david-park', 'opp-iv', 'impact-i', 'secondaries'] },
      { id: 'wire-instructions', label: 'Wire Instructions', sub: '6 Files', facts: [
        'Bank wire details for each fund entity',
        'Dual-verification required on changes',
        'Updated semi-annually'
      ], related: ['bank-svb', 'cap-call-docs', 'elena-vasquez'] },
      { id: 'org-charts', label: 'Org Charts', sub: '11 Files', facts: [
        'Fund entity structure diagrams',
        'GP/LP/Blocker/Feeder relationships',
        'Updated for each new fund or restructuring'
      ], related: ['rachel-kim', 'lpa-docs', 'firm'] }
    ],
    workflows: [
      { id: 'wf-rent-roll', label: 'Rent Roll Extract', sub: 'Active', facts: [
        'Automated Yardi CSV extraction and formatting',
        'Runs daily at 6:00 AM',
        '98.2% success rate across 142 runs'
      ], related: ['rent-rolls', 'yardi', 'hilgard'] },
      { id: 'wf-k1', label: 'K-1 Processing', sub: 'Active', facts: [
        'Extracts and validates K-1 tax documents',
        'Runs on document upload trigger',
        'Flags anomalies for manual review'
      ], related: ['k1-docs', 'fund-iii', 'lp-group'] },
      { id: 'wf-waterfall', label: 'LP Waterfall', sub: 'Active', facts: [
        'Calculates LP distribution waterfall',
        'European waterfall logic per LPA terms',
        'Handles catch-up, clawback, and GP commit'
      ], related: ['lpa-docs', 'fund-iii', 'dist-notices'] },
      { id: 'wf-fees', label: 'Fee Calculator', sub: 'Active', facts: [
        'Management fee calculation engine',
        '2% on committed during investment period',
        'Switches to invested capital post-period'
      ], related: ['fund-iii', 'hilgard', 'erabor'] },
      { id: 'wf-nav-calc', label: 'NAV Calculator', sub: 'Active', facts: [
        'Quarterly NAV calculation across all funds',
        'Pulls from Yardi, Citco, and manual inputs',
        'Reconciliation tolerance: 0.1%'
      ], related: ['elena-vasquez', 'admin-citco', 'valuation-reports'] },
      { id: 'wf-cap-call', label: 'Capital Call Gen', sub: 'Active', facts: [
        'Generates capital call notices from templates',
        'Auto-calculates pro-rata LP amounts',
        'Sends via DocuSign for e-signature'
      ], related: ['cap-call-docs', 'lp-group', 'elena-vasquez'] },
      { id: 'wf-compliance', label: 'Compliance Monitor', sub: 'Active', facts: [
        'Monitors regulatory filing deadlines',
        'Alerts 30/15/7 days before due dates',
        'Tracks SEC, CFTC, state blue sky'
      ], related: ['compliance-docs', 'rachel-kim'] },
      { id: 'wf-lp-portal', label: 'LP Portal Sync', sub: 'Active', facts: [
        'Syncs documents to investor portal',
        'Auto-publishes quarterly reports on approval',
        'Tracks LP download activity'
      ], related: ['qtr-reports', 'david-park', 'salesforce'] },
      { id: 'wf-reconcile', label: 'Bank Reconciliation', sub: 'Active', facts: [
        'Daily bank statement reconciliation',
        'Matches capital calls and distributions',
        'Escalates unmatched items after 3 days'
      ], related: ['bank-svb', 'elena-vasquez', 'wire-instructions'] },
      { id: 'wf-esg-report', label: 'ESG Reporting', sub: 'Draft', facts: [
        'Collects ESG metrics from portfolio companies',
        'SFDR Article 9 PAI indicators',
        'Annual report generation'
      ], related: ['impact-i', 'anna-kowalski', 'compliance-docs'] },
      { id: 'wf-data-room', label: 'Data Room Mgmt', sub: 'Active', facts: [
        'Manages virtual data rooms for fundraising',
        'Auto-watermarks confidential documents',
        'Tracks LP access and engagement analytics'
      ], related: ['due-diligence', 'pitch-decks', 'david-park'] },
      { id: 'wf-valuation', label: 'Valuation Pipeline', sub: 'Active', facts: [
        'Quarterly valuation workflow with approvals',
        'Draft → Review → Committee → Final pipeline',
        'Integrates third-party valuation agents'
      ], related: ['valuation-reports', 'sarah-chen', 'deloitte'] }
    ],
    systems: [
      { id: 'yardi', label: 'Yardi Voyager', sub: 'Property Mgmt', facts: [
        'Primary property management system',
        'CSV exports need cleanup (3 header rows, whitespace, dates)',
        'Preferred format: CSV over Excel'
      ], related: ['rent-rolls', 'wf-rent-roll', 'hilgard'] },
      { id: 'deloitte', label: 'Deloitte', sub: 'Auditor', facts: [
        'External audit firm',
        'Fiscal year ends March 31',
        'Audit partner: James Whitfield'
      ], related: ['james-whitfield', 'fund-iii', 'sarah-chen'] },
      { id: 'salesforce', label: 'Salesforce', sub: 'CRM', facts: [
        'LP relationship management',
        'Tracks commitments, communications, meetings',
        'Syncs with quarterly reporting workflow'
      ], related: ['lp-group', 'qtr-reports', 'david-park'] },
      { id: 'snowflake', label: 'Snowflake', sub: 'Data Warehouse', facts: [
        'Central data warehouse for analytics',
        'Ingests from Yardi, Salesforce, Citco',
        'Powers Tableau dashboards and Cosimo queries'
      ], related: ['tom-brennan', 'tableau', 'yardi'] },
      { id: 'tableau', label: 'Tableau', sub: 'BI / Dashboards', facts: [
        'Business intelligence and visualization',
        'Fund performance, portfolio, LP dashboards',
        'Embedded in LP portal'
      ], related: ['snowflake', 'tom-brennan', 'qtr-reports'] },
      { id: 'bank-svb', label: 'First Republic', sub: 'Banking', facts: [
        'Primary banking relationship (formerly SVB)',
        'Fund-level accounts, escrow services',
        'Wire processing SLA: same day before 2pm'
      ], related: ['wire-instructions', 'credit-ii', 'wf-reconcile'] },
      { id: 'docusign', label: 'DocuSign', sub: 'E-Signature', facts: [
        'Electronic signature platform',
        'Used for capital calls, side letters, LPAs',
        'Integrated with workflow automation'
      ], related: ['wf-cap-call', 'side-letters', 'cap-call-docs'] },
      { id: 'box', label: 'Box', sub: 'File Storage', facts: [
        'Enterprise file storage and sharing',
        'Folder structure mirrors fund hierarchy',
        'Retention policy: 10 years post-fund termination'
      ], related: ['tom-brennan', 'due-diligence', 'wf-data-room'] },
      { id: 'outlook', label: 'Outlook / M365', sub: 'Email & Calendar', facts: [
        'Microsoft 365 email and calendar',
        'Shared calendars for fund deadlines',
        'Archive policy: 7 years'
      ], related: ['tom-brennan', 'salesforce', 'marcus-webb'] }
    ],
    entities: [
      { id: 'firm', label: 'The Firm', sub: 'Mid-Market PE', facts: [
        'Mid-market private equity firm',
        '11 active funds across RE, infra, credit, growth, venture',
        '50+ LP investors, ~$2.8B total AUM',
        'Founded 2008, 45 employees'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'opp-iv', 'sarah-chen', 'growth-i'] },
      { id: 'fiscal-year', label: 'Fiscal Year', sub: 'Ends Mar 31', facts: [
        'Fiscal year ends March 31',
        'Audit cycle runs April-June',
        'Quarterly reporting: Jun, Sep, Dec, Mar'
      ], related: ['deloitte', 'qtr-reports'] },
      { id: 'fee-structure', label: 'Fee Structure', sub: '2/20 Standard', facts: [
        '2% management fee / 20% carried interest',
        'European waterfall across most funds',
        '8% preferred return, then GP catch-up',
        'Venture fund: 2.5/25 with no pref'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'lpa-docs', 'wf-fees'] },
      { id: 'prop-berkshire', label: 'Berkshire Complex', sub: 'Multifamily', facts: [
        '320-unit multifamily, Fund III portfolio',
        'Acquired 2020, $62M basis',
        'Current NOI: $4.8M, 94% occupied'
      ], related: ['fund-iii', 'rent-rolls', 'yardi'] },
      { id: 'prop-marina', label: 'Marina Industrial', sub: 'Industrial', facts: [
        '480K SF industrial park, Fund III',
        '12 tenants, triple-net leases',
        'Cap rate at acquisition: 5.8%'
      ], related: ['fund-iii', 'yardi'] },
      { id: 'prop-hilgard-apt', label: 'Hilgard Apartments', sub: 'Multifamily', facts: [
        '210-unit luxury apartments',
        'Flagship Hilgard Fund asset',
        'Value-add renovation 80% complete'
      ], related: ['hilgard', 'rent-rolls', 'yardi'] },
      { id: 'portfolio-saas', label: 'CloudMetrics', sub: 'SaaS / Growth I', facts: [
        'B2B SaaS analytics platform',
        'Growth I portfolio company, Series C',
        '$18M ARR, 130% net retention'
      ], related: ['growth-i', 'valuation-reports'] },
      { id: 'portfolio-fintech', label: 'PayBridge', sub: 'Fintech / Growth I', facts: [
        'Payment processing for SMBs',
        '$42M revenue, EBITDA positive',
        'Potential exit target — strategic interest'
      ], related: ['growth-i', 'seed-ventures', 'valuation-reports'] },
      { id: 'portfolio-climate', label: 'GreenGrid', sub: 'CleanTech / Impact', facts: [
        'Grid-scale battery storage developer',
        'Impact I portfolio, 3 projects operational',
        '200MW pipeline, DOE loan guarantee pending'
      ], related: ['impact-i', 'infra-fund', 'anna-kowalski'] },
      { id: 'benchmark-pe', label: 'PE Benchmarks', sub: 'Cambridge / Preqin', facts: [
        'Cambridge Associates PE benchmark data',
        'Preqin peer fund comparisons',
        'Updated quarterly, used in LP reports'
      ], related: ['qtr-reports', 'david-park', 'tableau'] },
      { id: 'market-data', label: 'Market Data', sub: 'CoStar / PitchBook', facts: [
        'CoStar real estate market data',
        'PitchBook PE deal flow and valuations',
        'MSCI climate risk data for ESG'
      ], related: ['anna-kowalski', 'board-decks', 'due-diligence'] },
      { id: 'carry-plan', label: 'Carry Plan', sub: 'GP Economics', facts: [
        'Carried interest allocation plan',
        'Points allocated across 12 senior team members',
        'Vesting: 4-year cliff, fund-by-fund'
      ], related: ['fee-structure', 'firm', 'sarah-chen'] },
      { id: 'succession-plan', label: 'Succession Plan', sub: 'Key Person', facts: [
        'Key person provisions per LPA',
        'Succession committee: 3 senior partners',
        'Insurance: $10M key person policy'
      ], related: ['firm', 'rachel-kim', 'insurance-docs'] },
      { id: 'esg-framework', label: 'ESG Framework', sub: 'UN PRI Signatory', facts: [
        'UN PRI signatory since 2021',
        'Annual PRI assessment score: 4/5',
        'TCFD-aligned climate disclosure'
      ], related: ['impact-i', 'wf-esg-report', 'compliance-docs'] }
    ]
  }
};
