<!-- 
  ChatMessage.vue
  Displays a single chat message with support for different message types and tool results
-->
<template>
  <div :class="['message-container', role]">
    <div class="avatar">
      <div v-if="role === 'user'" class="user-avatar">U</div>
      <div v-else class="assistant-avatar">A</div>
    </div>
    <div class="message-content">
      <div v-if="isToolResult" class="tool-result">
        <div class="tool-header">
          <span class="tool-name">{{ message.tool }}</span>
          <span :class="['tool-status', message.status]">{{ message.status }}</span>
        </div>
        <div v-if="message.status === 'completed'" class="tool-output">
          <!-- Browser screenshot result -->
          <div v-if="message.tool === 'browser_take_screenshot' && message.result?.imageUrl" class="screenshot">
            <img :src="message.result.imageUrl" alt="Screenshot" />
          </div>
          
          <!-- Browser snapshot result -->
          <div v-else-if="message.tool === 'browser_snapshot'" class="snapshot">
            <div class="snapshot-info">Page snapshot captured</div>
          </div>
          
          <!-- Fetch result -->
          <div v-else-if="message.tool === 'fetch' && message.result?.content" class="fetch-result">
            <div class="fetch-url">{{ message.result.url }}</div>
            <div class="fetch-content">{{ truncateContent(message.result.content) }}</div>
          </div>
          
          <!-- Default tool result -->
          <div v-else class="generic-result">
            <pre>{{ JSON.stringify(message.result, null, 2) }}</pre>
          </div>
        </div>
        <div v-else-if="message.status === 'error'" class="tool-error">
          {{ message.error || 'An error occurred' }}
        </div>
      </div>
      <div v-else class="text-message">
        {{ message.content }}
      </div>
      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    },
    role: {
      type: String,
      default: 'assistant',
      validator: (value) => ['user', 'assistant', 'system'].includes(value)
    }
  },
  computed: {
    isToolResult() {
      return this.message.tool && this.message.status;
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    truncateContent(content) {
      if (!content) return '';
      return content.length > 500 ? content.substring(0, 500) + '...' : content;
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
}

.message-container.user {
  background-color: #f0f4f8;
  justify-content: flex-end;
}

.message-container.assistant {
  background-color: #f8f8f8;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-avatar {
  background-color: #4a6cf7;
  color: white;
}

.assistant-avatar {
  background-color: #10b981;
  color: white;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 48px);
}

.text-message {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  text-align: right;
}

.tool-result {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tool-name {
  font-weight: 500;
  color: #374151;
}

.tool-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.tool-status.started {
  background-color: #fef3c7;
  color: #92400e;
}

.tool-status.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.tool-status.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.tool-output {
  padding: 12px;
  background-color: white;
}

.tool-error {
  padding: 12px;
  background-color: #fee2e2;
  color: #b91c1c;
}

.screenshot img {
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.fetch-url {
  font-weight: 500;
  margin-bottom: 8px;
  color: #2563eb;
}

.fetch-content {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  background-color: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.generic-result pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  background-color: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
</style>