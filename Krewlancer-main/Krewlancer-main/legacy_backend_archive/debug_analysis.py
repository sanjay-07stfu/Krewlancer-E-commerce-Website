from pymongo import MongoClient
from bson.objectid import ObjectId
import json

client = MongoClient("mongodb://localhost:27017/")
db = client.ecommerce_db

def check_collection(name, field_id):
    print(f"\n--- Checking {name} for invalid product IDs ---")
    items = list(db[name].find())
    print(f"Total items in {name}: {len(items)}")
    invalid_ids = []
    for item in items:
        pid = item.get(field_id)
        if not pid:
            # print(f"Missing {field_id} in {name} item: {item.get('_id')}")
            continue
        try:
            ObjectId(pid)
        except:
            print(f"Invalid {field_id} in {name}: {pid}")
            invalid_ids.append(pid)
    return invalid_ids

check_collection("wishlist", "product_id")
check_collection("cart", "product_id")

print("\n--- Checking Orders for invalid product IDs ---")
orders = list(db.orders.find())
print(f"Total orders: {len(orders)}")
for o in orders:
    items = o.get('items', [])
    for item in items:
        pid = item.get('id')
        if not pid:
             print(f"Missing product ID in order {o.get('id', 'N/A')} item: {item}")
        else:
            try:
                ObjectId(pid or "")
            except:
                print(f"Invalid product ID in order {o.get('id', 'N/A')}: {pid}")

print("\n--- Testing Aggregations ---")
try:
    sales_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.id",
            "name": {"$first": "$items.name"},
            "total_sold": {"$sum": "$items.quantity"}
        }}
    ]
    res = list(db.orders.aggregate(sales_pipeline))
    print("Sales pipeline (basic): SUCCESS")
    
    sales_pipeline_full = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.id",
            "name": {"$first": "$items.name"},
            "total_sold": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
        }}
    ]
    res = list(db.orders.aggregate(sales_pipeline_full))
    print("Sales pipeline (full): SUCCESS")
except Exception as e:
    print(f"Sales pipeline: FAILED - {e}")

try:
    wishlist_pipeline = [
        {"$group": {
            "_id": "$product_id",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    res = list(db.wishlist.aggregate(wishlist_pipeline))
    print("Wishlist pipeline: SUCCESS")
except Exception as e:
    print(f"Wishlist pipeline: FAILED - {e}")

try:
    cat_pipeline = [
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1},
            "total_stock": {"$sum": "$stock"}
        }}
    ]
    res = list(db.products.aggregate(cat_pipeline))
    print("Category pipeline: SUCCESS")
except Exception as e:
    print(f"Category pipeline: FAILED - {e}")
