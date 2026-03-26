from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client.ecommerce_db

print("Starting checks...")

def check_coll(name, field):
    print(f"Checking {name}...")
    items = list(db[name].find())
    for i in items:
        val = i.get(field)
        if val:
            try:
                ObjectId(val)
            except Exception as e:
                print(f"FOUND INVALID ID in {name}: {val} (item _id: {i['_id']})")

check_coll("wishlist", "product_id")
check_coll("cart", "product_id")

print("Checking orders...")
orders = list(db.orders.find())
for o in orders:
    for item in o.get('items', []):
        val = item.get('id')
        if val:
            try:
                ObjectId(val)
            except Exception as e:
                print(f"FOUND INVALID ID in order {o.get('id')}: {val}")

print("Done.")
