from fastapi import APIRouter, HTTPException, status

from app.core.deps import db_dependency, user_dependency
from app.models.survey import Survey
from app.schema.survey import CreateSurveyRequest, SurveyResponse

router = APIRouter(prefix="/surveys", tags=["surveys"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_survey(
    request: CreateSurveyRequest, auth_user: user_dependency, db: db_dependency
):
    print(auth_user)
    survey = Survey(
        name=request.survey_steps.title,
        user_id=auth_user["user_id"],
        survey_definition=request.survey_steps.model_dump(),
    )
    print(survey)
    db.add(survey)
    db.commit()
    db.refresh(survey)

    return survey


@router.get("/", response_model=list[SurveyResponse])
def get_surveys(auth_user: user_dependency, db: db_dependency):
    surveys = db.query(Survey).filter(Survey.user_id == auth_user["user_id"]).all()

    return surveys


@router.get(
    "/{survey_id}", response_model=SurveyResponse, status_code=status.HTTP_200_OK
)
def get_survey(auth_user: user_dependency, db: db_dependency, survey_id: str):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()

    if survey is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found"
        )

    if survey.user_id != auth_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )

    return survey
