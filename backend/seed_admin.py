from database import SessionLocal
from models import User
from auth import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@rci.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            new_admin = User(
                full_name="Super Admin RCI",
                email=admin_email,
                role="admin",
                hashed_password=get_password_hash("admin123")
            )
            db.add(new_admin)
            db.commit()
            print(f"✅ Admin user created successfully:\nEmail: {admin_email}\nPassword: admin123")
        else:
            print("ℹ️ Admin user already exists.")
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
