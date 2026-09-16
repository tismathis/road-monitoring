"""
Authentication Utilities
========================
JWT token creation/verification, password hashing, and FastAPI dependencies
for protecting routes.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import psycopg2.extras

from models import TokenData, UserResponse


# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production-use-openssl-rand-hex-32"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme for Authorization header
security = HTTPBearer()


def get_connection():
    """Reuse the database connection from main.py"""
    return psycopg2.connect(
        host="localhost",
        port=5433,
        dbname="gaborone_twin",
        user="mathismaomuhlebui"
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a bcrypt hash.
    Bcrypt has a 72-byte limit, so truncate password if needed.
    """
    # Truncate to 72 bytes to avoid bcrypt errors
    truncated = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(truncated, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Bcrypt has a 72-byte limit, so truncate password if needed.
    """
    # Truncate to 72 bytes to avoid bcrypt errors
    truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Payload to encode (must include 'sub' for username, 'role')
        expires_delta: Token expiration time (defaults to 24 hours)

    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT string

    Returns:
        TokenData with username and role

    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")

        if username is None or role is None:
            raise credentials_exception

        return TokenData(username=username, role=role)

    except JWTError:
        raise credentials_exception


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """
    FastAPI dependency: Extract and verify JWT from Authorization header.

    Used as: @app.get("/protected", dependencies=[Depends(get_current_user)])

    Returns:
        UserResponse object for the authenticated user

    Raises:
        HTTPException: If token is invalid or user not found/inactive
    """
    token = credentials.credentials
    token_data = verify_token(token)

    # Fetch user from database
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
        "FROM users WHERE username = %s",
        (token_data.username,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return UserResponse(**user)


def get_current_user_from_query(token: str = Query(...)) -> UserResponse:
    """
    FastAPI dependency: Extract and verify JWT from query parameter.

    ONLY use for /camera/stream and /parking/stream endpoints since
    <img> tags cannot send Authorization headers.

    Used as: @app.get("/camera/stream")
             def stream(user: UserResponse = Depends(get_current_user_from_query)):

    Returns:
        UserResponse object for the authenticated user

    Raises:
        HTTPException: If token is invalid or user not found/inactive
    """
    token_data = verify_token(token)

    # Fetch user from database
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
        "FROM users WHERE username = %s",
        (token_data.username,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return UserResponse(**user)


def get_current_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """
    FastAPI dependency: Verify current user has admin role.

    Used as: @app.post("/auth/register", dependencies=[Depends(get_current_admin)])

    Returns:
        UserResponse object (only if user is admin)

    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_role(allowed_roles: list[str]):
    """
    Dependency factory: Check if user has one of the allowed roles.

    Usage:
        @app.get("/camera/stats", dependencies=[Depends(require_role(["operator", "admin"]))])

    Args:
        allowed_roles: List of role names that can access this endpoint

    Returns:
        FastAPI dependency function
    """
    def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker


def require_role_query(allowed_roles: list[str]):
    """
    Dependency factory for query-param auth: Check if user has allowed role.

    Usage:
        @app.get("/camera/stream")
        def stream(user = Depends(require_role_query(["operator", "admin"]))):

    Args:
        allowed_roles: List of role names that can access this endpoint

    Returns:
        FastAPI dependency function
    """
    def role_checker(current_user: UserResponse = Depends(get_current_user_from_query)) -> UserResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker
