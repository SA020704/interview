class PromptUtils:
    @staticmethod
    def get_resume_extraction_prompt(resume_content):
        """生成简历提取的提示词"""
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个专业的简历分析专家，擅长从简历中提取关键信息。"
                },
                {
                    "role": "user",
                    "content": f"""
                    我将提供一份简历的文本内容。请根据内容提取以下关键信息：
                    1. 姓名
                    2. 工作年限
                    3. 求职岗位
                    4. 技能标签（用逗号分隔）

                    重要提示：
                    1. 只返回纯 JSON 格式，不要包含其他字符、标记或解释
                    2. 不要使用 markdown 格式，不要添加 ```json 或 ``` 代码块标记
                    3. 如果无法提取对应的关键信息，在对应的 JSON 字段中写入"无"
                    4. 返回的内容必须是可直接解析的有效 JSON
                    5. 所有内容必须使用中文返回

                    简历内容：
                    {resume_content}

                    请按以下 JSON 格式返回：
                    {{
                        "username": "姓名",
                        "workExperience": "工作年限",
                        "jobInformation": "求职岗位",
                        "skillTags": "技能标签"
                    }}
                    """
                }
            ],
            "temperature": 0.7
        }

    @staticmethod
    def get_init_question_message(resume_content):
        """生成初始化问题的提示词"""
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert technical interviewer who specializes in creating insightful "
                               "questions that accurately assess a candidate's skill level and achievement orientation."
                },
                {
                    "role": "user",
                    "content": f"""
                        Here are the key messages from a candidate's resume:
                        {resume_content}
                                                
                        Your task is to create three high-quality technical interview questions based on this resume.
                                                
                        Question requirements: 1. Each question must directly relate to specific technologies, 
                        projects or experiences mentioned in the resume 2. Questions should be designed to 
                        distinguish between basic competency (Level 1) and advanced mastery (Level 2) in achievement 
                        orientation 3. Questions should reveal the candidate's: - Technical depth and problem-solving 
                        approach - Decision-making process in technical implementation - Ability to overcome 
                        challenges and deliver results 4. Focus on areas that demonstrate the candidate's impact, 
                        initiative, and ability to exceed standard expectations
                                                
                        Output Requirements: 1. Return only pure string format, without any other characters, marks, 
                        or explanations 2. Accurately return three questions, separated by "/" character 3. Questions 
                        must be related to specific projects or experiences mentioned in the resume 4. Return content 
                        in Chinese 5. Each question must end with a question mark(?) 6. Each question is limited to 
                        80 characters or less, keeping it concise and clear 7. Questions must be able to distinguish 
                        between Level 1 and Level 2 achievement orientation characteristics
                                                
                        Example output format: 请描述您在Spring 
                        Boot项目中如何优化API性能，以及您取得的具体成果是什么?/在使用Elasticsearch时，您如何解决了哪些复杂的搜索需求挑战?/您能分享一个您通过MySQL
                        数据库优化显著提升系统性能的具体案例吗?"""
                }
            ],
            "temperature": 0.7
        }
