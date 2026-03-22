// Git history visualizer component — renders commit timeline with diff view

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import type { TraceProps, Commit, DiffLine } from './types'
import { escapeHtml } from './shared'
import { themes, themeToVars } from './themes'

const styles = `
.trace-root {
  --trace-bg: #09090b;
  --trace-fg: #e4e4e7;
  --trace-dim: #71717a;
  --trace-human: #22c55e;
  --trace-ai: #a855f7;
  --trace-add: rgba(34, 102, 68, 0.2);
  --trace-remove: rgba(185, 28, 28, 0.2);
  --trace-border: #27272a;
  --trace-border-subtle: #18181b;
  --trace-font-code: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  --trace-line-height: 1.6;
  --trace-radius: 0;
  --trace-duration: 0.18s;
  --trace-stagger: 35ms;
  display: block;
  font-family: var(--trace-font-code);
  background: var(--trace-bg);
  color: var(--trace-fg);
  border-radius: var(--trace-radius);
  overflow: hidden;
  font-size: 13px;
}
.trace-container {
  display: flex;
  height: 100%;
  min-height: 420px;
}
.trace-timeline {
  width: 240px;
  border-right: 1px solid var(--trace-border-subtle);
  padding: 0;
  overflow-y: auto;
  flex-shrink: 0;
  position: relative;
  background: var(--trace-bg);
  /* Performance: isolate layout and paint */
  contain: layout style paint;
  will-change: scroll-position;
}
.trace-progress {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--trace-commit-color, var(--trace-human));
  opacity: 0.6;
  pointer-events: none;
  transition: height 0.25s ease-out;
}
.trace-commit {
  position: relative;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.12s ease;
  border-left: 2px solid transparent;
}
.trace-commit:hover {
  background: rgba(255, 255, 255, 0.02);
}
.trace-commit.active {
  background: rgba(255, 255, 255, 0.03);
  border-left-color: var(--trace-commit-color, var(--trace-human));
}
.trace-commit-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.trace-commit-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--trace-commit-color, var(--trace-human));
  flex-shrink: 0;
}
.trace-commit-message {
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  color: var(--trace-fg);
}
.trace-commit-meta {
  font-size: 11px;
  color: var(--trace-dim);
  margin-top: 4px;
  padding-left: 14px;
}
.trace-badge {
  font-size: 10px;
  color: var(--trace-dim);
  font-weight: 400;
  text-transform: none;
  letter-spacing: -0.02em;
}
.trace-diff {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  font-size: 13px;
  line-height: var(--trace-line-height);
  background: var(--trace-bg);
  /* Performance: isolate layout and paint */
  contain: layout style paint;
  will-change: scroll-position;
}
.trace-diff-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--trace-border-subtle);
  background: var(--trace-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}
.trace-diff-header-message {
  font-size: 13px;
  font-weight: 500;
  color: var(--trace-fg);
  margin-bottom: 4px;
}
.trace-diff-header-meta {
  font-size: 11px;
  color: var(--trace-dim);
}
.trace-line {
  padding: 1px 16px;
  /* 2026: content-visibility for lazy rendering off-screen lines */
  content-visibility: auto;
  contain-intrinsic-size: auto 22px;
  min-height: 22px;
  display: flex;
  align-items: flex-start;
  /* Performance: isolate layout changes */
  contain: layout style paint;
}
.trace-line-prefix {
  width: 16px;
  flex-shrink: 0;
  color: var(--trace-dim);
  opacity: 0.5;
  font-size: 11px;
  user-select: none;
  text-align: center;
}
.trace-line-content {
  flex: 1;
  white-space: pre;
  overflow-x: auto;
}
@keyframes trace-line-in {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.trace-line.add {
  background: var(--trace-add);
  color: #86efac;
}
.trace-line.add .trace-line-prefix {
  color: #22c55e;
}
.trace-line.remove {
  background: var(--trace-remove);
  color: #fca5a5;
}
.trace-line.remove .trace-line-prefix {
  color: #ef4444;
}
.trace-line.ctx {
  opacity: 0.5;
}
.trace-controls {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--trace-border-subtle);
  align-items: center;
  background: var(--trace-bg);
}
.trace-btn {
  background: transparent;
  border: 1px solid var(--trace-border);
  color: var(--trace-fg);
  padding: 4px 10px;
  border-radius: var(--trace-radius);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
}
.trace-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--trace-dim);
}
.trace-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.trace-info {
  font-size: 11px;
  color: var(--trace-dim);
  margin-left: auto;
}
.trace-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--trace-dim);
}
`

// Line prefix lookup - constant outside render
const LINE_PREFIX: Record<string, string> = {
  add: '+',
  remove: '-',
  ctx: ' '
}

const STYLE_ID = 'trace-styles'

// Memoized line component - only re-renders when line content changes
const DiffLine = memo(function DiffLine({
  line,
  prefix
}: {
  line: DiffLine
  prefix: string
}) {
  return (
    <div className={`trace-line ${line.type}`}>
      <span className="trace-line-prefix">{prefix}</span>
      <span
        className="trace-line-content"
        dangerouslySetInnerHTML={{
          __html: escapeHtml(line.content)
        }}
      />
    </div>
  )
})

