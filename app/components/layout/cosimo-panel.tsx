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
    <div className={cn(
      'cosimo-panel-msg rounded-[var(--r-md)] px-3 py-2.5 text-[13px] leading-[1.5] mb-3',
      isAI
        ? 'cosimo-panel-msg-ai bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.1)] border border-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.18)] text-[var(--taupe-5)] dark:text-[var(--taupe-1)]'
        : 'cosimo-panel-msg-user bg-[rgba(var(--berry-3-rgb),0.05)] dark:bg-[rgba(var(--berry-3-rgb),0.1)] border border-[rgba(var(--berry-3-rgb),0.12)] dark:border-[rgba(var(--berry-3-rgb),0.15)] text-[var(--taupe-5)] dark:text-[var(--taupe-1)] text-right'
    )}>
      <div className={cn('mb-1.5 flex items-center gap-1.5', !isAI && 'justify-end')}>
        {isAI && (
          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--violet-3)] text-white">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        )}
        <span className="font-[family-name:var(--mono)] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--taupe-3)]">
          {isAI ? 'Cosimo' : 'You'}
        </span>
      </div>
      <p className="whitespace-pre-wrap font-[family-name:var(--sans)]">{message.content}</p>
    </div>
  );
}

// ======== ThinkingIndicator ========

function ThinkingIndicator() {
  return (
    <div className="flex gap-1 px-3 py-2">
      <span className="cosimo-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--violet-3)]" />
      <span className="cosimo-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--violet-3)] [animation-delay:0.2s]" />
      <span className="cosimo-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--violet-3)] [animation-delay:0.4s]" />
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
  const [isThinking, setIsThinking] = useState(false);
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
      setIsThinking(false);
      // Focus input after panel animation
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, context]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

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
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      setIsThinking(false);
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
        className={cn(
          'cosimo-panel-sheet flex w-[420px] flex-col gap-0 p-0 sm:max-w-[420px]',
          'bg-[var(--off-white)] dark:bg-[var(--surface-1)]',
          'border-l-2 border-solid',
          'border-l-[var(--taupe-2)] dark:border-l-[var(--surface-3)]',
          'shadow-[-4px_0_20px_rgba(0,0,0,0.15)] dark:shadow-[-4px_0_20px_rgba(0,0,0,0.5)]',
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex min-h-[38px] items-center justify-between gap-2 px-3 py-2 shrink-0',
          'bg-[var(--white)] dark:bg-[var(--surface-1)]',
          'border-b border-[var(--taupe-2)] dark:border-[var(--surface-3)]',
        )}>
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Sparkles className="h-4 w-4 shrink-0 text-[var(--violet-3)]" />
            <span className="font-[family-name:var(--mono)] text-[11px] font-semibold text-[var(--taupe-5)] dark:text-[var(--taupe-4)] whitespace-nowrap overflow-hidden text-ellipsis">
              Ask Cosimo
            </span>
          </div>
          <button
            onClick={closePanel}
            aria-label="Close Cosimo panel"
            className={cn(
              'cosimo-close-btn shrink-0 px-2 py-0.5',
              'font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-3)]',
              'bg-transparent border border-[var(--taupe-2)] dark:border-[var(--surface-3)] rounded-[var(--r-md)]',
              'cursor-pointer',
              'hover:text-[var(--taupe-5)] hover:border-[var(--taupe-3)]',
              'dark:hover:text-[var(--taupe-1)] dark:hover:border-[var(--taupe-2)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-2',
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Context chip */}
        {context && (
          <div className="border-b border-[var(--taupe-2)] dark:border-[var(--surface-3)] px-3 py-2">
            <Badge
              variant="secondary"
              className="gap-1.5 font-[family-name:var(--mono)] text-[10px] bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)] text-[var(--violet-3)] border border-[rgba(var(--violet-3-rgb),0.15)]"
            >
              {ContextIcon && <ContextIcon className="h-3 w-3" />}
              {context.text}
            </Badge>
          </div>
        )}

        {/* Chat area */}
        <div
          ref={chatRef}
          className="flex flex-1 flex-col overflow-y-auto p-3.5"
        >
          {messages.map((msg) => (
            <PanelMessageBubble key={msg.id} message={msg} />
          ))}
          {isThinking && <ThinkingIndicator />}
        </div>

        {/* Input area */}
        <div className="border-t border-[var(--taupe-2)] dark:border-[var(--surface-3)] px-3.5 py-2.5 bg-[var(--white)] dark:bg-[var(--surface-1)]">
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
                'min-h-[32px] max-h-[120px] flex-1 resize-none',
                'rounded-[var(--r-md)] bevel-inset',
                'bg-[var(--off-white)] dark:bg-[var(--surface-0)]',
                'px-2.5 py-[7px]',
                'font-[family-name:var(--mono)] text-[12px] leading-[1.5]',
                'text-[var(--taupe-5)] dark:text-[var(--taupe-1)]',
                'placeholder:text-[var(--taupe-3)]',
                'focus:outline-none focus:border-[var(--violet-3)]',
                'overflow-y-auto whitespace-pre-wrap break-words',
              )}
            />
            <Button
              size="icon-sm"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className={cn(
                'shrink-0 h-[28px] w-[28px] rounded-[var(--r-md)]',
                'bg-[var(--violet-3)] text-white border-0',
                'hover:bg-[var(--violet-4)]',
                'disabled:bg-[var(--taupe-2)] disabled:text-[var(--taupe-3)] disabled:opacity-60',
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
