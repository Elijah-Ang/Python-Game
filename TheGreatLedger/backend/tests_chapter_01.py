import unittest
from app.game.levels.chapter_01 import check_caravan_loader, create_chapter_01
from app.game.engine import GameEngine
from app.game.nodes import ChallengeNode

class TestChapter01(unittest.TestCase):
    def test_caravan_loader_logic(self):
        # Correct params
        good_locals = {'water_liters': 50, 'food_kgs': 100, 'messenger_name': "Hermes"}
        self.assertTrue(check_caravan_loader(good_locals, ""))

        # Wrong types
        bad_types = {'water_liters': "50", 'food_kgs': 100, 'messenger_name': "Hermes"}
        self.assertFalse(check_caravan_loader(bad_types, ""))

        # Missing vars
        missing_vars = {'water_liters': 50}
        self.assertFalse(check_caravan_loader(missing_vars, ""))

    def test_engine_integration(self):
        engine = GameEngine()
        chapter = create_chapter_01()
        engine.load_chapters([chapter])
        
        # We start at Zone 1.1, Node 1 (Lesson)
        node1 = engine.get_current_node()
        self.assertEqual(node1.title, "The Empty Jar")
        
        # Advance to Quiz
        engine.advance()
        node2 = engine.get_current_node()
        self.assertEqual(node2.title, "Label Sorting")
        
        # Advance to Challenge
        engine.advance()
        node3 = engine.get_current_node()
        self.assertIsInstance(node3, ChallengeNode)
        self.assertEqual(node3.title, "The Caravan Loader")
        
        # Test Execution
        code = """
water_liters = 50
food_kgs = 100
messenger_name = "Hermes"
"""
        user_locals, stdout, err = engine.execute_code(code)
        self.assertIsNone(err)
        success = node3.check_solution(user_locals, stdout)
        self.assertTrue(success)

if __name__ == '__main__':
    unittest.main()
