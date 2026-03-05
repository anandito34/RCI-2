from database import SessionLocal
from models import User
from auth import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        new_email = "superadmin@rci.com"
        new_password = "admin123"
        
        # Check if exists
        user = db.query(User).filter(User.email == new_email).first()
        if user:
            print(f"User {new_email} already exists.")
            # Update password
            user.hashed_password = get_password_hash(new_password)
            db.commit()
            print("Password updated.")
        else:
            new_admin = User(
                full_name="Super Admin RCI",
                email=new_email,
                role="admin",
                hashed_password=get_password_hash(new_password)
            )
            db.add(new_admin)
            db.commit()
            print(f"✅ New Admin created:\nEmail: {new_email}\nPassword: {new_password}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
