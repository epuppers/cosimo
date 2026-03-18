import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useThemeStore } from '~/stores/theme-store';
import { useChatStore } from '~/stores/chat-store';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from '~/components/ui/collapsible';

// ============================================
// ERABOR STREAMING DATA
// ============================================

/** A grouped reasoning step with title and detailed thoughts */
interface ReasoningStep {
  title: string;
  thoughts: string[];
  duration?: string;
}

/** Reasoning steps grouped into logical phases */
const REASONING_GROUPS: ReasoningStep[] = [
  {
    title: 'Locating document',
    thoughts: [
      'Locating Erabor Partners LP Agreement (executed Dec 2024)...',
    ],
    duration: '0.3s',
  },
  {
    title: 'Extracting economic terms',
    thoughts: [
      'Extracting Section 4 — Management Fee & Carry provisions',
      'GP commitment: 3.5% of total commitments ($7.0M on $200M fund) — <span class="reasoning-flag">above our standard 2.5%</span>',
      'Fee structure: 2.0% on committed during investment period, step-down to 1.5% on invested capital post-Year 5',
    ],
    duration: '1.1s',
  },
  {
    title: 'Scanning side letters',
    thoughts: [
      'Scanning for side letter provisions...',
      'Found 3 side letters — Northgate Capital, Westbridge RE, and one redacted entity',
      'Northgate side letter grants MFN on fees + co-invest priority — <span class="reasoning-flag">non-standard</span>',
    ],
    duration: '0.8s',
  },
  {
    title: 'Cross-referencing templates',
    thoughts: [
      'Cross-referencing clawback language against Fund III template...',
      'Clawback: interim clawback with annual true-up, 100% GP obligation — matches standard',
      'Key person clause names Marcus Tilden + one other — <span class="reasoning-flag">single-trigger suspension</span>, not our standard dual-trigger',
    ],
    duration: '0.9s',
  },
  {
    title: 'Compiling summary',
    thoughts: [
      'Compiling summary with flagged deviations...',
    ],
    duration: '0.4s',
  },
];

interface SectionKV {
  key: string;
  value: string;
  flag?: boolean;
}

interface StreamSection {
  title: string;
  rows: SectionKV[];
}

type StreamBlock = {
  type: 'text';
  html: string;
} | {
  type: 'section';
  section: StreamSection;
};

