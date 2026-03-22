// Type definitions for Trace component and commit data

export type Theme = 'dark' | 'light' | 'midnight' | 'cyber' | 'forest' | 'sunset'

export interface ThemeColors {
  bg: string
  fg: string
  dim: string
  human: string
  ai: string
  add: string
  remove: string
  border: string
  borderSubtle: string
}

export type Commit = {
  hash: string
  message: string
  author: string
  authorType: 'human' | 'ai'
  time: string
  lines: DiffLine[]
}

export type DiffLine = {
  type: 'add' | 'remove' | 'ctx'
  content: string
}

export type AuthorTypeFilter = 'all' | 'human' | 'ai'

export type FilterOptions = {
  search?: string
  authorType?: AuthorTypeFilter
  dateFrom?: string
  dateTo?: string
}

export type TraceProps = {
  commits?: Commit[]
  autoPlay?: boolean
  interval?: number
  onCommit?: (commit: Commit) => void
  className?: string
  theme?: Theme
  filterable?: boolean
  defaultFilter?: FilterOptions
  onFilterChange?: (filter: FilterOptions) => void
}

// GitHub API response types
export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author?: {
    login: string
  }
  files?: GitHubFile[]
}

export interface GitHubFile {
  patch?: string
  filename: string
}
