import os
import sys
import socket
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def test_connection():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url or "sqlite" in db_url:
        print("[-] DATABASE_URL is not set to PostgreSQL in .env")
        return False
        
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[+] Success: Connected to PostgreSQL!")
        return True
    except Exception as e:
        import traceback
        print(f"[-] Failed to connect: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if test_connection():
        print("[*] Database is ready.")
    else:
        print("[!] Please check your .env configuration and ensure PostgreSQL is running.")
