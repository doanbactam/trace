// Syntax highlighting using sugar-high (~1KB, zero dependencies)

import { highlight } from 'sugar-high'

const MAX_CACHE_SIZE = 100

/**
 * Simple LRU (Least Recently Used) cache implementation
 * Evicts oldest entries when capacity is reached
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)!
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value as K | undefined
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

// LRU cache for highlighted code to avoid re-calculating
const highlightCache = new LRUCache<string, string>()

/**
 * Highlight code using sugar-high
 * Returns HTML string with token classes (sh__token--*)
 * Results are cached for performance - same input produces same output
 *
 * SECURITY: sugar-high tokenizes code but does NOT escape HTML.
 * Caller must escape user input BEFORE calling this function.
 */
export function highlightCode(code: string): string {
  if (!code) return ''

  const cached = highlightCache.get(code)
  if (cached) return cached

  const result = highlight(code)
  highlightCache.set(code, result)
  return result
}

/**
 * Clear the highlight cache (useful for testing or memory management)
 */
export function clearHighlightCache(): void {
  highlightCache.clear()
}

/**
 * Get language from file extension
 * Useful for language-specific handling
 */
const LANGUAGE_MAP: Record<string, string> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'rs': 'rust',
  'go': 'go',
  'java': 'java',
  'c': 'c',
  'h': 'c',
  'cpp': 'cpp',
  'cc': 'cpp',
  'cxx': 'cpp',
  'hpp': 'cpp',
  'cs': 'csharp',
  'php': 'php',
  'rb': 'ruby',
  'swift': 'swift',
  'kt': 'kotlin',
  'scala': 'scala',
  'sh': 'shell',
  'bash': 'shell',
  'zsh': 'shell',
  'fish': 'shell',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'xml': 'xml',
  'html': 'html',
  'htm': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'sass',
  'md': 'markdown',
  'mdx': 'markdown',
  'sql': 'sql',
  'graphql': 'graphql',
  'gql': 'graphql',
  'vue': 'vue',
  'svelte': 'svelte'
}

export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return LANGUAGE_MAP[ext || ''] || 'text'
}
