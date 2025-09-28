import React, { useState, useEffect, useRef } from 'react'
import { Bot, X, Settings, MessageSquare, Code, Monitor } from 'lucide-react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import ToolPanel from './ToolPanel'

const ChatInterface = ({ sessionId, isVisible, onClose, onCodeExecute }) => {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState(null)
  const [showToolPanel, setShowToolPanel] = useState(false)
  const [aiModels, setAiModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
      loadAiModels()
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}`)
      const data = await response.json()
      if (data.code === 0) {
        setCurrentSession(data.data)
        setMessages(data.data.events || [])
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const loadAiModels = async () => {
    try {
      const response = await fetch('/api/v1/ai/models')
      const data = await response.json()
      if (data.code === 0) {
        setAiModels(data.data.models)
        // Select the first model by default
        if (data.data.models.length > 0) {
          setSelectedModel(data.data.models[0])
        }
      }
    } catch (error) {
      console.error('Failed to load AI models:', error)
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

      // Create new event source for streaming
      const eventSource = new EventSource(`/api/v1/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          timestamp: Date.now()
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
      
      case 'tool_server_started':
        // Show tool server status
        console.log('Tool server started:', data.data)
        break
      
      case 'tool':
        // Handle tool invocation
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                tool_invocation: data.data
              }
            ]
          }
          return prev
        })
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

  const handleToolInvoke = (toolName, result) => {
    console.log('Tool invoked:', toolName, result)
    // Handle tool invocation result
  }

  const handleAttachFile = (file) => {
    console.log('File attached:', file)
    // Handle file attachment
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-code-bg rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-code-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-code-accent rounded-full flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                <p className="text-sm text-code-text">
                  {currentSession ? `Session: ${currentSession.title}` : 'New Conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowToolPanel(!showToolPanel)}
                className="p-2 text-code-text hover:text-white transition-colors"
                title="Toggle Tool Panel"
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="text-code-text mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
                  <p className="text-code-text">Ask me anything about your code or request help with automation tasks.</p>
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
                    onToolInvoke={handleToolInvoke}
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

        {/* Tool Panel */}
        {showToolPanel && (
          <ToolPanel
            sessionId={sessionId}
            onToolInvoke={handleToolInvoke}
            className="w-80"
          />
        )}
      </div>
    </div>
  )
}

export default ChatInterface
