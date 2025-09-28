import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Save, FileText } from 'lucide-react'

const CodeEditor = ({ activeFile, onSave, onExecute, onCodeChange, isExecuting }) => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isModified, setIsModified] = useState(false)

  useEffect(() => {
    if (activeFile) {
      // Reset state when file changes
      setCode('')
      setIsModified(false)
      setLanguage(getLanguageFromFile(activeFile))
    }
  }, [activeFile])

  const getLanguageFromFile = (filePath) => {
    const extension = filePath.split('.').pop()?.toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown'
    }
    return languageMap[extension] || 'javascript'
  }

  const handleCodeChange = (value) => {
    setCode(value || '')
    setIsModified(true)
    onCodeChange?.(value || '')
  }

  const handleSave = () => {
    if (activeFile && code) {
      onSave(activeFile, code)
      setIsModified(false)
    }
  }

  const handleExecute = () => {
    if (code.trim()) {
      onExecute(code, language)
    }
  }

  const handleKeyDown = (event) => {
    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      handleSave()
    }
    
    // Ctrl+Enter or Cmd+Enter to execute
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleExecute()
    }
  }

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-code-text">
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 text-code-border" />
          <h2 className="text-xl font-semibold mb-2">No file selected</h2>
          <p className="text-code-border">Select a file from the sidebar to start coding</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-code-border bg-code-sidebar">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-white">{activeFile}</h3>
          {isModified && (
            <span className="text-xs text-yellow-400">● Modified</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
          
          <button
            onClick={handleSave}
            disabled={!isModified}
            className="button-secondary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save size={16} />
            Save
          </button>
          
          <button
            onClick={handleExecute}
            disabled={isExecuting || !code.trim()}
            className="button-success flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Play size={16} />
            {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1" onKeyDown={handleKeyDown}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            contextmenu: true,
            mouseWheelZoom: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            wordBasedSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>
    </div>
  )
}

export default CodeEditor
