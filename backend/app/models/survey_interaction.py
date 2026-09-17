from typing import Any

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class SurveyInteraction(TimestampMixin, Base):
    __tablename__ = "survey_interactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"), nullable=False)
    answers: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    current_step: Mapped[str] = mapped_column(String, nullable=True)

    survey: Mapped["Survey"] = relationship(back_populates="interactions")
