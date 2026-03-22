// Git host detection for CLI — auto-detects GitHub, GitLab, Gitea from repo strings

export type GitHost = 'github' | 'gitlab' | 'gitea'

export interface DetectedHost {
  host: GitHost
  owner: string
  repo: string
}

// Detect host from repo URL or owner/repo string
export function detectHost(input: string): DetectedHost | null {
  // GitHub: owner/repo
  const githubMatch = input.match(/^([\w-]+)\/([\w.-]+)$/)
  if (githubMatch) {
    return { host: 'github', owner: githubMatch[1], repo: githubMatch[2] }
  }

  // GitLab URL: gitlab.com/owner/repo or gitlab.com/owner/repo.git
  const gitlabMatch = input.match(/gitlab\.com\/([\w-]+)\/([\w.-]+)/)
  if (gitlabMatch) {
    return { host: 'gitlab', owner: gitlabMatch[1], repo: gitlabMatch[2].replace('.git', '') }
  }

  // Gitea URL: gitea.com/owner/repo or codeberg.org/owner/repo (runs Gitea)
  const giteaMatch = input.match(/(?:gitea\.com|codeberg\.org|notabug\.org)\/([\w-]+)\/([\w.-]+)/)
  if (giteaMatch) {
    return { host: 'gitea', owner: giteaMatch[1], repo: giteaMatch[2].replace('.git', '') }
  }

  return null
}
