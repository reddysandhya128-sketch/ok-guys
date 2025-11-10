#!/bin/bash
# data/db-seed.sh
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Waiting for postgres..."
  sleep 2
done

# 1. Create Normalized Schema (Task: Database Design)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE vendors (
        vendor_id SERIAL PRIMARY KEY, 
        vendor_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE invoices (
        invoice_id SERIAL PRIMARY KEY, 
        invoice_number VARCHAR(100) UNIQUE NOT NULL, 
        vendor_id INT NOT NULL REFERENCES vendors(vendor_id), 
        invoice_date DATE NOT NULL, 
        due_date DATE,
        total_amount NUMERIC(10, 2) NOT NULL, 
        payment_status VARCHAR(50) NOT NULL
    );

    CREATE TABLE line_items (
        line_item_id SERIAL PRIMARY KEY, 
        invoice_id INT NOT NULL REFERENCES invoices(invoice_id),
        item_description TEXT,
        category VARCHAR(100),
        quantity INT,
        unit_price NUMERIC(10, 2),
        line_total NUMERIC(10, 2)
    );
EOSQL

echo "Schema created. Running Python ingestion script..."
# You will run this Python script manually or via another setup step locally: python3 data/ingestion.py
echo "Database schema creation complete."