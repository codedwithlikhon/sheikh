/**
 * Cloudflare AI Gateway WebSocket client for real-time AI interactions
 */

class AIGatewayClient {
  /**
   * Create a new AI Gateway WebSocket client
   * @param {Object} config - Configuration options
   * @param {string} config.provider - AI provider (e.g., 'openai', 'google', etc.)
   * @param {Object} config.params - URL query parameters
   * @param {string} config.apiKey - Provider API key (optional if using BYOK)
   * @param {string} config.cloudflareToken - Cloudflare API token
   * @param {Function} config.onMessage - Message handler
   * @param {Function} config.onError - Error handler
   * @param {Function} config.onClose - Close handler
   * @param {Function} config.onOpen - Open handler
   * @param {Object} config.gatewayOptions - Cloudflare AI Gateway specific options
   * @param {string} config.gatewayOptions.backoffType - Customize backoff type for request retries
   * @param {string} config.gatewayOptions.cacheKey - Override default cache key
   * @param {number} config.gatewayOptions.cacheTtl - Specify cache time-to-live
   * @param {boolean} config.gatewayOptions.collectLog - Bypass default log setting
   * @param {number} config.gatewayOptions.customCost - Customize request cost
   * @param {string} config.gatewayOptions.eventId - Unique identifier for tracing events
   * @param {string} config.gatewayOptions.logId - Unique identifier for log entry
   * @param {number} config.gatewayOptions.maxAttempts - Customize max retry attempts
   * @param {Object} config.gatewayOptions.metadata - Custom metadata for tracking
   * @param {number} config.gatewayOptions.requestTimeout - Timeout for fallback provider (ms)
   * @param {number} config.gatewayOptions.retryDelay - Customize retry delay
   * @param {boolean} config.gatewayOptions.skipCache - Bypass caching for this request
   * @param {string} config.gatewayOptions.step - Processing step identifier
   */
  constructor(config) {
    this.config = config;
    this.socket = null;
    this.isConnected = false;
    this.gatewayOptions = config.gatewayOptions || {};
  }

  /**
   * Connect to the AI Gateway WebSocket
   * @returns {Promise} - Resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Build the WebSocket URL with query parameters
        const baseUrl = `/api/v1/ai-gateway/ws/${this.config.provider}`;
        const queryParams = new URLSearchParams(this.config.params || {});
        
        // Add API key as query parameter if provided
        if (this.config.apiKey) {
          queryParams.append('api_key', this.config.apiKey);
        }
        
        // Add Cloudflare AI Gateway headers as query parameters
        // This allows the backend to extract and forward them to Cloudflare
        if (this.gatewayOptions) {
          Object.entries(this.gatewayOptions).forEach(([key, value]) => {
            // Convert camelCase to kebab-case for header names
            const headerKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            
            // Handle metadata object specially
            if (key === 'metadata' && typeof value === 'object') {
              queryParams.append(`cf_aig_${headerKey}`, JSON.stringify(value));
            } else {
              queryParams.append(`cf_aig_${headerKey}`, value.toString());
            }
          });
        }
        
        const url = `${baseUrl}?${queryParams.toString()}`;
        
        // Create WebSocket connection
        this.socket = new WebSocket(url);
        
        // Set up event handlers
        this.socket.onopen = (event) => {
          this.isConnected = true;
          if (this.config.onOpen) {
            this.config.onOpen(event);
          }
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          if (this.config.onMessage) {
            try {
              const data = JSON.parse(event.data);
              this.config.onMessage(data);
            } catch (error) {
              // Handle non-JSON responses
              this.config.onMessage(event.data);
            }
          }
        };
        
        this.socket.onerror = (error) => {
          if (this.config.onError) {
            this.config.onError(error);
          }
          reject(error);
        };
        
        this.socket.onclose = (event) => {
          this.isConnected = false;
          if (this.config.onClose) {
            this.config.onClose(event);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a message to the AI Gateway
   * @param {Object|string} message - Message to send
   * @returns {boolean} - Success status
   */
  send(message) {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected');
    }
    
    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(payload);
      return true;
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error);
      }
      return false;
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

/**
 * Create an OpenAI real-time client
 * @param {Object} config - Configuration
 * @returns {AIGatewayClient} - Configured client
 */
export function createOpenAIRealtimeClient(config) {
  return new AIGatewayClient({
    provider: 'openai',
    params: { model: 'gpt-4o-realtime-preview-2024-12-17', ...config.params },
    apiKey: config.openaiApiKey,
    cloudflareToken: config.cloudflareToken,
    onMessage: config.onMessage,
    onError: config.onError,
    onClose: config.onClose,
    onOpen: config.onOpen,
  });
}

/**
 * Create a Google AI client
 * @param {Object} config - Configuration
 * @returns {AIGatewayClient} - Configured client
 */
export function createGoogleAIClient(config) {
  return new AIGatewayClient({
    provider: 'google',
    params: { ...config.params },
    apiKey: config.googleApiKey,
    cloudflareToken: config.cloudflareToken,
    onMessage: config.onMessage,
    onError: config.onError,
    onClose: config.onClose,
    onOpen: config.onOpen,
  });
}

export default AIGatewayClient;