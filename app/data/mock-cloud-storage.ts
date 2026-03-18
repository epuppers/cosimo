// ============================================
// Mock Data — Cloud Storage
// ============================================
// Cloud providers, SharePoint sites, Google Drive
// config, source trees, files, and data scope toggles.

import type {
  CloudProvider,
  SharePointSite,
  GoogleDriveConfig,
  CloudStorageSettings,
  CloudSource,
  CloudFile,
  DataScopeToggle,
} from '~/services/types';

// ============================================
// PROVIDERS
// ============================================

export const MOCK_CLOUD_PROVIDERS: CloudProvider[] = [
  {
    id: 'sharepoint',
    name: 'SharePoint',
    type: 'microsoft',
    status: 'connected',
    icon: 'sharepoint',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    type: 'google',
    status: 'connected',
    icon: 'google-drive',
  },
];

// ============================================
// SHAREPOINT SITES
// ============================================

export const MOCK_SHAREPOINT_SITES: SharePointSite[] = [
  {
    id: 'sp-marketfinance',
    name: 'Market Finance',
    url: 'notapplicable039.sharepoint.com/sites/marketfinance',
    libraries: [
      { id: 'sp-mf-documents', name: 'Documents', enabled: true },
      { id: 'sp-mf-shared-reports', name: 'Shared Reports', enabled: true },
    ],
  },
  {
    id: 'sp-hr',
    name: 'HR',
    url: 'notapplicable039.sharepoint.com/sites/hr',
    libraries: [
      { id: 'sp-hr-documents', name: 'Documents', enabled: true },
      { id: 'sp-hr-policies', name: 'Policies Library', enabled: false },
      { id: 'sp-hr-onboarding', name: 'Onboarding', enabled: true },
    ],
  },
];

// ============================================
// GOOGLE DRIVE CONFIG
// ============================================

export const MOCK_GOOGLE_DRIVE_CONFIG: GoogleDriveConfig = {
  serviceAccount: 'cosimo-acme-corp@cosimo-prod.iam.gserviceaccount.com',
  sharedFolders: [
    { id: 'gd-monthly-reports', name: 'Monthly Reports', fileCount: 47, enabled: true },
    { id: 'gd-tax-docs-2025', name: 'Tax Documents 2025', fileCount: 23, enabled: true },
    { id: 'gd-client-onboarding', name: 'Client Onboarding', fileCount: 156, enabled: true },
  ],
};

// ============================================
// CLOUD STORAGE SETTINGS (Combined)
// ============================================

export const MOCK_CLOUD_STORAGE_SETTINGS: CloudStorageSettings = {
  providers: MOCK_CLOUD_PROVIDERS,
  sharepoint: { sites: MOCK_SHAREPOINT_SITES },
  googleDrive: MOCK_GOOGLE_DRIVE_CONFIG,
};

// ============================================
// CLOUD SOURCES (Navigation Tree)
// ============================================

export const MOCK_CLOUD_SOURCES: CloudSource[] = [
  {
    id: 'sp-root',
    provider: 'sharepoint',
    label: 'SharePoint',
    type: 'root',
    children: [
      {
        id: 'sp-marketfinance',
        provider: 'sharepoint',
        label: 'Market Finance',
        type: 'site',
        children: [
          { id: 'sp-mf-documents', provider: 'sharepoint', label: 'Documents', type: 'library' },
          { id: 'sp-mf-shared-reports', provider: 'sharepoint', label: 'Shared Reports', type: 'library' },
        ],
      },
      {
        id: 'sp-hr',
        provider: 'sharepoint',
        label: 'HR',
        type: 'site',
        children: [
          { id: 'sp-hr-documents', provider: 'sharepoint', label: 'Documents', type: 'library' },
          { id: 'sp-hr-onboarding', provider: 'sharepoint', label: 'Onboarding', type: 'library' },
        ],
      },
    ],
  },
  {
    id: 'gd-root',
    provider: 'google-drive',
    label: 'Google Drive',
    type: 'root',
    children: [
      { id: 'gd-my-drive', provider: 'google-drive', label: 'My Drive', type: 'root' },
      {
        id: 'gd-shared',
        provider: 'google-drive',
        label: 'Shared',
        type: 'root',
        children: [
          { id: 'gd-monthly-reports', provider: 'google-drive', label: 'Monthly Reports', type: 'shared-folder' },
          { id: 'gd-tax-docs-2025', provider: 'google-drive', label: 'Tax Documents 2025', type: 'shared-folder' },
          { id: 'gd-client-onboarding', provider: 'google-drive', label: 'Client Onboarding', type: 'shared-folder' },
        ],
      },
    ],
  },
];

