
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('SQLALCHEMY_DATABASE_URI')
try:
    auth, host_db = uri.split('@')
    user_pass = auth.split('//')[1]
    user, password = user_pass.split(':')
    password = password.replace('%40', '@')
    host, db_name = host_db.split('/')
    
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db_name
    )
    
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_pic TEXT;")
            print("Added profile_pic to users")
        except Exception as e:
            print(f"profile_pic error: {e}")
            
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;")
            print("Added is_blocked to users")
        except Exception as e:
            print(f"is_blocked error: {e}")
            
    connection.commit()
    connection.close()
except Exception as e:
    print(f"Error: {e}")
