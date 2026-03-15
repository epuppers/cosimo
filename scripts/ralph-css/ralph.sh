#!/bin/bash
# Ralph — Autonomous AI agent loop for CSS Restoration
# Usage: ./ralph.sh [max_iterations]
#
# Based on snarktank/ralph with prd.json completion check
# Adapted for Medici CSS restoration pass

set -e

MAX_ITERATIONS=40
TIMEOUT_SECONDS=600  # 10 minutes per iteration
MAX_TURNS=50         # Max agentic tool-call rounds per iteration

if [[ "$1" =~ ^[0-9]+$ ]]; then
  MAX_ITERATIONS="$1"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# macOS-compatible timeout function
run_with_timeout() {
  local timeout=$1
  shift
  "$@" &
  local pid=$!
  ( sleep "$timeout" && echo "" && echo "  ⏰ TIMEOUT: Claude exceeded ${timeout}s — killing this iteration." && kill "$pid" 2>/dev/null ) &
  local watchdog=$!
  wait "$pid" 2>/dev/null
  local ret=$?
  kill "$watchdog" 2>/dev/null 2>&1
  wait "$watchdog" 2>/dev/null 2>&1
  return $ret
}

# ─── Preflight checks ───────────────────────────────────────────────

if ! command -v claude &> /dev/null; then
  echo "Error: Claude Code CLI not found."
  echo "Install it: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: jq not found."
  echo "Install it: brew install jq (macOS) or sudo apt install jq (Linux)"
  exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
  echo "Error: prd.json not found at $PRD_FILE"
  exit 1
fi

if [ ! -f "$PROGRESS_FILE" ]; then
  echo "Error: progress.txt not found at $PROGRESS_FILE"
  echo "Create it before running the loop."
  exit 1
fi

# ─── Branch setup ────────────────────────────────────────────────────

cd "$PROJECT_DIR"

BRANCH_NAME=$(jq -r '.branchName' "$PRD_FILE")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  echo "Switching to branch: $BRANCH_NAME"
  git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"
fi

# ─── Completion check ───────────────────────────────────────────────

check_prd_completion() {
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
  if [ "$REMAINING" -eq 0 ]; then
    return 0
  else
    return 1
  fi
}

# ─── Show initial status ────────────────────────────────────────────

TOTAL=$(jq '.userStories | length' "$PRD_FILE")
DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
REMAINING=$((TOTAL - DONE))

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Ralph — CSS Restoration Loop                        ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Project:    MediciNewUX → Restore retro visual design      ║"
echo "║  Branch:     $BRANCH_NAME"
echo "║  Stories:    $DONE/$TOTAL complete ($REMAINING remaining)"
echo "║  Max iter:   $MAX_ITERATIONS"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if check_prd_completion; then
  echo "All stories already complete! Nothing to do."
  exit 0
fi

# ─── Main loop ───────────────────────────────────────────────────────

for (( i=1; i<=MAX_ITERATIONS; i++ )); do
  TOTAL=$(jq '.userStories | length' "$PRD_FILE")
  DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
  REMAINING=$((TOTAL - DONE))
  NEXT_STORY=$(jq -r '[.userStories[] | select(.passes == false)][0] | "\(.id): \(.title)"' "$PRD_FILE")
  NEXT_ID=$(jq -r '[.userStories[] | select(.passes == false)][0] | .id' "$PRD_FILE")

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Iteration $i of $MAX_ITERATIONS"
  echo "  Progress: $DONE/$TOTAL complete ($REMAINING remaining)"
  echo "  Next story: $NEXT_STORY"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Run Claude with the agent instructions (with timeout + max turns)
  run_with_timeout "$TIMEOUT_SECONDS" claude --dangerously-skip-permissions --print --max-turns "$MAX_TURNS" "$(cat $SCRIPT_DIR/CLAUDE.md)" 2>&1 | tee /dev/stderr || true

  echo ""
  echo "  [Iteration $i complete — Task $NEXT_ID]"

  # Check if this specific story was marked as passed
  STORY_STATUS=$(jq -r --arg id "$NEXT_ID" '[.userStories[] | select(.id == $id)][0] | .passes' "$PRD_FILE")
  if [ "$STORY_STATUS" = "false" ]; then
    echo "  ⚠ Story $NEXT_ID was NOT marked as passed. Agent may have been blocked."
    echo "  Check progress.txt for details."
  fi

  if check_prd_completion; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║       CSS Restoration Complete!                             ║"
    echo "║       Finished at iteration $i of $MAX_ITERATIONS"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    echo "Stories completed:"
    jq -r '.userStories[] | "  \(if .passes then "✓" else "✗" end) \(.id): \(.title)"' "$PRD_FILE"
    echo ""
    echo "Review commits:  git log --oneline"
    echo "Dev server:      npm run dev"
    exit 0
  fi

  sleep 2
done

# ─── Max iterations reached ──────────────────────────────────────────

DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
REMAINING=$((TOTAL - DONE))

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Max iterations reached ($MAX_ITERATIONS)"
echo "║  Progress: $DONE/$TOTAL complete ($REMAINING remaining)"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "Completed stories:"
jq -r '.userStories[] | select(.passes == true) | "  ✓ \(.id): \(.title)"' "$PRD_FILE"
echo ""
echo "Remaining stories:"
jq -r '.userStories[] | select(.passes == false) | "  ✗ \(.id): \(.title)"' "$PRD_FILE"
echo ""
echo "To continue: ./ralph.sh $MAX_ITERATIONS"
exit 1
