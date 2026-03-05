from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Annotated
import os
import shutil
import uuid
import json

import models
import schemas
import auth
from database import engine, get_db
from seed_admin import seed_admin

models.Base.metadata.create_all(bind=engine)
seed_admin()

app = FastAPI(title="RCI Legal Consultation API")

os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Setup CORS — permissive policy to guarantee Vercel frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"message": "Welcome to RCI Legal Consultation API"}

@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://localhost:8000/api/uploads/{filename}"}

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = auth.get_password_hash(user.password)
    
    # Create new user
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user by email (using username field from form)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/api/auth/google")
def google_auth(token_data: dict, db: Session = Depends(get_db)):
    # This is a functional mock. In a real scenario, we would verify the Google ID token.
    # For now, we'll assume the token_data contains the email and name.
    email = token_data.get("email")
    name = token_data.get("name")
    
    if not email:
        raise HTTPException(status_code=400, detail="Invalid Google token data")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Auto-register Google users
        user = models.User(
            email=email,
            full_name=name or email.split('@')[0],
            hashed_password="google-auth-no-password", # Or handle specifically
            role="client"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/specialties", response_model=list[schemas.SpecialtyResponse])
def get_specialties(db: Session = Depends(get_db)):
    return db.query(models.Specialty).all()

@app.post("/api/chat/upload")
async def upload_chat_file(file: UploadFile = File(...)):
    """Upload a file attachment for chat messages."""
    os.makedirs("uploads/chat", exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", "chat", unique_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_url = f"http://localhost:8000/api/uploads/chat/{unique_name}"
    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_type": file.content_type or "application/octet-stream",
    }

@app.get("/api/lawyers/verified", response_model=list[schemas.LawyerProfileResponse])
def get_verified_lawyers(db: Session = Depends(get_db)):
    """Return all lawyers whose profiles have been approved by admin."""
    return db.query(models.LawyerProfile).filter(models.LawyerProfile.is_verified == True).all()

@app.get("/api/clients/{user_id}/consultations")
def get_client_consultations(user_id: int, db: Session = Depends(get_db)):
    """Return all consultations for a specific client, with lawyer info."""
    consultations = db.query(models.Consultation).filter(
        models.Consultation.client_id == user_id
    ).order_by(models.Consultation.created_at.desc()).all()
    
    result = []
    for c in consultations:
        lawyer_profile = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == c.lawyer_id).first()
        lawyer_user = lawyer_profile.user if lawyer_profile else None
        result.append({
            "id": c.id,
            "status": c.status,
            "scheduled_for": c.scheduled_for.isoformat() if c.scheduled_for else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "notes": c.notes,
            "lawyer_name": lawyer_user.full_name if lawyer_user else "Unknown",
            "lawyer_specialty": lawyer_profile.specialty.name if lawyer_profile and lawyer_profile.specialty else "Umum",
            "lawyer_user_id": lawyer_profile.user_id if lawyer_profile else None,
        })
    return result

@app.get("/api/clients/{user_id}/chat-sessions")
def get_client_chat_sessions(user_id: int):
    """Return all active chat sessions where this client is involved."""
    sessions = []
    for lawyer_id, client_list in active_chat_sessions.items():
        for client in client_list:
            if client["client_id"] == user_id:
                sessions.append({
                    "lawyer_user_id": lawyer_id,
                    "client_id": user_id,
                })
    return sessions

@app.get("/api/lawyers", response_model=list[schemas.LawyerProfileResponse])
def get_lawyers(specialty_id: int | None = None, search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.LawyerProfile).join(models.User).filter(models.LawyerProfile.is_verified == True)
    if specialty_id:
        query = query.filter(models.LawyerProfile.specialty_id == specialty_id)
    if search:
        query = query.filter(models.User.full_name.ilike(f"%{search}%"))
    return query.all()

@app.get("/api/lawyers/{lawyer_id}", response_model=schemas.LawyerProfileResponse)
def get_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    lawyer = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return lawyer

