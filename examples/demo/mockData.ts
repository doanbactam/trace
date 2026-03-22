import type { Commit } from 'trace'

// Mock commits simulating the development of Trace itself
export const commits: Commit[] = [
  {
    hash: 'a1b2c3d',
    message: 'Initial commit — add project skeleton',
    author: 'Lecoo',
    authorType: 'human',
    time: '2h ago',
    lines: [
      { type: 'add', content: '{' },
      { type: 'add', content: '  "name": "trace",' },
      { type: 'add', content: '  "version": "0.1.0",' },
      { type: 'add', content: '  "description": "Git history visualizer"' },
      { type: 'add', content: '}' }
    ]
  },
  {
    hash: 'e4f5g6h',
    message: 'Add Trace component with timeline view',
    author: 'Lecoo',
    authorType: 'human',
    time: '1h ago',
    lines: [
      { type: 'ctx', content: 'export function Trace({ commits, autoPlay }: Props) {' },
      { type: 'add', content: '  const [activeIndex, setActiveIndex] = useState(0)' },
      { type: 'add', content: '  const [isPlaying, setIsPlaying] = useState(autoPlay)' },
      { type: 'ctx', content: '' },
      { type: 'add', content: '  return (' },
      { type: 'add', content: '    <div className="trace-root">' },
      { type: 'add', content: '      <Timeline commits={commits} active={activeIndex} />' },
      { type: 'add', content: '      <DiffView commit={commits[activeIndex]} />' },
      { type: 'add', content: '    </div>' },
      { type: 'add', content: '  )' },
      { type: 'ctx', content: '}' }
    ]
  },
  {
    hash: 'i7j8k9l',
    message: 'Add AI detection patterns for Claude and Cursor',
    author: 'Claude',
    authorType: 'ai',
    time: '45m ago',
    lines: [
      { type: 'remove', content: 'export const AI_PATTERNS = []' },
      { type: 'add', content: 'export const DEFAULT_PATTERNS = {' },
      { type: 'add', content: '  emails: [' },
      { type: 'add', content: "    'noreply@cursor.sh'," },
      { type: 'add', content: "    'claude@anthropic.com'," },
      { type: 'add', content: "    'bot@github.com'" },
      { type: 'add', content: '  ],' },
      { type: 'add', content: '  messages: [' },
      { type: 'add', content: "    'Co-Authored-By: Claude'," },
      { type: 'add', content: "    'Co-Authored-By: Cursor'" },
      { type: 'add', content: '  ]' },
      { type: 'add', content: '}' }
    ]
  },
  {
    hash: 'm0n1o2p',
    message: 'Implement keyboard navigation',
    author: 'Claude',
    authorType: 'ai',
    time: '30m ago',
    lines: [
      { type: 'ctx', content: 'const handleKeyDown = (e: KeyboardEvent) => {' },
      { type: 'add', content: '  switch (e.key) {' },
      { type: 'add', content: '    case "ArrowUp":' },
      { type: 'add', content: '    case "ArrowLeft":' },
      { type: 'add', content: '      handlePrev()' },
      { type: 'add', content: '      break' },
      { type: 'add', content: '    case "ArrowDown":' },
      { type: 'add', content: '    case "ArrowRight":' },
      { type: 'add', content: '      handleNext()' },
      { type: 'add', content: '      break' },
      { type: 'add', content: '    case " ":' },
      { type: 'add', content: '      togglePlay()' },
      { type: 'add', content: '      break' },
      { type: 'add', content: '  }' },
      { type: 'ctx', content: '}' }
    ]
  },
  {
    hash: 'q3r4s5t',
    message: 'Add theme support with CSS variables',
    author: 'Lecoo',
    authorType: 'human',
    time: '15m ago',
    lines: [
      { type: 'ctx', content: 'export const themes = {' },
      { type: 'add', content: '  dark: {' },
      { type: 'add', content: '    bg: "#09090b",' },
      { type: 'add', content: '    fg: "#e4e4e7",' },
      { type: 'add', content: '    human: "#22c55e",' },
      { type: 'add', content: '    ai: "#a855f7"' },
      { type: 'add', content: '  },' },
      { type: 'add', content: '  midnight: {' },
      { type: 'add', content: '    bg: "#020617",' },
      { type: 'add', content: '    fg: "#f1f5f9",' },
      { type: 'add', content: '    human: "#10b981",' },
      { type: 'add', content: '    ai: "#8b5cf6"' },
      { type: 'add', content: '  }' },
      { type: 'ctx', content: '}' }
    ]
  },
  {
    hash: 'u6v7w8x',
    message: 'Add cyber theme with neon colors',
    author: 'Claude',
    authorType: 'ai',
    time: '10m ago',
    lines: [
      { type: 'add', content: '  cyber: {' },
      { type: 'add', content: '    bg: "#0a0a0f",' },
      { type: 'add', content: '    fg: "#00ff9f",' },
      { type: 'add', content: '    dim: "#00ff9f80",' },
      { type: 'add', content: '    human: "#00ff9f",' },
      { type: 'add', content: '    ai: "#ff00ff",' },
      { type: 'add', content: '    add: "rgba(0, 255, 159, 0.15)",' },
      { type: 'add', content: '    remove: "rgba(255, 0, 255, 0.15)"' },
      { type: 'add', content: '  }' }
    ]
  },
  {
    hash: 'y9z0a1b',
    message: 'Optimize rendering with memo and content-visibility',
    author: 'Claude',
    authorType: 'ai',
    time: '5m ago',
    lines: [
      { type: 'ctx', content: 'const DiffLine = memo(function DiffLine({ line }: Props) {' },
      { type: 'remove', content: '  return <div className="trace-line">{line.content}</div>' },
      { type: 'add', content: '  return (' },
      { type: 'add', content: '    <div className="trace-line" style={{' },
      { type: 'add', content: '      contentVisibility: "auto",' },
      { type: 'add', content: '      containIntrinsicSize: "auto 22px"' },
      { type: 'add', content: '    }}>' },
      { type: 'add', content: '      <span className="prefix">{line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}</span>' },
      { type: 'add', content: '      <span>{line.content}</span>' },
      { type: 'add', content: '    </div>' },
      { type: 'add', content: '  )' },
      { type: 'ctx', content: '})' }
    ]
  },
  {
    hash: 'c2d3e4f',
    message: 'Add CLI tool for exporting HTML',
    author: 'Lecoo',
    authorType: 'human',
    time: 'just now',
    lines: [
      { type: 'add', content: '#!/usr/bin/env node' },
      { type: 'ctx', content: '' },
      { type: 'add', content: 'const args = process.argv.slice(2)' },
      { type: 'add', content: 'const [file, format = "json"] = args' },
      { type: 'ctx', content: '' },
      { type: 'add', content: 'async function main() {' },
      { type: 'add', content: '  const commits = await getGitHistory(file)' },
      { type: 'add', content: '  if (format === "html") {' },
      { type: 'add', content: '    console.log(exportHTML(commits))' },
      { type: 'add', content: '  } else {' },
      { type: 'add', content: '    console.log(JSON.stringify(commits, null, 2))' },
      { type: 'add', content: '  }' },
      { type: 'add', content: '}' },
      { type: 'ctx', content: '' },
      { type: 'add', content: 'main()' }
    ]
  }
]
