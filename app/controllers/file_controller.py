from flask import Blueprint, request, jsonify

from app.res import Response
from app.utils.ALYAudioConversionUtil import ALYAudioConversionUtil
from app.utils.S3Utils import S3Utils

bp = Blueprint('file', __name__)
s3_utils = S3Utils()


@bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    # result = s3_utils.upload_file_to_s3(file)
    res = ALYAudioConversionUtil.file_trans("https://static.datingpaas.net/interview/20250605_102644_e13ea828.wav")
    return jsonify(Response.ok(res).__dict__)
    # if result['success']:
    #     return jsonify(Response.ok(result).__dict__)
    # else:
    #     return jsonify(Response.error(f"上传失败: {result['message']}").__dict__), 400
