import React, { useState, useEffect } from 'react'
import { GitBranch, GitMerge, GitCommit, Star, Eye, Fork, Code, FileText, Search, Filter, RefreshCw, ExternalLink, Users, Shield } from 'lucide-react'

const GitLabIntegration = ({ repository, onSelectFile, onSelectIssue, onSelectMR }) => {
  const [activeTab, setActiveTab] = useState('files')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [repositoryData, setRepositoryData] = useState({
    files: [],
    issues: [],
    mergeRequests: [],
    commits: [],
    branches: [],
    pipelines: []
  })

  const tabs = [
    { id: 'files', name: 'Files', icon: FileText },
    { id: 'issues', name: 'Issues', icon: GitMerge },
    { id: 'mrs', name: 'Merge Requests', icon: GitBranch },
    { id: 'commits', name: 'Commits', icon: Code },
    { id: 'branches', name: 'Branches', icon: GitBranch },
    { id: 'pipelines', name: 'Pipelines', icon: Code }
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
          { name: 'app/controllers/', type: 'directory', size: '45.2 KB', lastModified: '1 hour ago' },
          { name: 'app/models/', type: 'directory', size: '32.1 KB', lastModified: '2 hours ago' },
          { name: 'config/routes.rb', type: 'file', size: '2.8 KB', lastModified: '3 hours ago' },
          { name: 'Gemfile', type: 'file', size: '1.5 KB', lastModified: '1 day ago' },
          { name: 'README.md', type: 'file', size: '4.2 KB', lastModified: '2 days ago' }
        ],
        issues: [
          { id: 156, title: 'Implement CI/CD pipeline optimization', state: 'opened', author: 'devops-team', created: '1 day ago', labels: ['devops', 'ci/cd'], milestone: 'v2.1' },
          { id: 155, title: 'Add comprehensive test coverage', state: 'opened', author: 'qa-lead', created: '3 days ago', labels: ['testing', 'quality'], milestone: 'v2.0' },
          { id: 154, title: 'Database migration performance issue', state: 'closed', author: 'backend-dev', created: '1 week ago', labels: ['bug', 'database'], milestone: 'v1.9' }
        ],
        mergeRequests: [
          { id: 89, title: 'Feature: Add user role management', state: 'opened', author: 'frontend-team', created: '2 hours ago', status: 'draft', targetBranch: 'main' },
          { id: 88, title: 'Fix: Resolve memory leak in background jobs', state: 'opened', author: 'backend-dev', created: '1 day ago', status: 'ready', targetBranch: 'main' },
          { id: 87, title: 'Refactor: Improve API response structure', state: 'merged', author: 'api-team', created: '3 days ago', status: 'merged', targetBranch: 'main' }
        ],
        commits: [
          { hash: 'a1b2c3d4', message: 'feat: Add user authentication middleware', author: 'auth-team', date: '1 hour ago' },
          { hash: 'e5f6g7h8', message: 'fix: Resolve database connection timeout', author: 'db-admin', date: '4 hours ago' },
          { hash: 'i9j0k1l2', message: 'docs: Update API documentation', author: 'tech-writer', date: '1 day ago' }
        ],
        branches: [
          { name: 'main', protected: true, lastCommit: '1 hour ago', ahead: 0, behind: 0, default: true },
          { name: 'develop', protected: true, lastCommit: '2 hours ago', ahead: 2, behind: 0, default: false },
          { name: 'feature/user-roles', protected: false, lastCommit: '3 hours ago', ahead: 5, behind: 1, default: false },
          { name: 'hotfix/security-patch', protected: false, lastCommit: '6 hours ago', ahead: 1, behind: 0, default: false }
        ],
        pipelines: [
          { id: 1234, status: 'success', branch: 'main', author: 'ci-bot', created: '30 minutes ago', duration: '2m 15s' },
          { id: 1233, status: 'running', branch: 'feature/user-roles', author: 'dev-user', created: '5 minutes ago', duration: '1m 30s' },
          { id: 1232, status: 'failed', branch: 'develop', author: 'ci-bot', created: '1 hour ago', duration: '3m 45s' }
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
          key={issue.id}
          onClick={() => onSelectIssue(issue)}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                issue.state === 'opened' ? 'bg-green-500' : 'bg-slate-500'
              }`} />
              <span className="font-semibold text-white">#{issue.id}</span>
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
              {issue.milestone && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  {issue.milestone}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMergeRequests = () => (
    <div className="space-y-3">
      {repositoryData.mergeRequests.map((mr) => (
        <div
          key={mr.id}
          onClick={() => onSelectMR(mr)}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <GitMerge className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-white">!{mr.id}</span>
              <span className="text-slate-300">{mr.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                mr.status === 'merged' ? 'bg-purple-500/20 text-purple-400' :
                mr.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {mr.status}
              </span>
              <span className="text-sm text-slate-400">{mr.created}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">by {mr.author}</span>
              <span className="text-xs text-slate-500">→ {mr.targetBranch}</span>
            </div>
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
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                <Shield className="w-4 h-4 text-blue-400" />
              )}
              {branch.default && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  default
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

  const renderPipelines = () => (
    <div className="space-y-3">
      {repositoryData.pipelines.map((pipeline) => (
        <div
          key={pipeline.id}
          className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                pipeline.status === 'success' ? 'bg-green-500' :
                pipeline.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                pipeline.status === 'failed' ? 'bg-red-500' : 'bg-slate-500'
              }`} />
              <span className="font-semibold text-white">Pipeline #{pipeline.id}</span>
              <span className="text-slate-300">{pipeline.branch}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{pipeline.duration}</span>
              <span>{pipeline.created}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">by {pipeline.author}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              pipeline.status === 'success' ? 'bg-green-500/20 text-green-400' :
              pipeline.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
              pipeline.status === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {pipeline.status}
            </span>
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
      case 'mrs':
        return renderMergeRequests()
      case 'commits':
        return renderCommits()
      case 'branches':
        return renderBranches()
      case 'pipelines':
        return renderPipelines()
      default:
        return null
    }
  }

  if (!repository) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
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
            <GitBranch className="w-6 h-6 text-slate-400" />
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
            <span>42</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fork className="w-4 h-4" />
            <span>12</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>89</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>8 contributors</span>
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
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  ? 'text-orange-400 border-b-2 border-orange-400'
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
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}

export default GitLabIntegration

