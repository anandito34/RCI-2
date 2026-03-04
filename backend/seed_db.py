import sys
import os

# Add parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models
import auth

def seed():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if specialties exist
    if db.query(models.Specialty).count() == 0:
        print("Seeding specialties...")
        specialties = [
            models.Specialty(name="Pidana", description="Hukum terkait tindak kejahatan dan pelanggaran umum."),
            models.Specialty(name="Perdata", description="Hukum terkait sengketa antar individu atau badan hukum."),
            models.Specialty(name="Agraria", description="Hukum terkait pertanahan dan sumber daya alam."),
            models.Specialty(name="Keluarga", description="Hukum terkait pernikahan, perceraian, dan hak asuh anak."),
            models.Specialty(name="Bisnis", description="Hukum terkait korporasi, investasi, dan kontrak dagang."),
            models.Specialty(name="Ketenagakerjaan", description="Hukum terkait hubungan antara pemberi kerja dan pekerja.")
        ]
        db.add_all(specialties)
        db.commit()
    
    # Check if any lawyers exist
    if db.query(models.User).filter(models.User.role == "lawyer").count() == 0:
        print("Seeding sample lawyers...")
        
        # Get a specialty
        pidana = db.query(models.Specialty).filter(models.Specialty.name == "Pidana").first()
        perdata = db.query(models.Specialty).filter(models.Specialty.name == "Perdata").first()
        
        # Create Lawyer Users
        lawyer1 = models.User(
            email="lawyer1@example.com",
            full_name="Budi Santoso, S.H.",
            hashed_password=auth.get_password_hash("password123"),
            role="lawyer"
        )
        lawyer2 = models.User(
            email="lawyer2@example.com",
            full_name="Siti Aminah, S.H., M.H.",
            hashed_password=auth.get_password_hash("password123"),
            role="lawyer"
        )
        
        db.add_all([lawyer1, lawyer2])
        db.commit()
        db.refresh(lawyer1)
        db.refresh(lawyer2)
        
        # Create Profiles
        prof1 = models.LawyerProfile(
            user_id=lawyer1.id,
            specialty_id=pidana.id,
            bio="Pengacara spesialis hukum pidana dengan pengalaman 10 tahun.",
            experience_years=10,
            hourly_rate=500000.0,
            is_verified=True
        )
        prof2 = models.LawyerProfile(
            user_id=lawyer2.id,
            specialty_id=perdata.id,
            bio="Ahli hukum perdata dan sengketa bisnis.",
            experience_years=8,
            hourly_rate=750000.0,
            is_verified=True
        )
        
        db.add_all([prof1, prof2])
        db.commit()
        
    print("Database seeding completed.")
    db.close()

if __name__ == "__main__":
    seed()
