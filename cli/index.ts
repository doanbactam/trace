#!/usr/bin/env node
// CLI for trace — git history visualizer

import { parseGitLog } from './parser.js'
import { clearCache, getCacheInfo } from '../src/cache.js'
import { fetchCommits as fetchGitHubCommits } from '../src/github.js'
import { fetchCommits as fetchGitLabCommits } from '../src/gitlab.js'
import { fetchCommits as fetchGiteaCommits } from '../src/gitea.js'
import { detectHost } from '../src/host.js'
import { writeFileSync, readFileSync } from 'fs'

// Show cache info using getCacheInfo
function showCacheInfo() {
  const entries = getCacheInfo()

  if (entries.length === 0) {
    console.error('[trace] No cache found')
    return
  }

  console.error(`[trace] Cache: ${entries.length} entries`)
  for (const e of entries) {
    const age = Math.floor((Date.now() - e.timestamp) / 1000 / 60) // minutes
    console.error(`  - ${e.repo}/${e.file} (${e.last} commits, ${age}m old)`)
  }
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const GITLAB_TOKEN = process.env.GITLAB_TOKEN
const GITEA_TOKEN = process.env.GITEA_TOKEN
const DEFAULT_LAST = 10

const args = process.argv.slice(2)

function showHelp() {
  console.log(`
trace v0.4.0 — Git history visualizer

Usage:
  trace <file>                       Local git log
  trace <repo> <file>                Remote API (auto-detect host)
  trace cache                        Show cache
  trace cache clear                  Clear cache

Supported hosts:
  GitHub    owner/repo
  GitLab    gitlab.com/owner/repo
  Gitea     gitea.com/owner/repo, codeberg.org/owner/repo

Options:
  --last <n>     Commits to show (default: ${DEFAULT_LAST})
  --json        Output JSON
  --output <f>  Write to file

Examples:
  trace src/App.tsx
  trace src/App.tsx --last 5 --json
  trace doanbactam/trace src/Trace.tsx
  trace gitlab.com/gitlab-org/gitlab-shell README.md
  trace codeberg.org/forgejo/forgejo README.md
  trace src/App.tsx --output embed.html

Environment:
  GITHUB_TOKEN  GitHub token for API
  GITLAB_TOKEN  GitLab token for API
  GITEA_TOKEN   Gitea token for API
`)
}

function parseArgs() {
  const options: Record<string, string | boolean> = {
    last: String(DEFAULT_LAST),
    json: false,
    output: ''
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      showHelp()
      process.exit(0)
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1]
        i++
      } else {
        options[key] = true
      }
    }
  }

  return options
}

async function handleCacheCommand() {
  const cacheArgs = args.slice(1)

  if (cacheArgs.length === 0 || cacheArgs[0] === 'show' || cacheArgs[0] === 'info') {
    showCacheInfo()
    return
  }

  if (cacheArgs[0] === 'clear') {
    clearCache()
    return
  }

  console.error('Unknown cache command. Use: cache, cache clear')
  process.exit(1)
}

async function main() {
  if (args[0] === 'cache') {
    await handleCacheCommand()
    return
  }

  const options = parseArgs()

  // Get positional args (excluding options and their values)
  const positionalArgs: string[] = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      i++ // skip value
      continue
    }
    positionalArgs.push(arg)
  }

  // Detect GitHub repo (owner/repo format - only one slash, no file extension like .ts/.js)
  const repoArg = positionalArgs.find(a => {
    const parts = a.split('/')
    return parts.length === 2 && !parts[1].includes('.')
  })
  const fileArg = positionalArgs.find(a => a !== repoArg)

  if (!fileArg && !repoArg) {
    console.error('Error: Specify a file path or owner/repo')
    showHelp()
    process.exit(1)
  }

  const commits = await fetchCommits(fileArg, repoArg, options)

  if (options.json) {
    const output = JSON.stringify(commits, null, 2)
    writeOutput(options.output as string, output)
  } else {
    const html = generateHTML(commits)
    writeOutput(options.output as string, html)
  }
}

