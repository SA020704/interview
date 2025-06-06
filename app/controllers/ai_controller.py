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
            return jsonify(Response.error("未上传文件").__dict__)

        file = request.files['file']
        user_id = request.form.get('user_id') if request.form.get('user_id') else 1
        if file.filename == '':
            return jsonify(Response.error("未选择文件").__dict__)

        if not file.filename.lower().endswith('.pdf'):
            return jsonify(Response.error("只支持 PDF 文件").__dict__)

        # 读取文件内容
        file_content = file.read()

        # 调用 AI 服务分析简历
        result = ai_service.analyze_resume(file_content, user_id)
        return jsonify(Response.ok(result).__dict__)

    except Exception as e:
        return jsonify(Response.error(f"简历分析失败: {str(e)}").__dict__)


@bp.route('/audioAnalysis', methods=['POST'])
def analyze_audio():
    """
    音频分析得到问题(这一步仅仅是将音频转文字并且放入MQ中等待消费者进行处理)
    """
    try:
        user_id = request.form.get('user_id') if request.form.get('user_id') else 1
        url = request.form.get('url') if request.form.get('url') else None
        interview_id = request.form.get('interview_id') if request.form.get('interview_id') else None
        result = ai_service.analyze_audio(url, user_id, interview_id)
        return jsonify(Response.ok(result).__dict__)

    except Exception as e:
        return jsonify(Response.error(f"简历分析失败: {str(e)}").__dict__)


@bp.route('/getaAudioAnalysisRes', methods=['GET'])
def getaAudioAnalysisRes():
    """
    获取AI分析出的问题
    """
    try:
        interview_id = request.args.get('interview_id') if request.args.get('interview_id') else None
        if interview_id is None:
            return jsonify(Response.error("interview_id参数不能为空").__dict__)
        result = ai_service.getaAudioAnalysisRes(interview_id)
        if result is None:
            return jsonify(Response.error("未查询到对应结果").__dict__)
        return jsonify(Response.ok(result).__dict__)
    except Exception as e:
        return jsonify(Response.error(f"获取AI得到的问题失败: {str(e)}").__dict__)


@bp.route('/getAiEvaluation', methods=['GET'])
def getAiEvaluation():
    """
    AI面试评价
    """
    try:
        interview_id = request.args.get('interview_id') if request.args.get('interview_id') else None
        if interview_id is None:
            return jsonify(Response.error("interview_id参数不能为空").__dict__)
        result = ai_service.getAiEvaluation(interview_id)
        return jsonify(Response.ok(result).__dict__)
    except Exception as e:
        return jsonify(Response.error(f"AI面试评价失败: {str(e)}").__dict__)
