<!-- 
  ChatPage.vue
  Main chat interface with support for MCP server integrations
-->
<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with the assistant</p>
        </div>
        <template v-else>
          <ChatMessage 
            v-for="(msg, index) in messages" 
            :key="index" 
            :message="msg" 
            :role="msg.role || 'assistant'"
          />
        </template>
      </div>
      
      <ChatInput 
        :sessionId="sessionId" 
        :isLoading="isLoading"
        @send-message="handleSendMessage" 
      />
    </div>
    
    <ToolPanel 
      :sessionId="sessionId"
      @execute-tool="handleExecuteTool"
    />
  </div>
</template>

<script>
import ChatMessage from '../components/ChatMessage.vue';
import ChatInput from '../components/ChatInput.vue';
import ToolPanel from '../components/ToolPanel.vue';

export default {
  name: 'ChatPage',
  components: {
    ChatMessage,
    ChatInput,
    ToolPanel
  },
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      isLoading: false,
      eventSource: null
    };
  },
  mounted() {
    this.loadSessionHistory();
  },
  beforeUnmount() {
    this.closeEventSource();
  },
  methods: {
    async loadSessionHistory() {
      try {
        const response = await fetch(`/api/v1/sessions/${this.sessionId}`);
        const data = await response.json();
        
        if (data.code === 0 && data.data) {
          // Process and display session history
          this.messages = data.data.events || [];
        }
      } catch (error) {
        console.error('Failed to load session history:', error);
      }
    },
    
    handleSendMessage(messageData) {
      // Add user message to the chat
      this.messages.push({
        content: messageData.content,
        timestamp: messageData.timestamp,
        role: 'user'
      });
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Send message to backend
      this.sendMessageToBackend(messageData);
    },
    
    async sendMessageToBackend(messageData) {
      this.isLoading = true;
      this.closeEventSource(); // Close any existing connection
      
      try {
        // Create new EventSource for streaming response
        this.eventSource = new EventSource(`/api/v1/sessions/${this.sessionId}/chat?message=${encodeURIComponent(messageData.content)}`);
        
        // Handle different event types
        this.eventSource.addEventListener('message', this.handleMessageEvent);
        this.eventSource.addEventListener('tool', this.handleToolEvent);
        this.eventSource.addEventListener('error', this.handleErrorEvent);
        this.eventSource.addEventListener('done', this.handleDoneEvent);
        
        // Handle connection error
        this.eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          this.closeEventSource();
          this.isLoading = false;
        };
      } catch (error) {
        console.error('Failed to send message:', error);
        this.isLoading = false;
      }
    },
    
    handleMessageEvent(event) {
      try {
        const data = JSON.parse(event.data);
        this.messages.push({
          content: data.content,
          timestamp: data.timestamp || Math.floor(Date.now() / 1000),
          role: 'assistant'
        });
        this.scrollToBottom();
      } catch (error) {
        console.error('Error parsing message event:', error);
      }
    },
    
    handleToolEvent(event) {
      try {
        const data = JSON.parse(event.data);
        this.messages.push({
          tool: data.tool,
          status: data.status,
          result: data.result,
          error: data.error,
          timestamp: data.timestamp || Math.floor(Date.now() / 1000)
        });
        this.scrollToBottom();
      } catch (error) {
        console.error('Error parsing tool event:', error);
      }
    },
    
    handleErrorEvent(event) {
      try {
        const data = JSON.parse(event.data);
        this.messages.push({
          content: `Error: ${data.error || 'Unknown error occurred'}`,
          timestamp: Math.floor(Date.now() / 1000),
          role: 'system'
        });
        this.scrollToBottom();
      } catch (error) {
        console.error('Error parsing error event:', error);
      }
    },
    
    handleDoneEvent() {
      this.closeEventSource();
      this.isLoading = false;
    },
    
    closeEventSource() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    },
    
    async handleExecuteTool(toolData) {
      try {
        // Add tool execution message
        this.messages.push({
          tool: toolData.tool,
          status: 'started',
          timestamp: Math.floor(Date.now() / 1000)
        });
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Send tool execution request
        const response = await fetch(`/api/v1/sessions/${this.sessionId}/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tool: toolData.tool,
            params: toolData.params
          })
        });
        
        const data = await response.json();
        
        // Update tool execution message with result
        const toolIndex = this.messages.findIndex(
          msg => msg.tool === toolData.tool && msg.status === 'started'
        );
        
        if (toolIndex !== -1) {
          if (data.code === 0) {
            this.messages[toolIndex] = {
              ...this.messages[toolIndex],
              status: 'completed',
              result: data.data
            };
          } else {
            this.messages[toolIndex] = {
              ...this.messages[toolIndex],
              status: 'error',
              error: data.msg || 'Tool execution failed'
            };
          }
          
          // Force update
          this.messages = [...this.messages];
        }
      } catch (error) {
        console.error('Tool execution error:', error);
        
        // Update tool message with error
        const toolIndex = this.messages.findIndex(
          msg => msg.tool === toolData.tool && msg.status === 'started'
        );
        
        if (toolIndex !== -1) {
          this.messages[toolIndex] = {
            ...this.messages[toolIndex],
            status: 'error',
            error: error.message || 'Tool execution failed'
          };
          
          // Force update
          this.messages = [...this.messages];
        }
      }
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>