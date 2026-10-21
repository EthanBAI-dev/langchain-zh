"""在"假模型"和"真模型"之间切换。

练习里的 ``main()`` 演示都通过 get_model() 拿模型：

- 没设置环境变量 ``LC_MODEL``：用练习自带的离线剧本（假模型），不花钱、不联网；
- 设置了 ``LC_MODEL``（比如 ``openai:gpt-5-mini``、``anthropic:claude-sonnet-4-5``），
  并在 .env 里填了对应的 API Key：就换成真模型，看看真实效果。

自动检查（pytest）始终用假模型，结果稳定、可重复。
"""

from __future__ import annotations

import os
from typing import Sequence

from .fake import Reply, ScriptedChatModel


def _load_dotenv() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv()


def using_real_model() -> bool:
    _load_dotenv()
    return bool(os.environ.get("LC_MODEL"))


def get_model(offline_script: Sequence[Reply] = (), **kwargs):
    """返回一个聊天模型：设置了 LC_MODEL 就用真模型，否则用离线剧本。"""
    if using_real_model():
        from langchain.chat_models import init_chat_model

        name = os.environ["LC_MODEL"]
        print(f"🌐 使用真模型：{name}")
        return init_chat_model(name, **kwargs)
    print("📴 使用离线假模型（设置 LC_MODEL 环境变量即可换成真模型）")
    return ScriptedChatModel(list(offline_script), loop=True)
