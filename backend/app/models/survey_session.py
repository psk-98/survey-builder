from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.mixins import TimestampMixin


class SurveySessions(TimestampMixin, Base):
    __tablename__ = "survey_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"), nullable=False)
    survey_interaction_id: Mapped[int] = mapped_column(
        ForeignKey("survey_interactions.id"), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=datetime.now,
        nullable=True,
    )
