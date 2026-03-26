import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = "mongodb://localhost:27017/ecommerce_db"
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

updates = [
    {"name": "Leather Minimal Tote", "subcategory": "Bags"},
    {"name": "Cashmere Scarf", "subcategory": "Scarf"},
    {"name": "Essential Cashmere Sweater", "subcategory": "Sweaters"},
    {"name": "Tailored Wool Trousers", "subcategory": "Tailored"},
    {"name": "Organic Cotton Tee", "subcategory": "Tees"},
    {"name": "Silk Button-Down Shirt", "subcategory": "Formal"},
    {"name": "Merino Wool Cardigan", "subcategory": "Cardigans"},
    {"name": "Linen Wide-Leg Pants", "subcategory": "Casual"},
]

print("Starting subcategory migration...")

for update in updates:
    result = db.products.update_many(
        {"name": update["name"], "subcategory": {"$in": [None, ""]}},
        {"$set": {"subcategory": update["subcategory"]}}
    )
    print(f"Updated {result.modified_count} products for '{update['name']}' -> '{update['subcategory']}'")

print("Migration complete.")
