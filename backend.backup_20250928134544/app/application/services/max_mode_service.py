"""
Max Mode Service for ultra-large context windows and complex task processing
Supports up to 1M tokens, 200 tool invocations, and 750+ line file processing
"""
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import hashlib
import os

from application.services.ai_service import ai_service, ModelConfig
from infrastructure.mcp_server import mcp_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MaxModeCapability(Enum):
    """Max Mode capabilities and their limits"""
    ULTRA_LARGE_CONTEXT = "ultra_large_context"  # 1M tokens
    MASSIVE_TOOL_INVOCATION = "massive_tool_invocation"  # 200 tools
    LARGE_FILE_PROCESSING = "large_file_processing"  # 750+ lines
    CROSS_MODULE_ANALYSIS = "cross_module_analysis"  # Multi-file analysis
    COMPLEX_ORCHESTRATION = "complex_orchestration"  # Multi-step workflows

@dataclass
class MaxModeConfig:
    """Configuration for Max Mode operations"""
    max_context_tokens: int = 1_000_000  # 1M tokens
    max_tool_invocations: int = 200
    max_file_lines: int = 750
    max_concurrent_tools: int = 10
    context_chunk_size: int = 50_000  # Tokens per chunk
    enable_cross_module_analysis: bool = True
    enable_complex_orchestration: bool = True
    memory_optimization: bool = True
    parallel_processing: bool = True

@dataclass
class ContextChunk:
    """Represents a chunk of context for processing"""
    id: str
    content: str
    token_count: int
    chunk_type: str  # 'code', 'documentation', 'data', 'conversation'
    priority: int  # 1-10, higher = more important
    metadata: Dict[str, Any]
    created_at: datetime

@dataclass
class ToolInvocationPlan:
    """Plan for executing multiple tool invocations"""
    tool_name: str
    parameters: Dict[str, Any]
    dependencies: List[str]  # IDs of other tool invocations this depends on
    priority: int
    estimated_duration: float  # seconds
    retry_count: int = 0
    max_retries: int = 3

