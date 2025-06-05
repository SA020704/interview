from dataclasses import dataclass


@dataclass
class QAVO:
    """问答对"""
    question: str
    answer: str