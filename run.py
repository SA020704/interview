from app import create_app, db
from dotenv import load_dotenv
import os
import threading
import logging
import time

from app.consumers.consumer import InterviewAnalysisConsumer

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
log = logging.getLogger(__name__)

app = create_app()


def start_background_consumer():
    """在独立线程中启动消费者"""
    time.sleep(2)  # 等待Flask完全启动

    with app.app_context():
        try:
            log.info("启动消费者线程...")
            consumer = InterviewAnalysisConsumer()
            consumer.start_consuming()
        except Exception as e:
            log.error(f"消费者线程异常: {e}", exc_info=True)


if __name__ == '__main__':
    # 启动消费者线程
    consumer_thread = threading.Thread(
        target=start_background_consumer,
        daemon=False,  # 改为非守护线程
        name="MQConsumer"
    )
    consumer_thread.start()
    log.info("🚀 MQ消费者线程已启动")

    # 启动Flask应用（使用threaded=True）
    app.run(debug=False, host='127.0.0.1', port=5000, threaded=True)