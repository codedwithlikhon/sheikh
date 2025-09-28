import React, { useState, useEffect } from 'react'
import { Code, Clock, Star, ArrowRight, Filter, Search, CheckCircle, Play, Zap } from 'lucide-react'

const SuggestedTasks = ({ tasks = [], onTaskSelect, onTaskStart, isVisible = true }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [completedTasks, setCompletedTasks] = useState(new Set())

  const difficulties = [
    { id: 'all', name: 'All', color: 'text-slate-400' },
    { id: 'easy', name: 'Easy', color: 'text-green-400' },
    { id: 'medium', name: 'Medium', color: 'text-yellow-400' },
    { id: 'hard', name: 'Hard', color: 'text-red-400' }
  ]

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'bug-fix', name: 'Bug Fixes' },
    { id: 'feature', name: 'Features' },
    { id: 'optimization', name: 'Optimization' },
    { id: 'documentation', name: 'Documentation' },
    { id: 'testing', name: 'Testing' }
  ]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty.toLowerCase() === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const handleTaskStart = (task) => {
    setCompletedTasks(prev => new Set([...prev, task.id]))
    onTaskStart?.(task)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-500/10'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'hard':
        return 'text-red-400 bg-red-500/10'
      default:
        return 'text-slate-400 bg-slate-500/10'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bug-fix':
        return '🐛'
      case 'feature':
        return '✨'
      case 'optimization':
        return '⚡'
      case 'documentation':
        return '📚'
      case 'testing':
        return '🧪'
      default:
        return '💼'
    }
  }

  const renderTask = (task) => (
    <div
      key={task.id}
      className={`p-6 rounded-xl border transition-all cursor-pointer ${
        completedTasks.has(task.id)
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
      }`}
      onClick={() => onTaskSelect?.(task)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{task.title}</h3>
            <p className="text-slate-400 text-sm">{task.description}</p>
          </div>
        </div>
        {completedTasks.has(task.id) && (
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(task.difficulty)}`}>
            {task.difficulty}
          </span>
          <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-full">
            {getCategoryIcon(task.category)} {task.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedTime}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {task.priority && (
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-400' : 'text-slate-400'}`} />
              <span className="text-xs text-slate-400">{task.priority}</span>
            </div>
          )}
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Created {task.createdAt}</span>
          {task.assignee && <span>• Assigned to {task.assignee}</span>}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleTaskStart(task)
            }}
            disabled={completedTasks.has(task.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              completedTasks.has(task.id)
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {completedTasks.has(task.id) ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Task</span>
              </>
            )}
          </button>
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
            <h2 className="text-2xl font-bold text-white mb-2">Suggested Tasks</h2>
            <p className="text-slate-400">AI-powered task recommendations for your repository</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-slate-400">Try adjusting your search criteria or check back later for new suggestions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(renderTask)}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </span>
          <span>
            {completedTasks.size} completed
          </span>
        </div>
      </div>
    </div>
  )
}

export default SuggestedTasks

