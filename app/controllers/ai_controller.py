from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.res import Response

bp = Blueprint('ai', __name__)
ai_service = AIService()


@bp.route('/ResumeAnalysis', methods=['POST'])
def analyze_resume():
    try:
        if 'file' not in request.files:
            return jsonify(Response.error("未上传文件").__dict__), 400

        file = request.files['file']
        user_id = request.form.get('user_id') if request.form.get('user_id') else 1
        if file.filename == '':
            return jsonify(Response.error("未选择文件").__dict__), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify(Response.error("只支持 PDF 文件").__dict__), 400

        # 读取文件内容
        file_content = file.read()

        # 调用 AI 服务分析简历
        result = ai_service.analyze_resume(file_content, user_id)
        return jsonify(result.__dict__)

    except Exception as e:
        return jsonify(Response.error(f"简历分析失败: {str(e)}").__dict__), 500
