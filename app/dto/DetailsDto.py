from dataclasses import dataclass

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class DetailsDto:
    """评价详情"""
    summarize: str
    full_marks: str
    score: int