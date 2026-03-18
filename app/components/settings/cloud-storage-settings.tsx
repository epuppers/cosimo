import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronRight, Copy, FolderOpen, Mail, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { getCloudStorageSettings } from '~/services/cloud-storage';
import type { CloudStorageSettings as CloudStorageSettingsType, CloudProvider, SharePointSite } from '~/services/types';

// ============================================
// Props
// ============================================

interface CloudStorageSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================
// Provider Card Sub-component
// ============================================

/** Header icon for a provider — colored circle with initials */
function ProviderIcon({ provider }: { provider: CloudProvider }) {
  const bgClass = provider.type === 'microsoft' ? 'bg-violet-3' : 'bg-blue-3';
  const initials = provider.type === 'microsoft' ? 'SP' : 'GD';
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        bgClass
      )}
    >
      <span className="font-mono text-[0.625rem] font-bold text-white">
        {initials}
      </span>
    </div>
  );
}

/** SharePoint expanded content — sites with library toggles */
function SharePointContent({
  sites,
}: {
  sites: SharePointSite[];
}) {
  const [libraryStates, setLibraryStates] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const site of sites) {
        for (const lib of site.libraries) {
          initial[lib.id] = lib.enabled;
        }
      }
      return initial;
    }
  );
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const site of sites) {
        initial[site.id] = true;
      }
      return initial;
    }
  );

  return (
    <div className="mt-3 space-y-3">
      {sites.map((site) => (
        <div
          key={site.id}
          className="rounded-[var(--r-sm)] border border-taupe-2 bg-white p-3 dark:border-surface-3 dark:bg-surface-1"
        >
          {/* Site header */}
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between text-left',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
            onClick={() =>
              setExpandedSites((prev) => ({
                ...prev,
                [site.id]: !prev[site.id],
              }))
            }
          >
            <div>
              <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-2">
                {site.name}
              </span>
              <span className="ml-2 font-mono text-[0.625rem] text-taupe-3">
                {site.libraries.length} libraries
              </span>
            </div>
            {expandedSites[site.id] ? (
              <ChevronDown className="h-3.5 w-3.5 text-taupe-3" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-taupe-3" />
            )}
          </button>

          {/* Site URL */}
          <p className="mt-0.5 font-mono text-[0.625rem] text-taupe-3">
            {site.url}
          </p>

          {/* Libraries */}
          {expandedSites[site.id] && (
            <div className="mt-2.5 space-y-1.5">
              {site.libraries.map((lib) => (
                <div
                  key={lib.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="font-mono text-[0.6875rem] text-taupe-4 dark:text-taupe-3">
                    {lib.name}
                  </span>
                  <Switch
                    size="sm"
                    checked={libraryStates[lib.id] ?? lib.enabled}
                    onCheckedChange={(checked: boolean) =>
                      setLibraryStates((prev) => ({
                        ...prev,
                        [lib.id]: checked,
                      }))
                    }
                  />
                </div>
              ))}

              {/* Remove site link */}
              <button
                type="button"
                className={cn(
                  'mt-1 cursor-pointer font-mono text-[0.625rem] text-taupe-3 hover:text-red',
                  'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
                )}
              >
                Remove site
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add site link */}
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 cursor-pointer font-mono text-[0.6875rem] text-violet-3 hover:text-violet-4',
          'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
        )}
      >
        <Plus className="h-3 w-3" />
        Add site
      </button>

      {/* Data scopes */}
      <div className="border-t border-taupe-2 pt-3 dark:border-surface-3">
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Data Scopes
        </span>
        <div className="mt-1.5 space-y-0.5">
          <MicrosoftDataScopes />
        </div>
      </div>

      {/* Disconnect link */}
      <button
        type="button"
        className={cn(
          'mt-1 cursor-pointer font-mono text-[0.625rem] text-taupe-3 hover:text-red',
          'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
        )}
      >
        Disconnect SharePoint
      </button>
    </div>
  );
}

/** Google Drive expanded content — service account + shared folders */
function GoogleDriveContent({
  serviceAccount,
  sharedFolders,
}: {
  serviceAccount: string;
  sharedFolders: { id: string; name: string; fileCount: number; enabled: boolean }[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Service account */}
      <div>
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Service Account
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[0.625rem] text-taupe-4 dark:text-taupe-3">
            {serviceAccount}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy service account email"
            className={cn(
              'shrink-0 rounded-[var(--r-sm)] p-1 text-taupe-3 hover:bg-berry-1 hover:text-taupe-5',
              'dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:text-taupe-2',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
          >
            <Copy className="h-3 w-3" />
          </button>
          {copied && (
            <span className="font-mono text-[0.5625rem] text-violet-3">
              Copied
            </span>
          )}
        </div>
      </div>

      {/* Shared folders */}
      <div>
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Shared Folders
        </span>
        <div className="mt-1.5 space-y-1">
          {sharedFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-2 py-1"
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-taupe-3" />
              <span className="font-mono text-[0.6875rem] text-taupe-4 dark:text-taupe-3">
                {folder.name}
              </span>
              <span className="font-mono text-[0.625rem] text-taupe-3">
                · {folder.fileCount} files
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data scopes */}
      <div className="border-t border-taupe-2 pt-3 dark:border-surface-3">
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Data Scopes
        </span>
        <div className="mt-1.5 space-y-0.5">
          <GoogleDataScopes />
        </div>
      </div>

      {/* Disconnect link */}
      <button
        type="button"
        className={cn(
          'mt-1 cursor-pointer font-mono text-[0.625rem] text-taupe-3 hover:text-red',
          'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
        )}
      >
        Disconnect Google Drive
      </button>
    </div>
  );
}

/** Microsoft data scope toggles — Outlook Mail, Outlook Calendar, SharePoint Files */
function MicrosoftDataScopes() {
  const [outlookMail, setOutlookMail] = useState(true);
  const [outlookCalendar, setOutlookCalendar] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Mail className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Outlook Mail
          </span>
        </div>
        <Switch
          size="sm"
          checked={outlookMail}
          onCheckedChange={(checked: boolean) => setOutlookMail(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Calendar className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Outlook Calendar
          </span>
        </div>
        <Switch
          size="sm"
          checked={outlookCalendar}
          onCheckedChange={(checked: boolean) => setOutlookCalendar(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            SharePoint Files
          </span>
        </div>
        <span className="font-mono text-[0.625rem] italic text-taupe-3">
          Managed above
        </span>
      </div>
    </>
  );
}

/** Google data scope toggles — Gmail, Google Calendar, Drive Files */
function GoogleDataScopes() {
  const [gmail, setGmail] = useState(true);
  const [googleCalendar, setGoogleCalendar] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Mail className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Gmail
          </span>
        </div>
        <Switch
          size="sm"
          checked={gmail}
          onCheckedChange={(checked: boolean) => setGmail(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Calendar className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Google Calendar
          </span>
        </div>
        <Switch
          size="sm"
          checked={googleCalendar}
          onCheckedChange={(checked: boolean) => setGoogleCalendar(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Drive Files
          </span>
        </div>
        <span className="font-mono text-[0.625rem] italic text-taupe-3">
          Managed above
        </span>
      </div>
    </>
  );
}

/** Expandable provider card with connection status and content */
function ProviderCard({
  provider,
  subtitle,
  children,
}: {
  provider: CloudProvider;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-slot="provider-card"
      className="rounded-[var(--r-md)] border border-taupe-2 bg-off-white p-4 dark:border-surface-3 dark:bg-surface-2"
    >
      {/* Card header */}
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-3 text-left',
          'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <ProviderIcon provider={provider} />
        <div className="min-w-0 flex-1">
          <span className="font-mono text-sm font-bold text-taupe-5 dark:text-taupe-1">
            {provider.name}
          </span>
          <p className="font-mono text-[0.625rem] text-taupe-3">
            {subtitle}
          </p>
        </div>
        {/* Connected badge */}
        {provider.status === 'connected' && (
          <span className="shrink-0 rounded-[var(--r-pill)] border border-green-500/30 bg-[rgba(var(--green-rgb,34,197,94),0.1)] px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-green-600 dark:border-green-400/30 dark:bg-[rgba(34,197,94,0.1)] dark:text-green-400">
            Connected
          </span>
        )}
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-taupe-3" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-taupe-3" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && children}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

/** Cloud storage admin settings dialog for managing provider connections */
export function CloudStorageSettings({
  open,
  onOpenChange,
}: CloudStorageSettingsProps) {
  const [settings, setSettings] = useState<CloudStorageSettingsType | null>(null);

  useEffect(() => {
    if (open) {
      getCloudStorageSettings().then(setSettings);
    }
  }, [open]);

  // Build subtitle strings from settings
  const spSubtitle = settings?.sharepoint
    ? `${settings.sharepoint.sites.length} sites · ${settings.sharepoint.sites.reduce((acc, s) => acc + s.libraries.filter((l) => l.enabled).length, 0)} libraries shared`
    : '';
  const gdSubtitle = settings?.googleDrive
    ? `${settings.googleDrive.sharedFolders.length} shared folders · ${settings.googleDrive.sharedFolders.reduce((acc, f) => acc + f.fileCount, 0)} files`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Cloud Storage
            <span className="rounded-[var(--r-sm)] bg-[rgba(var(--violet-3-rgb),0.08)] px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-violet-3">
              Admin
            </span>
          </DialogTitle>
          <DialogDescription>
            Control which cloud drives your organization shares with Cosimo.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {settings?.providers.map((provider) => {
            if (provider.type === 'microsoft' && settings.sharepoint) {
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  subtitle={spSubtitle}
                >
                  <SharePointContent sites={settings.sharepoint.sites} />
                </ProviderCard>
              );
            }
            if (provider.type === 'google' && settings.googleDrive) {
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  subtitle={gdSubtitle}
                >
                  <GoogleDriveContent
                    serviceAccount={settings.googleDrive.serviceAccount}
                    sharedFolders={settings.googleDrive.sharedFolders}
                  />
                </ProviderCard>
              );
            }
            return null;
          })}
        </div>

        {/* Connect a service link */}
        <button
          type="button"
          className={cn(
            'flex items-center gap-1 cursor-pointer font-mono text-[0.6875rem] text-violet-3 hover:text-violet-4',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Connect a service
        </button>
      </DialogContent>
    </Dialog>
  );
}
