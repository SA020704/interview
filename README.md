# Flask 三层架构 Demo

## 结构说明

- `app/routes.py`：表示层，处理路由和请求
- `app/services.py`：业务逻辑层
- `app/models.py`：数据访问层，定义数据库模型
- `config.py`：数据库等配置
- `run.py`：项目启动入口

## 启动方法

```bash
pip install -r requirements.txt
python run.py
``` 