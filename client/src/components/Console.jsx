import React, { useEffect, useRef } from 'react'
import { Terminal, Trash2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const Console = ({ output, onClear }) => {
  const consoleRef = useRef(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [output])

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getOutputIcon = (type) => {
    switch (type) {
      case 'log':
        return '📝'
      case 'result':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📄'
    }
  }

  const getOutputClass = (type) => {
    switch (type) {
      case 'log':
        return 'text-green-400'
      case 'result':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-yellow-400'
      default:
        return 'text-code-text'
    }
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Console Header */}
      <div className="flex items-center justify-between p-3 border-b border-code-border bg-code-sidebar">
        <div className="flex items-center gap-2">
          <Terminal size={16} />
          <span className="font-semibold text-white">Console</span>
          <span className="text-xs text-code-border">({output.length} messages)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="button-secondary flex items-center gap-2 text-sm"
            disabled={output.length === 0}
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Console Output */}
      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
      >
        {output.length === 0 ? (
          <div className="text-center text-code-border py-8">
            <Terminal size={32} className="mx-auto mb-2" />
            <p>Console output will appear here</p>
            <p className="text-xs mt-1">Run some code to see results</p>
          </div>
        ) : (
          output.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded hover:bg-gray-800 group"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getOutputIcon(item.type)}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className={`${getOutputClass(item.type)} break-words`}>
                  {item.content}
                </div>
                <div className="text-xs text-code-border mt-1">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <button
                onClick={() => copyToClipboard(item.content, index)}
                className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity flex-shrink-0"
                title="Copy to clipboard"
              >
                {copiedIndex === index ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Console Footer */}
      <div className="p-2 border-t border-code-border bg-code-sidebar text-xs text-code-border">
        <div className="flex items-center justify-between">
          <span>Ready to execute code</span>
          <div className="flex items-center gap-4">
            <span>Ctrl+Enter: Run code</span>
            <span>Ctrl+S: Save file</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Console
