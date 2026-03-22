// Gitea API adapter — fetches commits with diffs from repositories

import type { Commit } from './types'
import { parseDiff, detectAI, formatRelativeTime, shortHash, firstLine } from './shared'

const GITEA_API = 'https://gitea.com/api/v1'

export async function fetchCommits(
  owner: string,
  repo: string,
  file: string,
  last: number = 10,
  token?: string,
  baseUrl?: string
): Promise<Commit[]> {
  const api = baseUrl || GITEA_API

  const headers: Record<string, string> = { 'Accept': 'application/json' }
  if (token) headers['Authorization'] = `token ${token}`

  // Fetch commits list
  const listUrl = `${api}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(file)}&limit=${last}`
  const listRes = await fetch(listUrl, { headers })

  if (!listRes.ok) {
    if (listRes.status === 401) throw new Error('Gitea authentication failed')
    if (listRes.status === 404) throw new Error(`Not found: ${owner}/${repo}/${file}`)
    throw new Error(`Gitea API error: ${listRes.status}`)
  }

  const commitsList = await listRes.json()

  // Fetch diffs in parallel
  const results = await Promise.allSettled(
    commitsList.map(async (c: any) => {
      const diffUrl = `${api}/repos/${owner}/${repo}/git/commits/${c.sha}/diff`
      const diffRes = await fetch(diffUrl, { headers })
      if (!diffRes.ok) return null
      const diffText = await diffRes.text()
      return parseCommit(c, diffText)
    })
  )

  return results
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter((c): c is Commit => c !== null)
}

function parseCommit(data: any, diffText: string): Commit {
  return {
    hash: shortHash(data.sha),
    message: firstLine(data.commit.message),
    author: data.author?.login || data.commit.author?.name || 'Unknown',
    authorType: detectAI(data.author?.login, data.commit.author?.email, data.commit.message),
    time: formatRelativeTime(data.commit.author.date),
    lines: parseDiff(diffText)
  }
}
