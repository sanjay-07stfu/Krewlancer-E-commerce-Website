from pymongo import MongoClient
from app import app
from models_mysql import db_mysql, User, Product, Category, Order, OrderItem
from werkzeug.security import generate_password_hash
import json
from bson.objectid import ObjectId

# Initialize MongoDB
mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client.ecommerce_db

def migrate():
    with app.app_context():
        print("Starting Data Migration...")
        
        # 1. Migrate Categories
        print("Migrating Categories...")
        mongo_categories = list(mongo_db.categories.find())
        for mc in mongo_categories:
            if not Category.query.filter_by(name=mc['name']).first():
                new_cat = Category(
                    name=mc['name'],
                    subcategories=mc.get('subcategories', [])
                )
                db_mysql.session.add(new_cat)
        db_mysql.session.commit()

        # 2. Migrate Users
        print("Migrating Users...")
        mongo_users = list(mongo_db.users.find())
        for mu in mongo_users:
            if not User.query.filter_by(email=mu['email']).first():
                new_user = User(
                    email=mu['email'],
                    password_hash=mu['password_hash'], # Assumes already hashed
                    first_name=mu.get('first_name'),
                    last_name=mu.get('last_name'),
                    phone=mu.get('phone'),
                    is_admin=bool(mu.get('is_admin', False))
                )
                db_mysql.session.add(new_user)
        db_mysql.session.commit()

        # 3. Migrate Products
        print("Migrating Products...")
        mongo_products = list(mongo_db.products.find())
        for mp in mongo_products:
            if not Product.query.filter_by(name=mp['name']).first():
                new_prod = Product(
                    name=mp['name'],
                    price=float(mp['price']),
                    category=mp.get('category'),
                    subcategory=mp.get('subcategory'),
                    gender=mp.get('gender'),
                    description=mp.get('description'),
                    images=json.loads(mp['images']) if isinstance(mp.get('images'), str) else mp.get('images', []),
                    sizes=json.loads(mp['sizes']) if isinstance(mp.get('sizes'), str) else mp.get('sizes', []),
                    stock=int(mp.get('stock', 0)),
                    is_featured=bool(mp.get('is_featured', False)),
                    is_new=bool(mp.get('is_new', False)),
                    is_bestseller=bool(mp.get('is_bestseller', False)),
                    fabric=mp.get('fabric'),
                    care=mp.get('care')
                )
                db_mysql.session.add(new_prod)
        db_mysql.session.commit()

        # 4. Migrate Orders
        print("Migrating Orders...")
        mongo_orders = list(mongo_db.orders.find())
        for mo in mongo_orders:
            if not Order.query.filter_by(order_number=mo['id']).first():
                # Find the user in MySQL
                user_email = "unknown@example.com"
                if 'user_id' in mo:
                    mu = mongo_db.users.find_one({"_id": ObjectId(mo['user_id'])})
                    if mu:
                        user_email = mu['email']
                
                user_sql = User.query.filter_by(email=user_email).first()
                
                new_order = Order(
                    order_number=mo['id'],
                    user_id=user_sql.id if user_sql else None,
                    total=float(mo.get('total', 0)),
                    status=mo.get('status', 'Pending'),
                    payment_status=mo.get('payment_status', 'Pending'),
                    shipping_address_json=json.dumps(mo.get('shipping_address', {}))
                )
                db_mysql.session.add(new_order)
                db_mysql.session.flush()
                
                for item in mo.get('items', []):
                    new_item = OrderItem(
                        order_id=new_order.id,
                        product_id_str=item.get('id'),
                        product_name=item.get('name'),
                        quantity=item.get('quantity', 1),
                        price=float(item.get('price', 0)),
                        size=item.get('size')
                    )
                    db_mysql.session.add(new_item)
        
        db_mysql.session.commit()
        print("Migration Completed Successfully!")

if __name__ == "__main__":
    migrate()
