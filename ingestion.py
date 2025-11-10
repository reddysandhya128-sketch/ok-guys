# data/ingestion.py
import json, os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DB_CONN_STR = os.getenv("DATABASE_URL")
JSON_FILE = 'Analytics_Test_Data.json'

def ingest_data():
    conn = psycopg2.connect(DB_CONN_STR)
    cur = conn.cursor()
    
    with open(JSON_FILE, 'r') as f:
        data = json.load(f)

    vendor_map = {} 
    
    for record in data:
        # --- 1. Vendor Normalization ---
        vendor_name = record.get('vendor', {}).get('name')
        if vendor_name and vendor_name not in vendor_map:
            try:
                cur.execute("INSERT INTO vendors (vendor_name) VALUES (%s) RETURNING vendor_id", (vendor_name,))
                vendor_id = cur.fetchone()[0]
                vendor_map[vendor_name] = vendor_id
            except psycopg2.errors.UniqueViolation:
                conn.rollback() 
                cur.execute("SELECT vendor_id FROM vendors WHERE vendor_name = %s", (vendor_name,))
                vendor_id = cur.fetchone()[0]
        else:
            vendor_id = vendor_map.get(vendor_name)

        # --- 2. Invoices Insertion ---
        invoice_rec = record.get('invoice', {})
        if vendor_id and invoice_rec.get('number'):
            try:
                cur.execute(
                    """
                    INSERT INTO invoices (invoice_number, vendor_id, invoice_date, due_date, total_amount, payment_status)
                    VALUES (%s, %s, %s, %s, %s, %s) 
                    ON CONFLICT (invoice_number) DO NOTHING 
                    RETURNING invoice_id
                    """,
                    (
                        invoice_rec['number'], vendor_id, invoice_rec['date'],
                        invoice_rec.get('due_date'), invoice_rec['total'], invoice_rec['status']
                    )
                )
                result = cur.fetchone()
                if result:
                    invoice_id = result[0]

                    # --- 3. Line Items Insertion ---
                    for item in record.get('line_items', []):
                        cur.execute(
                            """
                            INSERT INTO line_items (invoice_id, item_description, category, quantity, unit_price, line_total)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            """,
                            (
                                invoice_id, item.get('description'), item.get('category'), 
                                item.get('quantity'), item.get('unit_price'), item.get('line_total')
                            )
                        )
            except Exception as e:
                conn.rollback()
                continue

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    ingest_data()