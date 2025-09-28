import React, { useState, useEffect } from 'react'
import { Github, GitBranch, Slack, MessageSquare, Plus, Clock, Zap, Star, GitPullRequest, Code, FileText, Settings } from 'lucide-react'

const LandingPage = ({ onCreateSession, onSelectRepository, recentSessions = [], suggestedTasks = [] }) => {
  const [selectedProvider, setSelectedProvider] = useState('github')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const providers = [
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'from-gray-800 to-gray-900',
      description: 'Connect to GitHub repositories'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      icon: GitBranch,
      color: 'from-orange-500 to-red-600',
      description: 'Connect to GitLab repositories'
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: GitBranch,
      color: 'from-blue-500 to-blue-700',
      description: 'Connect to Bitbucket repositories'
    }
  ]

  const handleRepositoryConnect = async () => {
    if (!repositoryUrl.trim()) return
    
    setIsConnecting(true)
    try {
      // Simulate API call to connect repository
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSelectRepository({
        provider: selectedProvider,
        url: repositoryUrl,
        name: repositoryUrl.split('/').pop()
      })
    } catch (error) {
      console.error('Failed to connect repository:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleNewConversation = () => {
    onCreateSession()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CodeAct AI Agent</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Development Environment
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Connect to your repository and start collaborating with AI agents. 
            Support for GitHub, GitLab, and Bitbucket with real-time integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Repository Selection */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6">Connect Repository</h3>
              
              {/* Provider Selection */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {providers.map((provider) => {
                  const Icon = provider.icon
                  return (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedProvider === provider.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${provider.color} flex items-center justify-center mb-3 mx-auto`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{provider.name}</h4>
                      <p className="text-sm text-slate-400">{provider.description}</p>
                    </button>
                  )
                })}
              </div>

              {/* Repository URL Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder={`https://${selectedProvider}.com/username/repository`}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleRepositoryConnect}
                  disabled={!repositoryUrl.trim() || isConnecting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-5 h-5" />
                      <span>Connect Repository</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* New Conversation */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Start</h3>
              <button
                onClick={handleNewConversation}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Conversation</span>
              </button>
              <p className="text-sm text-slate-400 mt-3 text-center">
                Start a new AI conversation without connecting a repository
              </p>
            </div>

            {/* Integration Status */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Integrations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Github className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">GitHub</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GitBranch className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">GitLab</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Slack className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">Slack (Beta)</span>
                  </div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Tasks */}
        {suggestedTasks.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6">Suggested Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedTasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">{task.title}</h4>
                      <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                          {task.difficulty}
                        </span>
                        <span className="text-xs text-slate-500">{task.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        {recentSessions.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Recent Conversations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white mb-1 truncate">{session.title}</h4>
                      <p className="text-slate-400 text-sm mb-2 truncate">{session.latestMessage}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.latestMessageAt}</span>
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          session.status === 'active' 
                            ? 'text-green-400 bg-green-500/10' 
                            : 'text-slate-400 bg-slate-500/10'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage

