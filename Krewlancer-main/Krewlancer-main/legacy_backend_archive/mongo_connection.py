import os
from pymongo import MongoClient
from pymongo.errors import PyMongoError


def get_mongo_client() -> MongoClient:
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    return MongoClient(uri, serverSelectionTimeoutMS=5000)


def get_mongo_db_name() -> str:
    return os.getenv("MONGODB_DB_NAME", "ecommerce_db")


def get_mongo_db():
    client = get_mongo_client()
    return client[get_mongo_db_name()]


def verify_mongo_connection() -> tuple[bool, str]:
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        db_name = get_mongo_db_name()
        return True, f"MongoDB connected successfully (db={db_name})"
    except PyMongoError as exc:
        return False, f"MongoDB connection failed: {exc}"
