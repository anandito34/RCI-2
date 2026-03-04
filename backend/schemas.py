from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    profile_picture_url: str | None = None

    class Config:
        from_attributes = True

class SpecialtyBase(BaseModel):
    name: str
    description: str | None = None

class SpecialtyResponse(SpecialtyBase):
    id: int
    class Config:
        from_attributes = True

class LawyerProfileBase(BaseModel):
    bio: str
    experience_years: int
    hourly_rate: float
    specialty_id: int
    ktp_url: str | None = None
    certificate_url: str | None = None
    profile_picture_url: str | None = None

class LawyerProfileResponse(LawyerProfileBase):
    id: int
    user_id: int
    rating: float
    is_verified: bool
    ktp_url: str | None = None
    certificate_url: str | None = None
    user: UserResponse
    specialty: SpecialtyResponse
    class Config:
        from_attributes = True

class ConsultationBase(BaseModel):
    lawyer_id: int
    scheduled_for: datetime
    notes: str | None = None

class ConsultationResponse(ConsultationBase):
    id: int
    client_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    lawyer_id: int
    rating: int
    comment: str

class ReviewResponse(ReviewBase):
    id: int
    client_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class PaymentCreate(BaseModel):
    lawyer_id: int
    payment_method: str  # "bank_transfer", "ewallet", "qris"

class PaymentResponse(BaseModel):
    id: int
    client_id: int
    lawyer_id: int
    amount: float
    status: str
    payment_method: str
    transaction_id: str
    created_at: datetime
    completed_at: datetime | None = None
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    is_read: bool
    related_id: int | None = None
    created_at: datetime
    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    room_id: str
    sender_id: int
    message: str
    message_type: str
    file_url: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True
