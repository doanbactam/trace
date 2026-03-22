# trace
<img width="1828" height="1350" alt="image" src="https://github.com/user-attachments/assets/12ff8e4e-6360-446a-9ad6-80b9efed700e" />


Git history visualizer for the AI coding era.

## Quick Start

```tsx
import { Trace } from 'trace'

<Trace commits={commits} autoPlay interval={2000} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commits` | `Commit[]` | `[]` | Array of commits |
| `autoPlay` | `boolean` | `false` | Auto-play through commits |
| `interval` | `number` | `2000` | Ms between commits |
| `onCommit` | `(commit) => void` | — | Callback on commit change |
| `className` | `string` | — | CSS class for root element |

## Commit Type

```ts
type Commit = {
  hash: string
  message: string
  author: string
  authorType: 'human' | 'ai'
  time: string
  lines: DiffLine[]
}

type DiffLine = {
  type: 'add' | 'remove' | 'ctx'
  content: string
}
```

## CLI

```bash
# Local git history to JSON
npx trace src/App.tsx --last 8 --json > commits.json

# Standalone HTML
npx trace src/App.tsx --last 8 --output embed.html

# Fetch from GitHub (cached 24h)
npx trace owner/repo src/path.ts --token $GITHUB_TOKEN

# Cache management
npx trace cache           # Show cache info
npx trace cache clear     # Clear cache
```

## Configuration

Create `.tracerc` in project root or `~/.tracerc`:

```json
{
  "aiPatterns": {
    "emails": ["noreply@cursor.sh", "claude@anthropic.com"],
    "messages": ["Co-Authored-By: Claude", "AI-generated"],
    "logins": ["bot", "dependabot"]
  },
  "defaults": {
    "last": 10,
    "autoPlay": false,
    "interval": 2000
  },
  "cache": {
    "enabled": true,
    "ttl": 86400000
  }
}
```

## Theming

Override CSS variables:

```css
:root {
  --trace-bg: #09090b;
  --trace-human: #22c55e;
  --trace-ai: #a855f7;
  --trace-font-code: 'JetBrains Mono', monospace;
}
```

## Deploy Demo Site

```bash
# Using Vercel CLI
npm install -g vercel
vercel

# Or via Vercel Dashboard
# 1. Push to GitHub
# 2. Import at vercel.com/new
# 3. Root Directory: site
# 4. Output Directory: .
```

## Syntax Highlighting (Optional)

```tsx
// Core: ~3.6KB gzipped
import { Trace } from 'trace'

// With syntax highlighting: +6KB
import { Trace } from 'trace'
import 'trace/highlight'
```

## License

MIT
