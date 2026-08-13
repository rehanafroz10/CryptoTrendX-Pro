"""
POST /api/v1/auth/signup
POST /api/v1/auth/login
JWT-based authentication endpoints.

NOTE: Replace the in-memory `_fake_users_db` with a real DB (PostgreSQL + SQLAlchemy).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

# Placeholder in-memory store -> swap for real User table
_fake_users_db = {}


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
def signup(payload: SignupRequest):
    if payload.email in _fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    _fake_users_db[payload.email] = {
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
    }
    return {"message": "User created successfully"}


@router.post("/login")
def login(payload: LoginRequest):
    user = _fake_users_db.get(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}
