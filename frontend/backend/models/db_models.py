from sqlalchemy import Column, String, DateTime, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    tier = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    ticker = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    ticker = Column(String, nullable=False)
    satta_score = Column(Float, nullable=True)
    forecast = Column(JSON, nullable=True)
    sentiment = Column(JSON, nullable=True)
    risk = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)