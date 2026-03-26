
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
        cursor.execute("DESCRIBE orders;")
        columns = cursor.fetchall()
        print("Columns in 'orders' table:")
        for col in columns:
            print(f" - {col[0]}: {col[1]}")
            
    connection.close()
except Exception as e:
    print(f"Error: {e}")
