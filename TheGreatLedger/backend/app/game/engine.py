from typing import List, Optional
from dataclasses import dataclass
from app.game.nodes import BaseNode

@dataclass
class Zone:
    title: str
    nodes: List[BaseNode]

@dataclass
class Chapter:
    title: str
    zones: List[Zone]

class GameEngine:
    def __init__(self):
        self.chapters: List[Chapter] = []
        self.current_chapter_idx = 0
        self.current_zone_idx = 0
        self.current_node_idx = 0

    def load_chapters(self, chapters: List[Chapter]):
        self.chapters = chapters

    def get_current_node(self) -> Optional[BaseNode]:
        if not self.chapters:
            return None
        
        chapter = self.chapters[self.current_chapter_idx]
        if self.current_zone_idx >= len(chapter.zones):
            return None # End of chapter?
            
        zone = chapter.zones[self.current_zone_idx]
        if self.current_node_idx >= len(zone.nodes):
            return None # End of zone?
            
        return zone.nodes[self.current_node_idx]

    def advance(self) -> bool:
        """
        Moves to the next node. Returns True if successful, False if game completed.
        """
        chapter = self.chapters[self.current_chapter_idx]
        zone = chapter.zones[self.current_zone_idx]

        # Try next node in current zone
        if self.current_node_idx + 1 < len(zone.nodes):
            self.current_node_idx += 1
            return True
        
        # Try next zone in current chapter
        if self.current_zone_idx + 1 < len(chapter.zones):
            self.current_zone_idx += 1
            self.current_node_idx = 0
            return True
        
        # Try next chapter
        if self.current_chapter_idx + 1 < len(self.chapters):
            self.current_chapter_idx += 1
            self.current_zone_idx = 0
            self.current_node_idx = 0
            return True
            
        return False # Game Over / Completion

    def get_progress_str(self) -> str:
        if not self.chapters:
            return "No Game Loaded"
        chapter = self.chapters[self.current_chapter_idx]
        zone = chapter.zones[self.current_zone_idx]
        # human readable index
        return f"{chapter.title} - {zone.title} ({self.current_node_idx + 1}/{len(zone.nodes)})"

    def execute_code(self, code: str) -> tuple[dict, str, Optional[str]]:
        """
        Executes user code and returns (locals, stdout, error_message).
        """
        import sys
        from io import StringIO
        import traceback

        # Redirect stdout
        old_stdout = sys.stdout
        redirected_output = StringIO()
        sys.stdout = redirected_output

        user_locals = {}
        error_msg = None

        try:
            exec(code, {}, user_locals)
        except Exception:
            error_msg = traceback.format_exc()
        finally:
            sys.stdout = old_stdout

        return user_locals, redirected_output.getvalue(), error_msg
