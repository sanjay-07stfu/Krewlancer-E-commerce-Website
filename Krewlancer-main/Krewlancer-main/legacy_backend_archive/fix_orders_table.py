
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
            cursor.execute("ALTER TABLE orders ADD COLUMN shipping_address_json TEXT;")
            print("Added shipping_address_json to orders")
        except Exception as e:
            print(f"shipping_address_json error: {e}")
            
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN borzo_order_id VARCHAR(100);")
            print("Added borzo_order_id to orders")
        except Exception as e:
            print(f"borzo_order_id error: {e}")
            
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN borzo_tracking_url VARCHAR(500);")
            print("Added borzo_tracking_url to orders")
        except Exception as e:
            print(f"borzo_tracking_url error: {e}")
            
    connection.commit()
    connection.close()
except Exception as e:
    print(f"Error: {e}")
