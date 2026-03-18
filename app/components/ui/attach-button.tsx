import { useState } from 'react';
import { Paperclip, Monitor, Cloud } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

interface AttachButtonProps {
  onAttach?: (type: 'computer' | 'drive') => void;
  disabled?: boolean;
  className?: string;
}

/** Reusable attach-file dropdown button with computer/cloud drive options */
export function AttachButton({ onAttach, disabled = false, className }: AttachButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn('p-[8px_12px] min-h-9 text-xs font-semibold text-taupe-4 bg-taupe-1 border border-t-white border-l-white border-b-taupe-3 border-r-taupe-3 cursor-pointer flex items-center justify-center rounded-[var(--r-md)] hover:bg-berry-1 active:border-t-taupe-3 active:border-l-taupe-3 active:border-b-white active:border-r-white focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-default disabled:pointer-events-none [&_svg]:block dark:bg-surface-2 dark:text-taupe-3 dark:border-taupe-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]', className)}
        disabled={disabled}
        title="Attach file"
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4 [[data-a11y-labels=show]_&]:hidden" />
        <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Attach</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 shadow-[2px_2px_0_rgba(var(--black-rgb),0.08)] rounded-[var(--r-md)] p-[3px] dark:bg-surface-2 dark:border-taupe-2 dark:shadow-[2px_2px_0_rgba(var(--black-rgb),0.3)]">
        <button
          type="button"
          className="flex items-center gap-2 w-full px-2.5 py-1.5 bg-transparent border border-transparent cursor-pointer text-taupe-4 font-[family-name:var(--mono)] text-[0.6875rem] transition-all duration-100 rounded-[var(--r-md)] hover:bg-berry-1 hover:border-berry-2 hover:text-violet-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:border-violet-3 [&_svg]:block [&_svg]:w-4 [&_svg]:h-4"
          onClick={() => { onAttach?.('computer'); setOpen(false); }}
        >
          <Monitor className="h-4 w-4" />
          From computer
        </button>
        <button
          type="button"
          className="flex items-center gap-2 w-full px-2.5 py-1.5 bg-transparent border border-transparent cursor-pointer text-taupe-4 font-[family-name:var(--mono)] text-[0.6875rem] transition-all duration-100 rounded-[var(--r-md)] hover:bg-berry-1 hover:border-berry-2 hover:text-violet-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:border-violet-3 [&_svg]:block [&_svg]:w-4 [&_svg]:h-4"
          onClick={() => { onAttach?.('drive'); setOpen(false); }}
        >
          <Cloud className="h-4 w-4" />
          From cloud
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
