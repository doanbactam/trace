import { useState } from 'react'
import { Trace } from 'trace'
import { commits } from './mockData'
import type { Theme } from 'trace'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'cyber', label: 'Cyber' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'light', label: 'Light' }
]

export function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [autoPlay, setAutoPlay] = useState(true)
  const [interval, setInterval] = useState(1500)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span>Trace</span> Git History Visualizer
        </h1>
        <div className="app-controls">
          <select
            className="app-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            className="app-select"
            onClick={() => setAutoPlay(!autoPlay)}
          >
            {autoPlay ? 'Auto-play: ON' : 'Auto-play: OFF'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Trace
          commits={commits}
          autoPlay={autoPlay}
          interval={interval}
          theme={theme}
          onCommit={(commit) => {
            console.log('Viewing commit:', commit.message)
          }}
        />
      </main>

      <footer className="app-footer">
        <span>Visualizing {commits.length} commits from the Trace repository</span>
        <div className="kbd">
          <kbd>←</kbd><kbd>→</kbd> navigate · <kbd>space</kbd> play/pause · <kbd>esc</kbd> reset
        </div>
      </footer>
    </div>
  )
}
