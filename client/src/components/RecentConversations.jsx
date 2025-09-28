import React, { useState, useEffect } from 'react'
import { MessageSquare, Clock, User, Bot, Trash2, MoreVertical, Search, Filter, Star, Archive, Tag } from 'lucide-react'

const RecentConversations = ({ sessions = [], onSessionSelect, onSessionDelete, isVisible = true }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [favorites, setFavorites] = useState(new Set())

  const statuses = [
    { id: 'all', name: 'All', color: 'text-slate-400' },
    { id: 'active', name: 'Active', color: 'text-green-400' },
    { id: 'completed', name: 'Completed', color: 'text-blue-400' },
    { id: 'archived', name: 'Archived', color: 'text-slate-500' }
  ]

  const sortOptions = [
    { id: 'latest', name: 'Latest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'title', name: 'Title A-Z' },
    { id: 'unread', name: 'Unread First' }
  ]

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = searchQuery === '' || 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.latestMessage.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.latestMessageAt) - new Date(a.latestMessageAt)
        case 'oldest':
          return new Date(a.latestMessageAt) - new Date(b.latestMessageAt)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'unread':
          return b.unreadMessageCount - a.unreadMessageCount
        default:
          return 0
      }
    })

  const handleFavoriteToggle = (sessionId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(sessionId)) {
        newFavorites.delete(sessionId)
      } else {
        newFavorites.add(sessionId)
      }
      return newFavorites
    })
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10'
      case 'completed':
        return 'text-blue-400 bg-blue-500/10'
      case 'archived':
        return 'text-slate-500 bg-slate-500/10'
      default:
        return 'text-slate-400 bg-slate-500/10'
    }
  }

  const renderSession = (session) => (
    <div
      key={session.session_id}
      onClick={() => onSessionSelect?.(session)}
      className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/30 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{session.title}</h3>
            <p className="text-slate-400 text-sm truncate">{session.latestMessage}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {favorites.has(session.session_id) && (
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleFavoriteToggle(session.session_id)
            }}
            className="p-1 text-slate-400 hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSessionDelete?.(session.session_id)
            }}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
          {session.unreadMessageCount > 0 && (
            <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
              {session.unreadMessageCount} unread
            </span>
          )}
          {session.tags && session.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">{session.tags.length} tags</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(session.latestMessageAt)}</span>
        </div>
      </div>
    </div>
  )

  if (!isVisible) return null

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Recent Conversations</h2>
            <p className="text-slate-400">Your recent AI conversations and sessions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Archive className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No conversations found</h3>
            <p className="text-slate-400">Start a new conversation to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(renderSession)}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
          </span>
          <span>
            {favorites.size} favorited
          </span>
        </div>
      </div>
    </div>
  )
}

export default RecentConversations

