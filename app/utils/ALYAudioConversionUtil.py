import json
import os
import time
import logging
from aliyunsdkcore.acs_exception.exceptions import ClientException
from aliyunsdkcore.acs_exception.exceptions import ServerException
from aliyunsdkcore.client import AcsClient
from aliyunsdkcore.request import CommonRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ALYAudioConversionUtil:

    @staticmethod
    def file_trans(file_link):
        """
        将音频文件转换为文本

        Args:
            file_link: 音频文件链接

        Returns:
            str: 识别出的文本内容，失败返回None
        """
        # 从环境变量获取配置
        ak_id = os.getenv('ALIYUN_AK_ID')
        ak_secret = os.getenv('ALIYUN_AK_SECRET')
        app_key = os.getenv('NLS_APP_KEY')

        if not all([ak_id, ak_secret, app_key]):
            logger.error("缺少必要的环境变量：ALIYUN_AK_ID, ALIYUN_AK_SECRET, NLS_APP_KEY")
            return None

        # 常量定义
        REGION_ID = "cn-shanghai"
        PRODUCT = "nls-filetrans"
        DOMAIN = "filetrans.cn-shanghai.aliyuncs.com"
        API_VERSION = "2018-08-17"  # 中国站版本
        POST_REQUEST_ACTION = "SubmitTask"
        GET_REQUEST_ACTION = "GetTaskResult"

        # 请求参数键
        KEY_APP_KEY = "appkey"
        KEY_FILE_LINK = "file_link"
        KEY_VERSION = "version"
        KEY_ENABLE_WORDS = "enable_words"
        KEY_AUTO_SPLIT = "auto_split"

        # 响应参数键
        KEY_TASK = "Task"
        KEY_TASK_ID = "TaskId"
        KEY_STATUS_TEXT = "StatusText"
        KEY_RESULT = "Result"

        # 状态值
        STATUS_SUCCESS = "SUCCESS"
        STATUS_RUNNING = "RUNNING"
        STATUS_QUEUEING = "QUEUEING"

        try:
            # 创建AcsClient实例
            client = AcsClient(ak_id, ak_secret, REGION_ID)

            # 步骤1: 提交录音文件识别请求
            post_request = CommonRequest()
            post_request.set_domain(DOMAIN)
            post_request.set_version(API_VERSION)
            post_request.set_product(PRODUCT)
            post_request.set_action_name(POST_REQUEST_ACTION)
            post_request.set_method('POST')

            # 设置任务参数
            task = {
                KEY_APP_KEY: app_key,
                KEY_FILE_LINK: file_link,
                KEY_VERSION: "4.0",
                KEY_ENABLE_WORDS: True  # 开启词信息输出
            }

            task_json = json.dumps(task)
            logger.info(f"提交任务参数: {task_json}")
            post_request.add_body_params(KEY_TASK, task_json)

            # 提交请求
            post_response = client.do_action_with_exception(post_request)
            post_response = json.loads(post_response)
            logger.info(f"提交响应: {post_response}")

            status_text = post_response.get(KEY_STATUS_TEXT)
            if status_text != STATUS_SUCCESS:
                logger.error(f"录音文件识别请求失败，状态: {status_text}")
                return None

            task_id = post_response.get(KEY_TASK_ID)
            if not task_id:
                logger.error("未获取到任务ID")
                return None

            logger.info(f"录音文件识别请求成功，任务ID: {task_id}")

            # 步骤2: 轮询获取识别结果
            get_request = CommonRequest()
            get_request.set_domain(DOMAIN)
            get_request.set_version(API_VERSION)
            get_request.set_product(PRODUCT)
            get_request.set_action_name(GET_REQUEST_ACTION)
            get_request.set_method('GET')
            get_request.add_query_param(KEY_TASK_ID, task_id)

            # 轮询查询结果
            max_attempts = 360  # 最多尝试360次（1小时）
            attempt = 0

            while attempt < max_attempts:
                attempt += 1

                try:
                    get_response = client.do_action_with_exception(get_request)
                    get_response = json.loads(get_response)
                    logger.info(f"查询响应 (第{attempt}次): {get_response}")

                    status_text = get_response.get(KEY_STATUS_TEXT)

                    if status_text in [STATUS_RUNNING, STATUS_QUEUEING]:
                        # 继续轮询
                        logger.info(f"任务状态: {status_text}，等待10秒后继续查询...")
                        time.sleep(10)
                        continue
                    elif status_text == STATUS_SUCCESS:
                        # 识别成功，提取结果
                        logger.info("录音文件识别成功！")
                        result = get_response.get(KEY_RESULT)
                        if result:
                            # 提取文本内容
                            text = ALYAudioConversionUtil._extract_text_from_result(result)
                            return text
                        else:
                            logger.warning("识别成功但结果为空")
                            return ""
                    else:
                        # 识别失败
                        logger.error(f"录音文件识别失败，状态: {status_text}")
                        return None

                except (ServerException, ClientException) as e:
                    logger.error(f"查询请求异常: {e}")
                    time.sleep(10)
                    continue

            logger.error("查询超时，未能获取识别结果")
            return None

        except (ServerException, ClientException) as e:
            logger.error(f"阿里云API异常: {e}")
            return None
        except Exception as e:
            logger.error(f"处理异常: {e}")
            return None

    @staticmethod
    def _extract_text_from_result(result):
        """
        从识别结果中提取文本

        Args:
            result: 识别结果（字符串或字典）

        Returns:
            str: 提取的文本内容
        """
        try:
            # 如果result是字符串，解析为字典
            if isinstance(result, str):
                result_data = json.loads(result)
            else:
                result_data = result

            # 优先使用Sentences数组（包含标点符号）
            if "Sentences" in result_data and isinstance(result_data["Sentences"], list):
                sentences = result_data["Sentences"]
                full_text = ""

                for sentence in sentences:
                    if "Text" in sentence:
                        full_text += sentence["Text"]

                logger.info(f"从Sentences提取文本: {full_text}")
                return full_text

            # 备选方案：使用Words数组（不包含标点符号）
            elif "Words" in result_data and isinstance(result_data["Words"], list):
                words = result_data["Words"]
                word_list = []

                for word in words:
                    if "Word" in word:
                        word_list.append(word["Word"])

                full_text = " ".join(word_list)
                logger.info(f"从Words提取文本: {full_text}")
                return full_text

            # 如果都没有，尝试直接返回结果
            elif isinstance(result_data, str):
                return result_data

            logger.warning("无法从结果中提取文本内容")
            return "无法提取文本内容"

        except Exception as e:
            logger.error(f"提取文本异常: {e}")
            return f"文本提取失败: {str(e)}"