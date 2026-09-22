from pydantic import BaseModel


class OptionAnswer(BaseModel):
    id: str
    label: str


class SurveyInteractionRequest(BaseModel):
    survey_id: str
    survey_interaction_id: str | None = None
    answer: str | OptionAnswer | None = None


class OptionQuestion(BaseModel):
    content: str
    label: str


class SurveyInteractionAnswer(BaseModel):
    node_id: str
    question: str
    type: str
    answer: str | OptionAnswer
