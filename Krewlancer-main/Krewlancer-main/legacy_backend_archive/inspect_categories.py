import os
from pymongo import MongoClient
import json
from datetime import datetime
from bson import ObjectId

class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]

data = {
    "accessories_products": list(db.products.find({"category": "Accessories"}, {"_id": 0, "name": 1, "category": 1, "subcategory": 1}))
}

print(json.dumps(data, indent=2, cls=MongoEncoder))
