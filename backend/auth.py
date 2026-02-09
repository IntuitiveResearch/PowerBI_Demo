from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "star-cement-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    email: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Demo users
DEMO_USERS = {
    "demo@starcement.com": {
        "password": pwd_context.hash(os.getenv("APP_DEMO_ADMIN_PASSWORD", "Demo1234!")),
        "role": "CXO"
    },
    "plant@starcement.com": {
        "password": pwd_context.hash("Plant1234!"),
        "role": "Plant Head"
    },
    "energy@starcement.com": {
        "password": pwd_context.hash("Energy1234!"),
        "role": "Energy Manager"
    },
    "sales@starcement.com": {
        "password": pwd_context.hash("Sales1234!"),
        "role": "Sales"
    }
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str):
    if email not in DEMO_USERS:
        return None
    user_data = DEMO_USERS[email]
    if not verify_password(password, user_data["password"]):
        return None
    return User(email=email, role=user_data["role"])

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            return None
        return TokenData(email=email, role=role)
    except JWTError:
        return None
