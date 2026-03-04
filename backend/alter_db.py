from sqlalchemy import text
from database import engine

def alter_tables():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR;"))
            print("Added profile_picture_url to users")
        except Exception as e:
            print(e)
            
        try:
            conn.execute(text("ALTER TABLE lawyer_profiles ADD COLUMN ktp_url VARCHAR;"))
            print("Added ktp_url to lawyer_profiles")
        except Exception as e:
            print(e)
            
        try:
            conn.execute(text("ALTER TABLE lawyer_profiles ADD COLUMN certificate_url VARCHAR;"))
            print("Added certificate_url to lawyer_profiles")
        except Exception as e:
            print(e)
        
        conn.commit()

alter_tables()
print("Alter DB complete.")
