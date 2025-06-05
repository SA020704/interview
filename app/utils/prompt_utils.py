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

    @staticmethod
    def get_audio_content_analysis_message(audio_content, interview):
        """生成初始化问题的提示词"""
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a seasoned technical interviewer who excels at designing in-depth technical "
                               "questions based on existing interview dialogue content. You can precisely assess "
                               "candidates' professional abilities, project experience, and problem-solving "
                               "approaches through your questions."
                },
                {
                    "role": "user",
                    "content": f"""
                        I will provide you with the following interview information:
                        1. A segment of interview dialogue transcribed from audio.
                        2. The position the candidate is interviewing for.
                        3. Some information extracted from the candidate's resume.

                        Interview Information:
                        ```
                        Interview dialogue text:
                        {audio_content}

                        Candidate's basic information:
                        Resume information: 
                        {interview}
                        ```

                        Task Requirements: Based on the existing interview content, design 3 high-quality follow-up 
                        questions that should: 1. PRIMARILY focus on topics already discussed in the conversation (
                        this is the highest priority) 2. Explore deeper into the candidate's previous answers to 
                        reveal their true technical level and practical experience 3. Include open-ended questions 
                        that test the candidate's thinking patterns, problem-solving abilities and technical vision 
                        4. Target specific technical points mentioned in the dialogue rather than general skills 5. 
                        Set reasonable technical difficulty gradients that can distinguish the candidate's actual 
                        ability level

                        Content Analysis and Question Design Strategy: - First, identify topics that appear in BOTH 
                        the dialogue and resume - these are prime candidates for deeper questions that combine both 
                        sources - When a skill/technology is mentioned in both dialogue and resume, create questions 
                        that leverage both the candidate's stated experience (resume) and their discussion points (
                        dialogue) - For topics that ONLY appear in the dialogue, create questions based solely on the 
                        conversation content - Only ask about resume-exclusive items if they are highly relevant to 
                        the discussion context and there aren't enough dialogue topics to create 3 strong questions

                        Important Priority Guidelines:
                        - At least 2 of the 3 questions MUST be directly based on the interview dialogue content
                        - When topics overlap between dialogue and resume, prioritize these for questioning
                        - Avoid asking about resume items that have no connection to the ongoing conversation
                        - Always phrase questions as natural follow-ups to what has already been discussed

                        Question Type Guidelines: - Technical Depth: Explore specific technologies mentioned in the 
                        dialogue to assess deep understanding - Application Context: Ask how they've applied concepts 
                        from their conversation in real projects - Problem Solving: Present a problem scenario 
                        connected to something mentioned in the conversation - Technical Decision: Ask about their 
                        reasoning behind technical choices they've mentioned - Integration Questions: When a topic 
                        appears in both resume and dialogue, ask how they've integrated this with other technologies 
                        they know

                        Output Requirements: 1. Return only pure string format, without any other characters, marks, 
                        or explanations. 2. Return exactly three questions, separated by "/" character. 3. Questions 
                        must be relevant to the interview information. Priority: dialogue content >>> resume 
                        information. 4. Return content in Chinese language. 5. Each question must end with a question 
                        mark (?). 6. Limit each question to 80 characters or less, keeping them concise and clear.

                        Example output:
                        你提到使用了微服务架构，能详细说明你是如何解决服务间通信问题的吗?/刚才你谈到的性能优化方案与你简历中提到的Redis缓存经验有何关联?/你在项目中是如何确保分布式系统的数据一致性的?

                        Please help me generate the core interview questions I should ask next based on the above 
                        content."""
                }
            ],
            "temperature": 0.7
        }

    @staticmethod
    def ai_evaluation_message(total_text):
        """生成面试评价总结"""
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a seasoned technical interviewer and talent assessment expert with extensive "
                               "technical background and experience in talent selection. You excel at deeply "
                               "analyzing candidates' various abilities through interview dialogues and providing "
                               "precise evaluations."
                },
                {
                    "role": "user",
                    "content": f"""
                        I will provide you with a transcribed interview dialogue:
                        ```
                        {total_text}
                        ```

                        Assessment Requirements: 1. Deeply analyze the interview dialogue and extract key information 
                        that reflects the candidate's various abilities. 2. Comprehensively evaluate the candidate's 
                        performance based on professional requirements for the interview position. 3. When scoring, 
                        use industry standards: 5 points for industry top-level, 3 points for industry average, 
                        1 point for significant deficiency. 4. Maintain objectivity and fairness; base evaluations on 
                        facts and dialogue content, avoiding subjective assumptions. 5. For each assessment 
                        dimension, provide specific dialogue evidence and professional analysis.

                        Assessment Dimensions: - managementAbility: Management capabilities, including team 
                        management, task allocation, resource coordination, conflict handling, 
                        etc. - overallEvaluation: Overall assessment combining all dimensions, clearly stating 
                        whether to recommend hiring and the reasons - architectureThinking: Architectural thinking, 
                        including system design, architectural planning, technology selection, scalability 
                        considerations, etc. - technicalAbility: Technical capabilities, including programming 
                        skills, algorithm understanding, technical depth, learning abilities, etc. - advantage: 
                        Strengths, the candidate's outstanding merits and competitiveness - disadvantage: Weaknesses, 
                        the candidate's shortcomings and areas for improvement - teamCooperation: Team collaboration, 
                        including communication skills, cooperation awareness, conflict handling, 
                        etc. - productThinking: Product thinking, including understanding user needs, business value 
                        judgment, product improvement suggestions, etc. - activeDrive: Initiative, including 
                        self-motivation, problem-solving enthusiasm, innovation spirit, etc.

                        Output Requirements: 1. Fill in the blanks in my JSON template and return the complete 
                        content to me. 2. Do not modify field names or add extra fields. 3. Directly return the 
                        completed JSON object without adding markdown code block tags or other explanatory text. 4. 
                        The summarize field must contain at least 50 characters of evaluation, providing substantive 
                        analysis based on the interview content. If there is truly no relevant content, express this 
                        diplomatically. 5. Ensure the score is consistent with the text evaluation (summarize) and 
                        follows logical reasoning. 6. All content must be returned in Chinese language.

                        Please fill in the following JSON template:
                        {{
                            "managementAbility": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "overallEvaluation": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "architectureThinking": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "technicalAbility": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "advantage": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "disadvantage": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "teamCooperation": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "productThinking": {{"summarize": "", "fullMarks": "5", "score": 0}},
                            "activeDrive": {{"summarize": "", "fullMarks": "5", "score": 0}}
                        }}"""
                }
            ],
            "temperature": 0.7
        }

    @staticmethod
    def interview_qa(total_text):
        """面试问答总结"""
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an experienced interviewer skilled at accurately extracting and summarizing "
                               "every question and answer from interview content, without missing any important "
                               "information."
                },
                {
                    "role": "user",
                    "content": f"""
                        I will provide you with a transcribed interview dialogue:
                        ```
                        {total_text}
                        ```

                        Important Tasks:
                        1. Carefully analyze the dialogue content and identify the roles of interviewer and interviewee.
                        2. Segment the dialogue into logical topic sections based on content shifts or natural breaks in conversation.
                        3. For each topic section, create a comprehensive summary, extract keywords, and formulate a descriptive title.
                        4. Extract each question and corresponding answer in chronological order within each topic section.
                        5. Identify even indirect or implied questions.
                        6. Merge related Q&A under the same topic to avoid repetition or fragmentation.
                        7. Ensure questions are expressed completely and clearly, and answers contain all key information provided by the interviewee.
                        8. Remove fillers, repeated words, and other meaningless content from the Q&A while retaining all important information.

                        Output Requirements:
                        1. Return only pure JSON format, without any additional characters, marks, or explanations.
                        2. Do not use markdown format, do not add ```json or ``` code block tags.
                        3. The returned content must be a directly parsable valid JSON array.
                        4. Group Q&A pairs by topics/themes that emerged during the interview.
                        5. For each topic, provide a concise title, summary, and relevant keywords.
                        6. Ensure each Q&A pair is complete; do not truncate question or answer content.
                        7. Answers should accurately reflect the interviewee's original meaning without adding or removing key information.
                        8. All content must be returned in Chinese language.

                        Please return in the following JSON format:
                        [
                          {{
                            "title": "话题标题",
                            "summary": "该话题的简要总结，概述讨论的主要内容和见解",
                            "keywords": ["关键词1", "关键词2", "关键词3"],
                            "details": [
                              {{
                                "question": "问题内容",
                                "answer": "回答内容"
                              }}
                            ]
                          }}
                        ]

                        Complete example:
                        [
                          {{
                            "title": "Vue与React框架的关键区别与使用场景对比",
                            "summary": "Vue和React在数据绑定、性能优化和使用场景上存在显著区别。Vue采用双向数据绑定机制，简化了开发者对视图更新的处理，而React则采用单向数据流，通过虚拟DOM和异步渲染等技术提高性能。",
                            "keywords": ["Vue", "React", "数据绑定", "双向数据绑定", "单项数据流", "性能优化", "虚拟DOM", "异步渲染"],
                            "details": [
                              {{
                                "question": "你能简单说一下Vue和React中数据绑定的区别吗？",
                                "answer": "Vue采用双向数据绑定机制，当数据变化时会自动更新模型，反之亦然，简化了开发者对视图手动更新的工作。而React则采用单向数据流，不允许直接更改组件的属性(props)，通常需要通过setState或其他事件方法来更新数据，这种设计虽然增加了开发复杂度，但有利于维护数据的一致性。"
                              }},
                              {{
                                "question": "Vue和React在性能优化方面有什么不同策略？",
                                "answer": "React通过虚拟DOM、异步渲染和Fiber架构等技术优化性能，支持懒加载和异步组件，有效提升用户体验，尤其是在大型应用中，React利用虚拟DOM减少页面操作次数，提高性能表现。相较于Vue，React在多线程渲染等方面的技术支持，使其在处理复杂应用时更为出色。Vue则提供了一种优化手段，比如懒加载异步组件以提升用户体验，但在大型应用程序中可能会遇到一些性能瓶颈。"
                              }},
                              {{
                                "question": "这两个框架分别适合什么样的项目场景？",
                                "answer": "Vue更适合中小型项目和快速原型开发，因其简单易用和快速响应；React则适用于大型应用和高交互的单页面应用，凭借其灵活性、强大的生态系统以及支持服务端渲染等技术，能处理更复杂的应用场景和数据流。Vue的学习曲线相对平缓，适合快速上手；而React则需要掌握更多概念，但能提供更强的可扩展性。"
                              }}
                            ]
                          }}
                        ]"""
                }
            ],
            "temperature": 0.7
        }
