import os
import subprocess
import tempfile
import uuid
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FFmpegUtils:
    # FFmpeg可执行文件路径配置
    _ffmpeg_path = None
    _ffprobe_path = None

    @classmethod
    def _get_ffmpeg_path(cls) -> str:
        """获取FFmpeg路径"""
        if cls._ffmpeg_path:
            return cls._ffmpeg_path

        # 根据操作系统设置默认路径
        if os.name == 'nt':  # Windows
            default_path = os.getenv('WINDOWS_PATH')
        else:  # Linux/macOS
            default_path = os.getenv('MAC_PATH')

        # 首先尝试默认路径
        if os.path.isfile(default_path):
            cls._ffmpeg_path = default_path
            return cls._ffmpeg_path

        # 如果默认路径不存在，尝试从PATH中查找
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10
            )
            if result.returncode == 0:
                cls._ffmpeg_path = "ffmpeg"
                return cls._ffmpeg_path
        except Exception:
            pass

        # 如果都找不到，返回默认路径（会在使用时报错）
        cls._ffmpeg_path = default_path
        return cls._ffmpeg_path

    @classmethod
    def _get_ffprobe_path(cls) -> str:
        """获取FFprobe路径"""
        if cls._ffprobe_path:
            return cls._ffprobe_path

        # 根据操作系统设置默认路径
        if os.name == 'nt':  # Windows
            default_path = os.getenv('WINDOWS_PATH')
        else:  # Linux/macOS
            default_path = os.getenv('MAC_PATH')

        # 首先尝试默认路径
        if os.path.isfile(default_path):
            cls._ffprobe_path = default_path
            return cls._ffprobe_path

        # 如果默认路径不存在，尝试从PATH中查找
        try:
            result = subprocess.run(
                ["ffprobe", "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10
            )
            if result.returncode == 0:
                cls._ffprobe_path = "ffprobe"
                return cls._ffprobe_path
        except Exception:
            pass

        # 如果都找不到，返回默认路径（会在使用时报错）
        cls._ffprobe_path = default_path
        return cls._ffprobe_path

    @classmethod
    def set_ffmpeg_path(cls, ffmpeg_path: str, ffprobe_path: str = None):
        """
        手动设置FFmpeg和FFprobe路径
        :param ffmpeg_path: FFmpeg可执行文件路径
        :param ffprobe_path: FFprobe可执行文件路径（可选，会自动推断）
        """
        cls._ffmpeg_path = ffmpeg_path

        if ffprobe_path:
            cls._ffprobe_path = ffprobe_path
        else:
            # 自动推断ffprobe路径
            if os.name == 'nt':  # Windows
                cls._ffprobe_path = ffmpeg_path.replace('ffmpeg.exe', 'ffprobe.exe')
            else:  # Linux/macOS
                cls._ffprobe_path = ffmpeg_path.replace('ffmpeg', 'ffprobe')

    @classmethod
    def is_ffmpeg_available(cls) -> bool:
        """
        检查FFmpeg是否可用
        :return: 如果FFmpeg可用返回True，否则返回False
        """
        try:
            ffmpeg_path = cls._get_ffmpeg_path()
            process = subprocess.run(
                [ffmpeg_path, "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            return process.returncode == 0
        except Exception as e:
            logger.error(f"检查FFmpeg可用性失败: {str(e)}")
            return False

    @staticmethod
    def convert_to_wav_16k(input_file_path: str) -> Optional[Path]:
        """
        将音频文件转换为16kHz采样率的WAV格式
        :param input_file_path: 输入音频文件路径
        :return: 转换后的WAV文件路径
        """
        input_file = Path(input_file_path)
        if not input_file.exists():
            raise FileNotFoundError(f"输入文件不存在: {input_file_path}")

        if not FFmpegUtils.is_ffmpeg_available():
            raise RuntimeError("FFmpeg不可用，无法进行音频转换")

        # 创建临时目录和输出文件
        temp_dir = tempfile.mkdtemp()
        output_file = Path(temp_dir) / f"{uuid.uuid4()}.wav"

        logger.info(f"开始转换音频文件: {input_file} -> {output_file}")

        try:
            ffmpeg_path = FFmpegUtils._get_ffmpeg_path()
            # 构建FFmpeg命令
            cmd = [
                ffmpeg_path,
                "-y",  # 覆盖输出文件（如果存在）
                "-i", str(input_file),  # 输入文件
                "-ar", "16000",  # 设置采样率为16000Hz
                "-ac", "1",  # 设置为单声道
                "-c:a", "pcm_s16le",  # 设置编码为16位PCM
                str(output_file)  # 输出文件
            ]

            # 执行命令
            process = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=300  # 5分钟超时
            )

            if process.returncode != 0:
                logger.error(f"FFmpeg转换失败: {process.stderr}")
                raise RuntimeError(f"音频转换失败，退出码: {process.returncode}")

            logger.info(f"音频转换成功: {output_file}")
            return output_file

        except subprocess.TimeoutExpired:
            logger.error("FFmpeg转换超时")
            raise RuntimeError("音频转换超时")
        except Exception as e:
            logger.error(f"音频转换失败: {str(e)}")
            raise

    @staticmethod
    def convert_to_wav_16k_with_output(input_file_path: str, output_file_path: str) -> None:
        """
        将音频文件转换为16kHz采样率的WAV格式，并保存到指定位置
        :param input_file_path: 输入音频文件路径
        :param output_file_path: 输出音频文件路径
        """
        input_file = Path(input_file_path)
        output_file = Path(output_file_path)

        if not input_file.exists():
            raise FileNotFoundError(f"输入文件不存在: {input_file_path}")

        if not FFmpegUtils.is_ffmpeg_available():
            raise RuntimeError("FFmpeg不可用，无法进行音频转换")

        # 确保输出目录存在
        output_file.parent.mkdir(parents=True, exist_ok=True)

        logger.info(f"开始转换音频文件: {input_file} -> {output_file}")

        try:
            ffmpeg_path = FFmpegUtils._get_ffmpeg_path()
            # 构建FFmpeg命令
            cmd = [
                ffmpeg_path,
                "-y",  # 覆盖输出文件（如果存在）
                "-i", str(input_file),  # 输入文件
                "-ar", "16000",  # 设置采样率为16000Hz
                "-ac", "1",  # 设置为单声道
                "-c:a", "pcm_s16le",  # 设置编码为16位PCM
                str(output_file)  # 输出文件
            ]

            # 执行命令
            process = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=300  # 5分钟超时
            )

            if process.returncode != 0:
                logger.error(f"FFmpeg转换失败: {process.stderr}")
                raise RuntimeError(f"音频转换失败，退出码: {process.returncode}")

            logger.info(f"音频转换成功: {output_file}")

        except subprocess.TimeoutExpired:
            logger.error("FFmpeg转换超时")
            raise RuntimeError("音频转换超时")
        except Exception as e:
            logger.error(f"音频转换失败: {str(e)}")
            raise

    @staticmethod
    def get_audio_info(audio_file_path: str) -> str:
        """
        获取音频文件信息
        :param audio_file_path: 音频文件路径
        :return: 音频文件信息字符串
        """
        audio_file = Path(audio_file_path)
        if not audio_file.exists():
            raise FileNotFoundError(f"文件不存在: {audio_file_path}")

        try:
            ffmpeg_path = FFmpegUtils._get_ffmpeg_path()
            cmd = [
                ffmpeg_path,
                "-i", str(audio_file)
            ]

            process = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=30
            )

            return process.stderr

        except subprocess.TimeoutExpired:
            logger.error("获取音频信息超时")
            raise RuntimeError("获取音频信息超时")
        except Exception as e:
            logger.error(f"获取音频信息失败: {str(e)}")
            raise

    @staticmethod
    def is_wav_16k(audio_file_path: str) -> bool:
        """
        检查音频文件是否为16kHz采样率的WAV格式
        :param audio_file_path: 音频文件路径
        :return: 如果是16kHz采样率的WAV格式返回True，否则返回False
        """
        audio_file = Path(audio_file_path)
        if not audio_file.exists():
            return False

        try:
            ffprobe_path = FFmpegUtils._get_ffprobe_path()
            cmd = [
                ffprobe_path,
                "-v", "error",
                "-select_streams", "a:0",
                "-show_entries", "stream=sample_rate,codec_name,channels",
                "-of", "csv=p=0",
                str(audio_file)
            ]

            process = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=30
            )

            if process.returncode == 0:
                output = process.stdout.strip()
                parts = output.split(',')
                if len(parts) >= 3:
                    codec_name = parts[0].strip()
                    sample_rate = parts[1].strip()
                    channels = parts[2].strip()

                    # 检查是否为16kHz单声道WAV
                    is_correct_format = (
                            codec_name == "pcm_s16le" and
                            sample_rate == "16000" and
                            channels == "1"
                    )

                    logger.debug(
                        f"音频文件 {audio_file.name}: 编码={codec_name}, "
                        f"采样率={sample_rate}, 声道数={channels}, "
                        f"是否符合要求={is_correct_format}"
                    )

                    return is_correct_format

            return False

        except subprocess.TimeoutExpired:
            logger.error("检查音频格式超时")
            return False
        except Exception as e:
            logger.error(f"检查音频格式失败: {str(e)}")
            return False


