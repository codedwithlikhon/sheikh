<!-- 
  ChatInput.vue
  Input component for user messages with support for sending commands
-->
<template>
  <div class="chat-input-container">
    <textarea
      ref="inputField"
      v-model="message"
      @keydown.enter.prevent="handleEnter"
      placeholder="Type a message..."
      class="chat-input"
      :disabled="isLoading"
    ></textarea>
    <div class="input-actions">
      <button 
        @click="sendMessage" 
        class="send-button" 
        :disabled="!canSend || isLoading"
      >
        <span v-if="isLoading">
          <svg class="loading-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke-width="3" />
          </svg>
        </span>
        <span v-else>Send</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    sessionId: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      message: ''
    };
  },
  computed: {
    canSend() {
      return this.message.trim().length > 0;
    }
  },
  methods: {
    handleEnter(event) {
      // Send message on Enter (without Shift)
      if (!event.shiftKey && this.canSend && !this.isLoading) {
        this.sendMessage();
      }
    },
    sendMessage() {
      if (!this.canSend || this.isLoading) return;
      
      // Emit the message to parent component
      this.$emit('send-message', {
        content: this.message.trim(),
        timestamp: Math.floor(Date.now() / 1000),
        sessionId: this.sessionId
      });
      
      // Clear the input
      this.message = '';
      
      // Focus back on input
      this.$nextTick(() => {
        this.$refs.inputField.focus();
      });
    }
  }
};
</script>

<style scoped>
.chat-input-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  padding: 12px;
  margin: 16px;
}

.chat-input {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  resize: vertical;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  padding: 0;
}

.chat-input:disabled {
  background-color: white;
  color: #9ca3af;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.send-button {
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.send-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  stroke: white;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>