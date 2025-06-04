from datetime import datetime
from app import db
from enum import Enum


class Deleted(Enum):
    YES = 1
    NO = 0


class BaseEntity:
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    version = db.Column(db.Integer, default=0, nullable=False, comment='乐观锁')
    createDateTime = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updateDateTime = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    deleted = db.Column(db.Integer, default=Deleted.NO.value, comment='是否删除')
