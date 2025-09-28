import React, { useState, useEffect, useRef } from 'react'
import { Play, Square, RotateCcw, CheckCircle, XCircle, Clock, Zap, MessageSquare, Tool, Settings, Filter, Search } from 'lucide-react'

const EventTracker = ({ sessionId, events = [], onEventSelect, isVisible = true }) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const eventsEndRef = useRef(null)

  const eventTypes = [
    { id: 'all', name: 'All Events', icon: MessageSquare, color: 'text-slate-400' },
    { id: 'message', name: 'Messages', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'tool', name: 'Tool Calls', icon: Tool, color: 'text-purple-400' },
    { id: 'step', name: 'Steps', icon: Play, color: 'text-green-400' },
    { id: 'error', name: 'Errors', icon: XCircle, color: 'text-red-400' },
    { id: 'state', name: 'State Changes', icon: Settings, color: 'text-yellow-400' }
  ]

  const filteredEvents = events.filter(event => {
    const matchesFilter = activeFilter === 'all' || event.type === activeFilter
    const matchesSearch = searchQuery === '' || 
      event.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.toolName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const scrollToBottom = () => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [filteredEvents])

  const getEventIcon = (event) => {
    switch (event.type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'tool':
        return <Tool className="w-4 h-4 text-purple-400" />
      case 'step':
        return <Play className="w-4 h-4 text-green-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'state':
        return <Settings className="w-4 h-4 text-yellow-400" />
      default:
        return <MessageSquare className="w-4 h-4 text-slate-400" />
    }
  }

  const getEventStatusIcon = (event) => {
    switch (event.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const renderEvent = (event, index) => (
    <div
      key={event.id || index}
      onClick={() => {
        setSelectedEvent(event)
        onEventSelect?.(event)
      }}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        selectedEvent?.id === event.id
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getEventIcon(event)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                {event.type === 'tool' ? event.toolName : event.type}
              </span>
              {event.status && getEventStatusIcon(event)}
            </div>
            <span className="text-xs text-slate-400">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
          
          {event.content && (
            <p className="text-sm text-slate-300 mb-2 line-clamp-2">
              {event.content}
            </p>
          )}
          
          {event.toolName && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Tool: {event.toolName}</span>
              {event.parameters && (
                <span>• {Object.keys(event.parameters).length} parameters</span>
              )}
            </div>
          )}
          
          {event.stepNumber && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Step {event.stepNumber}</span>
              {event.totalSteps && <span>of {event.totalSteps}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEventDetails = () => {
    if (!selectedEvent) return null

    return (
      <div className="p-6 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
            <span className="text-sm text-slate-400">{selectedEvent.type}</span>
          </div>
          
          {selectedEvent.toolName && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tool</label>
              <span className="text-sm text-slate-400">{selectedEvent.toolName}</span>
            </div>
          )}
          
          {selectedEvent.content && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
              <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                {selectedEvent.content}
              </div>
            </div>
          )}
          
          {selectedEvent.parameters && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Parameters</label>
              <pre className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedEvent.parameters, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Timestamp</label>
            <span className="text-sm text-slate-400">
              {new Date(selectedEvent.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Event Tracker</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 rounded-lg transition-colors ${
                isRunning 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Event Type Filters */}
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {eventTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setActiveFilter(type.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === type.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No events found</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => renderEvent(event, index))
          )}
          <div ref={eventsEndRef} />
        </div>
      </div>

      {/* Event Details Panel */}
      {renderEventDetails()}
    </div>
  )
}

export default EventTracker

