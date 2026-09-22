from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime

from app.models.base import Base
from app.models.mixins import TimestampMixin


class SurveyInteraction(TimestampMixin, Base):
    __tablename__ = "survey_interactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"), nullable=False)
    # unquie identifier here phone etc for we'll use id
    answers: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=True)

    current_step: Mapped[str] = mapped_column(String, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    survey: Mapped["Survey"] = relationship(back_populates="interactions")
