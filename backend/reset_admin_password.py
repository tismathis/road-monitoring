#!/usr/bin/env python3
"""
Quick script to reset admin password to 'admin123'
"""
import bcrypt

# Hash the password "admin123"
password = "admin123"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"Hashed password: {hashed.decode('utf-8')}")

# Now update the database
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    dbname="gaborone_twin",
    user="mathismaomuhlebui"
)
cur = conn.cursor()

cur.execute(
    "UPDATE users SET hashed_password = %s WHERE username = 'admin'",
    (hashed.decode('utf-8'),)
)
conn.commit()

print("\n✅ Admin password reset successfully!")
print("   Username: admin")
print("   Password: admin123")
print("\nYou can now login at http://localhost:5173/login")

cur.close()
conn.close()
