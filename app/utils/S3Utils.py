import boto3
import uuid
import os
from datetime import datetime


def _get_content_type(filename):
    """根据文件扩展名获取Content-Type"""
    extension = os.path.splitext(filename)[1].lower()
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
    }
    return content_types.get(extension, 'application/octet-stream')


class S3Utils:
    def __init__(self):
        self.aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 's3-dl-resource')
        self.url = os.getenv('S3_BASE_URL', 'https://static.datingpaas.net/')

    def get_s3_client(self):
        s3 = boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key
        )
        return s3

    def upload_file_to_s3(self, file, folder="interview", custom_filename=None):
        """
        上传文件到S3

        Args:
            file: 文件对象 (Flask的FileStorage对象或文件路径字符串)
            folder: S3中的文件夹路径，默认为"uploads"
            custom_filename: 自定义文件名，如果不提供则自动生成

        Returns:
            dict: 包含上传结果的字典
            {
                'success': bool,
                'file_url': str,  # 文件的完整URL
                's3_key': str,    # S3中的文件键
                'message': str
            }
        """
        try:
            s3_client = self.get_s3_client()

            # 处理不同类型的文件输入
            if isinstance(file, str):
                file_path = file
                original_filename = os.path.basename(file_path)
                with open(file_path, 'rb') as f:
                    return self._upload_file_content(s3_client, f, original_filename, folder, custom_filename)
            else:
                original_filename = getattr(file, 'filename', 'unknown_file')
                return self._upload_file_content(s3_client, file, original_filename, folder, custom_filename)

        except Exception as e:
            return {
                'success': False,
                'file_url': None,
                's3_key': None,
                'message': f'上传失败: {str(e)}'
            }

    def _upload_file_content(self, s3_client, file_content, original_filename, folder, custom_filename):
        """内部方法：上传文件内容"""
        if custom_filename:
            filename = custom_filename
        else:
            # 获取文件扩展名
            file_extension = os.path.splitext(original_filename)[1]
            # 生成唯一文件名：时间戳 + UUID + 原扩展名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            filename = f"{timestamp}_{unique_id}{file_extension}"

        # 构建S3中的完整键名
        s3_key = f"{folder}/{filename}" if folder else filename

        # 上传文件
        s3_client.upload_fileobj(
            file_content,
            Bucket=self.bucket_name,
            Key=s3_key,
            ExtraArgs={
                'ContentType': _get_content_type(filename)
            }
        )

        # 构建文件的完整URL
        file_url = f"{self.url.rstrip('/')}/{s3_key}"

        return {
            'success': True,
            'file_url': file_url,
            's3_key': s3_key,
            'message': '上传成功'
        }

    def delete_file_from_s3(self, s3_key):
        """从S3删除文件"""
        try:
            s3_client = self.get_s3_client()
            s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            return {
                'success': True,
                'message': '删除成功'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'删除失败: {str(e)}'
            }