// ============================================
// CLOUD FILES (Keyed by source/folder ID)
// ============================================

export const MOCK_CLOUD_FILES: Record<string, CloudFile[]> = {
  'sp-mf-documents': [
    {
      id: 'sp-mf-doc-finance',
      name: 'Finance',
      type: 'folder',
      size: '',
      lastModified: 'Mar 12',
      provider: 'sharepoint',
      path: 'Documents',
      isFolder: true,
      itemCount: 5,
    },
    {
      id: 'sp-mf-doc-legal',
      name: 'Legal',
      type: 'folder',
      size: '',
      lastModified: 'Mar 8',
      provider: 'sharepoint',
      path: 'Documents',
      isFolder: true,
      itemCount: 3,
    },
    {
      id: 'sp-mf-doc-overview',
      name: 'Portfolio Overview.docx',
      type: 'docx',
      size: '342 KB',
      lastModified: 'Mar 14',
      provider: 'sharepoint',
      path: 'Documents',
      isFolder: false,
    },
    {
      id: 'sp-mf-doc-contacts',
      name: 'LP Contact List.xlsx',
      type: 'xlsx',
      size: '128 KB',
      lastModified: 'Mar 6',
      provider: 'sharepoint',
      path: 'Documents',
      isFolder: false,
    },
  ],
  'sp-marketfinance-documents-finance-q4': [
    {
      id: 'sp-mf-q4-report',
      name: 'Q4 Report.docx',
      type: 'docx',
      size: '1.2 MB',
      lastModified: 'Mar 10',
      provider: 'sharepoint',
      path: 'Documents > Finance > Q4',
      isFolder: false,
    },
    {
      id: 'sp-mf-q4-budget',
      name: 'Budget.xlsx',
      type: 'xlsx',
      size: '245 KB',
      lastModified: 'Mar 8',
      provider: 'sharepoint',
      path: 'Documents > Finance > Q4',
      isFolder: false,
    },
    {
      id: 'sp-mf-q4-fee-analysis',
      name: 'Fee Analysis - Hilgard Fund II.xlsx',
      type: 'xlsx',
      size: '189 KB',
      lastModified: 'Mar 5',
      provider: 'sharepoint',
      path: 'Documents > Finance > Q4',
      isFolder: false,
    },
    {
      id: 'sp-mf-q4-lp-dist',
      name: 'LP Distribution Summary.pdf',
      type: 'pdf',
      size: '456 KB',
      lastModified: 'Mar 3',
      provider: 'sharepoint',
      path: 'Documents > Finance > Q4',
      isFolder: false,
    },
    {
      id: 'sp-mf-q4-waterfall',
      name: 'Waterfall Calc Model.xlsx',
      type: 'xlsx',
      size: '312 KB',
      lastModified: 'Feb 28',
      provider: 'sharepoint',
      path: 'Documents > Finance > Q4',
      isFolder: false,
    },
  ],
  'gd-monthly-reports': [
    {
      id: 'gd-mr-march-nav',
      name: 'March 2026 NAV Report.xlsx',
      type: 'xlsx',
      size: '567 KB',
      lastModified: 'Mar 15',
      provider: 'google-drive',
      path: 'Shared > Monthly Reports',
      isFolder: false,
    },
    {
      id: 'gd-mr-feb-perf',
      name: 'February Performance Summary.pdf',
      type: 'pdf',
      size: '890 KB',
      lastModified: 'Mar 2',
      provider: 'google-drive',
      path: 'Shared > Monthly Reports',
      isFolder: false,
    },
    {
      id: 'gd-mr-jan-nav',
      name: 'January 2026 NAV Report.xlsx',
      type: 'xlsx',
      size: '534 KB',
      lastModified: 'Feb 12',
      provider: 'google-drive',
      path: 'Shared > Monthly Reports',
      isFolder: false,
    },
    {
      id: 'gd-mr-ytd-dashboard',
      name: 'YTD Dashboard.xlsx',
      type: 'xlsx',
      size: '1.4 MB',
      lastModified: 'Mar 14',
      provider: 'google-drive',
      path: 'Shared > Monthly Reports',
      isFolder: false,
    },
    {
      id: 'gd-mr-q1-commentary',
      name: 'Q1 Market Commentary.docx',
      type: 'docx',
      size: '278 KB',
      lastModified: 'Mar 10',
      provider: 'google-drive',
      path: 'Shared > Monthly Reports',
      isFolder: false,
    },
  ],
  'gd-shared-root': [
    {
      id: 'gd-sf-monthly',
      name: 'Monthly Reports',
      type: 'folder',
      size: '',
      lastModified: 'Mar 15',
      provider: 'google-drive',
      path: 'Shared',
      isFolder: true,
      itemCount: 47,
    },
    {
      id: 'gd-sf-tax',
      name: 'Tax Documents 2025',
      type: 'folder',
      size: '',
      lastModified: 'Mar 1',
      provider: 'google-drive',
      path: 'Shared',
      isFolder: true,
      itemCount: 23,
    },
    {
      id: 'gd-sf-onboarding',
      name: 'Client Onboarding',
      type: 'folder',
      size: '',
      lastModified: 'Feb 20',
      provider: 'google-drive',
      path: 'Shared',
      isFolder: true,
      itemCount: 156,
    },
  ],
};

