from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.game.levels.chapter_01 import create_chapter_01
from app.game.engine import GameEngine
from app.game.nodes import LessonNode, QuizNode, ChallengeNode
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="The Great Ledger API")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine
engine = GameEngine()
engine.load_chapters([create_chapter_01()])

class NodeResponse(BaseModel):
    title: str
    type: str
    content: Optional[str] = None
    question: Optional[str] = None
    options: Optional[List[str]] = None
    description: Optional[str] = None

class SubmitRequest(BaseModel):
    # For Quiz: index, For Challenge: code
    quiz_index: Optional[int] = None
    code: Optional[str] = None

class SubmitResponse(BaseModel):
    success: bool
    message: str
    next_node_id: Optional[str] = None
    stdout: Optional[str] = None
    error: Optional[str] = None

class MapNode(BaseModel):
    title: str
    type: str
    status: str  # locked, unlocked, completed

class MapZone(BaseModel):
    title: str
    nodes: List[MapNode]

class MapChapter(BaseModel):
    title: str
    zones: List[MapZone]

class MapResponse(BaseModel):
    chapters: List[MapChapter]
    current_chapter_idx: int
    current_zone_idx: int
    current_node_idx: int

@app.get("/api/map", response_model=MapResponse)
async def get_world_map():
    map_chapters = []
    
    for c_idx, chapter in enumerate(engine.chapters):
        map_zones = []
        for z_idx, zone in enumerate(chapter.zones):
            map_nodes = []
            for n_idx, node in enumerate(zone.nodes):
                # Determine status
                status = "locked"
                
                # Check absolute position logic
                # This is a simplified "linear progress" check
                # If chapter is passed -> completed
                if c_idx < engine.current_chapter_idx:
                    status = "completed"
                # If current chapter
                elif c_idx == engine.current_chapter_idx:
                    if z_idx < engine.current_zone_idx:
                        status = "completed"
                    elif z_idx == engine.current_zone_idx:
                        if n_idx < engine.current_node_idx:
                            status = "completed"
                        elif n_idx == engine.current_node_idx:
                            status = "unlocked"
                        else:
                            status = "locked"
                    else:
                        status = "locked"
                else:
                    status = "locked"

                # Type
                n_type = "unknown"
                if isinstance(node, LessonNode): n_type = "lesson"
                elif isinstance(node, QuizNode): n_type = "quiz"
                elif isinstance(node, ChallengeNode): n_type = "challenge"

                map_nodes.append(MapNode(title=node.title, type=n_type, status=status))
            
            map_zones.append(MapZone(title=zone.title, nodes=map_nodes))
        
        map_chapters.append(MapChapter(title=chapter.title, zones=map_zones))

    return MapResponse(
        chapters=map_chapters,
        current_chapter_idx=engine.current_chapter_idx,
        current_zone_idx=engine.current_zone_idx,
        current_node_idx=engine.current_node_idx
    )

@app.get("/api/node", response_model=NodeResponse)
async def get_current_node():
    node = engine.get_current_node()
    if not node:
        return NodeResponse(title="Game Complete", type="complete", content="You have reached the Summit.")
    
    resp = NodeResponse(title=node.title, type="unknown")
    
    if isinstance(node, LessonNode):
        resp.type = "lesson"
        resp.content = node.content
    elif isinstance(node, QuizNode):
        resp.type = "quiz"
        resp.question = node.question
        resp.options = node.options
    elif isinstance(node, ChallengeNode):
        resp.type = "challenge"
        resp.description = node.description
        
    return resp

@app.post("/api/submit", response_model=SubmitResponse)
async def submit_answer(req: SubmitRequest):
    node = engine.get_current_node()
    if not node:
        raise HTTPException(status_code=400, detail="Game Finished")

    success = False
    message = "Incorrect"
    stdout = None
    err = None

    if isinstance(node, LessonNode):
        success = True
        message = "Continued"
    
    elif isinstance(node, QuizNode):
        if req.quiz_index is not None and node.check_answer(req.quiz_index):
            success = True
            message = "Correct!"
    
    elif isinstance(node, ChallengeNode):
        if req.code:
            user_locals, stdout, err = engine.execute_code(req.code)
            if not err:
                if node.check_solution(user_locals, stdout):
                    success = True
                    message = "Challenge Passed!"
                else:
                    message = "Solution Incorrect"
            else:
                message = "Runtime Error"
    
    if success:
        engine.advance()
        
    return SubmitResponse(success=success, message=message, stdout=stdout, error=err)
