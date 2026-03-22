// Shared utilities for git adapters — parse diffs, detect AI authors, format dates

import { DEFAULT_PATTERNS } from './config'
import type { Commit } from './types'

// Parse unified diff format into lines
export function parseDiff(diffText: string): Commit['lines'] {
  const lines: Commit['lines'] = []

  for (const line of diffText.split('\n')) {
    // Skip diff headers
    if (line.startsWith('@@')) continue
    if (line.startsWith('+++') || line.startsWith('---')) continue
    if (line.startsWith('index') || line.startsWith('diff')) continue
    if (line.startsWith('new file') || line.startsWith('deleted file')) continue

    if (line.startsWith('+')) {
      lines.push({ type: 'add', content: line.slice(1) })
    } else if (line.startsWith('-')) {
      lines.push({ type: 'remove', content: line.slice(1) })
    } else {
      lines.push({ type: 'ctx', content: line.slice(1) || '' })
    }
  }

  return lines
}

// Compile string arrays to lowercase Sets for fast O(1) lookup
function compilePatterns(patterns: typeof DEFAULT_PATTERNS) {
  return {
    emails: new Set(patterns.emails.map(p => p.toLowerCase())),
    messages: new Set(patterns.messages.map(p => p.toLowerCase()))
  }
}

// Cached compiled defaults
const CACHED_DEFAULTS = compilePatterns(DEFAULT_PATTERNS)

// Detect if author is AI based on patterns
export function detectAI(
  login?: string,
  email?: string,
  message?: string,
  patterns?: typeof DEFAULT_PATTERNS
): 'human' | 'ai' {
  const compiled = patterns ? compilePatterns(patterns) : CACHED_DEFAULTS
  const toCheck = [login, email, message].filter(Boolean)

  for (const str of toCheck) {
    const lower = str!.toLowerCase()
    for (const pattern of compiled.emails) {
      if (lower === pattern || lower.includes(pattern)) return 'ai'
    }
    for (const pattern of compiled.messages) {
      if (lower.includes(pattern)) return 'ai'
    }
  }

  return 'human'
}

// Format date to relative time string
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days > 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (days > 0) return `${days}d ago`

  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h ago`

  const minutes = Math.floor(diff / 60000)
  if (minutes > 0) return `${minutes}m ago`

  return 'just now'
}

// Extract short hash from full SHA (7 characters)
export function shortHash(sha: string): string {
  return sha.slice(0, 7)
}

// Get first line of commit message
export function firstLine(message: string): string {
  return message.split('\n')[0]
}

// Filter Promise.allSettled results to non-null Commit array
export function filterSettledCommits(results: PromiseSettledResult<Commit | null>[]): Commit[] {
  return results
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter((c): c is Commit => c !== null)
}

// Escape HTML to prevent XSS attacks
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
