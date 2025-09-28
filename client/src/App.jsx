import React, { useState, useEffect, useRef } from 'react'
import { Play, Folder, File, Trash2, Plus, Save, RefreshCw, Bot, MessageSquare, Zap, Github, GitBranch, Slack, Settings } from 'lucide-react'
import CodeEditor from './components/CodeEditor'
import FileExplorer from './components/FileExplorer'
import Console from './components/Console'
import AIAssistant from './components/AIAssistant'
import ChatInterface from './components/ChatInterface'
import MaxModeChatInterface from './components/MaxModeChatInterface'
import LandingPage from './components/LandingPage'
import GitHubIntegration from './components/GitHubIntegration'
import GitLabIntegration from './components/GitLabIntegration'
import SlackIntegration from './components/SlackIntegration'
import EventTracker from './components/EventTracker'
import SuggestedTasks from './components/SuggestedTasks'
import RecentConversations from './components/RecentConversations'
import WebSocketService from './services/WebSocketService'

function App() {
  const [activeFile, setActiveFile] = useState(null)
  const [files, setFiles] = useState([])
  const [consoleOutput, setConsoleOutput] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [showMaxModeInterface, setShowMaxModeInterface] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [currentCode, setCurrentCode] = useState('')
  
  // New state for integrations and landing page
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'workspace', 'github', 'gitlab', 'slack'
  const [selectedRepository, setSelectedRepository] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [suggestedTasks, setSuggestedTasks] = useState([])
  const [events, setEvents] = useState([])
  const [showEventTracker, setShowEventTracker] = useState(false)
  const [showSlackIntegration, setShowSlackIntegration] = useState(false)
  const [showSuggestedTasks, setShowSuggestedTasks] = useState(false)
  const [showRecentConversations, setShowRecentConversations] = useState(false)
  
  const wsService = useRef(null)

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.current = new WebSocketService()
    
    wsService.current.onConnect = () => {
      setIsConnected(true)
      console.log('Connected to server')
    }
    
    wsService.current.onDisconnect = () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    }
    
    wsService.current.onMessage = (message) => {
      handleServerMessage(message)
    }
    
    wsService.current.connect()
    
    // Load initial data
    loadFiles()
    loadRecentSessions()
    loadSuggestedTasks()
    
    return () => {
      wsService.current?.disconnect()
    }
  }, [])

  const handleServerMessage = (message) => {
    switch (message.type) {
      case 'console_output':
        setConsoleOutput(prev => [...prev, { type: 'log', content: message.output }])
        break
      case 'execution_result':
        if (message.result) {
          setConsoleOutput(prev => [...prev, { type: 'result', content: message.result }])
        }
        if (message.error) {
          setConsoleOutput(prev => [...prev, { type: 'error', content: message.error }])
        }
        setIsExecuting(false)
        break
      case 'execution_error':
        setConsoleOutput(prev => [...prev, { type: 'error', content: message.error }])
        setIsExecuting(false)
        break
      case 'file_list':
        setFiles(message.files)
        break
      case 'file_content':
        if (message.path === activeFile) {
          // File content received
        }
        break
      case 'file_changed':
        // Handle real-time file changes
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const loadFiles = () => {
    wsService.current?.sendMessage('list_files', {})
  }

  const executeCode = (code, language = 'javascript') => {
    if (!isConnected) return
    
    setIsExecuting(true)
    setConsoleOutput(prev => [...prev, { type: 'info', content: `Executing ${language} code...` }])
    
    wsService.current?.sendMessage('execute_code', { code, language })
  }

  const saveFile = (filePath, content) => {
    if (!isConnected) return
    
    wsService.current?.sendMessage('write_file', { filePath, content })
  }

  const createFile = (filePath, content = '') => {
    if (!isConnected) return
    
    wsService.current?.sendMessage('create_file', { filePath, content })
    loadFiles()
  }

  const deleteFile = (filePath) => {
    if (!isConnected) return
    
    wsService.current?.sendMessage('delete_file', { filePath })
    loadFiles()
    
    if (activeFile === filePath) {
      setActiveFile(null)
    }
  }

  const selectFile = (filePath) => {
    setActiveFile(filePath)
    wsService.current?.sendMessage('read_file', { filePath })
  }

  const clearConsole = () => {
    setConsoleOutput([])
  }

  const handleCodeSuggestion = () => {
    setConsoleOutput(prev => [...prev, { 
      type: 'info', 
      content: 'AI: Analyzing code for suggestions...' 
    }])
    // Add AI suggestion logic here
  }

  const handleBugFix = () => {
    setConsoleOutput(prev => [...prev, { 
      type: 'info', 
      content: 'AI: Scanning code for potential bugs...' 
    }])
    // Add bug detection logic here
  }

  const handleOptimize = () => {
    setConsoleOutput(prev => [...prev, { 
      type: 'info', 
      content: 'AI: Analyzing code for optimization opportunities...' 
    }])
    // Add optimization logic here
  }

  const handleCodeChange = (code) => {
    setCurrentCode(code)
  }

  const createChatSession = async () => {
    try {
      const response = await fetch('/api/v1/sessions', {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.code === 0) {
        setCurrentSessionId(data.data.session_id)
        setShowChatInterface(true)
      }
    } catch (error) {
      console.error('Failed to create chat session:', error)
    }
  }

  const closeChatInterface = () => {
    setShowChatInterface(false)
  }

  const createMaxModeSession = async () => {
    try {
      const response = await fetch('/api/v1/sessions', {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.code === 0) {
        setCurrentSessionId(data.data.session_id)
        setShowMaxModeInterface(true)
      }
    } catch (error) {
      console.error('Failed to create Max Mode session:', error)
    }
  }

  const closeMaxModeInterface = () => {
    setShowMaxModeInterface(false)
  }

  const handleCodeExecute = (code, language = 'javascript') => {
    executeCode(code, language)
  }

  // New handler functions for integrations
  const handleRepositorySelect = (repository) => {
    setSelectedRepository(repository)
    setCurrentView(repository.provider)
  }

  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/v1/sessions', {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.code === 0) {
        setCurrentSessionId(data.data.session_id)
        setCurrentView('workspace')
        setShowChatInterface(true)
      }
    } catch (error) {
      console.error('Failed to create chat session:', error)
    }
  }

  const loadRecentSessions = async () => {
    try {
      const response = await fetch('/api/v1/sessions')
      const data = await response.json()
      if (data.code === 0) {
        setRecentSessions(data.data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to load recent sessions:', error)
    }
  }

  const loadSuggestedTasks = async () => {
    // Mock suggested tasks - replace with actual API call
    setSuggestedTasks([
      {
        title: 'Fix authentication bug',
        description: 'Resolve the login issue reported by users',
        difficulty: 'Medium',
        estimatedTime: '2-3 hours'
      },
      {
        title: 'Add dark mode support',
        description: 'Implement dark theme for better user experience',
        difficulty: 'Easy',
        estimatedTime: '1-2 hours'
      },
      {
        title: 'Optimize database queries',
        description: 'Improve performance of slow database operations',
        difficulty: 'Hard',
        estimatedTime: '4-6 hours'
      }
    ])
  }

  const handleFileSelect = (file) => {
    console.log('File selected:', file)
    // Add file selection logic here
  }

  const handleIssueSelect = (issue) => {
    console.log('Issue selected:', issue)
    // Add issue selection logic here
  }

  const handlePRSelect = (pr) => {
    console.log('Pull Request selected:', pr)
    // Add PR selection logic here
  }

  const handleEventSelect = (event) => {
    console.log('Event selected:', event)
    // Add event selection logic here
  }

  const handleSlackMessage = (channel, message) => {
    console.log('Slack message sent:', { channel, message })
    // Add Slack message handling logic here
  }

  const handleTaskSelect = (task) => {
    console.log('Task selected:', task)
    // Add task selection logic here
  }

  const handleTaskStart = (task) => {
    console.log('Task started:', task)
    // Add task start logic here
  }

  const handleSessionSelect = (session) => {
    console.log('Session selected:', session)
    setCurrentSessionId(session.session_id)
    setCurrentView('workspace')
    setShowChatInterface(true)
  }

  const handleSessionDelete = async (sessionId) => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setRecentSessions(prev => prev.filter(s => s.session_id !== sessionId))
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  // Render landing page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onCreateSession={handleNewConversation}
        onSelectRepository={handleRepositorySelect}
        recentSessions={recentSessions}
        suggestedTasks={suggestedTasks}
      />
    )
  }

  return (
    <div className="flex h-screen bg-code-bg">
      {/* Sidebar */}
      <div className="w-80 sidebar flex flex-col">
        <div className="p-4 border-b border-code-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">CodeAct AI Agent</h1>
            <button
              onClick={() => setCurrentView('landing')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => createFile('new-file.js', '// New JavaScript file\nconsole.log("Hello, World!");')}
              className="button-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              New File
            </button>
            <button
              onClick={loadFiles}
              className="button-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`flex items-center gap-2 text-sm ${showAIAssistant ? 'button-primary' : 'button-secondary'}`}
            >
              <Bot size={16} />
              AI
            </button>
            <button
              onClick={createChatSession}
              className="flex items-center gap-2 text-sm button-secondary"
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button
              onClick={createMaxModeSession}
              className="flex items-center gap-2 text-sm bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all"
            >
              <Zap size={16} />
              Max Mode
            </button>
          </div>
          
          {/* Integration buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCurrentView('github')}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                currentView === 'github' ? 'bg-gray-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Github size={16} />
              GitHub
            </button>
            <button
              onClick={() => setCurrentView('gitlab')}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                currentView === 'gitlab' ? 'bg-orange-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <GitBranch size={16} />
              GitLab
            </button>
            <button
              onClick={() => setShowSlackIntegration(!showSlackIntegration)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                showSlackIntegration ? 'bg-purple-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Slack size={16} />
              Slack
            </button>
            <button
              onClick={() => setShowEventTracker(!showEventTracker)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                showEventTracker ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <MessageSquare size={16} />
              Events
            </button>
            <button
              onClick={() => setShowSuggestedTasks(!showSuggestedTasks)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                showSuggestedTasks ? 'bg-green-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Code size={16} />
              Tasks
            </button>
            <button
              onClick={() => setShowRecentConversations(!showRecentConversations)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                showRecentConversations ? 'bg-purple-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Clock size={16} />
              Recent
            </button>
          </div>
        </div>
        
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onSelectFile={selectFile}
          onDeleteFile={deleteFile}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* GitHub Integration */}
        {currentView === 'github' && (
          <GitHubIntegration
            repository={selectedRepository}
            onSelectFile={handleFileSelect}
            onSelectIssue={handleIssueSelect}
            onSelectPR={handlePRSelect}
          />
        )}

        {/* GitLab Integration */}
        {currentView === 'gitlab' && (
          <GitLabIntegration
            repository={selectedRepository}
            onSelectFile={handleFileSelect}
            onSelectIssue={handleIssueSelect}
            onSelectMR={handlePRSelect}
          />
        )}

        {/* Default Workspace */}
        {currentView === 'workspace' && (
          <>
            {/* Editor */}
            <div className="flex-1">
              <CodeEditor
                activeFile={activeFile}
                onSave={saveFile}
                onExecute={executeCode}
                onCodeChange={handleCodeChange}
                isExecuting={isExecuting}
              />
            </div>

            {/* Console */}
            <div className="h-64 border-t border-code-border">
              <Console
                output={consoleOutput}
                onClear={clearConsole}
              />
            </div>
          </>
        )}
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <div className="w-80">
          <AIAssistant
            onCodeSuggestion={handleCodeSuggestion}
            onBugFix={handleBugFix}
            onOptimize={handleOptimize}
          />
        </div>
      )}

      {/* Event Tracker */}
      {showEventTracker && (
        <div className="w-96">
          <EventTracker
            sessionId={currentSessionId}
            events={events}
            onEventSelect={handleEventSelect}
            isVisible={showEventTracker}
          />
        </div>
      )}

      {/* Slack Integration */}
      {showSlackIntegration && (
        <div className="w-96">
          <SlackIntegration
            workspace={{ name: 'CodeAct Team' }}
            onMessageSend={handleSlackMessage}
            isVisible={showSlackIntegration}
          />
        </div>
      )}

      {/* Suggested Tasks */}
      {showSuggestedTasks && (
        <div className="w-96">
          <SuggestedTasks
            tasks={suggestedTasks}
            onTaskSelect={handleTaskSelect}
            onTaskStart={handleTaskStart}
            isVisible={showSuggestedTasks}
          />
        </div>
      )}

      {/* Recent Conversations */}
      {showRecentConversations && (
        <div className="w-96">
          <RecentConversations
            sessions={recentSessions}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={handleSessionDelete}
            isVisible={showRecentConversations}
          />
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface
        sessionId={currentSessionId}
        isVisible={showChatInterface}
        onClose={closeChatInterface}
        onCodeExecute={handleCodeExecute}
      />

      {/* Max Mode Interface */}
      <MaxModeChatInterface
        sessionId={currentSessionId}
        isVisible={showMaxModeInterface}
        onClose={closeMaxModeInterface}
        onCodeExecute={handleCodeExecute}
      />
    </div>
  )
}

export default App
