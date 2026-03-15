// ============================================
// ICON MAPPING — Lucide React equivalents
// Maps old ICONS keys from js/icons.js to lucide-react components
// ============================================

import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  BookOpen,
  GitFork,
  MessageSquare,
  Settings,
  Gauge,
  Folder,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Monitor,
  Cloud,
  SendHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Square,
  Search,
  User,
  Building2,
  Pencil,
  Sparkles,
  Trash2,
  X,
  ArrowLeft,
  ArrowRight,
  Copy,
  RefreshCw,
  MoreVertical,
  Check,
  RotateCw,
  FolderSearch,
  Clock,
  Terminal,
  Mail,
  Play,
  Link,
} from 'lucide-react';

/**
 * Mapping from original ICONS keys to lucide-react icon components.
 * Used to maintain compatibility with the vanilla prototype's icon system.
 */
export const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  lessons: BookOpen,
  graphs: GitFork,
  chat: MessageSquare,
  workflows: Settings,
  gauge: Gauge,
  folder: Folder,
  export: Download,
  share: Share2,
  thumbUp: ThumbsUp,
  thumbDown: ThumbsDown,
  attach: Paperclip,
  computer: Monitor,
  cloud: Cloud,
  send: SendHorizontal,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  stop: Square,
  search: Search,
  person: User,
  building: Building2,
  edit: Pencil,
  cosimo: Sparkles,
  trash: Trash2,
  trashRed: Trash2,
  close: X,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  copy: Copy,
  regen: RefreshCw,
  dots: MoreVertical,
  checkmark: Check,
  retry: RotateCw,
  folderWatch: FolderSearch,
  schedule: Clock,
  chatCommand: Terminal,
  emailTrigger: Mail,
  manualTrigger: Play,
  webhook: Link,
};

/**
 * Get a lucide-react icon component by its legacy ICONS key name.
 * Returns undefined if the name is not mapped.
 */
export function getIcon(name: string): LucideIcon | undefined {
  return iconMap[name];
}
