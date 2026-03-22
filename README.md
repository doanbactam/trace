# git-trace
<img width="1828" height="1350" alt="image" src="https://github.com/user-attachments/assets/12ff8e4e-6360-446a-9ad6-80b9efed700e" />


Git history visualizer for the AI coding era.

## Quick Start

```tsx
import { Trace } from 'git-trace'

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
| `theme` | `Theme` | `'dark'` | Color theme |
| `filterable` | `boolean` | `false` | Enable filter/search UI |
| `defaultFilter` | `FilterOptions` | `{}` | Initial filter state |
| `onFilterChange` | `(filter) => void` | — | Callback when filter changes |

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

## Filtering

Enable the filter UI with `filterable={true}`:

```tsx
import { Trace } from 'git-trace'

<Trace
  commits={commits}
  filterable={true}
  onFilterChange={(filter) => console.log(filter)}
/>
```

**FilterOptions:**
```ts
type FilterOptions = {
  search?: string          // Search in message, author, hash
  authorType?: 'all' | 'human' | 'ai'
  dateFrom?: string        // ISO date string (future)
  dateTo?: string          // ISO date string (future)
}
```

**Programmatic filtering:**
```tsx
const [filter, setFilter] = useState({ authorType: 'ai' })

<Trace
  commits={commits}
  filterable={true}
  defaultFilter={filter}
  onFilterChange={setFilter}
/>
```

## CLI

```bash
# Local git history to JSON
npx git-trace src/App.tsx --last 8 --json > commits.json

# Standalone HTML
npx git-trace src/App.tsx --last 8 --output embed.html

# Fetch from GitHub (cached 24h)
npx git-trace owner/repo src/path.ts --token $GITHUB_TOKEN

# Cache management
npx git-trace cache           # Show cache info
npx git-trace cache clear     # Clear cache
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

## Syntax Highlighting (Optional)

```tsx
// Core: ~3.6KB gzipped
import { Trace } from 'git-trace'

// With syntax highlighting: +6KB
import { Trace } from 'git-trace'
import 'git-trace/highlight'
```

## License

MIT
