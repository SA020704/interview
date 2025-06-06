import boto3
import uuid
import os
import tempfile
import shutil
from datetime import datetime
import logging

from app.utils.ffmpeg_utils import FFmpegUtils

logger = logging.getLogger(__name__)


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
        '.wav': 'audio/wav',
        '.flac': 'audio/flac',
        '.aac': 'audio/aac',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
    }
    return content_types.get(extension, 'application/octet-stream')


def _is_audio_file(filename):
    """检查文件是否为音频文件"""
    audio_extensions = {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.amr', '.webm'}
    extension = os.path.splitext(filename)[1].lower()
    return extension in audio_extensions


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
        上传文件到S3，音频文件会自动转换为16kHz采样率的WAV格式

        Args:
            file: 文件对象 (Flask的FileStorage对象或文件路径字符串)
            folder: S3中的文件夹路径，默认为"interview"
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
        temp_files_to_cleanup = []  # 用于跟踪需要清理的临时文件

        try:
            s3_client = self.get_s3_client()

            # 处理不同类型的文件输入
            if isinstance(file, str):
                # 文件路径字符串
                file_path = file
                original_filename = os.path.basename(file_path)

                logger.info(f"_is_audio_file(original_filename)结果是:{_is_audio_file(original_filename)}")
                if _is_audio_file(original_filename):
                    # 处理音频文件
                    return self._handle_audio_upload(s3_client, file_path, original_filename,
                                                     folder, custom_filename, temp_files_to_cleanup)
                else:
                    # 非音频文件直接上传
                    with open(file_path, 'rb') as f:
                        return self._upload_file_content(s3_client, f, original_filename, folder, custom_filename)
            else:
                # 文件对象 (如Flask的FileStorage)
                original_filename = getattr(file, 'filename', 'unknown_file')

                if _is_audio_file(original_filename):
                    # 先保存到临时文件
                    temp_file_path = self._save_uploaded_file_to_temp(file, original_filename)
                    temp_files_to_cleanup.append(temp_file_path)

                    # 处理音频文件
                    return self._handle_audio_upload(s3_client, temp_file_path, original_filename,
                                                     folder, custom_filename, temp_files_to_cleanup)
                else:
                    # 非音频文件直接上传
                    return self._upload_file_content(s3_client, file, original_filename, folder, custom_filename)

        except Exception as e:
            logger.error(f"上传文件失败: {str(e)}")
            return {
                'success': False,
                'file_url': None,
                's3_key': None,
                'message': f'上传失败: {str(e)}'
            }
        finally:
            # 清理临时文件
            self._cleanup_temp_files(temp_files_to_cleanup)

    def _save_uploaded_file_to_temp(self, file_obj, original_filename):
        """将上传的文件对象保存到临时文件"""
        # 获取文件扩展名
        file_extension = os.path.splitext(original_filename)[1]

        # 生成唯一临时文件名，仿照Java代码的逻辑
        time_millis = int(datetime.now().timestamp())
        random_num = 1000 + (int(uuid.uuid4().hex, 16) % 9000)  # 生成1000-9999的随机数
        unique_filename = f"{uuid.uuid4().hex}{time_millis}{random_num}{file_extension}"

        # 创建临时文件路径
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, unique_filename)

        try:
            # 保存文件
            if hasattr(file_obj, 'save'):
                # Flask FileStorage对象
                file_obj.save(temp_file_path)
            elif hasattr(file_obj, 'read'):
                # 其他文件对象
                file_obj.seek(0)  # 确保从文件开头读取
                with open(temp_file_path, 'wb') as temp_file:
                    shutil.copyfileobj(file_obj, temp_file)
            else:
                raise ValueError("不支持的文件对象类型")

            logger.info(f"文件已保存到临时位置: {temp_file_path}")
            return temp_file_path

        except Exception as e:
            # 如果保存失败，清理可能创建的文件
            if os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            raise e

    def _handle_audio_upload(self, s3_client, file_path, original_filename, folder, custom_filename,
                             temp_files_to_cleanup):
        """处理音频文件上传"""

        try:
            # 检查是否已经是16kHz采样率的WAV格式
            if FFmpegUtils.is_wav_16k(file_path):
                logger.info(f"音频文件 {original_filename} 已经是16kHz WAV格式，直接上传")
                # 直接上传原文件
                with open(file_path, 'rb') as f:
                    return self._upload_file_content(s3_client, f, original_filename, folder, custom_filename)
            else:
                logger.info(f"音频文件 {original_filename} 需要转换为16kHz WAV格式")

                # 生成转换后的文件名，仿照Java代码
                time_millis = int(datetime.now().timestamp())
                random_num = 1000 + (int(uuid.uuid4().hex, 16) % 9000)
                wav_filename = f"{uuid.uuid4().hex}{time_millis}{random_num}.wav"

                # 创建转换后的临时文件路径
                temp_dir = tempfile.gettempdir()
                converted_file_path = os.path.join(temp_dir, wav_filename)
                temp_files_to_cleanup.append(converted_file_path)

                # 转换为16kHz采样率的WAV格式
                FFmpegUtils.convert_to_wav_16k_with_output(file_path, converted_file_path)

                # 上传转换后的文件
                final_filename = custom_filename if custom_filename else None
                with open(converted_file_path, 'rb') as f:
                    # 如果没有自定义文件名，使用转换后的文件名（但保持原始基础名）
                    if not final_filename:
                        base_name = os.path.splitext(original_filename)[0]
                        final_filename = f"{base_name}_16k.wav"

                    return self._upload_file_content(s3_client, f, final_filename, folder, None)

        except Exception as e:
            logger.error(f"处理音频文件失败: {str(e)}")
            raise

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

        logger.info(f"文件上传成功: {file_url}")

        return {
            'success': True,
            'file_url': file_url,
            's3_key': s3_key,
            'message': '上传成功'
        }

    def _cleanup_temp_files(self, temp_files):
        """清理临时文件"""
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
                    logger.debug(f"已清理临时文件: {temp_file}")
            except Exception as e:
                logger.warning(f"清理临时文件失败 {temp_file}: {e}")

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
