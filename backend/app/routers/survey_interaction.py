from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import selectinload

from app.core.deps import db_dependency, user_dependency
from app.models.survey import Survey, SurveyTypes
from app.models.survey_interaction import SurveyInteraction
from app.models.survey_session import SurveySessions
from app.schema.survey import Edge, Node, SurveyDefinition
from app.schema.survey_interaction import (
    SurveyInteractionAnswer,
    SurveyInteractionRequest,
    SurveyInteractionRes,
)

router = APIRouter(prefix="/survey-interactions", tags=["survey-interactions"])


def find_node(definition: SurveyDefinition, node_id: str) -> Node | None:
    return next((node for node in definition.nodes if node.id == node_id), None)


def find_next_node(
    definition: SurveyDefinition, node_id: str, answer: str = "next"
) -> Edge | None:
    return next(
        (
            node
            for node in definition.edges
            if node.source == node_id and node.sourceHandle == answer
        ),
        None,
    )


@router.post("/", status_code=status.HTTP_200_OK)
def handle_survey_interactions(request: SurveyInteractionRequest, db: db_dependency):
    survey = db.query(Survey).filter(Survey.id == request.survey_id).first()

    # print(survey.id)
    sd = SurveyDefinition.model_validate(survey.survey_definition)
    # print(request)
    if request.survey_interaction_id is None:
        si = SurveyInteraction(
            survey_id=request.survey_id,
            current_step=sd.startNodeId,
        )
        db.add(si)
        db.commit()
        db.refresh(si)

        # first step
        if survey.type == SurveyTypes.web or survey.type == SurveyTypes.whatsapp_test:
            session = SurveySessions(
                survey_id=request.survey_id,
                survey_interaction_id=si.id,
            )

            db.add(si)
            db.commit()
            db.refresh(si)

            return {
                "survey_interaction_id": si.id,
                "survey_id": request.survey_id,
                "node": find_node(sd, sd.startNodeId),
            }

    elif request.survey_interaction_id is not None:
        si = (
            db.query(SurveyInteraction)
            .filter(
                SurveyInteraction.id == request.survey_interaction_id
                and SurveyInteraction.survey_id == request.survey_id
            )
            .first()
        )
        # print(si.current_step)
        node = find_node(sd, si.current_step)

        # check if answer exists
        new_answer: SurveyInteractionAnswer = {
            "node_id": si.current_step,
            "question": {"label": node.data.label, "content": node.data.content},
            "type": node.type,
            "answer": request.answer.model_dump()
            if node.type == "options"
            else request.answer,
        }
        si.answers = [*(si.answers or []), new_answer]
        # print(
        #     new_answer["answer"]["id"]
        #     if node.type == "options"
        #     else new_answer["answer"]
        # )

        si.current_step = (
            find_next_node(sd, si.current_step, new_answer["answer"]["id"]).target
            if node.type == "options"
            else find_next_node(sd, si.current_step).target
        )

        # print(si.current_step)

        # db.add(si)
        db.commit()
        db.refresh(si)
        # print(si.current_step)

        # # if(find_next_node(sd, si.current_step).target is None):

        return {
            "survey_interaction_id": si.id,
            "survey_id": request.survey_id,
            "node": find_node(sd, si.current_step),
        }


@router.get(
    "/{survey_id}/{survey_interaction_id}",
    response_model=SurveyInteractionRes,
    status_code=status.HTTP_200_OK,
)
def get_survey_interactions(
    survey_interaction_id: str, auth_user: user_dependency, db: db_dependency
):
    survey_interaction = (
        db.query(SurveyInteraction)
        .filter(SurveyInteraction.id == survey_interaction_id)
        .first()
    )

    # a guard be returning must

    return survey_interaction


@router.get(
    "/{survey_id}",
    response_model=list[SurveyInteractionRes],
    status_code=status.HTTP_200_OK,
)
def get_surveys_interactions(
    survey_id: str, auth_user: user_dependency, db: db_dependency
):
    survey = (
        db.query(Survey)
        .options(selectinload(Survey.interactions))
        .filter(Survey.id == survey_id)
        .first()
    )

    if survey is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found"
        )

    if survey.user_id != auth_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )

    return survey.interactions
