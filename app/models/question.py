from datetime import datetime
from app import db
from enum import Enum


class Deleted(Enum):
    YES = 1
    NO = 0


class Question(db.Model):
    __tablename__ = 'tb_question'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    version = db.Column(db.Integer, default=0, nullable=False, comment='乐观锁')
    create_date_time = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    update_date_time = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    deleted = db.Column(db.Integer, default=Deleted.NO.value, comment='是否删除')
    question = db.Column(db.String(255), nullable=False, comment='问题')
    interview_id = db.Column(db.Integer, nullable=False, comment='面试信息关联id')

    def __init__(self, question=None, interview_id=None):
        self.question = question
        self.interview_id = interview_id

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'interview_id': self.interview_id,
            'create_date_time': self.create_date_time.isoformat() if self.create_date_time else None,
            'update_date_time': self.update_date_time.isoformat() if self.update_date_time else None
        }