class MaxModeService:
    """
    Max Mode service for handling ultra-large context windows and complex operations
    """
    
    def __init__(self):
        self.config = MaxModeConfig()
        self.context_chunks: Dict[str, ContextChunk] = {}
        self.tool_execution_plan: List[ToolInvocationPlan] = []
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.context_cache: Dict[str, str] = {}
        
        # Enhanced models for Max Mode
        self.max_mode_models = self._initialize_max_mode_models()
    
    def _initialize_max_mode_models(self) -> Dict[str, ModelConfig]:
        """Initialize models optimized for Max Mode operations"""
        return {
            "gpt-4o-max": ModelConfig(
                name="gpt-4o-max",
                provider="openai",
                max_tokens=1_000_000,  # 1M tokens
                cost_per_1k_tokens=0.06,  # Higher cost for max context
                speed_rating=6,  # Slower due to large context
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
                max_tokens=500_000,  # 500K tokens for cost efficiency
                cost_per_1k_tokens=0.0003,
                speed_rating=7,
                capability_rating=8,
                context_window=500_000,
                max_mode_optimized=True
            )
        }
    
    async def enable_max_mode(self, session_id: str, capabilities: List[MaxModeCapability]) -> Dict[str, Any]:
        """
        Enable Max Mode for a session with specified capabilities
        
        Args:
            session_id: Session identifier
            capabilities: List of Max Mode capabilities to enable
            
        Returns:
            Configuration and status information
        """
        logger.info(f"Enabling Max Mode for session {session_id} with capabilities: {capabilities}")
        
        # Initialize session in Max Mode
        self.active_sessions[session_id] = {
            "capabilities": capabilities,
            "enabled_at": datetime.now(),
            "context_tokens_used": 0,
            "tool_invocations_count": 0,
            "files_processed": 0,
            "status": "active"
        }
        
        # Select optimal model for Max Mode
        selected_model = self._select_max_mode_model(capabilities)
        
        return {
            "session_id": session_id,
            "max_mode_enabled": True,
            "capabilities": [cap.value for cap in capabilities],
            "selected_model": selected_model,
            "config": {
                "max_context_tokens": self.config.max_context_tokens,
                "max_tool_invocations": self.config.max_tool_invocations,
                "max_file_lines": self.config.max_file_lines,
                "parallel_processing": self.config.parallel_processing
            },
            "enabled_at": datetime.now().isoformat()
        }
    
    def _select_max_mode_model(self, capabilities: List[MaxModeCapability]) -> str:
        """Select the optimal model for Max Mode based on capabilities"""
        if MaxModeCapability.ULTRA_LARGE_CONTEXT in capabilities:
            return "gpt-4o-max"
        elif MaxModeCapability.MASSIVE_TOOL_INVOCATION in capabilities:
            return "claude-3-5-sonnet-max"
        else:
            return "gpt-4o-mini-max"
    
    async def process_large_context(self, session_id: str, content: str, 
                                  content_type: str = "mixed") -> List[ContextChunk]:
        """
        Process large content into optimized context chunks
        
        Args:
            session_id: Session identifier
            content: Large content to process
            content_type: Type of content (code, documentation, data, mixed)
            
        Returns:
            List of processed context chunks
        """
        logger.info(f"Processing large context for session {session_id}, type: {content_type}")
        
        # Split content into manageable chunks
        chunks = self._split_content_into_chunks(content, content_type)
        
        # Create context chunks with metadata
        context_chunks = []
        for i, chunk_content in enumerate(chunks):
            chunk_id = f"{session_id}_chunk_{i}_{hashlib.md5(chunk_content.encode()).hexdigest()[:8]}"
            
            # Estimate token count (rough approximation: 1 token ≈ 4 characters)
            token_count = len(chunk_content) // 4
            
            chunk = ContextChunk(
                id=chunk_id,
                content=chunk_content,
                token_count=token_count,
                chunk_type=content_type,
                priority=self._calculate_chunk_priority(chunk_content, content_type),
                metadata={
                    "session_id": session_id,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "created_at": datetime.now().isoformat()
                },
                created_at=datetime.now()
            )
            
            context_chunks.append(chunk)
            self.context_chunks[chunk_id] = chunk
        
        # Update session context usage
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["context_tokens_used"] += sum(chunk.token_count for chunk in context_chunks)
        
        logger.info(f"Created {len(context_chunks)} context chunks for session {session_id}")
        return context_chunks
    
    def _split_content_into_chunks(self, content: str, content_type: str) -> List[str]:
        """Split content into optimal chunks based on type and size"""
        if content_type == "code":
            return self._split_code_content(content)
        elif content_type == "documentation":
            return self._split_documentation_content(content)
        elif content_type == "data":
            return self._split_data_content(content)
        else:
            return self._split_mixed_content(content)
    
    def _split_code_content(self, content: str) -> List[str]:
        """Split code content preserving logical boundaries"""
        lines = content.split('\n')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for line in lines:
            line_size = len(line) // 4  # Rough token estimate
            
            # Check if adding this line would exceed chunk size
            if current_size + line_size > self.config.context_chunk_size and current_chunk:
                chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
                current_size = line_size
            else:
                current_chunk.append(line)
                current_size += line_size
        
        # Add remaining content
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks
    
    def _split_documentation_content(self, content: str) -> List[str]:
        """Split documentation content by sections"""
        # Split by markdown headers or double newlines
        sections = content.split('\n\n\n')
        chunks = []
        
        for section in sections:
            if len(section) // 4 > self.config.context_chunk_size:
                # Further split large sections
                sub_chunks = self._split_by_sentences(section)
                chunks.extend(sub_chunks)
            else:
                chunks.append(section)
        
        return chunks
    
    def _split_data_content(self, content: str) -> List[str]:
        """Split data content (JSON, CSV, etc.) preserving structure"""
        try:
            # Try to parse as JSON
            data = json.loads(content)
            if isinstance(data, list):
                # Split large arrays
                chunk_size = self.config.context_chunk_size // 4
                for i in range(0, len(data), chunk_size):
                    chunk_data = data[i:i + chunk_size]
                    chunks.append(json.dumps(chunk_data, indent=2))
                return chunks
        except json.JSONDecodeError:
            pass
        
        # Fall back to line-based splitting
        return self._split_by_lines(content)
    
    def _split_mixed_content(self, content: str) -> List[str]:
        """Split mixed content using general strategies"""
        return self._split_by_lines(content)
    
    def _split_by_sentences(self, text: str) -> List[str]:
        """Split text by sentences"""
        sentences = text.split('. ')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence) // 4
            if current_size + sentence_size > self.config.context_chunk_size and current_chunk:
                chunks.append('. '.join(current_chunk) + '.')
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
        
        if current_chunk:
            chunks.append('. '.join(current_chunk))
        
        return chunks
    
    def _split_by_lines(self, content: str) -> List[str]:
        """Split content by lines with size limits"""
        lines = content.split('\n')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for line in lines:
            line_size = len(line) // 4
            if current_size + line_size > self.config.context_chunk_size and current_chunk:
                chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
                current_size = line_size
            else:
                current_chunk.append(line)
                current_size += line_size
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks
    
    def _calculate_chunk_priority(self, content: str, content_type: str) -> int:
        """Calculate priority for a context chunk (1-10, higher = more important)"""
        priority = 5  # Base priority
        
        # Increase priority for important content patterns
        if content_type == "code":
            if any(keyword in content.lower() for keyword in ['function', 'class', 'import', 'export']):
                priority += 2
            if any(keyword in content.lower() for keyword in ['error', 'exception', 'bug', 'fix']):
                priority += 3
        elif content_type == "documentation":
            if any(keyword in content.lower() for keyword in ['important', 'critical', 'warning', 'note']):
                priority += 2
            if content.startswith('#'):  # Headers
                priority += 1
        
        return min(priority, 10)
    
    async def create_tool_orchestration_plan(self, session_id: str, 
                                           task_description: str) -> List[ToolInvocationPlan]:
        """
        Create a comprehensive tool orchestration plan for complex tasks
        
        Args:
            session_id: Session identifier
            task_description: Description of the task to accomplish
            
        Returns:
            List of tool invocation plans
        """
        logger.info(f"Creating tool orchestration plan for session {session_id}")
        
        # Analyze task to determine required tools
        required_tools = await self._analyze_task_requirements(task_description)
        
        # Create tool invocation plans
        plans = []
        for i, tool_info in enumerate(required_tools):
            plan = ToolInvocationPlan(
                tool_name=tool_info["name"],
                parameters=tool_info["parameters"],
                dependencies=tool_info.get("dependencies", []),
                priority=tool_info.get("priority", 5),
                estimated_duration=tool_info.get("estimated_duration", 5.0)
            )
            plans.append(plan)
        
        # Sort by priority and dependencies
        plans = self._optimize_tool_execution_order(plans)
        
        self.tool_execution_plan = plans
        return plans
    
    async def _analyze_task_requirements(self, task_description: str) -> List[Dict[str, Any]]:
        """Analyze task description to determine required tools"""
        # This would typically use AI to analyze the task
        # For now, return a basic analysis based on keywords
        
        tools = []
        task_lower = task_description.lower()
        
        # Browser automation tools
        if any(keyword in task_lower for keyword in ['browser', 'web', 'navigate', 'click', 'form']):
            tools.extend([
                {"name": "browser_navigate", "parameters": {}, "priority": 8},
                {"name": "browser_snapshot", "parameters": {}, "priority": 6},
                {"name": "browser_take_screenshot", "parameters": {}, "priority": 7}
            ])
        
        # File operations
        if any(keyword in task_lower for keyword in ['file', 'read', 'write', 'create', 'modify']):
            tools.extend([
                {"name": "read_file", "parameters": {}, "priority": 9},
                {"name": "write_file", "parameters": {}, "priority": 8}
            ])
        
        # Web content
        if any(keyword in task_lower for keyword in ['fetch', 'api', 'data', 'content']):
            tools.append({"name": "fetch", "parameters": {}, "priority": 7})
        
        # GitHub operations
        if any(keyword in task_lower for keyword in ['github', 'repository', 'commit', 'pull request']):
            tools.extend([
                {"name": "github_search_repositories", "parameters": {}, "priority": 6},
                {"name": "github_get_file_contents", "parameters": {}, "priority": 8}
            ])
        
        return tools
    
    def _optimize_tool_execution_order(self, plans: List[ToolInvocationPlan]) -> List[ToolInvocationPlan]:
        """Optimize the order of tool execution based on dependencies and priority"""
        # Simple topological sort based on dependencies
        sorted_plans = []
        remaining_plans = plans.copy()
        
        while remaining_plans:
            # Find plans with no unmet dependencies
            ready_plans = [
                plan for plan in remaining_plans
                if not plan.dependencies or all(
                    dep in [p.tool_name for p in sorted_plans] for dep in plan.dependencies
                )
            ]
            
            if not ready_plans:
                # If no plans are ready, pick the one with highest priority
                ready_plans = [max(remaining_plans, key=lambda p: p.priority)]
            
            # Sort ready plans by priority
            ready_plans.sort(key=lambda p: p.priority, reverse=True)
            
            # Add the highest priority ready plan
            plan = ready_plans[0]
            sorted_plans.append(plan)
            remaining_plans.remove(plan)
        
        return sorted_plans
    
    async def execute_tool_orchestration(self, session_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute the tool orchestration plan with parallel processing
        
        Args:
            session_id: Session identifier
            
        Yields:
            Progress updates and results
        """
        logger.info(f"Executing tool orchestration for session {session_id}")
        
        if not self.tool_execution_plan:
            yield {"type": "error", "message": "No tool orchestration plan found"}
            return
        
        total_tools = len(self.tool_execution_plan)
        completed_tools = 0
        failed_tools = 0
        
        # Execute tools with concurrency control
        semaphore = asyncio.Semaphore(self.config.max_concurrent_tools)
        
        async def execute_tool(plan: ToolInvocationPlan):
            nonlocal completed_tools, failed_tools
            
            async with semaphore:
                try:
                    yield {
                        "type": "tool_started",
                        "tool_name": plan.tool_name,
                        "parameters": plan.parameters,
                        "progress": f"{completed_tools + failed_tools + 1}/{total_tools}"
                    }
                    
                    # Execute the tool
                    result = await mcp_server.invoke_tool_async(
                        session_id, plan.tool_name, plan.parameters
                    )
                    
                    completed_tools += 1
                    
                    yield {
                        "type": "tool_completed",
                        "tool_name": plan.tool_name,
                        "result": result,
                        "progress": f"{completed_tools + failed_tools}/{total_tools}"
                    }
                    
                except Exception as e:
                    failed_tools += 1
                    logger.error(f"Tool execution failed: {plan.tool_name}, error: {e}")
                    
                    yield {
                        "type": "tool_failed",
                        "tool_name": plan.tool_name,
                        "error": str(e),
                        "progress": f"{completed_tools + failed_tools}/{total_tools}"
                    }
        
        # Execute all tools concurrently
        tasks = [execute_tool(plan) for plan in self.tool_execution_plan]
        
        # Process results as they complete
        for task in asyncio.as_completed(tasks):
            async for result in await task:
                yield result
        
        # Final summary
        yield {
            "type": "orchestration_completed",
            "total_tools": total_tools,
            "completed_tools": completed_tools,
            "failed_tools": failed_tools,
            "success_rate": completed_tools / total_tools if total_tools > 0 else 0
        }
    
    async def process_large_file(self, file_path: str, max_lines: int = None) -> Dict[str, Any]:
        """
        Process large files with enhanced capabilities
        
        Args:
            file_path: Path to the file to process
            max_lines: Maximum lines to process (default: config.max_file_lines)
            
        Returns:
            Processing results and metadata
        """
        if max_lines is None:
            max_lines = self.config.max_file_lines
        
        logger.info(f"Processing large file: {file_path}, max_lines: {max_lines}")
        
        try:
            # Read file in chunks to handle very large files
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = []
                line_count = 0
                
                for line in file:
                    if line_count >= max_lines:
                        break
                    lines.append(line)
                    line_count += 1
                
                content = ''.join(lines)
            
            # Analyze file content
            analysis = self._analyze_file_content(content, file_path)
            
            # Create context chunks
            chunks = await self.process_large_context(
                f"file_{hashlib.md5(file_path.encode()).hexdigest()[:8]}",
                content,
                analysis["content_type"]
            )
            
            return {
                "file_path": file_path,
                "lines_processed": line_count,
                "content_length": len(content),
                "analysis": analysis,
                "context_chunks": len(chunks),
                "processing_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing large file {file_path}: {e}")
            return {
                "file_path": file_path,
                "error": str(e),
                "processing_time": datetime.now().isoformat()
            }
    
    def _analyze_file_content(self, content: str, file_path: str) -> Dict[str, Any]:
        """Analyze file content to determine type and characteristics"""
        file_extension = file_path.split('.')[-1].lower()
        
        analysis = {
            "file_type": file_extension,
            "content_type": "mixed",
            "language": "unknown",
            "has_functions": False,
            "has_classes": False,
            "has_imports": False,
            "complexity_score": 0
        }
        
        # Determine content type based on file extension and content
        if file_extension in ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs']:
            analysis["content_type"] = "code"
            analysis["language"] = file_extension
            
            # Analyze code characteristics
            analysis["has_functions"] = any(keyword in content for keyword in ['function', 'def ', 'public ', 'private '])
            analysis["has_classes"] = any(keyword in content for keyword in ['class ', 'interface ', 'struct '])
            analysis["has_imports"] = any(keyword in content for keyword in ['import ', 'require(', 'using '])
            
        elif file_extension in ['md', 'txt', 'rst']:
            analysis["content_type"] = "documentation"
            
        elif file_extension in ['json', 'xml', 'yaml', 'yml', 'csv']:
            analysis["content_type"] = "data"
        
        # Calculate complexity score
        analysis["complexity_score"] = self._calculate_complexity_score(content, analysis["content_type"])
        
        return analysis
    
    def _calculate_complexity_score(self, content: str, content_type: str) -> int:
        """Calculate a complexity score for the content (0-100)"""
        score = 0
        
        if content_type == "code":
            # Count various complexity indicators
            score += content.count('if ') * 2
            score += content.count('for ') * 3
            score += content.count('while ') * 3
            score += content.count('try ') * 2
            score += content.count('catch ') * 2
            score += content.count('function ') * 1
            score += content.count('class ') * 2
            score += content.count('import ') * 1
            score += content.count('export ') * 1
            
        elif content_type == "documentation":
            # Count sections, headers, links
            score += content.count('#') * 1
            score += content.count('##') * 2
            score += content.count('###') * 3
            score += content.count('[') * 1  # Links
            score += content.count('```') * 2  # Code blocks
        
        # Normalize score to 0-100
        return min(score, 100)
    
    def get_max_mode_status(self, session_id: str) -> Dict[str, Any]:
        """Get current Max Mode status for a session"""
        if session_id not in self.active_sessions:
            return {"max_mode_enabled": False}
        
        session = self.active_sessions[session_id]
        return {
            "max_mode_enabled": True,
            "capabilities": [cap.value for cap in session["capabilities"]],
            "context_tokens_used": session["context_tokens_used"],
            "tool_invocations_count": session["tool_invocations_count"],
            "files_processed": session["files_processed"],
            "status": session["status"],
            "enabled_at": session["enabled_at"].isoformat()
        }
    
    async def disable_max_mode(self, session_id: str) -> Dict[str, Any]:
        """Disable Max Mode for a session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
        
        # Clear context chunks for this session
        chunks_to_remove = [
            chunk_id for chunk_id, chunk in self.context_chunks.items()
            if chunk.metadata.get("session_id") == session_id
        ]
        
        for chunk_id in chunks_to_remove:
            del self.context_chunks[chunk_id]
        
        logger.info(f"Disabled Max Mode for session {session_id}")
        return {"max_mode_disabled": True, "session_id": session_id}

# Create a singleton instance
max_mode_service = MaxModeService()
