from fastapi import APIRouter, status

from app.core.deps import db_dependency
from app.models.survey import Survey, SurveyTypes
from app.models.survey_interaction import SurveyInteraction
from app.models.survey_session import SurveySessions
from app.schema.survey import Edge, Node, SurveyDefinition
from app.schema.survey_interaction import (
    SurveyInteractionAnswer,
    SurveyInteractionRequest,
)

router = APIRouter(prefix="/survey-interactions", tags=["survey-interactions"])


def find_node(definition: SurveyDefinition, node_id: str) -> Node | None:
    return next((node for node in definition.nodes if node.id == node_id), None)


def find_next_node(definition: SurveyDefinition, node_id: str) -> Edge | None:
    return next((node for node in definition.edges if node.source == node_id), None)


@router.post("/", status_code=status.HTTP_200_OK)
def handle_survey_interactions(request: SurveyInteractionRequest, db: db_dependency):
    survey = db.query(Survey).filter(Survey.id == request.survey_id).first()

    # print(survey.id)
    sd = SurveyDefinition.model_validate(survey.survey_definition)
    print(request)
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

        si.current_step = find_next_node(sd, si.current_step).target

        # db.add(si)
        db.commit()
        db.refresh(si)
        print(si.current_step)

        # if(find_next_node(sd, si.current_step).target is None):

        return {
            "survey_interaction_id": si.id,
            "survey_id": request.survey_id,
            "node": find_node(sd, si.current_step),
        }
