from app.game.engine import Chapter, Zone
from app.game.nodes import LessonNode, QuizNode, ChallengeNode
from typing import Dict, Any

# Verification Functions
def check_caravan_loader(user_locals: Dict[str, Any], user_stdout: str) -> bool:
    """
    Challenge: Create water_liters (int), food_kgs (int), messenger_name (str).
    """
    # 1. Check variables exist
    if 'water_liters' not in user_locals:
        return False
    if 'food_kgs' not in user_locals:
        return False
    if 'messenger_name' not in user_locals:
        return False
    
    # 2. Check types
    if not isinstance(user_locals['water_liters'], int):
        return False
    if not isinstance(user_locals['food_kgs'], (int, float)): # visual aid might be float
        return False
    if not isinstance(user_locals['messenger_name'], str):
        return False
        
    return True

# Chapter Construction
def create_chapter_01() -> Chapter:
    # Zone 1.1: The Memory Jar
    zone_1_1 = Zone(
        title="1.1 The Memory Jar",
        nodes=[
            LessonNode(
                title="The Empty Jar",
                content="In the desert, water is life. But to carry it, you need a container.\n\nIn Python, these containers are called **Variables**.\n\nYou create one by giving it a name and filling it with value:\n\n`water = 10`"
            ),
            QuizNode(
                title="Label Sorting",
                question="Which of these is a valid variable name?",
                options=[
                    "1st_jar",
                    "jar_1",
                    "jar-one",
                    "class"
                ],
                correct_index=1 # jar_1
            ),
            ChallengeNode(
                title="The Caravan Loader",
                description="The caravan is leaving. You need to register the supplies.\n\nCreate three variables:\n1. `water_liters` equal to 50\n2. `food_kgs` equal to 100\n3. `messenger_name` equal to 'Hermes'",
                verification_func=check_caravan_loader
            )
        ]
    )

    return Chapter(
        title="Chapter 1: Desert of Beginnings",
        zones=[zone_1_1]
    )
