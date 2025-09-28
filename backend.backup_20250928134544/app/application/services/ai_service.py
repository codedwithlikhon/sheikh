"""
AI Service for intelligent model selection and response handling
"""
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime
import openai
from openai import AsyncOpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelConfig:
    """Configuration for different AI models"""
    
    def __init__(self, name: str, provider: str, max_tokens: int, 
                 cost_per_1k_tokens: float, speed_rating: int, 
                 capability_rating: int, context_window: int,
                 max_mode_optimized: bool = False):
        self.name = name
        self.provider = provider
        self.max_tokens = max_tokens
        self.cost_per_1k_tokens = cost_per_1k_tokens
        self.speed_rating = speed_rating  # 1-10 scale
        self.capability_rating = capability_rating  # 1-10 scale
        self.context_window = context_window
        self.max_mode_optimized = max_mode_optimized

class AIService:
    """
    Intelligent AI service that selects the best model based on:
    - Response speed requirements
    - Task complexity
    - Resource usage
    - Cost considerations
    """
    
    def __init__(self):
        self.client = None
        self.models = self._initialize_models()
        self.conversation_history = {}
        
    def _initialize_models(self) -> Dict[str, ModelConfig]:
        """Initialize available AI models with their configurations"""
        return {
            "gpt-4o": ModelConfig(
                name="gpt-4o",
                provider="openai",
                max_tokens=4096,
                cost_per_1k_tokens=0.03,
                speed_rating=8,
                capability_rating=10,
                context_window=128000
            ),
            "gpt-4o-mini": ModelConfig(
                name="gpt-4o-mini", 
                provider="openai",
                max_tokens=16384,
                cost_per_1k_tokens=0.00015,
                speed_rating=9,
                capability_rating=8,
                context_window=128000
            ),
            "gpt-3.5-turbo": ModelConfig(
                name="gpt-3.5-turbo",
                provider="openai", 
                max_tokens=4096,
                cost_per_1k_tokens=0.002,
                speed_rating=10,
                capability_rating=7,
                context_window=16385
            ),
            "claude-3-5-sonnet": ModelConfig(
                name="claude-3-5-sonnet",
                provider="anthropic",
                max_tokens=4096,
                cost_per_1k_tokens=0.015,
                speed_rating=7,
                capability_rating=9,
                context_window=200000
            ),
            # Max Mode models for ultra-large context
            "gpt-4o-max": ModelConfig(
                name="gpt-4o-max",
                provider="openai",
                max_tokens=1_000_000,
                cost_per_1k_tokens=0.06,
                speed_rating=6,
                capability_rating=10,
                context_window=1_000_000,
                max_mode_optimized=True
            ),
            "claude-3-5-sonnet-max": ModelConfig(
                name="claude-3-5-sonnet-max",
                provider="anthropic",
                max_tokens=1_000_000,
                cost_per_1k_tokens=0.03,
                speed_rating=5,
                capability_rating=10,
                context_window=1_000_000,
                max_mode_optimized=True
            ),
            "gpt-4o-mini-max": ModelConfig(
                name="gpt-4o-mini-max",
                provider="openai",
                max_tokens=500_000,
                cost_per_1k_tokens=0.0003,
                speed_rating=7,
                capability_rating=8,
                context_window=500_000,
                max_mode_optimized=True
            )
        }
    
    def initialize_client(self, api_key: str, provider: str = "openai"):
        """Initialize the AI client with API key"""
        if provider == "openai":
            self.client = AsyncOpenAI(api_key=api_key)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def select_model(self, task_type: str, complexity: str, 
                    speed_priority: bool = False, 
                    cost_priority: bool = False,
                    max_mode: bool = False) -> str:
        """
        Intelligently select the best model for the task
        
        Args:
            task_type: Type of task (coding, analysis, creative, etc.)
            complexity: Task complexity (simple, medium, complex)
            speed_priority: Whether speed is the primary concern
            cost_priority: Whether cost is the primary concern
            max_mode: Whether Max Mode is enabled for ultra-large context
            
        Returns:
            Selected model name
        """
        # Scoring algorithm
        scores = {}
        
        for model_name, config in self.models.items():
            score = 0
            
            # Max Mode consideration - prioritize Max Mode models when enabled
            if max_mode:
                if config.max_mode_optimized:
                    score += 20  # Strong preference for Max Mode models
                else:
                    score -= 10  # Penalty for non-Max Mode models
            else:
                if config.max_mode_optimized:
                    score -= 5  # Slight penalty for Max Mode models when not needed
            
            # Base capability score
            score += config.capability_rating * 0.3
            
            # Speed consideration
            if speed_priority:
                score += config.speed_rating * 0.4
            else:
                score += config.speed_rating * 0.2
            
            # Cost consideration
            if cost_priority:
                # Lower cost = higher score
                cost_score = max(0, 10 - (config.cost_per_1k_tokens * 1000))
                score += cost_score * 0.3
            else:
                score += 5 * 0.1  # Neutral cost consideration
            
            # Task-specific adjustments
            if task_type == "coding" and "gpt" in model_name:
                score += 2  # GPT models are good for coding
            elif task_type == "analysis" and "claude" in model_name:
                score += 2  # Claude models are good for analysis
            
            # Complexity adjustments
            if complexity == "complex" and config.capability_rating >= 9:
                score += 3
            elif complexity == "simple" and config.speed_rating >= 8:
                score += 2
            
            # Context window consideration for Max Mode
            if max_mode and config.context_window >= 500_000:
                score += 5  # Bonus for large context windows
            
            scores[model_name] = score
        
        # Select the model with the highest score
        selected_model = max(scores, key=scores.get)
        logger.info(f"Selected model {selected_model} with score {scores[selected_model]:.2f}")
        
        return selected_model
    
    async def generate_response(self, session_id: str, message: str, 
                              context: Optional[Dict[str, Any]] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generate AI response with intelligent model selection
        
        Args:
            session_id: Session identifier
            message: User message
            context: Additional context (code, files, etc.)
            
        Yields:
            Streaming response chunks
        """
        if not self.client:
            raise RuntimeError("AI client not initialized")
        
        # Analyze the message to determine task characteristics
        task_analysis = self._analyze_message(message, context)
        
        # Select appropriate model
        model_name = self.select_model(
            task_type=task_analysis["task_type"],
            complexity=task_analysis["complexity"],
            speed_priority=task_analysis["speed_priority"],
            cost_priority=task_analysis["cost_priority"]
        )
        
        # Prepare conversation context
        conversation_context = self._prepare_conversation_context(session_id, message, context)
        
        # Generate response with streaming
        try:
            async for chunk in self._stream_response(model_name, conversation_context):
                yield chunk
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            yield {
                "type": "error",
                "content": f"Error generating response: {str(e)}"
            }
    
    def _analyze_message(self, message: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze message to determine task characteristics"""
        message_lower = message.lower()
        
        # Determine task type
        task_type = "general"
        if any(keyword in message_lower for keyword in ["code", "function", "class", "variable", "debug", "fix"]):
            task_type = "coding"
        elif any(keyword in message_lower for keyword in ["analyze", "explain", "understand", "review"]):
            task_type = "analysis"
        elif any(keyword in message_lower for keyword in ["create", "write", "generate", "design"]):
            task_type = "creative"
        elif any(keyword in message_lower for keyword in ["browser", "click", "navigate", "automate"]):
            task_type = "automation"
        
        # Determine complexity
        complexity = "medium"
        if len(message) < 50 and not context:
            complexity = "simple"
        elif len(message) > 200 or (context and len(str(context)) > 1000):
            complexity = "complex"
        
        # Determine priorities
        speed_priority = any(keyword in message_lower for keyword in ["quick", "fast", "urgent", "asap"])
        cost_priority = any(keyword in message_lower for keyword in ["cheap", "low cost", "budget"])
        
        return {
            "task_type": task_type,
            "complexity": complexity,
            "speed_priority": speed_priority,
            "cost_priority": cost_priority
        }
    
    def _prepare_conversation_context(self, session_id: str, message: str, 
                                    context: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Prepare conversation context for the AI model"""
        # Get conversation history
        history = self.conversation_history.get(session_id, [])
        
        # Build context messages
        messages = []
        
        # System prompt
        system_prompt = """You are an intelligent AI coding assistant with access to various tools including browser automation, file operations, and web search. 

You can:
- Write, debug, and optimize code in multiple languages
- Automate browser interactions using Playwright
- Search and analyze web content
- Manage files and projects
- Provide detailed explanations and suggestions

Always be helpful, accurate, and provide clear explanations for your actions."""
        
        messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history
        messages.extend(history[-10:])  # Keep last 10 exchanges
        
        # Add current message with context
        current_message = message
        if context:
            context_str = self._format_context(context)
            current_message = f"{message}\n\nContext:\n{context_str}"
        
        messages.append({"role": "user", "content": current_message})
        
        return messages
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context information for the AI model"""
        context_parts = []
        
        if "code" in context:
            context_parts.append(f"Code:\n```\n{context['code']}\n```")
        
        if "files" in context:
            context_parts.append(f"Files: {', '.join(context['files'])}")
        
        if "error" in context:
            context_parts.append(f"Error: {context['error']}")
        
        if "browser_state" in context:
            context_parts.append(f"Browser State: {context['browser_state']}")
        
        return "\n".join(context_parts)
    
    async def _stream_response(self, model_name: str, messages: List[Dict[str, str]]) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream response from the selected model"""
        try:
            model_config = self.models[model_name]
            
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=model_config.max_tokens,
                temperature=0.7,
                stream=True
            )
            
            # Send initial metadata
            yield {
                "type": "model_selected",
                "model": model_name,
                "capabilities": {
                    "speed_rating": model_config.speed_rating,
                    "capability_rating": model_config.capability_rating,
                    "max_tokens": model_config.max_tokens
                }
            }
            
            # Stream the response
            full_content = ""
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_content += content
                    
                    yield {
                        "type": "content",
                        "content": content
                    }
            
            # Send completion signal
            yield {
                "type": "complete",
                "full_content": full_content,
                "tokens_used": len(full_content.split())  # Approximate token count
            }
            
        except Exception as e:
            logger.error(f"Error streaming response from {model_name}: {e}")
            yield {
                "type": "error",
                "content": f"Error generating response: {str(e)}"
            }
    
    def add_to_history(self, session_id: str, role: str, content: str):
        """Add message to conversation history"""
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        self.conversation_history[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 50 messages to prevent context overflow
        if len(self.conversation_history[session_id]) > 50:
            self.conversation_history[session_id] = self.conversation_history[session_id][-50:]
    
    def clear_history(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
    
    def get_model_info(self, model_name: str) -> Optional[ModelConfig]:
        """Get information about a specific model"""
        return self.models.get(model_name)
    
    def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available models with their information"""
        return [
            {
                "name": config.name,
                "provider": config.provider,
                "max_tokens": config.max_tokens,
                "cost_per_1k_tokens": config.cost_per_1k_tokens,
                "speed_rating": config.speed_rating,
                "capability_rating": config.capability_rating,
                "context_window": config.context_window
            }
            for config in self.models.values()
        ]

# Create a singleton instance
ai_service = AIService()
