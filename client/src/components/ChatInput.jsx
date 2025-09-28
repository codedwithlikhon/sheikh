import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, Settings, Bot } from 'lucide-react'

const ChatInput = ({ onSendMessage, onAttachFile, isConnected, isProcessing, onSettingsClick }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onAttachFile) {
      onAttachFile(file)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
  }

  const quickActions = [
    { label: 'Explain code', action: () => setMessage('Can you explain this code?') },
    { label: 'Find bugs', action: () => setMessage('Please review this code for potential bugs') },
    { label: 'Optimize', action: () => setMessage('How can I optimize this code?') },
    { label: 'Browser automation', action: () => setMessage('Help me automate browser tasks') }
  ]

  return (
    <div className="border-t border-code-border bg-code-bg">
      {/* Quick Actions */}
      {isExpanded && (
        <div className="p-3 border-b border-code-border">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="px-3 py-1 text-xs bg-code-accent text-white rounded-md hover:bg-code-accent-hover transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={handleFileAttach}
            className="p-2 text-code-text hover:text-white transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".js,.ts,.jsx,.tsx,.py,.html,.css,.json,.md"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Ask me anything about your code..." : "Connecting..."}
              disabled={!isConnected || isProcessing}
              className="w-full px-4 py-3 pr-12 bg-code-input text-white placeholder-code-text rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-code-accent disabled:opacity-50"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-1 right-12 text-xs text-code-text">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 transition-colors ${
              isRecording 
                ? 'text-red-500 hover:text-red-400' 
                : 'text-code-text hover:text-white'
            }`}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || !isConnected || isProcessing}
            className="p-2 bg-code-accent text-white rounded-lg hover:bg-code-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send size={20} />
          </button>

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-code-text hover:text-white transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <Settings size={20} />
          </button>
        </form>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-code-text">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            {isProcessing && (
              <div className="flex items-center gap-1">
                <Bot size={14} className="animate-pulse" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          <div className="text-xs">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
