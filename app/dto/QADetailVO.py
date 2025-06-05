from dataclasses import dataclass
from typing import List

from app.dto import QAVO


@dataclass
class QADetailVO:
    """问答详情"""
    title: str
    summary: str
    keywords: List[str]
    details: List[QAVO]