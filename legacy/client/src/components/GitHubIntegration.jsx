import React, { useState, useEffect } from 'react'
import { Github, GitPullRequest, GitCommit, Star, Eye, Fork, Code, FileText, Search, Filter, RefreshCw, ExternalLink } from 'lucide-react'

const GitHubIntegration = ({ repository, onSelectFile, onSelectIssue, onSelectPR }) => {
  const [activeTab, setActiveTab] = useState('files')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [repositoryData, setRepositoryData] = useState({
    files: [],
    issues: [],
    pullRequests: [],
    commits: [],
    branches: []
  })

  const tabs = [
    { id: 'files', name: 'Files', icon: FileText },
    { id: 'issues', name: 'Issues', icon: GitPullRequest },
    { id: 'prs', name: 'Pull Requests', icon: GitCommit },
    { id: 'commits', name: 'Commits', icon: Code },
    { id: 'branches', name: 'Branches', icon: GitBranch }
  ]

  useEffect(() => {
    if (repository) {
      loadRepositoryData()
    }
  }, [repository])

  const loadRepositoryData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls to fetch repository data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual API calls
      setRepositoryData({
        files: [
          { name: 'src/App.jsx', type: 'file', size: '2.1 KB', lastModified: '2 hours ago' },
          { name: 'src/components/', type: 'directory', size: '15.2 KB', lastModified: '1 day ago' },
          { name: 'package.json', type: 'file', size: '1.2 KB', lastModified: '3 days ago' },
          { name: 'README.md', type: 'file', size: '3.4 KB', lastModified: '1 week ago' }
        ],
        issues: [
          { number: 42, title: 'Add dark mode support', state: 'open', author: 'john-doe', created: '2 days ago', labels: ['enhancement', 'ui'] },
          { number: 41, title: 'Fix memory leak in data processing', state: 'open', author: 'jane-smith', created: '1 week ago', labels: ['bug', 'performance'] },
          { number: 40, title: 'Update documentation', state: 'closed', author: 'alex-wilson', created: '2 weeks ago', labels: ['documentation'] }
        ],
        pullRequests: [
          { number: 15, title: 'Implement user authentication', state: 'open', author: 'dev-team', created: '1 day ago', status: 'draft' },
          { number: 14, title: 'Add unit tests for API endpoints', state: 'open', author: 'qa-team', created: '3 days ago', status: 'ready' },
          { number: 13, title: 'Refactor component structure', state: 'merged', author: 'senior-dev', created: '1 week ago', status: 'merged' }
        ],
        commits: [
          { hash: 'a1b2c3d', message: 'Fix authentication bug', author: 'john-doe', date: '2 hours ago' },
          { hash: 'e4f5g6h', message: 'Add new feature for user dashboard', author: 'jane-smith', date: '1 day ago' },
          { hash: 'i7j8k9l', message: 'Update dependencies', author: 'alex-wilson', date: '2 days ago' }
        ],
        branches: [
          { name: 'main', protected: true, lastCommit: '2 hours ago', ahead: 0, behind: 0 },
          { name: 'feature/auth', protected: false, lastCommit: '1 day ago', ahead: 3, behind: 1 },
          { name: 'bugfix/memory-leak', protected: false, lastCommit: '2 days ago', ahead: 1, behind: 0 }
        ]
      })
    } catch (error) {
      console.error('Failed to load repository data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderFiles = () => (
    <div className="space-y-2">
      {repositoryData.files.map((file, index) => (
        <div
          key={index}
          onClick={() => file.type === 'file' && onSelectFile(file)}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            file.type === 'file' 
              ? 'hover:bg-slate-700/50 border-slate-600 hover:border-slate-500' 
              : 'bg-slate-800/30 border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {file.type === 'file' ? (
                <FileText className="w-4 h-4 text-slate-400" />
              ) : (
                <Code className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-slate-300">{file.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{file.size}</span>
              <span>{file.lastModified}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderIssues = () => (
    <div className="space-y-3">
      {repositoryData.issues.map((issue) => (
        <div
          key={issue.number}
          onClick={() => onSelectIssue(issue)}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                issue.state === 'open' ? 'bg-green-500' : 'bg-slate-500'
              }`} />
              <span className="font-semibold text-white">#{issue.number}</span>
              <span className="text-slate-300">{issue.title}</span>
            </div>
            <span className="text-sm text-slate-400">{issue.created}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">by {issue.author}</span>
              <div className="flex space-x-1">
                {issue.labels.map((label, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPullRequests = () => (
    <div className="space-y-3">
      {repositoryData.pullRequests.map((pr) => (
        <div
          key={pr.number}
          onClick={() => onSelectPR(pr)}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <GitPullRequest className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-white">#{pr.number}</span>
              <span className="text-slate-300">{pr.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                pr.status === 'merged' ? 'bg-purple-500/20 text-purple-400' :
                pr.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {pr.status}
              </span>
              <span className="text-sm text-slate-400">{pr.created}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">by {pr.author}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderCommits = () => (
    <div className="space-y-3">
      {repositoryData.commits.map((commit) => (
        <div
          key={commit.hash}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-all"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-mono text-white">{commit.hash.substring(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 font-medium">{commit.message}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                <span>{commit.author}</span>
                <span>{commit.date}</span>
                <span className="font-mono">{commit.hash}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderBranches = () => (
    <div className="space-y-3">
      {repositoryData.branches.map((branch) => (
        <div
          key={branch.name}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-medium">{branch.name}</span>
              {branch.protected && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  protected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{branch.lastCommit}</span>
              {branch.ahead > 0 && (
                <span className="text-green-400">+{branch.ahead}</span>
              )}
              {branch.behind > 0 && (
                <span className="text-red-400">-{branch.behind}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'files':
        return renderFiles()
      case 'issues':
        return renderIssues()
      case 'prs':
        return renderPullRequests()
      case 'commits':
        return renderCommits()
      case 'branches':
        return renderBranches()
      default:
        return null
    }
  }

  if (!repository) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Github className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No repository selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Repository Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Github className="w-6 h-6 text-slate-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">{repository.name}</h2>
              <p className="text-slate-400 text-sm">{repository.url}</p>
            </div>
          </div>
          <button
            onClick={loadRepositoryData}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Repository Stats */}
        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>24</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fork className="w-4 h-4" />
            <span>8</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>156</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}

export default GitHubIntegration