if __name__ == "__main__":
    # 如果需要，可以手动设置FFmpeg路径
    # FFmpegUtils.set_ffmpeg_path("D:\\Software\\ffmpeg-7.0.2-essentials_build\\bin\\ffmpeg.exe")

    if FFmpegUtils.is_ffmpeg_available():
        logger.info("FFmpeg可用，可以进行音频转换")
        logger.info(f"使用的FFmpeg路径: {FFmpegUtils._get_ffmpeg_path()}")

        try:
            # 示例：转换音频文件
            input_file_path = "D:\\path\\to\\your\\audio\\file.mp3"  # 替换为实际的音频文件路径
            output_file_path = "D:\\path\\to\\output\\converted_audio.wav"  # 替换为实际的输出路径

            # 转换音频并保存到指定位置
            FFmpegUtils.convert_to_wav_16k_with_output(input_file_path, output_file_path)

            # 检查转换后的文件是否符合要求
            if FFmpegUtils.is_wav_16k(output_file_path):
                logger.info("音频转换成功，文件符合16kHz采样率的WAV格式要求")
            else:
                logger.warning("音频转换完成，但文件可能不符合16kHz采样率的WAV格式要求")

            # 获取并打印音频信息
            audio_info = FFmpegUtils.get_audio_info(output_file_path)
            logger.info(f"转换后的音频信息:\n{audio_info}")

        except Exception as e:
            logger.error(f"音频转换失败: {str(e)}")
    else:
        logger.error("FFmpeg不可用，无法进行音频转换")
        logger.error("请检查FFmpeg是否正确安装，或手动设置路径：")
        logger.error("FFmpegUtils.set_ffmpeg_path('你的ffmpeg路径')")