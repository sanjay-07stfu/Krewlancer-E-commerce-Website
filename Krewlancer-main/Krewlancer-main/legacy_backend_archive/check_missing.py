from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client.ecommerce_db

def count_missing(name, field):
    count = db[name].count_documents({field: {"$exists": False}})
    null_count = db[name].count_documents({field: None})
    print(f"{name}: missing={count}, null={null_count}")

count_missing("wishlist", "product_id")
count_missing("cart", "product_id")
count_missing("orders", "items.id")
