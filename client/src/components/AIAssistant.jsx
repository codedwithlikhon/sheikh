import React, { useState, useEffect, useRef } from 'react'
import { Bot, Send, Loader, Lightbulb, Bug, Zap, Globe, Terminal, FileCode, FileText } from 'lucide-react'

const API_BASE_URL = '/api/v1';

const AIAssistant = ({ onCodeSuggestion, onBugFix, onOptimize }) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [toolEvents, setToolEvents] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const eventSourceRef = useRef(null)
  
  // Create a session when component mounts
  useEffect(() => {
    createSession();
    
    // Cleanup function to close the session when component unmounts
    return () => {
      if (sessionId) {
        stopSession(sessionId);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  const createSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.code === 0 && data.data.session_id) {
        setSessionId(data.data.session_id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };
  
  const stopSession = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/sessions/${id}/stop`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || !sessionId) return
    
    // Add user message to the chat
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and show loading state
    setMessage('')
    setIsLoading(true)
    
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    try {
      // Start SSE connection for streaming response
      const eventSource = new EventSource(`${API_BASE_URL}/sessions/${sessionId}/chat?message=${encodeURIComponent(message)}`);
      eventSourceRef.current = eventSource;
      
      let assistantMessage = { role: 'assistant', content: '' };
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Update assistant message content
          assistantMessage.content += data.content;
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantIndex = newMessages.findIndex(msg => msg.role === 'assistant' && msg.content === assistantMessage.content.slice(0, -data.content.length));
            
            if (assistantIndex >= 0) {
              newMessages[assistantIndex] = assistantMessage;
            } else {
              newMessages.push(assistantMessage);
            }
            
            return newMessages;
          });
        } else if (data.type === 'tool') {
          // Add tool event
          setToolEvents(prev => [...prev, data.tool]);
        } else if (data.type === 'plan') {
          // Update execution plan
          setCurrentPlan(data.plan);
        } else if (data.type === 'step') {
          // Update step status in the plan
          setCurrentPlan(prev => {
            if (!prev) return prev;
            
            const updatedSteps = prev.steps.map(step => {
              if (step.id === data.step.id) {
                return { ...step, status: data.step.status };
              }
              return step;
            });
            
            return { ...prev, steps: updatedSteps };
          });
        } else if (data.type === 'done') {
          // Conversation is complete
          eventSource.close();
          eventSourceRef.current = null;
          setIsLoading(false);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }

  const generateLocalSuggestions = (input) => {
    const suggestions = []
    
    // Code explanation suggestion
    if (input.toLowerCase().includes('explain') || input.toLowerCase().includes('what') || input.toLowerCase().includes('how')) {
      suggestions.push({
        title: 'Explain Code',
        description: 'Get a detailed explanation of the selected code',
        icon: <FileText size={18} />,
        action: () => onCodeSuggestion('explain')
      })
    }
    
    // Bug fixing suggestion
    if (input.toLowerCase().includes('bug') || input.toLowerCase().includes('fix') || input.toLowerCase().includes('error')) {
      suggestions.push({
        title: 'Fix Bugs',
        description: 'Identify and fix bugs in the selected code',
        icon: <Bug size={18} />,
        action: () => onBugFix()
      })
    }
    
    // Optimization suggestion
    if (input.toLowerCase().includes('optimize') || input.toLowerCase().includes('improve') || input.toLowerCase().includes('better')) {
      suggestions.push({
        title: 'Optimize Code',
        description: 'Suggest optimizations for the selected code',
        icon: <Zap size={18} />,
        action: () => onOptimize()
      })
    }
    
    // Browser automation suggestion
    if (input.toLowerCase().includes('browser') || input.toLowerCase().includes('automate') || input.toLowerCase().includes('playwright')) {
      suggestions.push({
        title: 'Browser Automation',
        description: 'Help with browser automation using Playwright',
        icon: <Globe size={18} />,
        action: () => handleBrowserAutomation()
      })
    }
    
    return suggestions
  }
  
  const handleBrowserAutomation = () => {
    setMessage("Help me automate a browser task using Playwright");
  }

  const clearSuggestions = () => {
    setSuggestions([])
    setMessage('')
  }
  
  const clearConversation = async () => {
    if (sessionId) {
      // Stop current session
      await stopSession(sessionId);
      
      // Create a new session
      await createSession();
      
      // Clear messages and other state
      setMessages([]);
      setToolEvents([]);
      setCurrentPlan(null);
      setSuggestions([]);
    }
  }

  return (
    <div className="h-full flex flex-col bg-code-sidebar border-l border-code-border">
      {/* Header */}
      <div className="p-4 border-b border-code-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-code-accent" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          {messages.length > 0 && (
            <button 
              onClick={clearConversation}
              className="text-xs text-code-border hover:text-white"
            >
              New Chat
            </button>
          )}
        </div>
        <p className="text-sm text-code-border">
          Ask me to help with your code, fix bugs, or suggest improvements.
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-code-accent text-white' 
                      : 'bg-code-bg border border-code-border text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Show current plan if available */}
            {currentPlan && (
              <div className="border border-code-border rounded-lg p-3 my-2 bg-code-bg">
                <h5 className="font-medium text-white mb-2">Execution Plan</h5>
                <div className="space-y-2">
                  {currentPlan.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        step.status === 'completed' 
                          ? 'bg-green-500' 
                          : step.status === 'in_progress' 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        step.status === 'completed' 
                          ? 'line-through text-code-border' 
                          : 'text-white'
                      }`}>
                        {step.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show tool events */}
            {toolEvents.length > 0 && (
              <div className="border border-code-border rounded-lg p-3 my-2 bg-code-bg">
                <h5 className="font-medium text-white mb-2">Tool Executions</h5>
                <div className="space-y-2">
                  {toolEvents.map((event, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2">
                        {event.tool_name.startsWith('browser_') ? (
                          <Globe size={14} className="text-blue-400" />
                        ) : (
                          <Terminal size={14} className="text-green-400" />
                        )}
                        <span className="font-medium text-white">{event.tool_name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          event.status === 'completed' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      {event.parameters && (
                        <div className="ml-6 mt-1 text-code-border">
                          {Object.entries(event.parameters).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-400">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-center my-2">
                <Loader size={20} className="animate-spin text-code-accent" />
              </div>
            )}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Suggestions</h4>
              <button
                onClick={clearSuggestions}
                className="text-xs text-code-border hover:text-white"
              >
                Clear
              </button>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-code-bg rounded border border-code-border hover:border-code-accent transition-colors cursor-pointer"
                onClick={suggestion.action}
              >
                <div className="flex items-start gap-3">
                  <div className="text-code-accent mt-0.5">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">
                      {suggestion.title}
                    </h5>
                    <p className="text-sm text-code-border">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-code-border py-8">
            <Bot size={32} className="mx-auto mb-2" />
            <p className="text-sm">Start a conversation to get AI assistance</p>
            <p className="text-xs mt-1">Try asking about bugs, optimization, or code suggestions</p>
          </div>
        )
      </div>
      
      {/* Quick Action Buttons */}
      <div className="p-4 border-t border-code-border">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setMessage("Explain this code")}
            className="button-secondary text-xs py-1.5"
          >
            <FileCode size={14} className="mr-1" /> Explain
          </button>
          <button
            onClick={() => setMessage("Fix bugs in this code")}
            className="button-secondary text-xs py-1.5"
          >
            <Bug size={14} className="mr-1" /> Fix Bug
          </button>
          <button
            onClick={() => setMessage("Optimize this code")}
            className="button-secondary text-xs py-1.5"
          >
            <Zap size={14} className="mr-1" /> Optimize
          </button>
          <button
            onClick={handleBrowserAutomation}
            className="button-secondary text-xs py-1.5"
          >
            <Globe size={14} className="mr-1" /> Browser
          </button>
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your code..."
              className="input-field flex-1 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="button-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AIAssistant
