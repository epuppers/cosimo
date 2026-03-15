import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, FileText, GitBranch, BookOpen } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
} from '~/components/ui/sheet';
import { Badge } from '~/components/ui/badge';
import { useUIStore, type CosimoContextType } from '~/stores/ui-store';
import { cn } from '~/lib/utils';

// ======== Types ========

interface PanelMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

// ======== Context icon helper ========

const CONTEXT_ICONS: Record<NonNullable<CosimoContextType>, typeof FileText> = {
  template: GitBranch,
  node: FileText,
  lesson: BookOpen,
};

// ======== Welcome messages per context type ========

function getWelcomeMessage(contextType: CosimoContextType, contextText: string | undefined): string {
  if (contextType === 'template' && contextText) {
    return `I'm ready to help you edit the "${contextText}" workflow. What would you like to change?`;
  }
  if (contextType === 'node' && contextText) {
    return `Let's work on the "${contextText}" node. Describe the changes you'd like to make.`;
  }
  if (contextType === 'lesson' && contextText) {
    return `I can help you refine the "${contextText}" lesson. What would you like to adjust?`;
  }
  return "Hi! I'm Cosimo, your AI finance assistant. How can I help you today?";
}

// ======== CosimoPanelMessage ========

/** Renders a single message in the Cosimo panel chat */
function PanelMessageBubble({ message }: { message: PanelMessage }) {
  const isAI = message.role === 'ai';

  return (
    <div className={cn('rounded-md px-3 py-2.5 text-[13px] leading-relaxed', isAI
      ? 'bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.1)] border border-[rgba(var(--violet-3-rgb),0.1)] dark:border-[rgba(var(--violet-3-rgb),0.18)]'
      : 'bg-[rgba(var(--berry-3-rgb),0.05)] dark:bg-[rgba(var(--berry-3-rgb),0.1)] border border-[rgba(var(--berry-3-rgb),0.1)] dark:border-[rgba(var(--berry-3-rgb),0.15)]'
    )}>
      <div className="mb-1 flex items-center gap-1.5">
        {isAI && (
          <span className="flex h-4 w-4 items-center justify-center rounded bg-[var(--violet-3)] text-white">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {isAI ? 'Cosimo' : 'You'}
        </span>
      </div>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

// ======== CosimPanel ========

/** Slide-in Cosimo assistant panel using shadcn Sheet */
export function CosimoPanel() {
  const open = useUIStore((s) => s.cosimoPanelOpen);
  const context = useUIStore((s) => s.cosimoPanelContext);
  const closePanel = useUIStore((s) => s.closeCosimoPanel);

  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Reset messages when panel opens with new context
  useEffect(() => {
    if (open) {
      const welcome: PanelMessage = {
        id: 'welcome',
        role: 'ai',
        content: getWelcomeMessage(context?.type ?? null, context?.text),
      };
      setMessages([welcome]);
      setInputValue('');
      // Focus input after panel animation
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, context]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: PanelMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: PanelMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "I understand your request. In the full version, I'll process this and make the changes. For now, this is a preview of the Cosimo assistant panel.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  }, [inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) closePanel();
  }, [closePanel]);

  const ContextIcon = context?.type ? CONTEXT_ICONS[context.type] : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[400px] flex-col gap-0 p-0 sm:max-w-[400px]"
      >
        {/* Header */}
        <div className="flex min-h-[38px] items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--violet-3)]" />
            <span className="font-mono text-sm font-semibold text-foreground">
              Ask Cosimo
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closePanel}
            aria-label="Close Cosimo panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Context chip */}
        {context && (
          <div className="border-b border-border px-3 py-2">
            <Badge
              variant="secondary"
              className="gap-1.5 font-mono text-xs"
            >
              {ContextIcon && <ContextIcon className="h-3 w-3" />}
              {context.text}
            </Badge>
          </div>
        )}

        {/* Chat area */}
        <div
          ref={chatRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-3.5"
        >
          {messages.map((msg) => (
            <PanelMessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-border px-3 py-2.5">
          <div className="flex items-end gap-1.5">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a change..."
              aria-label="Cosimo message input"
              rows={1}
              className={cn(
                'min-h-[32px] max-h-[120px] flex-1 resize-none rounded-md border border-border bg-background px-2.5 py-1.5',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-1 focus:ring-ring',
              )}
            />
            <Button
              size="icon-sm"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
