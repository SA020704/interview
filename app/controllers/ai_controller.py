import json
from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.res import Response
from app.services.interview_service import InterviewService

bp = Blueprint('ai', __name__)
ai_service = AIService()
interview_service = InterviewService()


@bp.route('/ResumeAnalysis', methods=['POST'])
def analyze_resume():
    """
    从简历上提取面试者关键信息/初始化题目
    """
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
        return jsonify(Response.ok(result).__dict__)

    except Exception as e:
        return jsonify(Response.error(f"简历分析失败: {str(e)}").__dict__), 500


@bp.route('/interviewInit', methods=['POST'])
def interview_init():
    """
    面试信息初始化
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify(Response.error("请求数据为空").__dict__), 400
        job = data.get('job', '')
        biographical_notes_response = data.get('biographicalNotesResponse', {})
        if job != '' and biographical_notes_response:
            resume_json = json.dumps(biographical_notes_response, ensure_ascii=False)
            interview = interview_service.create_interview(
                job=job,
                interview_type=None,
                resume=resume_json
            )
            return jsonify(Response.ok(interview.id).__dict__), 200
        else:
            return jsonify(Response.error("缺少必要参数").__dict__), 400
    except ValueError as ve:
        return jsonify(Response.error(str(ve)).__dict__), 400
    except Exception as e:
        return jsonify(Response.error(f"面试信息初始化失败: {str(e)}").__dict__), 500
