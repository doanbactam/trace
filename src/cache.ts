// Local cache for GitHub API responses to avoid rate limits

import type { Commit } from './types'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const CACHE_DIR = join(homedir(), '.trace-cache')
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface CacheEntry {
  data: Commit[]
  timestamp: number
  repo: string
  file: string
  last: number
}

function sanitizePath(path: string): string {
  // Remove ../, ./, and replace slashes with dashes
  return path
    .replace(/\.\.\//g, '')
    .replace(/\.\//g, '')
    .replace(/[\/\\]/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
}

function getCacheKey(repo: string, file: string, last: number): string {
  const key = `${sanitizePath(repo)}-${sanitizePath(file)}-${last}.json`
  return join(CACHE_DIR, key)
}

export function getCached(repo: string, file: string, last: number): Commit[] | null {
  const cachePath = getCacheKey(repo, file, last)

  if (!existsSync(cachePath)) {
    return null
  }

  try {
    const content = readFileSync(cachePath, 'utf-8')
    const entry: CacheEntry = JSON.parse(content)

    // Check if cache is expired
    const now = Date.now()
    if (now - entry.timestamp > CACHE_TTL) {
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

export function setCached(repo: string, file: string, last: number, data: Commit[]): void {
  const cachePath = getCacheKey(repo, file, last)

  try {
    // Ensure cache directory exists
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true })
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      repo,
      file,
      last
    }

    writeFileSync(cachePath, JSON.stringify(entry, null, 2))
  } catch {
    // Silently fail - caching is optional
  }
}

export function clearCache(): void {
  try {
    rmSync(CACHE_DIR, { recursive: true, force: true })
  } catch {
    // Ignore
  }
}

export function getCacheSize(): number {
  try {
    if (!existsSync(CACHE_DIR)) return 0
    const files = readdirSync(CACHE_DIR)
    return files.length
  } catch {
    return 0
  }
}

export function getCacheInfo(): CacheEntry[] {
  try {
    if (!existsSync(CACHE_DIR)) return []

    const files = readdirSync(CACHE_DIR)
    const entries: CacheEntry[] = []

    for (const file of files) {
      try {
        const content = readFileSync(join(CACHE_DIR, file), 'utf-8')
        const entry: CacheEntry = JSON.parse(content)
        entries.push(entry)
      } catch {
        // Skip invalid files
      }
    }

    return entries
  } catch {
    return []
  }
}
