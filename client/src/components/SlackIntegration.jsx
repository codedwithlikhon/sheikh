import React, { useState, useEffect } from 'react'
import { Slack, MessageSquare, Users, Hash, Bell, Settings, Send, Paperclip, Smile, MoreVertical } from 'lucide-react'

const SlackIntegration = ({ workspace, onMessageSend, isVisible = true }) => {
  const [activeChannel, setActiveChannel] = useState(null)
  const [message, setMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (workspace) {
      loadSlackData()
    }
  }, [workspace])

  const loadSlackData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls to fetch Slack data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual API calls
      setChannels([
        { id: 'general', name: 'general', type: 'channel', unread: 3, members: 12 },
        { id: 'dev-team', name: 'dev-team', type: 'channel', unread: 0, members: 8 },
        { id: 'ai-assistant', name: 'ai-assistant', type: 'channel', unread: 1, members: 5 },
        { id: 'random', name: 'random', type: 'channel', unread: 0, members: 15 },
        { id: 'john-doe', name: 'john-doe', type: 'dm', unread: 2, members: 1 }
      ])
      
      setMessages([
        {
          id: 1,
          user: 'alice-dev',
          avatar: 'A',
          content: 'Hey team! The new AI integration is working great 🚀',
          timestamp: '2 minutes ago',
          reactions: [{ emoji: '🚀', count: 3 }]
        },
        {
          id: 2,
          user: 'bob-qa',
          avatar: 'B',
          content: 'I found a small bug in the authentication flow. Should I create an issue?',
          timestamp: '5 minutes ago',
          reactions: []
        },
        {
          id: 3,
          user: 'ai-assistant',
          avatar: '🤖',
          content: 'I can help you create an issue! Would you like me to:',
          timestamp: '3 minutes ago',
          reactions: [],
          isBot: true,
          attachments: [
            {
              type: 'button',
              text: 'Create GitHub Issue',
              action: 'create_issue'
            },
            {
              type: 'button',
              text: 'Create GitLab Issue',
              action: 'create_gitlab_issue'
            }
          ]
        }
      ])
      
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to load Slack data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || !activeChannel) return
    
    const newMessage = {
      id: Date.now(),
      user: 'You',
      avatar: 'Y',
      content: message,
      timestamp: 'now',
      reactions: []
    }
    
    setMessages(prev => [...prev, newMessage])
    onMessageSend?.(activeChannel, message)
    setMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderChannel = (channel) => (
    <div
      key={channel.id}
      onClick={() => setActiveChannel(channel)}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        activeChannel?.id === channel.id
          ? 'bg-purple-500/20 text-purple-400'
          : 'hover:bg-slate-700/50 text-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {channel.type === 'channel' ? (
            <Hash className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          <span className="font-medium">{channel.name}</span>
        </div>
        {channel.unread > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {channel.unread}
          </span>
        )}
      </div>
    </div>
  )

  const renderMessage = (msg) => (
    <div key={msg.id} className="flex space-x-3 p-4 hover:bg-slate-700/30 transition-colors">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-white">{msg.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-white">{msg.user}</span>
          <span className="text-xs text-slate-400">{msg.timestamp}</span>
          {msg.isBot && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              Bot
            </span>
          )}
        </div>
        <p className="text-slate-300 mb-2">{msg.content}</p>
        
        {msg.attachments && (
          <div className="space-y-2 mb-2">
            {msg.attachments.map((attachment, index) => (
              <button
                key={index}
                onClick={() => console.log('Button clicked:', attachment.action)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                {attachment.text}
              </button>
            ))}
          </div>
        )}
        
        {msg.reactions.length > 0 && (
          <div className="flex space-x-2">
            {msg.reactions.map((reaction, index) => (
              <span
                key={index}
                className="text-sm px-2 py-1 bg-slate-700 rounded-full hover:bg-slate-600 cursor-pointer transition-colors"
              >
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (!isVisible) return null

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Slack className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Slack Integration</h2>
              <p className="text-sm text-slate-400">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Info */}
        {workspace && (
          <div className="text-sm text-slate-400">
            Workspace: {workspace.name}
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Channels Sidebar */}
        <div className="w-64 border-r border-slate-700 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Channels</h3>
            <div className="space-y-1">
              {channels.map(renderChannel)}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Direct Messages</h3>
            <div className="space-y-1">
              {channels.filter(c => c.type === 'dm').map(renderChannel)}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChannel ? (
            <>
              {/* Channel Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {activeChannel.type === 'channel' ? (
                      <Hash className="w-5 h-5 text-slate-400" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{activeChannel.name}</h3>
                      <p className="text-sm text-slate-400">
                        {activeChannel.members} member{activeChannel.members !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map(renderMessage)}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message #${activeChannel.name}`}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Slack className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SlackIntegration

