import React, { useState, useEffect, useRef } from 'react'
import { 
  Zap, 
  X, 
  Settings, 
  Play, 
  Square, 
  FileText, 
  Code, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Trash2
} from 'lucide-react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import MaxModePanel from './MaxModePanel'

const MaxModeChatInterface = ({ sessionId, isVisible, onClose, onCodeExecute }) => {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMaxModeEnabled, setIsMaxModeEnabled] = useState(false)
  const [maxModeStatus, setMaxModeStatus] = useState(null)
  const [showMaxModePanel, setShowMaxModePanel] = useState(false)
  const [toolOrchestration, setToolOrchestration] = useState(null)
  const [largeFiles, setLargeFiles] = useState([])
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    if (sessionId && isVisible) {
      loadMaxModeStatus()
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [sessionId, isVisible])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMaxModeStatus = async () => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/status`)
      const data = await response.json()
      if (data.code === 0) {
        setIsMaxModeEnabled(data.data.max_mode_enabled)
        setMaxModeStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to load Max Mode status:', error)
    }
  }

  const sendMessage = async (message) => {
    if (!sessionId || !message.trim()) return

    const newMessage = {
      id: Date.now(),
      content: message,
      role: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, newMessage])
    setIsProcessing(true)

    try {
      // Close existing event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Create new event source for streaming with Max Mode context
      const eventSource = new EventSource(`/api/v1/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          timestamp: Date.now(),
          max_mode: isMaxModeEnabled
        })
      })

      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleStreamEvent(data)
        } catch (error) {
          console.error('Failed to parse stream event:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error)
        setIsProcessing(false)
        eventSource.close()
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setIsProcessing(false)
    }
  }

  const handleStreamEvent = (data) => {
    switch (data.event) {
      case 'processing':
        // Show processing indicator
        break
      
      case 'model_selected':
        // Show model selection info
        console.log('Model selected:', data.data)
        break
      
      case 'message':
        // Add streaming message content
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + data.data.content
              }
            ]
          } else {
            return [
              ...prev,
              {
                id: Date.now(),
                content: data.data.content,
                role: 'assistant',
                timestamp: Date.now(),
                isStreaming: true
              }
            ]
          }
        })
        break
      
      case 'complete':
        // Mark streaming as complete
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                isStreaming: false,
                content: data.data.full_content || lastMessage.content
              }
            ]
          }
          return prev
        })
        setIsProcessing(false)
        break
      
      case 'tool_orchestration':
        // Handle tool orchestration events
        setToolOrchestration(prev => ({
          ...prev,
          ...data.data
        }))
        break
      
      case 'error':
        // Handle errors
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            content: data.data.error,
            role: 'assistant',
            timestamp: Date.now(),
            error: true
          }
        ])
        setIsProcessing(false)
        break
      
      case 'done':
        // Close event source
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }
        setIsProcessing(false)
        break
    }
  }

  const createToolOrchestrationPlan = async (taskDescription) => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/create-tool-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_description: taskDescription })
      })
      
      const data = await response.json()
      if (data.code === 0) {
        setToolOrchestration(data.data)
      }
    } catch (error) {
      console.error('Failed to create tool orchestration plan:', error)
    }
  }

  const executeToolOrchestration = async () => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/execute-tools`, {
        method: 'POST'
      })
      
      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              handleStreamEvent(data)
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to execute tool orchestration:', error)
    }
  }

  const processLargeFile = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/process-large-file`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.code === 0) {
        setLargeFiles(prev => [...prev, data.data])
      }
    } catch (error) {
      console.error('Failed to process large file:', error)
    }
  }

  const handleAttachFile = (file) => {
    if (isMaxModeEnabled) {
      processLargeFile(file)
    } else {
      console.log('File attached:', file)
    }
  }

  const handleMaxModeToggle = (enabled) => {
    setIsMaxModeEnabled(enabled)
    if (enabled) {
      loadMaxModeStatus()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-code-bg rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-code-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Max Mode AI Assistant</h2>
                <p className="text-sm text-code-text">
                  Ultra-large context • 200+ tools • 750+ line files
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMaxModePanel(!showMaxModePanel)}
                className={`p-2 transition-colors ${
                  showMaxModePanel ? 'text-yellow-400' : 'text-code-text hover:text-white'
                }`}
                title="Max Mode Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-code-text hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Max Mode Status Bar */}
          {isMaxModeEnabled && maxModeStatus && (
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-b border-yellow-500/20">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <CheckCircle size={14} />
                    <span>Max Mode Active</span>
                  </div>
                  <div className="text-code-text">
                    Tokens: {maxModeStatus.context_tokens_used?.toLocaleString() || 0}
                  </div>
                  <div className="text-code-text">
                    Tools: {maxModeStatus.tool_invocations_count || 0}
                  </div>
                </div>
                <div className="text-code-text">
                  {maxModeStatus.capabilities?.join(', ') || ''}
                </div>
              </div>
            </div>
          )}

          {/* Tool Orchestration Panel */}
          {toolOrchestration && (
            <div className="p-4 border-b border-code-border bg-code-input">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <BarChart3 size={16} />
                  Tool Orchestration Plan
                </h3>
                <button
                  onClick={executeToolOrchestration}
                  className="px-3 py-1 bg-code-accent text-white text-xs rounded hover:bg-code-accent-hover transition-colors flex items-center gap-1"
                >
                  <Play size={12} />
                  Execute
                </button>
              </div>
              <div className="text-sm text-code-text">
                {toolOrchestration.total_tools} tools • {toolOrchestration.estimated_duration?.toFixed(1)}s estimated
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Zap size={48} className="text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Max Mode Ready</h3>
                  <p className="text-code-text mb-4">
                    Ultra-large context processing for complex tasks
                  </p>
                  {!isMaxModeEnabled && (
                    <button
                      onClick={() => setShowMaxModePanel(true)}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all"
                    >
                      Enable Max Mode
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.role === 'user'}
                    timestamp={message.timestamp}
                    isStreaming={message.isStreaming}
                    onCodeExecute={onCodeExecute}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSendMessage={sendMessage}
            onAttachFile={handleAttachFile}
            isConnected={isConnected}
            isProcessing={isProcessing}
          />
        </div>

        {/* Max Mode Panel */}
        {showMaxModePanel && (
          <MaxModePanel
            sessionId={sessionId}
            onMaxModeToggle={handleMaxModeToggle}
            isMaxModeEnabled={isMaxModeEnabled}
            className="w-80"
          />
        )}
      </div>
    </div>
  )
}

export default MaxModeChatInterface
