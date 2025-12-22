from abc import ABC, abstractmethod
from typing import List, Optional, Callable, Dict, Any

class BaseNode(ABC):
    """
    Abstract base class for all game nodes (Lesson, Quiz, Challenge).
    """
    def __init__(self, title: str):
        self.title = title

class LessonNode(BaseNode):
    """
    A node that presents information to the player.
    """
    def __init__(self, title: str, content: str):
        super().__init__(title)
        self.content = content

class QuizNode(BaseNode):
    """
    A multiple-choice question node.
    """
    def __init__(self, title: str, question: str, options: List[str], correct_index: int):
        super().__init__(title)
        self.question = question
        self.options = options
        self.correct_index = correct_index

    def check_answer(self, index: int) -> bool:
        return index == self.correct_index

class ChallengeNode(BaseNode):
    """
    A coding challenge node.
    """
    def __init__(self, title: str, description: str, verification_func: Callable[[Dict[str, Any], str], bool]):
        super().__init__(title)
        self.description = description
        # verification_func accepts (user_locals, user_stdout) and returns True/False
        self.verification_func = verification_func

    def check_solution(self, user_locals: Dict[str, Any], user_stdout: str) -> bool:
        try:
            return self.verification_func(user_locals, user_stdout)
        except Exception:
            return False
