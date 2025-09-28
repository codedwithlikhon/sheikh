<!-- 
  ToolPanel.vue
  Provides UI for interacting with MCP server tools
-->
<template>
  <div class="tool-panel">
    <div class="panel-header">
      <h3>Tools</h3>
      <button @click="togglePanel" class="toggle-btn">
        {{ isPanelOpen ? '×' : '≡' }}
      </button>
    </div>
    
    <div v-if="isPanelOpen" class="panel-content">
      <div class="tool-category">
        <h4>Browser Automation</h4>
        <div class="tool-list">
          <button @click="selectTool('browser_navigate')" class="tool-btn">Navigate</button>
          <button @click="selectTool('browser_take_screenshot')" class="tool-btn">Screenshot</button>
          <button @click="selectTool('browser_click')" class="tool-btn">Click</button>
          <button @click="selectTool('browser_type')" class="tool-btn">Type</button>
          <button @click="selectTool('browser_snapshot')" class="tool-btn">Snapshot</button>
        </div>
      </div>
      
      <div class="tool-category">
        <h4>Web Content</h4>
        <div class="tool-list">
          <button @click="selectTool('fetch')" class="tool-btn">Fetch URL</button>
        </div>
      </div>
      
      <div v-if="selectedTool" class="tool-form">
        <h4>{{ getToolTitle(selectedTool) }}</h4>
        
        <!-- Browser Navigate -->
        <div v-if="selectedTool === 'browser_navigate'" class="tool-inputs">
          <div class="input-group">
            <label>URL</label>
            <input v-model="toolParams.url" placeholder="https://example.com" />
          </div>
          <button @click="executeTool" class="execute-btn">Navigate</button>
        </div>
        
        <!-- Browser Screenshot -->
        <div v-else-if="selectedTool === 'browser_take_screenshot'" class="tool-inputs">
          <div class="input-group">
            <label>Filename (optional)</label>
            <input v-model="toolParams.filename" placeholder="screenshot.png" />
          </div>
          <div class="input-group checkbox">
            <input type="checkbox" id="fullPage" v-model="toolParams.fullPage" />
            <label for="fullPage">Full Page</label>
          </div>
          <button @click="executeTool" class="execute-btn">Take Screenshot</button>
        </div>
        
        <!-- Browser Click -->
        <div v-else-if="selectedTool === 'browser_click'" class="tool-inputs">
          <div class="input-group">
            <label>Element Description</label>
            <input v-model="toolParams.element" placeholder="Login button" />
          </div>
          <div class="input-group">
            <label>Element Reference</label>
            <input v-model="toolParams.ref" placeholder="From snapshot" />
          </div>
          <button @click="executeTool" class="execute-btn">Click Element</button>
        </div>
        
        <!-- Browser Type -->
        <div v-else-if="selectedTool === 'browser_type'" class="tool-inputs">
          <div class="input-group">
            <label>Element Description</label>
            <input v-model="toolParams.element" placeholder="Username field" />
          </div>
          <div class="input-group">
            <label>Element Reference</label>
            <input v-model="toolParams.ref" placeholder="From snapshot" />
          </div>
          <div class="input-group">
            <label>Text</label>
            <input v-model="toolParams.text" placeholder="Text to type" />
          </div>
          <div class="input-group checkbox">
            <input type="checkbox" id="submit" v-model="toolParams.submit" />
            <label for="submit">Submit after typing</label>
          </div>
          <button @click="executeTool" class="execute-btn">Type Text</button>
        </div>
        
        <!-- Browser Snapshot -->
        <div v-else-if="selectedTool === 'browser_snapshot'" class="tool-inputs">
          <button @click="executeTool" class="execute-btn">Capture Snapshot</button>
        </div>
        
        <!-- Fetch URL -->
        <div v-else-if="selectedTool === 'fetch'" class="tool-inputs">
          <div class="input-group">
            <label>URL</label>
            <input v-model="toolParams.url" placeholder="https://example.com" />
          </div>
          <div class="input-group">
            <label>Max Length (optional)</label>
            <input v-model.number="toolParams.max_length" type="number" placeholder="10000" />
          </div>
          <div class="input-group checkbox">
            <input type="checkbox" id="raw" v-model="toolParams.raw" />
            <label for="raw">Raw HTML</label>
          </div>
          <button @click="executeTool" class="execute-btn">Fetch Content</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolPanel',
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isPanelOpen: true,
      selectedTool: null,
      toolParams: {},
      toolTitles: {
        browser_navigate: 'Navigate to URL',
        browser_take_screenshot: 'Take Screenshot',
        browser_click: 'Click Element',
        browser_type: 'Type Text',
        browser_snapshot: 'Capture Page Snapshot',
        fetch: 'Fetch Web Content'
      }
    };
  },
  methods: {
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
    },
    selectTool(tool) {
      this.selectedTool = tool;
      this.resetToolParams();
    },
    resetToolParams() {
      // Set default parameters based on selected tool
      switch (this.selectedTool) {
        case 'browser_navigate':
          this.toolParams = { url: '' };
          break;
        case 'browser_take_screenshot':
          this.toolParams = { filename: '', fullPage: false };
          break;
        case 'browser_click':
          this.toolParams = { element: '', ref: '' };
          break;
        case 'browser_type':
          this.toolParams = { element: '', ref: '', text: '', submit: false };
          break;
        case 'browser_snapshot':
          this.toolParams = {};
          break;
        case 'fetch':
          this.toolParams = { url: '', max_length: 10000, raw: false };
          break;
        default:
          this.toolParams = {};
      }
    },
    getToolTitle(tool) {
      return this.toolTitles[tool] || 'Unknown Tool';
    },
    executeTool() {
      // Validate parameters
      if (!this.validateParams()) {
        return;
      }
      
      // Emit event to parent component to execute the tool
      this.$emit('execute-tool', {
        tool: this.selectedTool,
        params: this.toolParams,
        sessionId: this.sessionId
      });
      
      // Reset after execution
      this.selectedTool = null;
    },
    validateParams() {
      // Basic validation based on tool type
      switch (this.selectedTool) {
        case 'browser_navigate':
          return !!this.toolParams.url;
        case 'browser_click':
          return !!this.toolParams.element && !!this.toolParams.ref;
        case 'browser_type':
          return !!this.toolParams.element && !!this.toolParams.ref && !!this.toolParams.text;
        case 'fetch':
          return !!this.toolParams.url;
        default:
          return true;
      }
    }
  }
};
</script>

<style scoped>
.tool-panel {
  border-left: 1px solid #e5e7eb;
  background-color: #f9fafb;
  height: 100%;
  width: 300px;
  position: relative;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #4b5563;
}

.panel-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100% - 50px);
}

.tool-category {
  margin-bottom: 20px;
}

.tool-category h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.tool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-btn {
  background-color: #e5e7eb;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background-color: #d1d5db;
}

.tool-form {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.tool-form h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #111827;
}

.tool-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 13px;
  color: #4b5563;
}

.input-group input {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.input-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.execute-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.execute-btn:hover {
  background-color: #1d4ed8;
}
</style>