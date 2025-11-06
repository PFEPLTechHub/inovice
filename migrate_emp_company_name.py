#!/usr/bin/env python3
"""
Migration: add company_name column to contract_user_info (nullable)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db


def migrate():
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                # Check if column exists
                result = conn.execute(db.text("SHOW COLUMNS FROM contract_user_info LIKE 'company_name'"))
                if result.fetchone():
                    print("Column company_name already exists on contract_user_info. Skipping.")
                    return True

                print("Adding company_name column to contract_user_info...")
                conn.execute(db.text(
                    "ALTER TABLE contract_user_info ADD COLUMN company_name VARCHAR(255) NULL"
                ))
                conn.commit()
                print("Done.")
                return True
        except Exception as e:
            print("Migration error:", str(e))
            return False


if __name__ == "__main__":
    ok = migrate()
    print("Success" if ok else "Failed")
