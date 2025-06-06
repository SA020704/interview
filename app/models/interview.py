from datetime import datetime
from app import db
from enum import Enum


class Deleted(Enum):
    YES = 1
    NO = 0


class Interview(db.Model):
    __tablename__ = 'tb_interview'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    version = db.Column(db.Integer, default=0, nullable=False, comment='乐观锁')
    create_date_time = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    update_date_time = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    deleted = db.Column(db.Integer, default=Deleted.NO.value, comment='是否删除')
    user_id = db.Column(db.Integer)
    resume = db.Column(db.Text)
    interview_evaluation = db.Column(db.Text)

    def __init__(self, user_id=None, resume=None, interview_evaluation=None):
        self.user_id = user_id
        self.resume = resume
        self.interview_evaluation = interview_evaluation

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'resume': self.resume,
            'create_date_time': self.create_date_time.isoformat() if self.create_date_time else None,
            'update_date_time': self.update_date_time.isoformat() if self.update_date_time else None,
            'interview_evaluation': self.interview_evaluation if self.interview_evaluation else None
        }
