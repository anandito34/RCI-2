import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    if len(tables) > 0:
        print("SUCCESS: Database schema initialized successfully.")
    else:
        print("WARNING: No tables found in the database.")
except Exception as e:
    print(f"ERROR: Could not connect to database: {e}")
