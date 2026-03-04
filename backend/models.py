from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="client") # "client" or "lawyer"
    is_active = Column(Boolean, default=True)
    profile_picture_url = Column(String, nullable=True)
    
    # Relationships
    lawyer_profile = relationship("LawyerProfile", back_populates="user", uselist=False)
    consultations = relationship("Consultation", back_populates="client", foreign_keys="Consultation.client_id")

class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., "Pidana", "Perdata", "Agraria"
    description = Column(Text, nullable=True)

    lawyers = relationship("LawyerProfile", back_populates="specialty")

class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialty_id = Column(Integer, ForeignKey("specialties.id"))
    bio = Column(Text)
    experience_years = Column(Integer)
    hourly_rate = Column(Float)
    rating = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    ktp_url = Column(String, nullable=True)
    certificate_url = Column(String, nullable=True)

    user = relationship("User", back_populates="lawyer_profile")
    specialty = relationship("Specialty", back_populates="lawyers")
    consultations = relationship("Consultation", back_populates="lawyer", foreign_keys="Consultation.lawyer_id")
    reviews = relationship("Review", back_populates="lawyer")

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id"))
    status = Column(String, default="pending") # pending, active, completed, cancelled
    scheduled_for = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    client = relationship("User", back_populates="consultations")
    lawyer = relationship("LawyerProfile", back_populates="consultations")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    lawyer = relationship("LawyerProfile", back_populates="reviews")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    lawyer_id = Column(Integer, ForeignKey("lawyer_profiles.id"))
    amount = Column(Float)
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    payment_method = Column(String)  # bank_transfer, ewallet, qris
    transaction_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    client = relationship("User")
    lawyer = relationship("LawyerProfile")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    type = Column(String)  # new_message, new_client, payment_success, consultation_update
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)  # ID of related entity (payment, consultation, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, index=True)  # Format: "{min_id}_{max_id}"
    sender_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    message_type = Column(String, default="text")  # text, file
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User")
