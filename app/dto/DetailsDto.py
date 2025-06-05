from dataclasses import dataclass


@dataclass
class DetailsDto:
    """评价详情"""
    summarize: str
    full_marks: str
    score: int