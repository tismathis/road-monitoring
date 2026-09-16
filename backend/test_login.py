#!/usr/bin/env python3
"""
Test script to verify password hashing and authentication
"""
import bcrypt

# The hash currently in database
db_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeP7QRyGKP6i"

# Test password
password = "admin123"

print("=" * 60)
print("PASSWORD VERIFICATION TEST")
print("=" * 60)

# Method 1: Direct bcrypt check
print("\n1. Testing with direct bcrypt.checkpw():")
try:
    result = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8'))
    print(f"   ✅ Result: {result}")
    if result:
        print("   → Password 'admin123' MATCHES the database hash!")
    else:
        print("   → Password 'admin123' DOES NOT MATCH the database hash")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Method 2: Create fresh hash and compare
print("\n2. Creating fresh hash for 'admin123':")
try:
    fresh_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    print(f"   ✅ New hash: {fresh_hash.decode('utf-8')}")

    # Verify the fresh hash works
    verify = bcrypt.checkpw(password.encode('utf-8'), fresh_hash)
    print(f"   ✅ Fresh hash verification: {verify}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Method 3: Test with passlib (what the app uses)
print("\n3. Testing with passlib CryptContext (used by app):")
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    result = pwd_context.verify(password, db_hash)
    print(f"   ✅ Result: {result}")
    if result:
        print("   → Password 'admin123' MATCHES using passlib!")
    else:
        print("   → Password 'admin123' DOES NOT MATCH using passlib")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Method 4: Test the truncation logic from auth_utils.py
print("\n4. Testing with 72-byte truncation (from auth_utils.py):")
try:
    truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    print(f"   Password after truncation: '{truncated}'")
    result = bcrypt.checkpw(truncated.encode('utf-8'), db_hash.encode('utf-8'))
    print(f"   ✅ Result: {result}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("RECOMMENDATION:")
print("=" * 60)

# If none work, generate a new hash
print("\nIf all tests failed, run this SQL command:")
try:
    new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    print(f"\npsql -h localhost -p 5433 -U mathismaomuhlebui -d gaborone_twin -c \"UPDATE users SET hashed_password = '{new_hash.decode('utf-8')}' WHERE username = 'admin';\"")
except Exception as e:
    print(f"Could not generate new hash: {e}")
