from flask import Blueprint, request, jsonify

from app.res import Response
from app.utils.ALYAudioConversionUtil import ALYAudioConversionUtil
from app.utils.S3Utils import S3Utils

bp = Blueprint('file', __name__)
s3_utils = S3Utils()


@bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    result = s3_utils.upload_file_to_s3(file)
    if result['success']:
        return jsonify(Response.ok(result).__dict__)
    else:
        return jsonify(Response.error(f"上传失败: {result['message']}").__dict__), 400
