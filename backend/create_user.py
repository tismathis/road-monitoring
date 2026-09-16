#!/usr/bin/env python3
"""
Create User Script
==================
CLI utility to create new users in the database.

Usage:
    # Create admin user (will be prompted for password)
    python create_user.py --username admin --email admin@example.com --role admin

    # Create operator user with full name
    python create_user.py --username john.doe --email john@company.com --role operator --full-name "John Doe"

    # Create viewer user
    python create_user.py --username jane.smith --email jane@company.com --role viewer
"""

import argparse
import getpass
import sys
import psycopg2
from auth_utils import get_password_hash


def create_user(username: str, email: str, password: str, role: str, full_name: str = None):
    """
    Create a new user in the database.

    Args:
        username: Unique username (3-100 chars)
        email: Unique email address
        password: Plain password (will be hashed)
        role: User role (admin, operator, viewer)
        full_name: Optional full name

    Returns:
        True if successful, False otherwise
    """
    # Validate role
    if role not in ['admin', 'operator', 'viewer']:
        print(f"❌ Error: Role must be one of: admin, operator, viewer")
        return False

    # Validate password length
    if len(password) < 8:
        print(f"❌ Error: Password must be at least 8 characters")
        return False

    try:
        # Connect to database
        conn = psycopg2.connect(
            host="localhost",
            port=5433,
            dbname="gaborone_twin",
            user="mathismaomuhlebui"
        )
        cur = conn.cursor()

        # Check if username already exists
        cur.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cur.fetchone():
            print(f"❌ Error: Username '{username}' already exists")
            cur.close()
            conn.close()
            return False

        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            print(f"❌ Error: Email '{email}' already exists")
            cur.close()
            conn.close()
            return False

        # Hash password
        hashed_password = get_password_hash(password)

        # Insert user
        cur.execute(
            """
            INSERT INTO users (username, email, hashed_password, full_name, role)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, username, email, role, created_at
            """,
            (username, email, hashed_password, full_name, role)
        )

        user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        print("\n✅ User created successfully!")
        print(f"   ID: {user[0]}")
        print(f"   Username: {user[1]}")
        print(f"   Email: {user[2]}")
        print(f"   Role: {user[3]}")
        print(f"   Created: {user[4]}")
        print(f"\n🔑 Credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"\n💡 Save these credentials securely!")

        return True

    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Create a new user in the Gaborone Digital Twin authentication system"
    )
    parser.add_argument("--username", required=True, help="Unique username (3-100 chars)")
    parser.add_argument("--email", required=True, help="Unique email address")
    parser.add_argument("--role", required=True, choices=['admin', 'operator', 'viewer'],
                        help="User role")
    parser.add_argument("--full-name", help="Full name (optional)")
    parser.add_argument("--password", help="Password (will prompt if not provided)")

    args = parser.parse_args()

    print("=" * 70)
    print("CREATE USER - Gaborone Digital Twin")
    print("=" * 70)

    # Get password (prompt if not provided via arg)
    if args.password:
        password = args.password
    else:
        password = getpass.getpass("Enter password (min 8 chars): ")
        password_confirm = getpass.getpass("Confirm password: ")

        if password != password_confirm:
            print("❌ Error: Passwords do not match")
            sys.exit(1)

    # Create user
    success = create_user(
        username=args.username,
        email=args.email,
        password=password,
        role=args.role,
        full_name=args.full_name
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
