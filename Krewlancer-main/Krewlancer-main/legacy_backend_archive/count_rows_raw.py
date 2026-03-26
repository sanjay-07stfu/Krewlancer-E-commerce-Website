
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
        cursor.execute("SELECT COUNT(*) FROM users;")
        print(f"User count: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM products;")
        print(f"Product count: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM categories;")
        print(f"Category count: {cursor.fetchone()[0]}")
            
    connection.close()
except Exception as e:
    print(f"Error: {e}")
