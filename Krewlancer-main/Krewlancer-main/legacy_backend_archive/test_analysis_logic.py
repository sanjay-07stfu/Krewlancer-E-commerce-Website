from app import app, db_mysql, OrderSQL, OrderItem, ProductSQL, CategorySQL
import json

with app.app_context():
    try:
        print("DEBUG: Starting isolated test")
        all_orders = OrderSQL.query.all()
        print(f"DEBUG: Found {len(all_orders)} orders")
        product_sales = {}
        for order in all_orders:
            for item in order.items:
                pid = item.product_id_str
                qty = item.quantity or 1
                if pid:
                    product_sales[pid] = product_sales.get(pid, 0) + qty
        
        sorted_sales = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
        most_sold_list = []
        for pid, qty in sorted_sales:
            print(f"DEBUG: Processing product {pid}")
            numeric_id = int(pid)
            product = ProductSQL.query.get(numeric_id)
            if product:
                prod_images = product.images
                print(f"DEBUG: Product {pid} images type: {type(prod_images)}")
                # The issue might be here if images is somehow not behaving as expected
                most_sold_list.append({
                    "id": str(product.id),
                    "name": product.name,
                    "total_sold": qty
                })
        print("DEBUG: Isolated test SUCCESS")
    except Exception as e:
        print(f"DEBUG: Isolated test FAILED: {e}")
        import traceback
        traceback.print_exc()
