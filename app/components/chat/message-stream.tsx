import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { useThemeStore } from '~/stores/theme-store';
import { useChatStore } from '~/stores/chat-store';

// ============================================
// ERABOR STREAMING DATA
// ============================================

/** Reasoning steps shown during the "thinking" phase */
const REASONING_STEPS = [
  'Locating Erabor Partners LP Agreement (executed Dec 2024)...',
  'Extracting Section 4 — Management Fee & Carry provisions',
  'GP commitment: 3.5% of total commitments ($7.0M on $200M fund) — <span class="text-[var(--amber)] font-semibold">above our standard 2.5%</span>',
  'Fee structure: 2.0% on committed during investment period, step-down to 1.5% on invested capital post-Year 5',
  'Scanning for side letter provisions...',
  'Found 3 side letters — Northgate Capital, Westbridge RE, and one redacted entity',
  'Northgate side letter grants MFN on fees + co-invest priority — <span class="text-[var(--amber)] font-semibold">non-standard</span>',
  'Cross-referencing clawback language against Fund III template...',
  'Clawback: interim clawback with annual true-up, 100% GP obligation — matches standard',
  'Key person clause names Marcus Tilden + one other — <span class="text-[var(--amber)] font-semibold">single-trigger suspension</span>, not our standard dual-trigger',
  'Compiling summary with flagged deviations...',
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
function ThinkingCubes({ fading }: { fading: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 py-1 transition-opacity duration-500',
        fading && 'opacity-0'
      )}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full animate-thinking-cube"
          style={{
            background: 'radial-gradient(circle at 35% 35%, var(--violet-2), var(--violet-4))',
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.15)',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Reasoning panel — shows "Cosimo is thinking..." with steps appearing one by one */
function ReasoningPanel({ visibleSteps }: { visibleSteps: number }) {
  return (
    <div className="ml-8 my-1 rounded-[var(--r-md)] border-2 border-[var(--taupe-2)] border-r-[var(--taupe-4)] border-b-[var(--taupe-4)] dark:border-[var(--taupe-2)] bg-[var(--off-white)] dark:bg-[var(--surface-1)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--taupe-5)] dark:bg-[var(--surface-2)] border-b border-[var(--taupe-4)] dark:border-[var(--surface-3)]">
        <span className="text-[10px] text-[var(--violet-2)]">◆</span>
        <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[var(--taupe-1)] dark:text-[var(--taupe-4)] tracking-wider">
          Cosimo is thinking...
        </span>
        <div
          className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--violet-2)] border border-[var(--violet-3)] animate-reasoning-pulse"
        />
      </div>
      {/* Steps */}
      <div className="px-3 py-2 max-h-[300px] overflow-y-auto">
        {REASONING_STEPS.map((step, i) => (
          <div
            key={i}
            className={cn(
              'font-[var(--font-mono)] text-[11px] leading-relaxed text-[var(--taupe-4)] py-[3px] border-b border-[var(--taupe-1)] dark:border-[var(--surface-3)] last:border-b-0',
              'transition-all duration-300',
              i < visibleSteps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}
            dangerouslySetInnerHTML={{ __html: step }}
          />
        ))}
      </div>
    </div>
  );
}

/** Renders a structured section block (title + key-value rows) */
function SectionBlock({ section, visibleRows, showCursor }: { section: StreamSection; visibleRows: number; showCursor: boolean }) {
  return (
    <div className="ml-8 my-3 rounded-[var(--r-md)] border-2 border-[var(--taupe-2)] border-r-[var(--taupe-4)] border-b-[var(--taupe-4)] dark:border-[var(--taupe-2)] bg-[var(--white)] dark:bg-[var(--surface-1)] overflow-hidden">
      <div className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-widest text-[var(--taupe-1)] dark:text-[var(--taupe-4)] px-3 py-1.5 bg-[var(--taupe-5)] dark:bg-[var(--surface-2)] border-b border-[var(--taupe-4)] dark:border-[var(--surface-3)]">
        {section.title}
        {showCursor && visibleRows === 0 && <StreamCursor />}
      </div>
      <div className="py-1">
        {section.rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              'flex justify-between items-baseline gap-4 px-3 py-[5px] border-b border-[var(--taupe-1)] dark:border-[var(--surface-3)] last:border-b-0',
              'transition-all duration-200',
              i < visibleRows ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}
          >
            <span className="font-[var(--font-mono)] text-[11px] text-[var(--taupe-3)] uppercase tracking-wider shrink-0">
              {row.key}
            </span>
            <span className={cn(
              'font-[var(--font-mono)] text-[12px] font-semibold text-right',
              row.flag ? 'text-[var(--amber)]' : 'text-[var(--taupe-5)] dark:text-[var(--taupe-4)]'
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
  return (
    <span className="inline-block w-[2px] h-3.5 bg-[var(--violet-3)] ml-0.5 align-text-bottom animate-stream-cursor" />
  );
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
    <div className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold">
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
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showLatency, setShowLatency] = useState(false);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [streamDone, setStreamDone] = useState(false);

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

  // Run the animation sequence on mount
  useEffect(() => {
    setStreaming(true);

    // Reduced motion: skip to done
    if (reducedMotion) {
      setPhase('done');
      setShowLatency(true);
      setVisibleSteps(REASONING_STEPS.length);
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

        // Phase 2: Reveal reasoning steps one by one (550ms apart)
        REASONING_STEPS.forEach((_, i) => {
          schedule(() => {
            setVisibleSteps(i + 1);
            softScroll();
          }, i * 550);
        });

        // After all steps + 1s pause, collapse reasoning and start streaming
        const totalStepTime = REASONING_STEPS.length * 550 + 1000;
        schedule(() => {
          setShowLatency(true);
          setPhase('streaming');

          schedule(() => {
            setVisibleBlocks(1);
            setActiveBlockIdx(0);
            softScroll();
          }, 500);
        }, totalStepTime);
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
    <div className="mb-4 relative">
      <div>
        {/* Header: Cosimo avatar + name + timestamp + latency + model badge */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] bg-[var(--violet-3)] text-[10px] font-bold text-white border border-[var(--violet-2)] border-b-[var(--violet-5)] border-r-[var(--violet-5)]">
            ◆
          </div>
          <span className="font-[var(--font-sans)] text-sm font-medium text-foreground">
            Cosimo
          </span>
          <span className="text-xs text-muted-foreground">3:30 PM</span>
          {showLatency && (
            <Badge
              variant="outline"
              className="font-[var(--font-mono)] text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground"
            >
              4.2s
            </Badge>
          )}
          <Badge
            variant="outline"
            className="font-[var(--font-mono)] text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground"
          >
            Expert
          </Badge>
        </div>

        {/* Phase 1: Thinking cubes */}
        {phase === 'thinking' && (
          <div className="pl-8">
            <ThinkingCubes fading={thinkingFading} />
          </div>
        )}

        {/* Phase 2: Reasoning panel */}
        {phase === 'reasoning' && (
          <ReasoningPanel visibleSteps={visibleSteps} />
        )}

        {/* Phase 3 / Done: Streamed reply */}
        {(phase === 'streaming' || phase === 'done') && (
          <div className="pl-8">
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
                    className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold"
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
          <div className="pl-8 mt-1.5 flex gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-green-500 hover:bg-green-500/10 dark:hover:text-green-400 dark:hover:bg-green-500/20"
              title="Good response"
              aria-label="Good response"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:bg-red-500/20"
              title="Poor response"
              aria-label="Poor response"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