// ============================================
// RECENT CLOUD FILES
// ============================================

export const MOCK_RECENT_CLOUD_FILES: CloudFile[] = [
  {
    id: 'sp-mf-q4-fee-analysis',
    name: 'Fee Analysis - Hilgard Fund II.xlsx',
    type: 'xlsx',
    size: '189 KB',
    lastModified: 'Mar 5',
    provider: 'sharepoint',
    path: 'Documents > Finance > Q4',
    isFolder: false,
  },
  {
    id: 'gd-mr-march-nav',
    name: 'March 2026 NAV Report.xlsx',
    type: 'xlsx',
    size: '567 KB',
    lastModified: 'Mar 15',
    provider: 'google-drive',
    path: 'Shared > Monthly Reports',
    isFolder: false,
  },
  {
    id: 'sp-mf-doc-overview',
    name: 'Portfolio Overview.docx',
    type: 'docx',
    size: '342 KB',
    lastModified: 'Mar 14',
    provider: 'sharepoint',
    path: 'Documents',
    isFolder: false,
  },
  {
    id: 'gd-mr-ytd-dashboard',
    name: 'YTD Dashboard.xlsx',
    type: 'xlsx',
    size: '1.4 MB',
    lastModified: 'Mar 14',
    provider: 'google-drive',
    path: 'Shared > Monthly Reports',
    isFolder: false,
  },
  {
    id: 'sp-mf-q4-lp-dist',
    name: 'LP Distribution Summary.pdf',
    type: 'pdf',
    size: '456 KB',
    lastModified: 'Mar 3',
    provider: 'sharepoint',
    path: 'Documents > Finance > Q4',
    isFolder: false,
  },
];

// ============================================
// DATA SCOPE TOGGLES
// ============================================

export const MOCK_DATA_SCOPE_TOGGLES: DataScopeToggle[] = [
  { id: 'ms-sharepoint-files', label: 'SharePoint Files', type: 'files', enabled: true, provider: 'microsoft' },
  { id: 'ms-outlook-mail', label: 'Outlook Mail', type: 'email', enabled: true, provider: 'microsoft' },
  { id: 'ms-outlook-calendar', label: 'Outlook Calendar', type: 'calendar', enabled: true, provider: 'microsoft' },
  { id: 'g-drive-files', label: 'Drive Files', type: 'files', enabled: true, provider: 'google' },
  { id: 'g-gmail', label: 'Gmail', type: 'email', enabled: true, provider: 'google' },
  { id: 'g-calendar', label: 'Google Calendar', type: 'calendar', enabled: true, provider: 'google' },
];
