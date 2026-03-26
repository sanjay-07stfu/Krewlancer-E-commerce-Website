from dotenv import load_dotenv
from mongo_connection import verify_mongo_connection


if __name__ == "__main__":
    load_dotenv()
    ok, message = verify_mongo_connection()
    print(message)
    raise SystemExit(0 if ok else 1)
