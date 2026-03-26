
from pymongo import MongoClient
from app import app
from models_mysql import db_mysql, User, Product, Category, Order
import os
from dotenv import load_dotenv

load_dotenv()

def verify():
    # MongoDB Connection
    mongo_client = MongoClient("mongodb://localhost:27017/")
    mongo_db = mongo_client.ecommerce_db

    with app.app_context():
        # Check Categories
        mongo_cats = mongo_db.categories.count_documents({})
        mysql_cats = Category.query.count()
        print(f"Categories: MongoDB={mongo_cats}, MySQL={mysql_cats}")

        # Check Products
        mongo_prods = mongo_db.products.count_documents({})
        mysql_prods = Product.query.count()
        print(f"Products: MongoDB={mongo_prods}, MySQL={mysql_prods}")

        # Check Users
        mongo_users = mongo_db.users.count_documents({})
        mysql_users = User.query.count()
        print(f"Users: MongoDB={mongo_users}, MySQL={mysql_users}")

        # Check Orders
        mongo_orders = mongo_db.orders.count_documents({})
        mysql_orders = Order.query.count()
        print(f"Orders: MongoDB={mongo_orders}, MySQL={mysql_orders}")

        if mongo_cats == mysql_cats and mongo_prods == mysql_prods and mongo_users == mysql_users:
            print("\nSUCCESS: All major tables seem to match in count.")
        else:
            print("\nWARNING: Mismatch in counts. You might need to run migration again.")

if __name__ == "__main__":
    verify()
