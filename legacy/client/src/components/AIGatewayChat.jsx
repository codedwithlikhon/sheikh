import React, { useState, useEffect, useRef } from 'react';
import { createOpenAIRealtimeClient } from '../utils/AIGatewayClient';

/**
 * AI Gateway Chat Component
 * Demonstrates real-time chat with Cloudflare AI Gateway
 */
const AIGatewayChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to AI Gateway
  const connectToGateway = async () => {
    try {
      setIsLoading(true);
      
      // Create OpenAI realtime client
      clientRef.current = createOpenAIRealtimeClient({
        // These would typically come from environment variables or user input
        openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        cloudflareToken: process.env.REACT_APP_CLOUDFLARE_TOKEN || '',
        onMessage: (data) => {
          // Handle incoming messages
          if (typeof data === 'string') {
            try {
              const parsed = JSON.parse(data);
              handleMessage(parsed);
            } catch (e) {
              console.log('Received non-JSON message:', data);
            }
          } else {
            handleMessage(data);
          }
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message || 'Connection failed'}` }]);
        },
        onClose: () => {
          setIsConnected(false);
          setMessages(prev => [...prev, { role: 'system', content: 'Connection closed' }]);
        },
        onOpen: () => {
          setIsConnected(true);
          setMessages(prev => [...prev, { role: 'system', content: 'Connected to AI Gateway' }]);
        }
      });

      await clientRef.current.connect();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to connect:', error);
      setMessages(prev => [...prev, { role: 'system', content: `Connection error: ${error.message}` }]);
      setIsLoading(false);
    }
  };

  // Handle incoming messages from the AI
  const handleMessage = (data) => {
    if (data.type === 'text') {
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } else if (data.type === 'content_block_delta' && data.delta?.text) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Append to existing message
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + data.delta.text }
          ];
        } else {
          // Create new message
          return [...prev, { role: 'assistant', content: data.delta.text }];
        }
      });
    }
  };

  // Send a message to the AI
  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Format message for OpenAI realtime API
    const payload = {
      type: 'response.create',
      response: { 
        modalities: ['text'], 
        instructions: input 
      }
    };
    
    clientRef.current.send(payload);
    setInput('');
  };

  // Disconnect from AI Gateway
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setIsConnected(false);
    }
  };

  return (
    <div className="ai-gateway-chat">
      <div className="chat-header">
        <h2>Cloudflare AI Gateway Chat</h2>
        <div className="connection-status">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <div className="connection-controls">
          {!isConnected ? (
            <button 
              onClick={connectToGateway} 
              disabled={isLoading}
              className="connect-button"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button 
              onClick={disconnect}
              className="disconnect-button"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-role">{msg.role}</div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button 
          onClick={sendMessage}
          disabled={!isConnected || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIGatewayChat;