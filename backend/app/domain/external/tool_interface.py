from abc import ABC, abstractmethod

class ToolInterface(ABC):
    """Abstract interface for external tools."""

    @abstractmethod
    def execute(self, tool_name: str, params: Dict) -> Any:
        """Execute a tool with given parameters."""
        pass

# Concrete implementations would be in infrastructure