// Memoized commit item - only re-renders when active state or commit changes
const CommitItem = memo(function CommitItem({
  commit,
  index,
  isActive,
  onClick
}: {
  commit: Commit
  index: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`trace-commit ${isActive ? 'active' : ''}`}
      style={{
        '--trace-commit-color':
          commit.authorType === 'ai' ? 'var(--trace-ai)' : 'var(--trace-human)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="trace-commit-header">
        <span className="trace-commit-dot" aria-hidden="true" />
        <span className="trace-commit-message">
          {commit.message}
        </span>
        <span className={`trace-badge ${commit.authorType}`} aria-label={`Author type: ${commit.authorType}`}>
          {commit.authorType}
        </span>
      </div>
      <div className="trace-commit-meta">
        {commit.author} · {commit.time}
      </div>
    </div>
  )
})

// Memoized diff content - only re-renders when active commit changes
const DiffContent = memo(function DiffContent({
  commit,
  activeIndex,
  linePrefix
}: {
  commit: Commit
  activeIndex: number
  linePrefix: Record<string, string>
}) {
  return (
    <>
      <div className="trace-diff-header">
        <div className="trace-diff-header-message">
          {commit.message}
        </div>
        <div className="trace-diff-header-meta">
          {commit.hash} · {commit.author}
        </div>
      </div>
      {commit.lines.map((line, index) => (
        <DiffLine
          key={`${activeIndex}-${index}-${line.type}`}
          line={line}
          prefix={linePrefix[line.type] || ' '}
        />
      ))}
    </>
  )
})

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = styles
  document.head.appendChild(style)
}

export function Trace({
  commits = [],
  autoPlay = false,
  interval = 2000,
  onCommit,
  className = '',
  theme = 'dark'
}: TraceProps) {
  const themeVars = themeToVars(themes[theme])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const intervalRef = useRef<number | undefined>(undefined)
  const commitsRef = useRef(commits)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    injectStyles()
  }, [])

  useEffect(() => {
    commitsRef.current = commits
    onCommitRef.current = onCommit
  }, [commits, onCommit])

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setActiveIndex(i => {
        const next = i + 1
        const maxIndex = commitsRef.current.length - 1
        if (next >= maxIndex) {
          setIsPlaying(false)
          return maxIndex
        }
        return next
      })
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, interval])

  useEffect(() => {
    if (commitsRef.current[activeIndex]) {
      onCommitRef.current?.(commitsRef.current[activeIndex])
    }
  }, [activeIndex])

  // Helper to navigate with View Transitions API (2026: native smooth transitions)
  const navigateToIndex = useCallback((newIndex: number) => {
    const setActive = () => setActiveIndex(newIndex)

    // Use View Transitions API for smooth native transitions (Chrome 111+)
    // Disabled for performance - can be enabled via prop if needed
    // if (document.startViewTransition) {
    //   try {
    //     document.startViewTransition(setActive)
    //   } catch (err: unknown) {
    //     setActive()
    //     console.error('View transition failed:', err)
    //   }
    // } else {
      setActive()
    // }
  }, [])

  const handlePrev = useCallback(() => {
    navigateToIndex(Math.max(0, activeIndex - 1))
  }, [activeIndex, navigateToIndex])

  const handleNext = useCallback(() => {
    navigateToIndex(Math.min(commitsRef.current.length - 1, activeIndex + 1))
  }, [activeIndex, navigateToIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying(v => !v)
  }, [])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        handlePrev()
        break
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        handleNext()
        break
      case ' ':
        e.preventDefault()
        togglePlay()
        break
      case 'Escape':
        e.preventDefault()
        navigateToIndex(0)
        setIsPlaying(false)
        break
      case 'Home':
        e.preventDefault()
        navigateToIndex(0)
        break
      case 'End':
        e.preventDefault()
        navigateToIndex(commitsRef.current.length - 1)
        break
    }
  }, [handlePrev, handleNext, togglePlay, navigateToIndex])

  if (commits.length === 0) {
    return (
      <div className={`trace-root ${className}`}>
        <div className="trace-empty">no commits to display</div>
      </div>
    )
  }

  const activeCommit = commits[activeIndex]
  const progressHeight = commits.length > 0 ? ((activeIndex + 1) / commits.length) * 100 : 0

  // Guard against out-of-bounds activeIndex (can happen with rapid navigation)
  if (!activeCommit) {
    return (
      <div className={`trace-root ${className}`}>
        <div className="trace-empty">commit not found</div>
      </div>
    )
  }

  return (
    <div
      className={`trace-root ${className}`}
      style={themeVars as React.CSSProperties}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="trace-controls">
        <button className="trace-btn" onClick={handlePrev} disabled={activeIndex === 0}>
          prev
        </button>
        <button className="trace-btn" onClick={togglePlay}>
          {isPlaying ? 'pause' : 'play'}
        </button>
        <button className="trace-btn" onClick={handleNext} disabled={activeIndex >= commits.length - 1}>
          next
        </button>
        <span className="trace-info">{activeIndex + 1} / {commits.length}</span>
      </div>

      <div className="trace-container">
        <div className="trace-timeline">
          <div className="trace-progress" style={{ height: `${progressHeight}%` }} />
          {commits.map((commit, index) => (
            <CommitItem
              key={commit.hash}
              commit={commit}
              index={index}
              isActive={index === activeIndex}
              onClick={() => navigateToIndex(index)}
            />
          ))}
        </div>

        <div className="trace-diff">
          <DiffContent
            commit={activeCommit}
            activeIndex={activeIndex}
            linePrefix={LINE_PREFIX}
          />
        </div>
      </div>
    </div>
  )
}
