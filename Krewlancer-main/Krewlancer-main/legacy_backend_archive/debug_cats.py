from app import app, db
import json

with app.app_context():
    cats = list(db.categories.find())
    print(f"CATEGORIES_COUNT:{len(cats)}")
    for c in cats:
        print(f"CAT:{c.get('name')}")
