from datetime import datetime

from pydantic import BaseModel


class Option(BaseModel):
    id: str
    label: str


class NodeData(BaseModel):
    label: str
    content: str | None = None
    options: list[Option] = []


class Node(BaseModel):
    id: str
    type: str
    data: NodeData


class SurveyInteractionRequest(BaseModel):
    survey_id: str
    survey_interaction_id: str | None = None
    answer: str | Option | None = None


class SurveyInteractionResponse(BaseModel):
    survey_id: str
    survey_interaction_id: str | None = None
    node: Node | None = None


class OptionQuestion(BaseModel):
    content: str
    label: str


class SurveyInteractionAnswer(BaseModel):
    node_id: str
    question: str
    type: str
    answer: str | Option


class SurveyInteractionRes(BaseModel):
    id: str
    survey_id: str
    answers: list[SurveyInteractionAnswer]
    current_step: str
    completed: bool
    created_at: datetime
    updated_at: datetime
