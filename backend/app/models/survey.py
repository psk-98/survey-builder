from typing import Any

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Survey(TimestampMixin, Base):
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    survey_definition: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    # type:

    owner: Mapped["User"] = relationship(back_populates="surveys")
    interactions: Mapped[list["SurveyInteraction"]] = relationship(
        back_populates="survey", cascade="all, delete-orphan"
    )
