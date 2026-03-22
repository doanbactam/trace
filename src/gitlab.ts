// GitLab API adapter — fetches commits with diffs from repositories

import type { Commit } from './types'
import { parseDiff, detectAI, formatRelativeTime, shortHash, firstLine } from './shared'

const GITLAB_API = 'https://gitlab.com/api/v4'

export async function fetchCommits(
  owner: string,
  repo: string,
  file: string,
  last: number = 10,
  token?: string,
  baseUrl?: string
): Promise<Commit[]> {
  const api = baseUrl || GITLAB_API
  const projectId = encodeURIComponent(`${owner}/${repo}`)

  const headers: Record<string, string> = {}
  if (token) headers['PRIVATE-TOKEN'] = token

  // Fetch commits list
  const listUrl = `${api}/projects/${projectId}/repository/commits?path=${encodeURIComponent(file)}&per_page=${last}`
  const listRes = await fetch(listUrl, { headers })

  if (!listRes.ok) {
    if (listRes.status === 401) throw new Error('GitLab authentication failed')
    if (listRes.status === 404) throw new Error(`Not found: ${owner}/${repo}/${file}`)
    throw new Error(`GitLab API error: ${listRes.status}`)
  }

  const commitsList = await listRes.json()

  // Fetch diffs in parallel
  const results = await Promise.allSettled(
    commitsList.map(async (c: any) => {
      const diffUrl = `${api}/projects/${projectId}/repository/commits/${c.id}/diff?per_page=100`
      const diffRes = await fetch(diffUrl, { headers })
      if (!diffRes.ok) return null
      const diff = await diffRes.json()
      return parseCommit(c, diff)
    })
  )

  return results
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter((c): c is Commit => c !== null)
}

function parseCommit(data: any, diffData: any[]): Commit {
  const lines: Commit['lines'] = []
  for (const file of diffData) {
    if (!file.diff) continue
    lines.push(...parseDiff(file.diff))
  }

  return {
    hash: shortHash(data.id),
    message: firstLine(data.title),
    author: data.author_name || 'Unknown',
    authorType: detectAI(data.author_name, data.author_email, data.title),
    time: formatRelativeTime(data.created_at),
    lines
  }
}
