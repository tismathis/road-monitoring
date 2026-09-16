"""
Authentication Router
=====================
All authentication and user management endpoints.

Endpoints:
  POST   /auth/login          - User login (returns JWT)
  GET    /auth/me             - Get current user info
  POST   /auth/register       - Create new user (admin only)
  GET    /auth/users          - List all users (admin only)
  PATCH  /auth/users/{id}     - Update user (admin only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import psycopg2.extras

from models import (
    UserLogin, UserRegister, UserUpdate, UserResponse, Token
)
from auth_utils import (
    get_connection, verify_password, get_password_hash,
    create_access_token, get_current_user, get_current_admin
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    """
    Authenticate user and return JWT token.

    Request body:
        {
            "username": "john.doe",
            "password": "secretpass123"
        }

    Returns:
        {
            "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "john.doe",
                "email": "john@example.com",
                "role": "operator",
                ...
            }
        }

    Raises:
        401: Invalid credentials
        403: Account is inactive
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch user by username
    cur.execute(
        "SELECT id, username, email, full_name, hashed_password, role, is_active, "
        "created_at, last_login FROM users WHERE username = %s",
        (credentials.username,)
    )
    user = cur.fetchone()

    if not user or not verify_password(credentials.password, user['hashed_password']):
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user['is_active']:
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last_login timestamp
    cur.execute(
        "UPDATE users SET last_login = %s WHERE id = %s",
        (datetime.utcnow(), user['id'])
    )
    conn.commit()

    # Fetch updated user data
    cur.execute(
        "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
        "FROM users WHERE id = %s",
        (user['id'],)
    )
    updated_user = cur.fetchone()
    cur.close()
    conn.close()

    # Create JWT token
    access_token = create_access_token(
        data={"sub": user['username'], "role": user['role']}
    )

    return Token(
        access_token=access_token,
        user=UserResponse(**updated_user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user's information.

    Headers:
        Authorization: Bearer <token>

    Returns:
        UserResponse with current user data

    Raises:
        401: Invalid or missing token
        403: Account is inactive
    """
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserRegister,
    admin: UserResponse = Depends(get_current_admin)
):
    """
    Create a new user account (admin only).

    Request body:
        {
            "username": "jane.smith",
            "email": "jane@example.com",
            "password": "temppass123",
            "full_name": "Jane Smith",
            "role": "operator"
        }

    Returns:
        UserResponse for the newly created user

    Raises:
        400: Username or email already exists
        403: Not an admin
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Check if username already exists
    cur.execute("SELECT id FROM users WHERE username = %s", (user_data.username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check if email already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    # Hash password and insert user
    hashed_password = get_password_hash(user_data.password)

    cur.execute(
        """
        INSERT INTO users (username, email, hashed_password, full_name, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, username, email, full_name, role, is_active, created_at, last_login
        """,
        (user_data.username, user_data.email, hashed_password, user_data.full_name, user_data.role)
    )

    new_user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return UserResponse(**new_user)


@router.get("/users", response_model=list[UserResponse])
def list_users(admin: UserResponse = Depends(get_current_admin)):
    """
    List all users (admin only).

    Headers:
        Authorization: Bearer <admin-token>

    Returns:
        List of UserResponse objects

    Raises:
        403: Not an admin
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
        "FROM users ORDER BY created_at DESC"
    )
    users = cur.fetchall()
    cur.close()
    conn.close()

    return [UserResponse(**user) for user in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    admin: UserResponse = Depends(get_current_admin)
):
    """
    Update a user's role or active status (admin only).

    Path params:
        user_id: ID of user to update

    Request body:
        {
            "role": "viewer",           // optional
            "is_active": false,         // optional
            "full_name": "New Name"     // optional
        }

    Returns:
        UserResponse for the updated user

    Raises:
        403: Not an admin
        404: User not found
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Check if user exists
    cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Build dynamic UPDATE query based on provided fields
    update_fields = []
    update_values = []

    if user_update.role is not None:
        update_fields.append("role = %s")
        update_values.append(user_update.role)

    if user_update.is_active is not None:
        update_fields.append("is_active = %s")
        update_values.append(user_update.is_active)

    if user_update.full_name is not None:
        update_fields.append("full_name = %s")
        update_values.append(user_update.full_name)

    if not update_fields:
        # No fields to update
        cur.execute(
            "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
            "FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        return UserResponse(**user)

    # Execute update
    update_values.append(user_id)
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"

    cur.execute(query, update_values)
    conn.commit()

    # Fetch updated user
    cur.execute(
        "SELECT id, username, email, full_name, role, is_active, created_at, last_login "
        "FROM users WHERE id = %s",
        (user_id,)
    )
    updated_user = cur.fetchone()
    cur.close()
    conn.close()

    return UserResponse(**updated_user)
