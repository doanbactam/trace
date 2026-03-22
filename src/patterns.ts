// Default AI detection patterns — browser-safe, no Node.js dependencies

export const DEFAULT_PATTERNS = {
  emails: ['noreply@cursor.sh', 'claude@anthropic.com', 'bot@github.com', 'copilot', 'cursor'],
  messages: ['Co-Authored-By: Claude', 'Co-Authored-By: Cursor', 'Generated-by:', '[skip-human-review]', 'AI-generated']
}
