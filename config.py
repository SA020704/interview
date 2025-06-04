import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev_key'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost:3306/worldAI?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False 