import json
import os
from typing import Optional, List

import requests
import time
import base64

from app.dto.AiEvaluationVO import AiEvaluationVO
from app.dto.DetailsDto import DetailsDto
from app.dto.QADetailVO import QADetailVO
from app.dto.QAVO import QAVO


class ChatGptUtils:
    def __init__(self):
        self.gpt_proxy = os.getenv('GPT_PROXY_KEY')
        self.api_url = os.getenv('GPT_API_URL')

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
                cleaned_response = api_response.replace("```json|```", "").strip()
                result = json.loads(cleaned_response)
                return result
            except json.JSONDecodeError:
                # 第三级：使用正则表达式提取信息
                if regex_extractor:
                    return regex_extractor(api_response)
                return None

    @staticmethod
    def extract_with_regex(content: str):
        """使用正则表达式从AI简历总结文本中提取信息"""
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

    @staticmethod
    def parse_evaluation_response(api_response: str) -> Optional[AiEvaluationVO]:
        """解析评价响应为AiEvaluationVO对象"""
        try:
            parsed_data = ChatGptUtils.parse_ai_response(api_response)
            if not parsed_data or not isinstance(parsed_data, dict):
                return None

            evaluation_vo = AiEvaluationVO()

            # 字段映射：JSON字段名 -> Python属性名
            field_mapping = {
                'overallEvaluation': 'overall_evaluation',
                'advantage': 'advantage',
                'disadvantage': 'disadvantage',
                'technicalAbility': 'technical_ability',
                'managementAbility': 'management_ability',
                'productThinking': 'product_thinking',
                'teamCooperation': 'team_cooperation',
                'architectureThinking': 'architecture_thinking',
                'activeDrive': 'active_drive'
            }

            # 解析每个评价维度
            for json_key, attr_name in field_mapping.items():
                if json_key in parsed_data:
                    detail_data = parsed_data[json_key]
                    if isinstance(detail_data, dict):
                        details_dto = DetailsDto(
                            summarize=detail_data.get('summarize', ''),
                            full_marks=detail_data.get('fullMarks', '5'),
                            score=int(detail_data.get('score', 0))
                        )
                        setattr(evaluation_vo, attr_name, details_dto)

            return evaluation_vo

        except Exception as e:
            return None

    @staticmethod
    def parse_qa_response(api_response: str) -> List[QADetailVO]:
        """解析QA响应为QADetailVO列表"""
        try:
            parsed_data = ChatGptUtils.parse_ai_response(api_response)
            if not parsed_data or not isinstance(parsed_data, list):
                return []

            qa_list = []
            for item in parsed_data:
                if not isinstance(item, dict):
                    continue

                # 解析details中的QA对
                qa_details = []
                if 'details' in item and isinstance(item['details'], list):
                    for detail in item['details']:
                        if isinstance(detail, dict) and 'question' in detail and 'answer' in detail:
                            qa_vo = QAVO(
                                question=detail['question'],
                                answer=detail['answer']
                            )
                            qa_details.append(qa_vo)

                qa_detail_vo = QADetailVO(
                    title=item.get('title', ''),
                    summary=item.get('summary', ''),
                    keywords=item.get('keywords', []) if isinstance(item.get('keywords'), list) else [],
                    details=qa_details
                )
                qa_list.append(qa_detail_vo)

            return qa_list

        except Exception as e:
            return []

    @staticmethod
    def parse_combined_response(evaluation_response: str, qa_response: str) -> AiEvaluationVO:
        """解析并合并评价和QA响应"""
        try:
            # 解析评价响应
            evaluation_vo = ChatGptUtils.parse_evaluation_response(evaluation_response)
            if not evaluation_vo:
                evaluation_vo = AiEvaluationVO()

            # 解析QA响应
            qa_list = ChatGptUtils.parse_qa_response(qa_response)

            # 合并结果
            evaluation_vo.qa = qa_list

            return evaluation_vo

        except Exception as e:
            return AiEvaluationVO()
