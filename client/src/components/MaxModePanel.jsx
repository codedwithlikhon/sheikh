import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Settings, 
  Play, 
  Square, 
  FileText, 
  Code, 
  Database, 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Cpu,
  Memory
} from 'lucide-react'

const MaxModePanel = ({ sessionId, onMaxModeToggle, isMaxModeEnabled, className = '' }) => {
  const [capabilities, setCapabilities] = useState([])
  const [selectedCapabilities, setSelectedCapabilities] = useState([])
  const [maxModeStatus, setMaxModeStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadCapabilities()
    if (isMaxModeEnabled) {
      loadMaxModeStatus()
    }
  }, [sessionId, isMaxModeEnabled])

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/v1/max-mode/capabilities')
      const data = await response.json()
      if (data.code === 0) {
        setCapabilities(data.data.capabilities)
      }
    } catch (error) {
      console.error('Failed to load Max Mode capabilities:', error)
    }
  }

  const loadMaxModeStatus = async () => {
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/status`)
      const data = await response.json()
      if (data.code === 0) {
        setMaxModeStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to load Max Mode status:', error)
    }
  }

  const enableMaxMode = async () => {
    if (selectedCapabilities.length === 0) {
      alert('Please select at least one capability')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capabilities: selectedCapabilities })
      })
      
      const data = await response.json()
      if (data.code === 0) {
        setMaxModeStatus(data.data)
        onMaxModeToggle(true)
      }
    } catch (error) {
      console.error('Failed to enable Max Mode:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disableMaxMode = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/sessions/${sessionId}/max-mode/disable`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (data.code === 0) {
        setMaxModeStatus(null)
        onMaxModeToggle(false)
      }
    } catch (error) {
      console.error('Failed to disable Max Mode:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCapability = (capability) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability)
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    )
  }

  const getCapabilityIcon = (capability) => {
    switch (capability) {
      case 'ultra_large_context': return <Memory size={16} />
      case 'massive_tool_invocation': return <Cpu size={16} />
      case 'large_file_processing': return <FileText size={16} />
      case 'cross_module_analysis': return <Code size={16} />
      case 'complex_orchestration': return <BarChart3 size={16} />
      default: return <Settings size={16} />
    }
  }

  const getCapabilityDescription = (capability) => {
    switch (capability) {
      case 'ultra_large_context': return '1M+ token context window for massive content processing'
      case 'massive_tool_invocation': return '200+ tool invocations for complex automation'
      case 'large_file_processing': return '750+ line file processing with smart chunking'
      case 'cross_module_analysis': return 'Multi-file analysis and dependency tracking'
      case 'complex_orchestration': return 'Multi-step workflow orchestration'
      default: return 'Advanced processing capability'
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className={`bg-code-input border-l border-code-border h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-code-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            Max Mode
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-1 text-code-text hover:text-white transition-colors"
            title="Advanced Settings"
          >
            <Settings size={16} />
          </button>
        </div>
        
        {isMaxModeEnabled && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle size={14} />
            <span>Max Mode Active</span>
          </div>
        )}
      </div>

      {/* Status Display */}
      {isMaxModeEnabled && maxModeStatus && (
        <div className="p-4 border-b border-code-border">
          <h4 className="text-sm font-medium text-white mb-3">Current Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-code-text">Context Tokens:</span>
              <span className="text-white">{formatNumber(maxModeStatus.context_tokens_used)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-code-text">Tool Invocations:</span>
              <span className="text-white">{maxModeStatus.tool_invocations_count}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-code-text">Files Processed:</span>
              <span className="text-white">{maxModeStatus.files_processed}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-code-text">Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                maxModeStatus.status === 'active' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {maxModeStatus.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Selection */}
      {!isMaxModeEnabled && (
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm font-medium text-white mb-3">Select Capabilities</h4>
          <div className="space-y-3">
            {capabilities.map((capability) => (
              <div key={capability.name} className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCapabilities.includes(capability.name)}
                    onChange={() => toggleCapability(capability.name)}
                    className="mt-1 w-4 h-4 text-code-accent bg-code-bg border-code-border rounded focus:ring-code-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-white">
                      {getCapabilityIcon(capability.name)}
                      {capability.description}
                    </div>
                    <p className="text-xs text-code-text mt-1">
                      {getCapabilityDescription(capability.name)}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="p-4 border-b border-code-border">
          <h4 className="text-sm font-medium text-white mb-3">Advanced Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-code-text">Max Context Tokens</label>
              <div className="text-sm text-white">1,000,000</div>
            </div>
            <div>
              <label className="text-xs text-code-text">Max Tool Invocations</label>
              <div className="text-sm text-white">200</div>
            </div>
            <div>
              <label className="text-xs text-code-text">Max File Lines</label>
              <div className="text-sm text-white">750</div>
            </div>
            <div>
              <label className="text-xs text-code-text">Parallel Processing</label>
              <div className="text-sm text-green-400">Enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-code-border">
        {!isMaxModeEnabled ? (
          <button
            onClick={enableMaxMode}
            disabled={isLoading || selectedCapabilities.length === 0}
            className="w-full p-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Clock size={16} className="animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Zap size={16} />
                Enable Max Mode
              </>
            )}
          </button>
        ) : (
          <button
            onClick={disableMaxMode}
            disabled={isLoading}
            className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Clock size={16} className="animate-spin" />
                Disabling...
              </>
            ) : (
              <>
                <Square size={16} />
                Disable Max Mode
              </>
            )}
          </button>
        )}
      </div>

      {/* Usage Tips */}
      {!isMaxModeEnabled && (
        <div className="p-4 border-t border-code-border">
          <h4 className="text-sm font-medium text-white mb-2">Usage Tips</h4>
          <div className="space-y-2 text-xs text-code-text">
            <div className="flex items-start gap-2">
              <AlertCircle size={12} className="mt-0.5 text-yellow-500" />
              <span>Max Mode is designed for large, complex projects</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={12} className="mt-0.5 text-yellow-500" />
              <span>Higher resource usage and costs</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={12} className="mt-0.5 text-yellow-500" />
              <span>Best for cross-module refactoring</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaxModePanel
