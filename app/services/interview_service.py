from typing import List, Optional
from app.dao.interview_dao import InterviewDao
from app.models.interview import Interview


class InterviewService:
    def __init__(self):
        self.interview_dao = InterviewDao()

    def get_interview(self, interview_id: int) -> Optional[Interview]:
        return self.interview_dao.get_interview(interview_id)

    def get_all_interviews(self) -> List[Interview]:
        return self.interview_dao.get_all_interviews()

    def create_interview(self, job: str, interview_type: str = None, resume: str = None) -> Interview:
        # 业务逻辑验证
        if not job:
            raise ValueError("面试岗位不能为空")

        return self.interview_dao.create_interview(job, interview_type, resume)

    def update_interview(self, interview_id: int, job: str = None,
                         interview_type: str = None, resume: str = None) -> Optional[Interview]:
        # 检查面试记录是否存在
        interview = self.get_interview(interview_id)
        if not interview:
            raise ValueError("面试记录不存在")

        # 如果更新面试岗位，进行验证
        if job and not job.strip():
            raise ValueError("面试岗位不能为空")

        return self.interview_dao.update_interview(interview_id, job, interview_type, resume)

    def delete_interview(self, interview_id: int) -> bool:
        return self.interview_dao.delete_interview(interview_id)
