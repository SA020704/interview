import json
import requests
import time
import base64


class ChatGptUtils:
    def __init__(self):
        self.gpt_proxy = "Online-Exam-Evan-Proxy"
        self.api_url = "https://openai.masonvips.com/proxy/v1/chat/completions"

    def proxy_ms_api(self, params):
        """茂松代理Api接口"""
        try:
            # 当前时间戳
            current_time_millis = int(time.time())
            timestamp = (current_time_millis - 1720000000) * 999
            stamp = str(timestamp)

            # 使用base64编码
            cur_timestamp = base64.b64encode(stamp.encode()).decode()

            # 生成 Basic Auth 头
            credentials = f"{self.gpt_proxy}:{cur_timestamp}"
            credential = "Basic " + base64.b64encode(credentials.encode()).decode()

            headers = {
                "Content-Type": "application/json",
                "Authorization": credential,
                "Timestamp": str(current_time_millis)
            }

            response = requests.post(
                self.api_url,
                headers=headers,
                json=params
            )

            if response.status_code != 200:
                error_body = response.text
                raise Exception(f"API request failed: {error_body}")

            response_data = response.json()
            content = response_data["choices"][0]["message"]["content"]

            return content

        except Exception as e:
            raise Exception(f"API调用失败: {str(e)}")

    @staticmethod
    def parse_ai_response(api_response, type_reference=None, regex_extractor=None):
        """解析 AI 响应"""
        if not api_response:
            return None

        # 第一级：尝试直接解析 JSON
        try:
            result = json.loads(api_response)
            return result
        except json.JSONDecodeError:
            # 第二级：清理响应中可能的 markdown 标记并重新解析
            try:
                cleaned_response = api_response.replaceAll("```json|```", "").strip()
                result = json.loads(cleaned_response)
                return result
            except json.JSONDecodeError:
                # 第三级：使用正则表达式提取信息
                if regex_extractor:
                    return regex_extractor(api_response)
                return None

    @staticmethod
    def extract_with_regex(content):
        """使用正则表达式从文本中提取信息"""
        import re

        result = {
            "username": "无",
            "workExperience": "无",
            "jobInformation": "无",
            "skillTags": "无"
        }

        # 提取用户名
        username_match = re.search(r'"username"\s*:\s*"([^"]+)"', content)
        if username_match:
            result["username"] = username_match.group(1)

        # 提取工作经验
        work_exp_match = re.search(r'"workExperience"\s*:\s*"([^"]+)"', content)
        if work_exp_match:
            result["workExperience"] = work_exp_match.group(1)

        # 提取工作信息
        job_info_match = re.search(r'"jobInformation"\s*:\s*"([^"]+)"', content)
        if job_info_match:
            result["jobInformation"] = job_info_match.group(1)

        # 提取技能标签
        skills_match = re.search(r'"skillTags"\s*:\s*"([^"]+)"', content)
        if skills_match:
            result["skillTags"] = skills_match.group(1)

        return result 