@app.post("/api/lawyers/profile", response_model=schemas.LawyerProfileResponse)
def create_lawyer_profile(
    profile_data: schemas.LawyerProfileBase, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create profiles")
    
    # Check if profile already exists
    existing_profile = db.query(models.LawyerProfile).filter(models.LawyerProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    if profile_data.profile_picture_url:
        current_user.profile_picture_url = profile_data.profile_picture_url
    
    new_profile = models.LawyerProfile(
        user_id=current_user.id,
        bio=profile_data.bio,
        experience_years=profile_data.experience_years,
        hourly_rate=profile_data.hourly_rate,
        specialty_id=profile_data.specialty_id,
        ktp_url=profile_data.ktp_url,
        certificate_url=profile_data.certificate_url
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@app.post("/api/consultations", response_model=schemas.ConsultationResponse)
def create_consultation(
    consultation: schemas.ConsultationBase,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Basic date validation
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    if consultation.scheduled_for < now_utc:
        raise HTTPException(status_code=400, detail="Cannot schedule consultation in the past")

    # Verify lawyer exists
    lawyer = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == consultation.lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    new_consultation = models.Consultation(
        client_id=current_user.id,
        lawyer_id=consultation.lawyer_id,
        scheduled_for=consultation.scheduled_for,
        notes=consultation.notes
    )
    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)
    return new_consultation

@app.get("/api/consultations/me", response_model=list[schemas.ConsultationResponse])
def get_my_consultations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "lawyer" and current_user.lawyer_profile:
        return db.query(models.Consultation).filter(models.Consultation.lawyer_id == current_user.lawyer_profile.id).all()
    return db.query(models.Consultation).filter(models.Consultation.client_id == current_user.id).all()

@app.post("/api/reviews", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewBase,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has had a consultation with this lawyer
    consultation = db.query(models.Consultation).filter(
        models.Consultation.client_id == current_user.id,
        models.Consultation.lawyer_id == review.lawyer_id,
        models.Consultation.status == "completed"
    ).first()
    
    # For demo purposes, we might allow reviewing if they have ANY consultation 
    # but in a perfect system we check for completion.
    # Let's be a bit more flexible for the user's "marketplace" feel right now.
    
    new_review = models.Review(
        client_id=current_user.id,
        lawyer_id=review.lawyer_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Update lawyer's average rating
    all_reviews = db.query(models.Review).filter(models.Review.lawyer_id == review.lawyer_id).all()
    avg_rating = sum([r.rating for r in all_reviews]) / len(all_reviews)
    
    lawyer = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == review.lawyer_id).first()
    lawyer.rating = round(avg_rating, 1)
    db.commit()
    
    return new_review

# ADMIN ROUTES
@app.get("/api/admin/lawyers/pending", response_model=list[schemas.LawyerProfileResponse])
def get_pending_lawyers(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    # Return all lawyer profiles where is_verified is False
    pending_lawyers = db.query(models.LawyerProfile).filter(models.LawyerProfile.is_verified == False).all()
    return pending_lawyers

@app.post("/api/admin/lawyers/{lawyer_id}/verify")
def verify_lawyer(
    lawyer_id: int,
    action: dict, # expecting {"status": "approve" | "reject"}
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    lawyer = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
        
    status = action.get("status")
    if status == "approve":
        lawyer.is_verified = True
        db.commit()
        return {"message": "Lawyer approved successfully."}
    elif status == "reject":
        # In a real app we might soft-delete or change status to 'rejected'.
        # For this prototype we will hard delete the profile so they can retry.
        db.delete(lawyer)
        db.commit()
        return {"message": "Lawyer profile rejected and removed."}
    else:
        raise HTTPException(status_code=400, detail="Invalid status action. Use 'approve' or 'reject'.")

# ----------------- PAYMENT ROUTES -----------------
@app.post("/api/payments", response_model=schemas.PaymentResponse)
def create_payment(
    payment: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new payment. Simulated: auto-confirms after creation."""
    # Verify lawyer exists and get hourly rate
    lawyer = db.query(models.LawyerProfile).filter(models.LawyerProfile.id == payment.lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    # Validate payment method
    valid_methods = ["bank_transfer", "ewallet", "qris"]
    if payment.payment_method not in valid_methods:
        raise HTTPException(status_code=400, detail=f"Invalid payment method. Use: {', '.join(valid_methods)}")

    # Generate unique transaction ID
    transaction_id = f"RCI-{uuid.uuid4().hex[:12].upper()}"

    # Create payment record
    new_payment = models.Payment(
        client_id=current_user.id,
        lawyer_id=payment.lawyer_id,
        amount=lawyer.hourly_rate,
        status="completed",  # Simulated: auto-confirm
        payment_method=payment.payment_method,
        transaction_id=transaction_id,
        completed_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    # Auto-create notifications for payment
    lawyer_user = lawyer.user
    # Notification for client
    client_notif = models.Notification(
        user_id=current_user.id,
        type="payment_success",
        title="Pembayaran Berhasil",
        message=f"Pembayaran Rp{int(lawyer.hourly_rate):,} untuk konsultasi dengan {lawyer_user.full_name} berhasil.",
        related_id=new_payment.id
    )
    # Notification for lawyer
    lawyer_notif = models.Notification(
        user_id=lawyer.user_id,
        type="new_client",
        title="Klien Baru",
        message=f"{current_user.full_name} telah membayar untuk sesi konsultasi dengan Anda.",
        related_id=new_payment.id
    )
    db.add_all([client_notif, lawyer_notif])
    db.commit()

    return new_payment

@app.get("/api/payments/{payment_id}", response_model=schemas.PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment details by ID."""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return payment

@app.get("/api/payments/me", response_model=list[schemas.PaymentResponse])
def get_my_payments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for the current user."""
    return db.query(models.Payment).filter(
        models.Payment.client_id == current_user.id
    ).order_by(models.Payment.created_at.desc()).all()


# ----------------- NOTIFICATION ROUTES -----------------
@app.get("/api/notifications", response_model=list[schemas.NotificationResponse])
def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for the current user, newest first."""
    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a single notification as read."""
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@app.put("/api/notifications/read-all")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read."""
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

# ----------------- CHAT HISTORY -----------------
@app.get("/api/chat/history/{room_id}", response_model=list[schemas.ChatMessageResponse])
def get_chat_history(
    room_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for a room. Room format: {min_id}_{max_id}"""
    # Verify user is part of this room
    parts = room_id.split("_")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid room ID format")
    try:
        id_a, id_b = int(parts[0]), int(parts[1])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid room ID format")
    
    if current_user.id not in (id_a, id_b) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db.query(models.ChatMessage).filter(
        models.ChatMessage.room_id == room_id
    ).order_by(models.ChatMessage.created_at.asc()).limit(100).all()

# ----------------- WEBSOCKET CHAT -----------------
# Track active chat sessions: { lawyer_user_id: [ {client_id, client_name, timestamp} ] }
active_chat_sessions: dict[int, list[dict]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    print(f"Error sending message in room {room_id}: {e}")

manager = ConnectionManager()

@app.get("/api/lawyers/{lawyer_user_id}/active-sessions")
def get_active_sessions(lawyer_user_id: int):
    """Return the list of clients who have started a chat session with this lawyer."""
    sessions = active_chat_sessions.get(lawyer_user_id, [])
    return sessions

@app.websocket("/ws/chat/{client_id}/{lawyer_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int, lawyer_id: int, db: Session = Depends(get_db)):
    room_id = f"{min(client_id, lawyer_id)}_{max(client_id, lawyer_id)}"
    
    await manager.connect(websocket, room_id)

    # If the connector is a client (not the lawyer), register the session
    # We determine this by checking: if client_id != lawyer_id, register the client
    client_user = db.query(models.User).filter(models.User.id == client_id).first()
    is_client_connecting = client_user and client_user.role == "client"
    
    if is_client_connecting:
        if lawyer_id not in active_chat_sessions:
            active_chat_sessions[lawyer_id] = []
        # Avoid duplicates
        existing_ids = [s["client_id"] for s in active_chat_sessions[lawyer_id]]
        if client_id not in existing_ids:
            active_chat_sessions[lawyer_id].append({
                "client_id": client_id,
                "client_name": client_user.full_name if client_user else f"Client #{client_id}",
                "client_email": client_user.email if client_user else "",
            })
    
    try:
        while True:
            data = await websocket.receive_text()
            # Save message to database
            try:
                msg_data = json.loads(data)
                chat_msg = models.ChatMessage(
                    room_id=room_id,
                    sender_id=msg_data.get("sender_id", client_id),
                    message=msg_data.get("text", ""),
                    message_type=msg_data.get("type", "text"),
                    file_url=msg_data.get("file_url"),
                )
                db.add(chat_msg)
                db.commit()
            except Exception as save_err:
                print(f"Error saving message: {save_err}")
            await manager.broadcast(data, room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Clean up session if client disconnects and room is empty
        if room_id not in manager.active_connections:
            if is_client_connecting and lawyer_id in active_chat_sessions:
                active_chat_sessions[lawyer_id] = [
                    s for s in active_chat_sessions[lawyer_id] if s["client_id"] != client_id
                ]
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id)

