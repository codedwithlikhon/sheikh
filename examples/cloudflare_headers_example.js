/**
 * Example demonstrating Cloudflare AI Gateway headers usage
 * 
 * This example shows how to use various Cloudflare AI Gateway headers
 * to control caching, logging, retries, and other behaviors.
 */

import AIGatewayClient from '../client/src/utils/AIGatewayClient';

// Example 1: Basic usage with caching control
async function demonstrateCachingControl() {
  console.log('Example 1: Caching Control');
  
  // Create client with cache control options
  const client = new AIGatewayClient({
    provider: 'openai',
    params: { model: 'gpt-4' },
    apiKey: process.env.OPENAI_API_KEY,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    gatewayOptions: {
      // Cache this response for 1 hour (3600 seconds)
      cacheTtl: 3600,
      // Use a custom cache key based on prompt content
      cacheKey: 'example-prompt-1',
    },
    onMessage: (data) => console.log('Response:', data),
    onError: (error) => console.error('Error:', error),
  });

  await client.connect();
  
  // Send the same message multiple times - should hit cache after first request
  const message = { 
    messages: [{ role: 'user', content: 'What is the capital of France?' }]
  };
  
  await client.send(message);
  console.log('First request sent - this will be cached');
  
  // Wait a moment then send again - should be served from cache
  setTimeout(async () => {
    await client.send(message);
    console.log('Second request sent - should be served from cache');
    client.disconnect();
  }, 2000);
}

// Example 2: Request retry configuration
async function demonstrateRetryConfiguration() {
  console.log('Example 2: Retry Configuration');
  
  const client = new AIGatewayClient({
    provider: 'openai',
    params: { model: 'gpt-4' },
    apiKey: process.env.OPENAI_API_KEY,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    gatewayOptions: {
      // Set maximum retry attempts
      maxAttempts: 3,
      // Use exponential backoff strategy
      backoffType: 'exponential',
      // Initial retry delay in milliseconds
      retryDelay: 1000,
      // Request timeout in milliseconds
      requestTimeout: 15000,
    },
    onMessage: (data) => console.log('Response:', data),
    onError: (error) => console.error('Error:', error),
    onClose: (event) => console.log('Connection closed:', event.code),
  });

  await client.connect();
  
  const message = { 
    messages: [{ role: 'user', content: 'Generate a complex response that might timeout' }]
  };
  
  await client.send(message);
  console.log('Request sent with retry configuration');
}

// Example 3: Logging and analytics
async function demonstrateLoggingAndAnalytics() {
  console.log('Example 3: Logging and Analytics');
  
  const client = new AIGatewayClient({
    provider: 'openai',
    params: { model: 'gpt-4' },
    apiKey: process.env.OPENAI_API_KEY,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    gatewayOptions: {
      // Force logging even if disabled at gateway level
      collectLog: true,
      // Add custom event ID for tracing
      eventId: 'user-session-123',
      // Add custom metadata for analytics
      metadata: {
        userId: 'user-456',
        sessionType: 'customer-support',
        businessUnit: 'sales',
        region: 'europe',
        appVersion: '1.2.3'
      },
      // Add custom cost tracking
      customCost: 0.05,
    },
    onMessage: (data) => console.log('Response:', data),
    onError: (error) => console.error('Error:', error),
  });

  await client.connect();
  
  const message = { 
    messages: [{ role: 'user', content: 'How can I upgrade my subscription?' }]
  };
  
  await client.send(message);
  console.log('Request sent with logging and analytics configuration');
}

// Run all examples
async function runExamples() {
  try {
    await demonstrateCachingControl();
    setTimeout(async () => {
      await demonstrateRetryConfiguration();
      setTimeout(async () => {
        await demonstrateLoggingAndAnalytics();
      }, 5000);
    }, 5000);
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Check for required environment variables
if (!process.env.OPENAI_API_KEY || !process.env.CLOUDFLARE_TOKEN) {
  console.error('Error: Required environment variables missing.');
  console.error('Please set OPENAI_API_KEY and CLOUDFLARE_TOKEN.');
  process.exit(1);
}

runExamples();