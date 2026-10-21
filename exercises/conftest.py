"""pytest 配置：决定检查"你的代码"还是"参考答案"，并在最后打印中文成绩单。

    pytest                  # 检查你写的 exercise.py
    pytest --solution       # 检查参考答案 solution.py（确认环境没问题）
    pytest ch03_memory      # 只检查某一章
"""

from __future__ import annotations

import importlib.util
import os
import sys
from collections import defaultdict
from pathlib import Path

import pytest

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))  # 让各章都能 `from kit import ...`


def pytest_addoption(parser):
    parser.addoption(
        "--solution",
        action="store_true",
        default=os.environ.get("EXERCISE_TARGET") == "solution",
        help="检查参考答案 solution.py，而不是 exercise.py",
    )


def _load(path: Path):
    name = f"_ex_{path.parent.name}_{path.stem}"
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def ex(request):
    """当前章节的练习模块（默认 exercise.py，加 --solution 时是 solution.py）。"""
    target = "solution" if request.config.getoption("--solution") else "exercise"
    return _load(Path(request.path).parent / f"{target}.py")


@pytest.fixture(autouse=True)
def _offline(monkeypatch):
    """自动检查永远离线：屏蔽 LC_MODEL，避免误用真模型。"""
    monkeypatch.delenv("LC_MODEL", raising=False)


# ---------------------------------------------------------------- 成绩单
# 章节 -> 检查项标题 -> 是否全部通过（参数化的多组用例合并成一项）
_results: dict[str, dict[str, bool]] = defaultdict(dict)


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" or (report.when == "setup" and not report.passed):
        chapter = Path(item.path).parent.name
        title = (item.function.__doc__ or item.name).strip().splitlines()[0]
        if not report.skipped:
            prev = _results[chapter].get(title, True)
            _results[chapter][title] = prev and report.passed


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    if not _results:
        return
    tr = terminalreporter
    target = "参考答案 solution.py" if config.getoption("--solution") else "你的 exercise.py"
    tr.write_sep("=", f"📋 成绩单（检查对象：{target}）")
    total_ok = total = 0
    for chapter in sorted(_results):
        r = _results[chapter]
        ok = sum(r.values())
        total_ok += ok
        total += len(r)
        mark = "✅" if ok == len(r) else "🟡" if ok else "⬜"
        tr.write_line(f"{mark} {chapter:<26} {ok}/{len(r)} 通过")
        for title, passed in r.items():
            if not passed:
                tr.write_line(f"      ✗ {title}")
    tr.write_line("")
    if total and total_ok == total:
        tr.write_line(f"🎉 全部 {total} 项检查通过！")
    else:
        tr.write_line(f"共 {total_ok}/{total} 项通过。看上面 ✗ 的条目，回到对应 exercise.py 里找 TODO。")
