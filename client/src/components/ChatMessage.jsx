import React, { useState, useEffect, useRef } from 'react'
import { User, Bot, Copy, Check, ExternalLink, Code, Image, FileText, AlertCircle } from 'lucide-react'

const ChatMessage = ({ message, isUser, timestamp, isStreaming = false, onCodeExecute, onToolInvoke }) => {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messageRef = useRef(null)

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [message.content, isStreaming])

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderContent = (content) => {
    if (typeof content !== 'string') return content

    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const code = part.slice(3, -3).trim()
        const language = code.split('\n')[0].match(/^(\w+)/)?.[1] || 'text'
        const codeContent = code.replace(/^\w+\n/, '').trim()
        
        return (
          <div key={index} className="my-3">
            <div className="flex items-center justify-between bg-code-input px-3 py-2 rounded-t-lg border-b border-code-border">
              <span className="text-sm text-code-text font-mono">{language}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(codeContent)}
                  className="p-1 text-code-text hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {onCodeExecute && (
                  <button
                    onClick={() => onCodeExecute(codeContent, language)}
                    className="p-1 text-code-text hover:text-white transition-colors"
                    title="Execute code"
                  >
                    <Code size={14} />
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-code-input p-4 rounded-b-lg overflow-x-auto">
              <code className="text-sm text-white font-mono">{codeContent}</code>
            </pre>
          </div>
        )
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        const code = part.slice(1, -1)
        return (
          <code key={index} className="bg-code-input px-2 py-1 rounded text-sm font-mono text-code-accent">
            {code}
          </code>
        )
      } else {
        // Regular text
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      }
    })
  }

  const renderToolInvocation = (toolData) => {
    if (!toolData) return null

    return (
      <div className="mt-3 p-3 bg-code-input rounded-lg border border-code-border">
        <div className="flex items-center gap-2 mb-2">
          <Code size={16} className="text-code-accent" />
          <span className="text-sm font-medium text-white">Tool: {toolData.tool_name}</span>
          <span className={`px-2 py-1 text-xs rounded ${
            toolData.status === 'completed' ? 'bg-green-900 text-green-300' :
            toolData.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
            toolData.status === 'error' ? 'bg-red-900 text-red-300' :
            'bg-gray-900 text-gray-300'
          }`}>
            {toolData.status}
          </span>
        </div>
        
        {toolData.parameters && (
          <div className="mb-2">
            <span className="text-xs text-code-text">Parameters:</span>
            <pre className="text-xs text-white mt-1 bg-code-bg p-2 rounded">
              {JSON.stringify(toolData.parameters, null, 2)}
            </pre>
          </div>
        )}
        
        {toolData.result && (
          <div>
            <span className="text-xs text-code-text">Result:</span>
            <pre className="text-xs text-white mt-1 bg-code-bg p-2 rounded">
              {JSON.stringify(toolData.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={messageRef} className={`flex gap-3 p-4 ${isUser ? 'bg-code-bg' : 'bg-code-input'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-code-accent'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-code-text">
            {formatTimestamp(timestamp)}
          </span>
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-code-accent">
              <div className="w-2 h-2 bg-code-accent rounded-full animate-pulse"></div>
              <span>Streaming...</span>
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="text-white">
          {renderContent(message.content)}
          {message.tool_invocation && renderToolInvocation(message.tool_invocation)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => copyToClipboard(message.content)}
            className="p-1 text-code-text hover:text-white transition-colors"
            title="Copy message"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          
          {message.links && message.links.length > 0 && (
            <div className="flex items-center gap-1">
              {message.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-code-text hover:text-white transition-colors"
                  title={link.title}
                >
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {message.error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-red-300">{message.error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
