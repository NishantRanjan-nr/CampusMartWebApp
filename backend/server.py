from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import traceback
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from pymongo.errors import PyMongoError
import certifi

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'campusmart-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app with redirect_slashes enabled (default behavior)
app = FastAPI(title="CampusMart API")

def _normalize_origin(url: str) -> str:
    return url.strip().rstrip("/")


# Supports comma-separated frontend origins via FRONTEND_URLS.
frontend_urls_raw = os.environ.get("FRONTEND_URLS", "")
frontend_urls = [_normalize_origin(u) for u in frontend_urls_raw.split(",") if u.strip()]

# Backward-compatible with existing single FRONTEND_URL.
frontend_url = _normalize_origin(os.environ.get("FRONTEND_URL", "http://localhost:3000"))
if frontend_url:
    frontend_urls.append(frontend_url)

allowed_origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://campusmartnr.me",
    "https://www.campusmartnr.me",
}
allowed_origins.update(frontend_urls)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

# Security
security = HTTPBearer()

# Routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
items_router = APIRouter(prefix="/items", tags=["Items"])
booking_router = APIRouter(prefix="/bookings", tags=["Bookings"])
messages_router = APIRouter(prefix="/messages", tags=["Messages"])
reviews_router = APIRouter(prefix="/reviews", tags=["Reviews"])

# ===================== MODELS =====================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    location: Optional[str] = "Campus"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    location: str
    created_at: str
    avatar: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Item Models
class ItemCreate(BaseModel):
    title: str
    description: str
    category: str  # "electronics" or "clothes"
    price_per_day: float
    deposit: float
    location: str
    images: List[str] = []
    condition: str = "Good"
    size: Optional[str] = None  # For clothes

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_per_day: Optional[float] = None
    deposit: Optional[float] = None
    location: Optional[str] = None
    images: Optional[List[str]] = None
    condition: Optional[str] = None
    size: Optional[str] = None
    is_available: Optional[bool] = None

class ItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    owner_id: str
    owner_name: str
    owner_avatar: Optional[str] = None
    title: str
    description: str
    category: str
    price_per_day: float
    deposit: float
    location: str
    images: List[str]
    condition: str
    size: Optional[str] = None
    is_available: bool
    avg_rating: float
    review_count: int
    created_at: str

# Booking Models
class BookingCreate(BaseModel):
    item_id: str
    start_date: str  # ISO format
    end_date: str    # ISO format

class BookingResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    item_id: str
    item_title: str
    item_image: Optional[str] = None
    renter_id: str
    renter_name: str
    owner_id: str
    owner_name: str
    start_date: str
    end_date: str
    total_days: int
    total_price: float
    deposit: float
    status: str  # pending, confirmed, active, completed, cancelled
    created_at: str

class BookingStatusUpdate(BaseModel):
    status: str

# Message Models
class MessageCreate(BaseModel):
    receiver_id: str
    content: str
    item_id: Optional[str] = None

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    item_id: Optional[str] = None
    is_read: bool
    created_at: str

class ConversationResponse(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    last_message: str
    last_message_time: str
    unread_count: int

# Review Models
class ReviewCreate(BaseModel):
    item_id: str
    booking_id: str
    rating: int  # 1-5
    comment: str

class ReviewResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    item_id: str
    booking_id: str
    reviewer_id: str
    reviewer_name: str
    reviewer_avatar: Optional[str] = None
    rating: int
    comment: str
    created_at: str

# ===================== HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===================== AUTH ROUTES =====================

@auth_router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    try:
        print('signup called with:', user_data.dict())
        # Check if user exists
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "name": user_data.name,
            "location": user_data.location or "Campus",
            "avatar": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user)
        token = create_token(user_id)
        
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            location=user["location"],
            created_at=user["created_at"],
            avatar=user["avatar"]
        )
        
        return TokenResponse(access_token=token, user=user_response)
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")
    except Exception as e:
        print('signup error:', e)
        traceback.print_exc()
        raise

@auth_router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        location=user["location"],
        created_at=user["created_at"],
        avatar=user.get("avatar")
    )
    
    return TokenResponse(access_token=token, user=user_response)

@auth_router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        location=current_user["location"],
        created_at=current_user["created_at"],
        avatar=current_user.get("avatar")
    )

# Backward-compatible endpoint for requested /register path
@app.post("/register", response_model=TokenResponse)
async def register_main(user_data: UserCreate):
    try:
        return await signup(user_data)
    except Exception as e:
        print('register_main error:', e)
        import traceback
        traceback.print_exc()
        raise

@auth_router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    location: Optional[str] = None,
    avatar: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if name:
        update_data["name"] = name
    if location:
        update_data["location"] = location
    if avatar:
        update_data["avatar"] = avatar
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        name=updated_user["name"],
        location=updated_user["location"],
        created_at=updated_user["created_at"],
        avatar=updated_user.get("avatar")
    )

