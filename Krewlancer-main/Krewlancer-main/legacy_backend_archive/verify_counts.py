
from pymongo import MongoClient
from app import app
from models_mysql import User, Product, Category, Order
import os
from dotenv import load_dotenv

load_dotenv()

def verify():
    mongo_client = MongoClient("mongodb://localhost:27017/")
    mongo_db = mongo_client.ecommerce_db

    with app.app_context():
        m_cats = mongo_db.categories.count_documents({})
        s_cats = Category.query.count()
        
        m_prods = mongo_db.products.count_documents({})
        s_prods = Product.query.count()
        
        m_users = mongo_db.users.count_documents({})
        s_users = User.query.count()
        
        m_orders = mongo_db.orders.count_documents({})
        s_orders = Order.query.count()
        
        print("-" * 30)
        print(f"{'Table':<15} | {'Mongo':<7} | {'MySQL':<7}")
        print("-" * 30)
        print(f"{'Categories':<15} | {m_cats:<7} | {s_cats:<7}")
        print(f"{'Products':<15} | {m_prods:<7} | {s_prods:<7}")
        print(f"{'Users':<15} | {m_users:<7} | {s_users:<7}")
        print(f"{'Orders':<15} | {m_orders:<7} | {s_orders:<7}")
        print("-" * 30)

if __name__ == "__main__":
    verify()