async function fetchCommits(
  fileArg: string,
  repoArg: string | undefined,
  options: Record<string, string | boolean>
): Promise<any[]> {
  const last = parseInt(options.last as string)

  // Remote mode - auto-detect host
  if (repoArg) {
    const detected = detectHost(repoArg)

    if (detected) {
      const { host, owner, repo } = detected
      console.error(`[trace] Fetching from ${host}: ${owner}/${repo}/${fileArg}`)

      switch (host) {
        case 'github':
          return await fetchGitHubCommits(owner, repo, fileArg, last, GITHUB_TOKEN)
        case 'gitlab':
          return await fetchGitLabCommits(owner, repo, fileArg, last, GITLAB_TOKEN)
        case 'gitea':
          return await fetchGiteaCommits(owner, repo, fileArg, last, GITEA_TOKEN)
      }
    }

    // Fallback to GitHub for owner/repo format
    const [owner, repo] = repoArg.split('/')
    console.error(`[trace] Fetching from GitHub: ${owner}/${repo}/${fileArg}`)
    return await fetchGitHubCommits(owner, repo, fileArg, last, GITHUB_TOKEN)
  }

  // Local git mode
  console.error(`[trace] Parsing local git: ${fileArg}`)
  return await parseGitLog(fileArg, last)
}

function writeOutput(path: string, content: string): void {
  if (path) {
    writeFileSync(path, content)
    console.error(`[trace] Written to ${path}`)
  } else {
    console.log(content)
  }
}

function generateHTML(commits: any[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Trace — ${commits[0]?.message.split(' ')[0] || 'Git History'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'JetBrains Mono', ui-monospace, monospace; background: #07090f; color: #e2e8f0; padding: 40px; min-height: 100vh; }
    .trace-root { max-width: 1200px; margin: 0 auto; border-radius: 12px; overflow: hidden; }
    pre { background: #0d1117; padding: 16px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="trace-root" id="t"></div>
  <script>
    const commits = ${JSON.stringify(commits)};
    let i = 0;
    function render() {
      const c = commits[i];
      document.getElementById('t').innerHTML = \`
        <div style="display:flex;height:600px;border:1px solid #1e293b;border-radius:8px">
          <div style="width:250px;border-right:1px solid #1e293b;padding:16px;overflow-y:auto">
            \${commits.map((c,j)=\`<div onclick="i=\${j}" style="padding:12px;cursor:pointer;border-left:2px solid transparent;\${i===j?'background:rgba(255,255,255,0.05);border-left-color:'+(c.authorType==='ai'?'#a78bfa':'#34d399'):'')">
              <div style="display:flex;align-items:center;margin-bottom:4px">
                <span style="width:8px;height:8px;border-radius:50%;background:\${c.authorType==='ai'?'#a78bfa':'#34d399'};margin-right:8px"></span>
                <span style="font-size:13px">\${c.message.slice(0,30)}\${c.message.length>30?'...':''}</span>
              </div>
              <div style="font-size:11px;opacity:0.6">\${c.author} · \${c.time}</div>
              <span style="font-size:9px;padding:2px 6px;border-radius:4px;background:\${c.authorType==='ai'?'rgba(167,139,250,0.15)':'rgba(52,211,153,0.15)'};color:\${c.authorType==='ai'?'#a78bfa':'#34d399'}">\${c.authorType}</span>
            </div>\`).join('')}
          </div>
          <div style="flex:1;padding:16px;overflow-y:auto">
            <h2 style="font-size:16px;margin:0 0 4px">\${c.message}</h2>
            <div style="font-size:12px;opacity:0.6;margin-bottom:16px">\${c.hash} · \${c.author}</div>
            <pre>\${c.lines.map(l=>\`<div style="\${l.type==='add'?'color:#34d399':l.type==='remove'?'color:#f87171':'opacity:0.5'}">\${l.content||' '}</div>\`).join('')}</pre>
          </div>
        </div>
      \`;
    }
    render();
  </script>
</body>
</html>`
}

main().catch(err => {
  console.error(`[trace] Error: ${err.message}`)
  process.exit(1)
})