/** The 10 stream blocks that make up the Erabor reply */
const STREAM_BLOCKS: StreamBlock[] = [
  {
    type: 'text',
    html: '<p>I\'ve pulled the executed Erabor Partners LP Agreement dated December 14, 2024 and cross-referenced all economic terms against our Fund III standard template. The agreement covers a $200M closed-end vehicle with a 7-year investment period and two 1-year extensions at GP discretion, subject to advisory committee consent.</p>',
  },
  {
    type: 'text',
    html: '<p>Overall, the structure is largely in line with institutional norms for a fund of this size and strategy. However, I\'ve identified three provisions that deviate from our standard terms in ways that could create friction or optionality issues down the road. I\'ve detailed each section below with flagged items highlighted.</p>',
  },
  {
    type: 'section',
    section: {
      title: 'GP Commitment',
      rows: [
        { key: 'Amount', value: '$7.0M (3.5% of $200M)' },
        { key: 'Fund III Standard', value: '2.5% ($5.0M equivalent)' },
        { key: 'Funding Schedule', value: 'Pro rata with LP capital calls' },
        { key: 'Source', value: 'Cash only — no management fee waiver notes permitted' },
        { key: 'Status', value: 'Above standard — favorable to LPs, signals strong GP alignment', flag: true },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Fee Structure',
      rows: [
        { key: 'Investment Period', value: '2.0% on committed capital' },
        { key: 'Post-Year 5', value: '1.5% on invested capital (step-down)' },
        { key: 'Organizational Exp', value: 'Capped at $1.5M, borne by fund' },
        { key: 'Offset Provisions', value: '100% of transaction, monitoring, and break-up fees offset against management fee' },
        { key: 'Fee Commencement', value: 'First close date (not final close)' },
        { key: 'Status', value: 'Standard — matches Fund III template' },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Carried Interest & Waterfall',
      rows: [
        { key: 'Carry Rate', value: '20% above 8% preferred return' },
        { key: 'Preferred Return', value: '8% compounded annually, net of fees and expenses' },
        { key: 'Catch-up', value: '50/50 GP/LP split until 20% GP share achieved' },
        { key: 'Waterfall Type', value: 'European (whole-fund) — carry calculated on aggregate, not deal-by-deal' },
        { key: 'Crystallization', value: 'Upon each distribution event, subject to clawback' },
        { key: 'Status', value: 'Standard' },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Clawback Provisions',
      rows: [
        { key: 'Type', value: 'Interim clawback with annual true-up' },
        { key: 'GP Obligation', value: '100% of excess carry distributions' },
        { key: 'Escrow', value: '30% of carried interest held for 24 months post-final distribution' },
        { key: 'GP Guarantee', value: 'Joint and several personal guarantee from named GPs' },
        { key: 'Tax Adjustment', value: 'Net of taxes actually paid — GP provides annual tax cert' },
        { key: 'Status', value: 'Standard — matches Fund III' },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Side Letter Concessions',
      rows: [
        { key: 'Northgate Capital', value: 'MFN on fees + co-invest priority on deals >$50M', flag: true },
        { key: 'Westbridge RE', value: 'Enhanced quarterly reporting + advisory committee seat' },
        { key: 'Redacted Entity', value: 'Fee waiver on first $10M committed — unusual, requires follow-up with counsel', flag: true },
        { key: 'MFN Sunset', value: 'Northgate MFN applies only to LPs committing >$25M at first close' },
        { key: 'Disclosure', value: 'Redacted entity side letter not disclosed to advisory committee — potential compliance issue', flag: true },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Key Person Clause',
      rows: [
        { key: 'Named Persons', value: 'Marcus Tilden (Managing Partner), David Chen (CIO)' },
        { key: 'Trigger', value: 'Single-trigger suspension — if either departs, investment period suspends automatically', flag: true },
        { key: 'Fund III Standard', value: 'Dual-trigger (both must depart)' },
        { key: 'Cure Period', value: '90 days to appoint replacement approved by advisory committee' },
        { key: 'Devotion Clause', value: 'Each key person must devote "substantially all" business time — no defined threshold' },
        { key: 'LP Vote to Resume', value: '66.7% in interest required to lift suspension' },
      ],
    },
  },
  {
    type: 'section',
    section: {
      title: 'Reporting & Governance',
      rows: [
        { key: 'Auditor', value: 'Ernst & Young LLP' },
        { key: 'Reporting Frequency', value: 'Quarterly NAV + annual audited financials within 120 days of fiscal year-end' },
        { key: 'Advisory Committee', value: '5 members, LP-appointed, conflict approval + valuation oversight' },
        { key: 'LP Transfer Rights', value: 'Subject to GP consent (not to be unreasonably withheld), minimum $5M transfer' },
        { key: 'LPAC Meeting Freq', value: 'Semi-annual in-person, quarterly written updates' },
      ],
    },
  },
  {
    type: 'text',
    html: '<p><strong>Summary for Thursday\'s call:</strong> Three items to raise with Marcus.</p><p>First, the single-trigger key person clause is materially more aggressive than our standard dual-trigger structure. This gives LPs significant optionality — if David Chen were to leave, LPs could effectively put the fund into suspension regardless of Marcus\'s continued involvement. This is worth discussing whether it was an intentional concession to anchor LPs or an oversight from prior fund documents that carried forward.</p><p>Second, the Northgate MFN plus co-invest priority side letter could create allocation tension on larger deals. If Northgate has priority on anything above $50M and their MFN triggers fee parity with smaller commitments, it narrows the GP\'s flexibility on deal allocation and economics. Worth understanding if this was a condition of their anchor commitment.</p><p>Third, the redacted entity fee waiver needs immediate disclosure and counsel review. An undisclosed side letter with a fee waiver is a compliance risk under the fund\'s own governance framework — the advisory committee should have been notified. I\'d recommend raising this directly with Marcus and getting confirmation that outside counsel has signed off.</p><p>Everything else — carry structure, clawback, fee step-down, reporting cadence — is clean and within Fund III norms. The GP commitment at 3.5% is actually above standard, which is a positive signal for LP alignment.</p><p>Want me to draft talking points for the call, or generate a redline comparison against the Fund III template?</p>',
  },
];

// ============================================
// ANIMATION PHASES
// ============================================

type Phase = 'thinking' | 'reasoning' | 'streaming' | 'done';

// ============================================
// TOKENIZER
// ============================================

interface HTMLToken {
  type: 'tag' | 'char';
  value: string;
}

/** Tokenizes HTML into tags (inserted instantly) and characters (typed one at a time) */
function tokenizeHTML(html: string): HTMLToken[] {
  const tokens: HTMLToken[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end !== -1) {
        tokens.push({ type: 'tag', value: html.slice(i, end + 1) });
        i = end + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else if (html[i] === '&') {
      const semi = html.indexOf(';', i);
      if (semi !== -1 && semi - i < 10) {
        tokens.push({ type: 'char', value: html.slice(i, semi + 1) });
        i = semi + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else {
      tokens.push({ type: 'char', value: html[i] });
      i++;
    }
  }
  return tokens;
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Animated thinking cubes — 3 small squares that bounce and rotate */
export function ThinkingCubes({ fading }: { fading: boolean }) {
  const CUBE_DELAYS = ['', '[animation-delay:0.2s]', '[animation-delay:0.4s]'];
  return (
    <div className={cn(
      'flex items-center gap-1.5 py-1',
      fading && 'transition-opacity duration-500 ease-in-out opacity-0'
    )}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 bg-violet-2 border border-t-violet-1 border-l-violet-1 border-b-violet-4 border-r-violet-4 animate-[cube-wave_1.8s_ease-in-out_infinite]',
            CUBE_DELAYS[i]
          )}
        />
      ))}
    </div>
  );
}

/** Reasoning panel — shows grouped, collapsible reasoning steps */
function ReasoningPanel({
  visibleGroups,
  activeGroup,
  visibleThoughts,
  openGroups,
  onToggleGroup,
  isThinking,
}: {
  visibleGroups: number;
  activeGroup: number;
  visibleThoughts: number;
  openGroups: Set<number>;
  onToggleGroup: (idx: number) => void;
  isThinking: boolean;
}) {
  return (
    <div className="my-1 ml-[30px] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 bg-off-white overflow-hidden rounded-[var(--r-md)] dark:border-taupe-2 dark:bg-surface-1">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-taupe-5 border-b border-taupe-4 rounded-t-[var(--r-sm)] dark:bg-surface-2">
        <span className="text-[0.625rem] text-violet-2">◆</span>
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 tracking-[0.05em] dark:text-taupe-4">
          {isThinking ? 'Cosimo is thinking...' : `Reasoning · ${REASONING_GROUPS.length} steps`}
        </span>
        {isThinking && (
          <div className="w-1.5 h-1.5 bg-violet-2 border border-violet-3 animate-[reason-pulse_1.5s_ease-in-out_infinite] ml-auto" />
        )}
      </div>

      {/* Stepped reasoning groups */}
      <div className="py-1">
        {REASONING_GROUPS.slice(0, visibleGroups).map((group, groupIdx) => {
          const isOpen = openGroups.has(groupIdx);
          const isActive = groupIdx === activeGroup && isThinking;
          const thoughtCount = isActive ? visibleThoughts : group.thoughts.length;

          return (
            <Collapsible
              key={groupIdx}
              open={isOpen}
              onOpenChange={() => onToggleGroup(groupIdx)}
            >
              <CollapsibleTrigger
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-left cursor-pointer transition-colors duration-100',
                  'border-b border-taupe-1 last:border-b-0 dark:border-surface-3',
                  'hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)]',
                  'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]'
                )}
              >
                {/* Timeline dot */}
                <div className={cn(
                  'w-1.5 h-1.5 shrink-0 border',
                  isActive
                    ? 'bg-violet-2 border-violet-3 animate-[reason-pulse_1.5s_ease-in-out_infinite]'
                    : 'bg-violet-2 border-violet-3 opacity-60'
                )} />

                {/* Step number + title */}
                <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 tracking-[0.03em] dark:text-taupe-4">
                  {groupIdx + 1}. {group.title}
                </span>

                {/* Duration badge */}
                {group.duration && !isActive && (
                  <span className="font-mono text-[0.5625rem] text-taupe-3 ml-auto mr-1">
                    {group.duration}
                  </span>
                )}

                {/* Chevron */}
                <ChevronDown className={cn(
                  'h-3 w-3 shrink-0 text-taupe-3 transition-transform duration-200',
                  isOpen && 'rotate-180',
                  !group.duration || isActive ? 'ml-auto' : ''
                )} />
              </CollapsibleTrigger>

              <CollapsiblePanel className="data-[open]:animate-[collapsible-open_200ms_ease-out] data-[closed]:animate-[collapsible-closed_200ms_ease-in]">
                <div className="px-3 pb-2 pt-0.5 ml-[22px] border-l-2 border-l-[rgba(var(--violet-3-rgb),0.2)]">
                  {group.thoughts.slice(0, thoughtCount).map((thought, thoughtIdx) => (
                    <div
                      key={thoughtIdx}
                      className={cn(
                        'font-sans text-[0.6875rem] leading-[1.6] text-taupe-4 py-[3px]',
                        'transition-all duration-300 ease-in-out',
                        thoughtIdx < thoughtCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                      )}
                      dangerouslySetInnerHTML={{ __html: thought }}
                    />
                  ))}
                </div>
              </CollapsiblePanel>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

/** Renders a structured section block (title + key-value rows) */
function SectionBlock({ section, visibleRows, showCursor }: { section: StreamSection; visibleRows: number; showCursor: boolean }) {
  return (
    <div className="my-3 ml-[30px] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 bg-white rounded-[var(--r-md)] dark:border-taupe-2">
      <div className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-taupe-1 px-3 py-1.5 bg-taupe-5 border-b border-taupe-4 rounded-t-[var(--r-sm)] dark:bg-surface-2 dark:text-taupe-4">
        {section.title}
        {showCursor && visibleRows === 0 && <StreamCursor />}
      </div>
      <div className="py-1">
        {section.rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              'flex justify-between items-baseline gap-4 px-3 py-[5px] border-b border-taupe-1 last:border-b-0 dark:border-surface-3',
              'transition-all duration-200',
              i < visibleRows ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}
          >
            <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em] shrink-0">{row.key}</span>
            <span className={cn(
              'font-mono text-xs font-semibold text-taupe-5 text-right',
              row.flag && 'text-amber'
            )}>
              {row.value}
            </span>
            {showCursor && i === visibleRows - 1 && <StreamCursor />}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Blinking cursor shown during streaming */
function StreamCursor() {
  return <span className="inline-block w-0.5 h-3.5 bg-violet-3 ml-px align-text-bottom animate-[blink-cursor_0.6s_step-end_infinite]" />;
}

/** Renders a text block with typewriter effect */
function TextBlockStreaming({ html, onDone, showCursor }: { html: string; onDone: () => void; showCursor: boolean }) {
  const [displayHTML, setDisplayHTML] = useState('');
  const [isDone, setIsDone] = useState(false);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayHTML(html);
      setIsDone(true);
      onDone();
      return;
    }

    const tokens = tokenizeHTML(html);
    let tokenIdx = 0;
    let built = '';

    timerRef.current = setInterval(() => {
      let charsAdded = 0;
      while (tokenIdx < tokens.length && charsAdded < 2) {
        const token = tokens[tokenIdx];
        built += token.value;
        tokenIdx++;
        if (token.type === 'char') charsAdded++;
      }
      setDisplayHTML(built);
      if (tokenIdx >= tokens.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsDone(true);
        onDone();
      }
    }, 16);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [html, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="msg-body pl-[30px] font-sans text-sm leading-[1.6] text-taupe-5 break-words">
      <span dangerouslySetInnerHTML={{ __html: displayHTML }} />
      {showCursor && !isDone && <StreamCursor />}
    </div>
  );
}

/** Renders a section block with rows appearing one by one */
function SectionBlockStreaming({ section, onDone, showCursor }: { section: StreamSection; onDone: () => void; showCursor: boolean }) {
  const [visibleRows, setVisibleRows] = useState(0);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleRows(section.rows.length);
      onDone();
      return;
    }

    // Show rows one at a time with 180ms delay
    section.rows.forEach((_, i) => {
      const timer = setTimeout(() => {
        setVisibleRows(i + 1);
        if (i === section.rows.length - 1) {
          onDone();
        }
      }, 200 + i * 180);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [section, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  return <SectionBlock section={section} visibleRows={visibleRows} showCursor={showCursor} />;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Erabor streaming animation component.
 * Recreates the multi-phase streaming demo:
 *   Phase 1: Thinking cubes (2s)
 *   Phase 2: Reasoning steps appear one by one (11 × 550ms)
 *   Phase 3: Reply streams in block by block with typewriter effect
 *
 * Respects reduced motion — shows all content instantly.
 */
export function MessageStream() {
  const [phase, setPhase] = useState<Phase>('thinking');
  const [thinkingFading, setThinkingFading] = useState(false);
  const [showLatency, setShowLatency] = useState(false);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [streamDone, setStreamDone] = useState(false);

  // Reasoning step state
  const [visibleGroups, setVisibleGroups] = useState(0);
  const [activeGroup, setActiveGroup] = useState(0);
  const [visibleThoughts, setVisibleThoughts] = useState(0);
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());

  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** Schedule a timeout and track it for cleanup */
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  /** Auto-scroll to bottom if near bottom */
  const softScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  /** Toggle a reasoning group open/closed (user interaction) */
  const handleToggleGroup = useCallback((idx: number) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  // Run the animation sequence on mount
  useEffect(() => {
    setStreaming(true);

    // Reduced motion: skip to done
    if (reducedMotion) {
      setPhase('done');
      setShowLatency(true);
      setVisibleGroups(REASONING_GROUPS.length);
      setVisibleBlocks(STREAM_BLOCKS.length);
      setActiveBlockIdx(STREAM_BLOCKS.length);
      setStreamDone(true);
      setStreaming(false);
      return;
    }

    // Phase 1: Thinking cubes for 2s, then fade
    schedule(() => {
      setThinkingFading(true);
      schedule(() => {
        setPhase('reasoning');

        // Phase 2: Animate reasoning groups one by one
        let cumulativeDelay = 0;

        REASONING_GROUPS.forEach((group, groupIdx) => {
          // Show this group and expand it
          schedule(() => {
            setVisibleGroups(groupIdx + 1);
            setActiveGroup(groupIdx);
            setVisibleThoughts(0);
            setOpenGroups(new Set([groupIdx]));
            softScroll();
          }, cumulativeDelay);

          // Show each thought within the group
          group.thoughts.forEach((_, thoughtIdx) => {
            cumulativeDelay += 400;
            schedule(() => {
              setVisibleThoughts(thoughtIdx + 1);
              softScroll();
            }, cumulativeDelay);
          });

          // Pause after group completes
          cumulativeDelay += 300;
        });

        // After all groups, collapse all and transition to streaming
        schedule(() => {
          setOpenGroups(new Set());
          setShowLatency(true);
          setPhase('streaming');

          schedule(() => {
            setVisibleBlocks(1);
            setActiveBlockIdx(0);
            softScroll();
          }, 500);
        }, cumulativeDelay + 600);
      }, 500);
    }, 2000);

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      setStreaming(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called when a streaming block finishes — advance to next block */
  const handleBlockDone = useCallback(() => {
    setActiveBlockIdx((prev) => {
      const next = prev + 1;
      if (next >= STREAM_BLOCKS.length) {
        setStreamDone(true);
        setStreaming(false);
        return prev;
      }
      // Small delay before next block
      schedule(() => {
        setVisibleBlocks(next + 1);
        setActiveBlockIdx(next);
        softScroll();
      }, 120);
      return prev;
    });
  }, [schedule, softScroll, setStreaming]);

  return (
    <div className="group mb-4 relative">
      <div>
        {/* Header: Cosimo avatar + name + timestamp + latency + model badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-[22px] h-[22px] flex items-center justify-center font-mono text-[0.6875rem] font-bold shrink-0 rounded-r-md bg-violet-3 text-white border border-violet-2 border-r-violet-5 border-b-violet-5">◆</div>
          <span className="font-mono text-xs font-semibold text-taupe-5">Cosimo</span>
          <span className="font-mono text-xs text-taupe-3">3:30 PM</span>
          {showLatency && (
            <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-off-white border border-taupe-2 px-1.5 py-px rounded-r-md dark:bg-surface-2 dark:border-taupe-3">4.2s</span>
          )}
          <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-off-white border border-taupe-2 px-1.5 py-px rounded-r-md dark:bg-surface-2 dark:border-taupe-3">Expert</span>
        </div>

        {/* Phase 1: Thinking cubes */}
        {phase === 'thinking' && (
          <div className="pl-[30px]">
            <ThinkingCubes fading={thinkingFading} />
          </div>
        )}

        {/* Phase 2+: Reasoning panel (persists through streaming and done) */}
        {(phase === 'reasoning' || phase === 'streaming' || phase === 'done') && (
          <ReasoningPanel
            visibleGroups={visibleGroups}
            activeGroup={activeGroup}
            visibleThoughts={visibleThoughts}
            openGroups={openGroups}
            onToggleGroup={handleToggleGroup}
            isThinking={phase === 'reasoning'}
          />
        )}

        {/* Phase 3 / Done: Streamed reply */}
        {(phase === 'streaming' || phase === 'done') && (
          <div>
            {STREAM_BLOCKS.slice(0, visibleBlocks).map((block, i) => {
              const isActive = i === activeBlockIdx && !streamDone;

              if (block.type === 'text') {
                if (isActive) {
                  return (
                    <TextBlockStreaming
                      key={i}
                      html={block.html}
                      onDone={handleBlockDone}
                      showCursor={true}
                    />
                  );
                }
                // Already streamed — show full content
                return (
                  <div
                    key={i}
                    className="msg-body pl-[30px] font-sans text-sm leading-[1.6] text-taupe-5 break-words"
                    dangerouslySetInnerHTML={{ __html: block.html }}
                  />
                );
              }

              if (block.type === 'section') {
                if (isActive) {
                  return (
                    <SectionBlockStreaming
                      key={i}
                      section={block.section}
                      onDone={handleBlockDone}
                      showCursor={true}
                    />
                  );
                }
                // Already streamed — show full section
                return (
                  <SectionBlock
                    key={i}
                    section={block.section}
                    visibleRows={block.section.rows.length}
                    showCursor={false}
                  />
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Feedback buttons shown after streaming is done */}
        {streamDone && (
          <div className="flex gap-1 mt-1.5 pl-[30px]">
            <button className="feedback-btn w-6 h-6 flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 hover:border-taupe-2 hover:text-green hover:bg-[rgba(var(--green-rgb),0.08)] hover:border-green [&_svg]:w-3 [&_svg]:h-3" title="Good response" aria-label="Good response">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              <span className="a11y-label">Good</span>
            </button>
            <button className="feedback-btn w-6 h-6 flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 hover:border-taupe-2 hover:text-red hover:bg-[rgba(var(--red-rgb),0.08)] hover:border-red [&_svg]:w-3 [&_svg]:h-3" title="Poor response" aria-label="Poor response">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
              <span className="a11y-label">Bad</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// THINKING-ONLY COMPONENT (Q4LP etc.)
// ============================================

/**
 * Standalone "Cosimo is thinking" message block.
 * Shows the AI message header + perpetual thinking cubes animation.
 * Used for threads where Cosimo hasn't responded yet.
 */
export function MessageThinking({ timestamp = '11:20 AM', model = 'Assistant' }: { timestamp?: string; model?: string }) {
  return (
    <div className="group mb-4 relative">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-[22px] h-[22px] flex items-center justify-center font-mono text-[0.6875rem] font-bold shrink-0 rounded-r-md bg-violet-3 text-white border border-violet-2 border-r-violet-5 border-b-violet-5">◆</div>
          <span className="font-mono text-xs font-semibold text-taupe-5">Cosimo</span>
          <span className="font-mono text-xs text-taupe-3">{timestamp}</span>
          <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-off-white border border-taupe-2 px-1.5 py-px rounded-r-md dark:bg-surface-2 dark:border-taupe-3">{model}</span>
        </div>
        <div className="pl-[30px]">
          <ThinkingCubes fading={false} />
        </div>
      </div>
    </div>
  );
}
