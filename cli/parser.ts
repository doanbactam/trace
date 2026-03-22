import { exec } from 'child_process'
import { promisify } from 'util'
import { parseDiff, detectAI } from '../src/shared.js'

const execAsync = promisify(exec)

/**
 * Validate file path to prevent command injection
 * Rejects paths with shell metacharacters or absolute paths
 */
function validatePath(filePath: string): void {
  // Reject shell metacharacters that could escape git quotes
  const dangerous = /[\n\r`$\\;&|<>]/
  if (dangerous.test(filePath)) {
    throw new Error(`Invalid file path: contains potentially dangerous characters`)
  }
  // Reject absolute paths (should work relative to cwd)
  if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
    throw new Error(`Invalid file path: use relative paths only`)
  }
}

export async function parseGitLog(filePath: string, last: number = 10): Promise<any[]> {
  validatePath(filePath)
  const format = '%H|%an|%ae|%s|%cr'

  try {
    const { stdout } = await execAsync(
      `git log -${last} --follow -p "--format=${format}" -- "${filePath}"`,
      { cwd: process.cwd(), shell: true, windowsHide: true }
    )
    return parseGitLogOutput(stdout)
  } catch (error) {
    throw new Error(`Failed to parse git log: ${(error as Error).message}`)
  }
}

function parseGitLogOutput(output: string): any[] {
  const commits: any[] = []
  const lines = output.split('\n')
  let currentCommit: any = null
  let inDiff = false

  for (const line of lines) {
    if (/^[a-f0-9]{40}\|/.test(line)) {
      if (currentCommit?.lines) commits.push(currentCommit)
      const [hash, author, email, message, time] = line.split('|')
      currentCommit = {
        hash: hash.slice(0, 7),
        author,
        message,
        authorType: detectAI(undefined, email, message),
        time,
        lines: []
      }
      inDiff = false
      continue
    }

    if (line.startsWith('diff --git')) {
      inDiff = true
      continue
    }

    if (inDiff && currentCommit) {
      if (line.startsWith('@@') || line.startsWith('index') ||
          line.startsWith('---') || line.startsWith('+++')) {
        continue
      }
      currentCommit.lines.push(...parseDiff(line))
    }
  }

  if (currentCommit?.lines) commits.push(currentCommit)
  return commits
}
