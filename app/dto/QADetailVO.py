from dataclasses import dataclass
from typing import List

from dataclasses_json import dataclass_json

from app.dto import QAVO


@dataclass_json
@dataclass
class QADetailVO:
    """问答详情"""
    title: str
    summary: str
    keywords: List[str]
    details: List[QAVO]
