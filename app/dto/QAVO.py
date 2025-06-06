from dataclasses import dataclass

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class QAVO:
    """问答对"""
    question: str
    answer: str