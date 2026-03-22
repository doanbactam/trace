// GitHub API adapter — fetches commits with diffs from repositories

import type { Commit, GitHubCommit } from './types'
import type { TraceConfig } from './config'
import { getCached, setCached } from './cache'
import { loadConfig, getAIPatterns } from './config'
import { parseDiff, detectAI, formatRelativeTime, shortHash, firstLine } from './shared'

const GITHUB_API = 'https://api.github.com'

export async function fetchCommits(
  owner: string,
  repo: string,
  file: string,
  last: number = 10,
  token?: string,
  useCache: boolean = true,
  onCacheHit?: () => void,
  onCacheWrite?: () => void
): Promise<Commit[]> {
  const repoKey = `${owner}/${repo}`
  const config = loadConfig()

  // Check cache
  if (useCache) {
    const cached = getCached(repoKey, file, last)
    if (cached) {
      onCacheHit?.()
      return cached as Commit[]
    }
  }

  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Fetch commits list
  const listUrl = `${GITHUB_API}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(file)}&per_page=${last}`
  const listRes = await fetch(listUrl, { headers })

  if (!listRes.ok) {
    if (listRes.status === 403) {
      const reset = listRes.headers.get('X-RateLimit-Reset')
      const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : 'unknown'
      throw new Error(`Rate limit exceeded. Resets at ${resetTime}`)
    }
    if (listRes.status === 404) throw new Error(`Not found: ${owner}/${repo}/${file}`)
    throw new Error(`GitHub API error: ${listRes.status}`)
  }

  const commitsList = await listRes.json()

  // Fetch diffs in parallel
  const results = await Promise.allSettled(
    commitsList.map(async (c: { sha: string }) => {
      const commitUrl = `${GITHUB_API}/repos/${owner}/${repo}/commits/${c.sha}`
      const commitRes = await fetch(commitUrl, { headers })
      if (!commitRes.ok) return null
      const detail = await commitRes.json() as GitHubCommit
      return parseCommit(detail, config)
    })
  )

  const commits = results
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter((c): c is Commit => c !== null)

  // Cache results
  if (useCache && commits.length > 0) {
    setCached(repoKey, file, last, commits)
    onCacheWrite?.()
  }

  return commits
}

export { clearCache, getCacheSize } from './cache'

function parseCommit(data: GitHubCommit, config?: TraceConfig): Commit {
  const lines: Commit['lines'] = []
  const aiPatterns = getAIPatterns(config)

  for (const file of data.files || []) {
    if (!file.patch) continue
    lines.push(...parseDiff(file.patch))
  }

  return {
    hash: shortHash(data.sha),
    message: firstLine(data.commit.message),
    author: data.author?.login || data.commit.author?.name || 'Unknown',
    authorType: detectAI(
      data.author?.login,
      data.commit.author?.email,
      data.commit.message,
      aiPatterns
    ),
    time: formatRelativeTime(data.commit.author.date),
    lines
  }
}
