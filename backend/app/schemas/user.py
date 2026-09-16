from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserLogin(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
