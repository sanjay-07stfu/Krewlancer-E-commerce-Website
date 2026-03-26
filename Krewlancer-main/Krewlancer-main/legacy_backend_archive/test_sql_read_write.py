
from app import app
from models_mysql import db_mysql, User, Product, Category, Order
import json

def test_sql_functionality():
    with app.app_context():
        print("--- Testing MySQL Functionality ---")
        
        # 1. Test Querying Products
        products = Product.query.all()
        print(f"Query Products: Found {len(products)} products.")
        if products:
            p = products[0]
            print(f"Sample Product: {p.name}, Price: {p.price}, Images: {type(p.images)}")
            
        # 2. Test Querying Categories
        categories = Category.query.all()
        print(f"Query Categories: Found {len(categories)} categories.")
        if categories:
            c = categories[0]
            print(f"Sample Category: {c.name}, Subcategories: {type(c.subcategories)}")
            
        # 3. Test User query
        users = User.query.all()
        print(f"Query Users: Found {len(users)} users.")
        if users:
            u = users[0]
            print(f"Sample User: {u.email}, Admin: {u.is_admin}")
            
        # 4. Test adding a temporary product and deleting it
        try:
            temp_p = Product(
                name="Test SQL Product",
                price=99.99,
                category="Test",
                description="Test description",
                images=["test.jpg"],
                sizes=["M"]
            )
            db_mysql.session.add(temp_p)
            db_mysql.session.commit()
            print("Successfully added a product to MySQL.")
            
            # Delete it
            db_mysql.session.delete(temp_p)
            db_mysql.session.commit()
            print("Successfully deleted the test product from MySQL.")
        except Exception as e:
            print(f"Error testing write operations: {e}")
            db_mysql.session.rollback()

if __name__ == "__main__":
    test_sql_functionality()
