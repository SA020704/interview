from dotenv import load_dotenv
from flask import Flask, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
load_dotenv()

from config import Config
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    CORS(app, resources={r"/*": {"origins": "*"}})

    from .controllers.interview_controller import bp as interview_bp
    from .controllers.ai_controller import bp as ai_bp
    from .controllers.file_controller import bp as file_controller_bp

    app.register_blueprint(interview_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/ai')
    app.register_blueprint(file_controller_bp, url_prefix='/v1/files')

    return app
