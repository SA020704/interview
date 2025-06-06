# test_your_classes.py
from app.dto.AiEvaluationVO import AiEvaluationVO
from app.dto.DetailsDto import DetailsDto
from app.dto.QADetailVO import QADetailVO
from app.dto.QAVO import QAVO

if __name__ == "__main__":
    # 创建测试数据
    detail = DetailsDto(summarize="测试总结", full_marks="100", score=85)
    qa = QAVO(question="测试问题", answer="测试答案")
    qa_detail = QADetailVO(
        title="面试问题",
        summary="问题总结",
        keywords=["Python", "Flask"],
        details=[qa]
    )

    # 创建主对象
    ai_eval = AiEvaluationVO(
        overall_evaluation=detail,
        advantage=detail,
        qa=[qa_detail]
    )

    # 测试方法是否存在
    print(f"AiEvaluationVO has to_json: {hasattr(ai_eval, 'to_json')}")
    print(f"AiEvaluationVO has from_json: {hasattr(AiEvaluationVO, 'from_json')}")

    # 测试序列化
    try:
        json_str = ai_eval.to_json()
        print(f"序列化成功: {json_str[:100]}...")

        # 测试反序列化
        restored = AiEvaluationVO.from_json(json_str)
        print(f"反序列化成功: {type(restored)}")
        print(f"数据一致性: {restored.overall_evaluation.score == 85}")

    except Exception as e:
        print(f"序列化失败: {e}")