from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    from .controllers.interview_controller import bp as interview_bp
    from .controllers.ai_controller import bp as ai_bp

    app.register_blueprint(interview_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/ai')

    return app
