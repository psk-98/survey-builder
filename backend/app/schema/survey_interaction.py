from pydantic import BaseModel


class CreateSurveyInteractionRequest(BaseModel):
    survey_id: str