# ===================== ITEMS ROUTES =====================

@items_router.post("", response_model=ItemResponse)
async def create_item(item_data: ItemCreate, current_user: dict = Depends(get_current_user)):
    item_id = str(uuid.uuid4())
    item = {
        "id": item_id,
        "owner_id": current_user["id"],
        "owner_name": current_user["name"],
        "owner_avatar": current_user.get("avatar"),
        "title": item_data.title,
        "description": item_data.description,
        "category": item_data.category,
        "price_per_day": item_data.price_per_day,
        "deposit": item_data.deposit,
        "location": item_data.location,
        "images": item_data.images if item_data.images else ["https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=400"],
        "condition": item_data.condition,
        "size": item_data.size,
        "is_available": True,
        "avg_rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.items.insert_one(item)
    return ItemResponse(**item)

@items_router.get("", response_model=List[ItemResponse])
async def get_items(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {"is_available": True}
    
    if category:
        query["category"] = category
    if min_price is not None:
        query["price_per_day"] = {"$gte": min_price}
    if max_price is not None:
        if "price_per_day" in query:
            query["price_per_day"]["$lte"] = max_price
        else:
            query["price_per_day"] = {"$lte": max_price}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    items = await db.items.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return [ItemResponse(**item) for item in items]

@items_router.get("/featured", response_model=List[ItemResponse])
async def get_featured_items():
    items = await db.items.find({"is_available": True}, {"_id": 0}).sort("avg_rating", -1).limit(8).to_list(8)
    return [ItemResponse(**item) for item in items]

@items_router.get("/my-listings", response_model=List[ItemResponse])
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    items = await db.items.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return [ItemResponse(**item) for item in items]

@items_router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemResponse(**item)

@items_router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: str, item_data: ItemUpdate, current_user: dict = Depends(get_current_user)):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in item_data.model_dump().items() if v is not None}
    if update_data:
        await db.items.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.items.find_one({"id": item_id}, {"_id": 0})
    return ItemResponse(**updated_item)

@items_router.delete("/{item_id}")
async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.items.delete_one({"id": item_id})
    return {"message": "Item deleted"}

# ===================== BOOKING ROUTES =====================

