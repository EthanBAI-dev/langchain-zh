"""练习用的小工具箱：假模型、真模型切换。"""

from .fake import ScriptedChatModel, ai, call
from .models import get_model

__all__ = ["ScriptedChatModel", "ai", "call", "get_model"]
