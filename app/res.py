from dataclasses import dataclass
from typing import Optional


@dataclass
class Response:
    code: int = 200
    message: str = "success"
    data: Optional[object] = None

    @staticmethod
    def ok(data=None):
        return Response(data=data)

    @staticmethod
    def error(message="error", code=500):
        return Response(code=code, message=message)
