import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Play, 
  Square, 
  RefreshCw, 
  Code, 
  Globe, 
  Github, 
  Monitor,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const ToolPanel = ({ sessionId, onToolInvoke, className = '' }) => {
  const [tools, setTools] = useState({})
  const [mcpServers, setMcpServers] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedSections, setExpandedSections] = useState({
    browser: true,
    web: true,
    github: false
  })

  useEffect(() => {
    loadTools()
    loadMcpServers()
  }, [])

  const loadTools = async () => {
    try {
      const response = await fetch('/api/v1/tools')
      const data = await response.json()
      if (data.code === 0) {
        setTools(data.data.tools)
      }
    } catch (error) {
      console.error('Failed to load tools:', error)
    }
  }

  const loadMcpServers = async () => {
    try {
      const response = await fetch('/api/v1/mcp/servers')
      const data = await response.json()
      if (data.code === 0) {
        setMcpServers(data.data.servers)
      }
    } catch (error) {
      console.error('Failed to load MCP servers:', error)
    }
  }

  const startMcpServer = async (serverName) => {
    try {
      const response = await fetch(`/api/v1/mcp/servers/${serverName}/start`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.code === 0) {
        loadMcpServers()
      }
    } catch (error) {
      console.error('Failed to start MCP server:', error)
    }
  }

  const stopMcpServer = async (processId) => {
    try {
      const response = await fetch(`/api/v1/mcp/servers/${processId}/stop`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.code === 0) {
        loadMcpServers()
      }
    } catch (error) {
      console.error('Failed to stop MCP server:', error)
    }
  }

  const invokeTool = async (toolName, parameters = {}) => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parameters })
      })
      const data = await response.json()
      if (data.code === 0 && onToolInvoke) {
        onToolInvoke(toolName, data.data)
      }
    } catch (error) {
      console.error('Failed to invoke tool:', error)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'browser': return <Monitor size={16} />
      case 'web': return <Globe size={16} />
      case 'github': return <Github size={16} />
      default: return <Code size={16} />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <CheckCircle size={16} className="text-green-500" />
      case 'stopped': return <XCircle size={16} className="text-red-500" />
      default: return <AlertCircle size={16} className="text-yellow-500" />
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredTools = Object.entries(tools).filter(([name, info]) => 
    selectedCategory === 'all' || info.category === selectedCategory
  )

  const toolsByCategory = filteredTools.reduce((acc, [name, info]) => {
    if (!acc[info.category]) {
      acc[info.category] = []
    }
    acc[info.category].push([name, info])
    return acc
  }, {})

  return (
    <div className={`bg-code-input border-l border-code-border h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-code-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} />
            Tools & Servers
          </h3>
          <button
            onClick={loadMcpServers}
            className="p-1 text-code-text hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* MCP Servers Status */}
      <div className="p-4 border-b border-code-border">
        <h4 className="text-sm font-medium text-white mb-3">MCP Servers</h4>
        <div className="space-y-2">
          {Object.entries(mcpServers).map(([processId, status]) => (
            <div key={processId} className="flex items-center justify-between p-2 bg-code-bg rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.status)}
                <span className="text-sm text-white">{status.server_name}</span>
              </div>
              <div className="flex items-center gap-1">
                {status.status === 'running' ? (
                  <button
                    onClick={() => stopMcpServer(processId)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Stop server"
                  >
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => startMcpServer(status.server_name)}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    title="Start server"
                  >
                    <Play size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools by Category */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <div key={category} className="border-b border-code-border">
            <button
              onClick={() => toggleSection(category)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-code-bg transition-colors"
            >
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="text-sm font-medium text-white capitalize">{category}</span>
                <span className="text-xs text-code-text">({categoryTools.length})</span>
              </div>
              {expandedSections[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {expandedSections[category] && (
              <div className="p-2 space-y-1">
                {categoryTools.map(([toolName, toolInfo]) => (
                  <div key={toolName} className="p-2 bg-code-bg rounded hover:bg-code-accent/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-mono">{toolName}</span>
                      <button
                        onClick={() => invokeTool(toolName)}
                        className="p-1 text-code-accent hover:text-white transition-colors"
                        title="Invoke tool"
                      >
                        <Play size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-code-text">{toolInfo.description}</p>
                    {toolInfo.parameters && Object.keys(toolInfo.parameters).length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-code-text">Parameters:</span>
                        <div className="text-xs text-white font-mono">
                          {Object.entries(toolInfo.parameters).map(([param, type]) => (
                            <div key={param} className="ml-2">
                              {param}: {type}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-code-border">
        <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => invokeTool('browser_navigate', { url: 'https://example.com' })}
            className="w-full p-2 text-left text-sm text-white bg-code-accent rounded hover:bg-code-accent-hover transition-colors"
          >
            Navigate to Example.com
          </button>
          <button
            onClick={() => invokeTool('browser_take_screenshot')}
            className="w-full p-2 text-left text-sm text-white bg-code-accent rounded hover:bg-code-accent-hover transition-colors"
          >
            Take Screenshot
          </button>
          <button
            onClick={() => invokeTool('fetch', { url: 'https://api.github.com' })}
            className="w-full p-2 text-left text-sm text-white bg-code-accent rounded hover:bg-code-accent-hover transition-colors"
          >
            Fetch GitHub API
          </button>
        </div>
      </div>
    </div>
  )
}

export default ToolPanel
