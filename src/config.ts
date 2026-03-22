// Config file support for .tracerc

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export interface TraceConfig {
  aiPatterns?: {
    emails?: string[]
    messages?: string[]
  }
  last?: number
}

// Default AI detection patterns — single source of truth
export const DEFAULT_PATTERNS = {
  emails: ['noreply@cursor.sh', 'claude@anthropic.com', 'bot@github.com', 'copilot', 'cursor'],
  messages: ['Co-Authored-By: Claude', 'Co-Authored-By: Cursor', 'Generated-by:', '[skip-human-review]', 'AI-generated']
}

const DEFAULT: TraceConfig = {
  aiPatterns: DEFAULT_PATTERNS,
  last: 10
}

let cached: TraceConfig | null = null

export function loadConfig(cwd?: string): TraceConfig {
  if (cached) return cached

  const paths = cwd ? [join(cwd, '.tracerc'), join(homedir(), '.tracerc')] : [join(homedir(), '.tracerc')]

  for (const path of paths) {
    if (existsSync(path)) {
      try {
        const user = JSON.parse(readFileSync(path, 'utf-8'))
        const merged: TraceConfig = { ...DEFAULT, ...user }
        cached = merged
        return cached
      } catch {
        // Invalid config, use defaults
      }
    }
  }

  cached = DEFAULT
  return cached
}

export function getAIPatterns(config?: TraceConfig) {
  const patterns = (config || loadConfig()).aiPatterns
  return {
    emails: patterns?.emails || DEFAULT.aiPatterns!.emails!,
    messages: patterns?.messages || DEFAULT.aiPatterns!.messages!
  }
}
