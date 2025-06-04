from flask import Blueprint, jsonify, request
from app.services.interview_service import InterviewService
from app.res import Response

bp = Blueprint('interview', __name__)
interview_service = InterviewService()


@bp.route('/interviews', methods=['GET'])
def get_interviews():
    try:
        interviews = interview_service.get_all_interviews()
        return jsonify(Response.ok([interview.to_dict() for interview in interviews]).__dict__)
    except Exception as e:
        return jsonify(Response.error(str(e)).__dict__), 500


@bp.route('/interviews/<int:interview_id>', methods=['GET'])
def get_interview(interview_id):
    try:
        interview = interview_service.get_interview(interview_id)
        if interview:
            return jsonify(Response.ok(interview.to_dict()).__dict__)
        return jsonify(Response.error("面试记录不存在").__dict__), 404
    except Exception as e:
        return jsonify(Response.error(str(e)).__dict__), 500


@bp.route('/interviews', methods=['POST'])
def create_interview():
    try:
        data = request.get_json()
        job = data.get('job')
        interview_type = data.get('interview_type')
        resume = data.get('resume')

        if not job:
            return jsonify(Response.error("面试岗位不能为空").__dict__), 400

        interview = interview_service.create_interview(job, interview_type, resume)
        return jsonify(Response.ok(interview.to_dict()).__dict__), 201
    except ValueError as e:
        return jsonify(Response.error(str(e)).__dict__), 400
    except Exception as e:
        return jsonify(Response.error(str(e)).__dict__), 500


@bp.route('/interviews/<int:interview_id>', methods=['PUT'])
def update_interview(interview_id):
    try:
        data = request.get_json()
        job = data.get('job')
        interview_type = data.get('interview_type')
        resume = data.get('resume')

        interview = interview_service.update_interview(
            interview_id, job, interview_type, resume
        )
        if interview:
            return jsonify(Response.ok(interview.to_dict()).__dict__)
        return jsonify(Response.error("面试记录不存在").__dict__), 404
    except ValueError as e:
        return jsonify(Response.error(str(e)).__dict__), 400
    except Exception as e:
        return jsonify(Response.error(str(e)).__dict__), 500


@bp.route('/interviews/<int:interview_id>', methods=['DELETE'])
def delete_interview(interview_id):
    try:
        if interview_service.delete_interview(interview_id):
            return jsonify(Response.ok({"message": "面试记录删除成功"}).__dict__)
        return jsonify(Response.error("面试记录不存在").__dict__), 404
    except Exception as e:
        return jsonify(Response.error(str(e)).__dict__), 500