@booking_router.post("", response_model=BookingResponse)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    item = await db.items.find_one({"id": booking_data.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not item["is_available"]:
        raise HTTPException(status_code=400, detail="Item not available")
    if item["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot book your own item")
    
    # Calculate days and price
    start = datetime.fromisoformat(booking_data.start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(booking_data.end_date.replace('Z', '+00:00'))
    total_days = max(1, (end - start).days)
    total_price = total_days * item["price_per_day"]
    
    owner = await db.users.find_one({"id": item["owner_id"]}, {"_id": 0})
    
    booking_id = str(uuid.uuid4())
    booking = {
        "id": booking_id,
        "item_id": item["id"],
        "item_title": item["title"],
        "item_image": item["images"][0] if item["images"] else None,
        "renter_id": current_user["id"],
        "renter_name": current_user["name"],
        "owner_id": item["owner_id"],
        "owner_name": owner["name"] if owner else "Unknown",
        "start_date": booking_data.start_date,
        "end_date": booking_data.end_date,
        "total_days": total_days,
        "total_price": total_price,
        "deposit": item["deposit"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking)
    return BookingResponse(**booking)

@booking_router.get("", response_model=List[BookingResponse])
async def get_bookings(current_user: dict = Depends(get_current_user)):
    # Get bookings where user is renter or owner
    bookings = await db.bookings.find(
        {"$or": [{"renter_id": current_user["id"]}, {"owner_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [BookingResponse(**b) for b in bookings]

@booking_router.get("/my-rentals", response_model=List[BookingResponse])
async def get_my_rentals(current_user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"renter_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [BookingResponse(**b) for b in bookings]

@booking_router.get("/incoming", response_model=List[BookingResponse])
async def get_incoming_bookings(current_user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"owner_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [BookingResponse(**b) for b in bookings]

@booking_router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(booking_id: str, status_data: BookingStatusUpdate, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Owner can confirm/cancel, renter can cancel
    if booking["owner_id"] != current_user["id"] and booking["renter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    valid_statuses = ["pending", "confirmed", "active", "completed", "cancelled"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status_data.status}})
    
    updated = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return BookingResponse(**updated)

# ===================== MESSAGES ROUTES =====================

@messages_router.post("", response_model=MessageResponse)
async def send_message(msg_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    receiver = await db.users.find_one({"id": msg_data.receiver_id}, {"_id": 0})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    msg_id = str(uuid.uuid4())
    message = {
        "id": msg_id,
        "sender_id": current_user["id"],
        "sender_name": current_user["name"],
        "receiver_id": msg_data.receiver_id,
        "receiver_name": receiver["name"],
        "content": msg_data.content,
        "item_id": msg_data.item_id,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message)
    return MessageResponse(**message)

@messages_router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    # Get all unique conversations
    messages = await db.messages.find(
        {"$or": [{"sender_id": current_user["id"]}, {"receiver_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    conversations = {}
    for msg in messages:
        other_id = msg["receiver_id"] if msg["sender_id"] == current_user["id"] else msg["sender_id"]
        other_name = msg["receiver_name"] if msg["sender_id"] == current_user["id"] else msg["sender_name"]
        
        if other_id not in conversations:
            unread = 0 if msg["sender_id"] == current_user["id"] else (0 if msg["is_read"] else 1)
            conversations[other_id] = {
                "user_id": other_id,
                "user_name": other_name,
                "user_avatar": None,
                "last_message": msg["content"],
                "last_message_time": msg["created_at"],
                "unread_count": unread
            }
        else:
            if msg["receiver_id"] == current_user["id"] and not msg["is_read"]:
                conversations[other_id]["unread_count"] += 1
    
    return [ConversationResponse(**c) for c in conversations.values()]

@messages_router.get("/conversation/{user_id}", response_model=List[MessageResponse])
async def get_conversation(user_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": current_user["id"], "receiver_id": user_id},
            {"sender_id": user_id, "receiver_id": current_user["id"]}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Mark as read
    await db.messages.update_many(
        {"sender_id": user_id, "receiver_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return [MessageResponse(**m) for m in messages]

@messages_router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.messages.count_documents({"receiver_id": current_user["id"], "is_read": False})
    return {"count": count}

# ===================== REVIEWS ROUTES =====================

@reviews_router.post("", response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # Verify booking exists and is completed
    booking = await db.bookings.find_one({"id": review_data.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["renter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only renter can review")
    
    # Check if already reviewed
    existing = await db.reviews.find_one({"booking_id": review_data.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    
    review_id = str(uuid.uuid4())
    review = {
        "id": review_id,
        "item_id": review_data.item_id,
        "booking_id": review_data.booking_id,
        "reviewer_id": current_user["id"],
        "reviewer_name": current_user["name"],
        "reviewer_avatar": current_user.get("avatar"),
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review)
    
    # Update item average rating
    item_reviews = await db.reviews.find({"item_id": review_data.item_id}, {"_id": 0}).to_list(1000)
    if item_reviews:
        avg = sum(r["rating"] for r in item_reviews) / len(item_reviews)
        await db.items.update_one(
            {"id": review_data.item_id},
            {"$set": {"avg_rating": round(avg, 1), "review_count": len(item_reviews)}}
        )
    
    return ReviewResponse(**review)

@reviews_router.get("/item/{item_id}", response_model=List[ReviewResponse])
async def get_item_reviews(item_id: str):
    reviews = await db.reviews.find({"item_id": item_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [ReviewResponse(**r) for r in reviews]

# ===================== DASHBOARD STATS =====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Total listings
    total_listings = await db.items.count_documents({"owner_id": current_user["id"]})
    
    # Active rentals (where user is renter)
    active_rentals = await db.bookings.count_documents({
        "renter_id": current_user["id"],
        "status": {"$in": ["confirmed", "active"]}
    })
    
    # Calculate earnings from completed bookings
    completed = await db.bookings.find({
        "owner_id": current_user["id"],
        "status": "completed"
    }, {"_id": 0, "total_price": 1}).to_list(1000)
    total_earnings = sum(b["total_price"] for b in completed)
    
    # Pending requests
    pending_requests = await db.bookings.count_documents({
        "owner_id": current_user["id"],
        "status": "pending"
    })
    
    return {
        "total_listings": total_listings,
        "active_rentals": active_rentals,
        "total_earnings": total_earnings,
        "pending_requests": pending_requests
    }

@api_router.get("/dashboard/recent-activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    # Get recent bookings
    bookings = await db.bookings.find(
        {"$or": [{"owner_id": current_user["id"]}, {"renter_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    activities = []
    for b in bookings:
        if b["owner_id"] == current_user["id"]:
            action = f"{b['renter_name']} requested to rent {b['item_title']}"
        else:
            action = f"You booked {b['item_title']}"
        
        activities.append({
            "id": b["id"],
            "action": action,
            "status": b["status"],
            "time": b["created_at"]
        })
    
    return activities

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CampusMart API"}

# Include routers
api_router.include_router(auth_router)
api_router.include_router(items_router)
api_router.include_router(booking_router)
api_router.include_router(messages_router)
api_router.include_router(reviews_router)
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
