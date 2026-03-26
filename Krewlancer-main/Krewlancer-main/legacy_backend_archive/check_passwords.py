from app import app, db_mysql, User
import sys

with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for u in users:
        is_hashed = u.password.startswith(('pbkdf2:', 'scrypt:', 'argon2:', 'sha256:'))
        print(f"User: {u.email} | Hashed: {is_hashed} | Pwd Start: {u.password[:10]}...")
