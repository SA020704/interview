from dataclasses import dataclass
from typing import Optional, List

from dataclasses_json import dataclass_json

from app.dto import DetailsDto, QADetailVO


@dataclass_json
@dataclass
class AiEvaluationVO:
    """AI评价结果"""
    overall_evaluation: Optional[DetailsDto] = None
    advantage: Optional[DetailsDto] = None
    disadvantage: Optional[DetailsDto] = None
    technical_ability: Optional[DetailsDto] = None
    management_ability: Optional[DetailsDto] = None
    product_thinking: Optional[DetailsDto] = None
    team_cooperation: Optional[DetailsDto] = None
    architecture_thinking: Optional[DetailsDto] = None
    active_drive: Optional[DetailsDto] = None
    qa: Optional[List[QADetailVO]] = None
