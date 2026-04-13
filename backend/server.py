from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import traceback
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import random
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

# Resend Configuration for Email Sending
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
RESEND_FROM = 'no-reply@campusmartnr.me'
RESEND_API_URL = 'https://api.resend.com/emails'
RESEND_ENABLED = bool(RESEND_API_KEY)

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
products_router = APIRouter(prefix="/products", tags=["Products"])
booking_router = APIRouter(prefix="/bookings", tags=["Bookings"])
messages_router = APIRouter(prefix="/messages", tags=["Messages"])
reviews_router = APIRouter(prefix="/reviews", tags=["Reviews"])

# ===================== MODELS =====================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    college: str = Field(..., min_length=1)
    course: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    college: str
    course: Optional[str] = None
    created_at: str
    avatar: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SignupResponse(BaseModel):
    message: str
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

# Item Models
class RentDetails(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    price_per_day: float = Field(..., alias="pricePerDay")
    is_available: bool = Field(True, alias="isAvailable")

class RentRequestEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    user_id: str = Field(..., alias="userId")
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    status: Literal["pending", "approved", "rejected"] = "pending"

class RentRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")

class ProductRequestEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    request_id: str = Field(..., alias="requestId")
    buyer_id: str = Field(..., alias="buyerId")
    buyer_name: Optional[str] = Field(default=None, alias="buyerName")
    type: Literal["buy", "rent"]
    payment_method: Literal["meet"] = Field("meet", alias="paymentMethod")
    status: Literal["pending", "approved", "rejected"] = "pending"
    start_date: Optional[str] = Field(default=None, alias="startDate")
    end_date: Optional[str] = Field(default=None, alias="endDate")
    created_at: str = Field(..., alias="createdAt")

class ProductRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    type: Literal["buy", "rent"]
    payment_method: Literal["meet"] = Field("meet", alias="paymentMethod")
    start_date: Optional[str] = Field(default=None, alias="startDate")
    end_date: Optional[str] = Field(default=None, alias="endDate")

class ProductRequestDecision(BaseModel):
    status: Literal["approved", "rejected"]

class SellerRequestResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    request_id: str = Field(..., alias="requestId")
    product_id: str = Field(..., alias="productId")
    product_title: str = Field(..., alias="productTitle")
    buyer_id: str = Field(..., alias="buyerId")
    buyer_name: Optional[str] = Field(default=None, alias="buyerName")
    type: Literal["buy", "rent"]
    payment_method: Literal["meet"] = Field("meet", alias="paymentMethod")
    status: Literal["pending", "approved", "rejected"]
    start_date: Optional[str] = Field(default=None, alias="startDate")
    end_date: Optional[str] = Field(default=None, alias="endDate")
    created_at: str = Field(..., alias="createdAt")

class ItemCreate(BaseModel):
    title: str
    description: str
    category: str  # "electronics" or "clothes"
    type: Literal["sell", "rent"] = "rent"
    price: Optional[float] = None
    rent_details: Optional[RentDetails] = Field(default=None, alias="rentDetails")
    price_per_day: Optional[float] = None
    deposit: Optional[float] = 0.0
    location: str
    images: List[str] = []
    condition: str = "Good"
    size: Optional[str] = None  # For clothes
    is_available: Optional[bool] = True

class ItemUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    type: Optional[Literal["sell", "rent"]] = None
    price: Optional[float] = None
    rent_details: Optional[RentDetails] = Field(default=None, alias="rentDetails")
    price_per_day: Optional[float] = None
    deposit: Optional[float] = None
    location: Optional[str] = None
    images: Optional[List[str]] = None
    condition: Optional[str] = None
    size: Optional[str] = None
    is_available: Optional[bool] = None
    rent_requests: Optional[List[RentRequestEntry]] = Field(default=None, alias="rentRequests")
    requests: Optional[List[ProductRequestEntry]] = None

class ItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str
    owner_id: str
    owner_name: str
    owner_avatar: Optional[str] = None
    title: str
    description: str
    category: str
    type: Literal["sell", "rent"] = "rent"
    price: Optional[float] = None
    rent_details: Optional[RentDetails] = Field(default=None, alias="rentDetails")
    rent_requests: List[RentRequestEntry] = Field(default_factory=list, alias="rentRequests")
    requests: List[ProductRequestEntry] = Field(default_factory=list)
    price_per_day: Optional[float] = None
    deposit: Optional[float] = 0.0
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
def _generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"

def _otp_expiry() -> str:
    return (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

def _get_user_college(user: dict) -> str:
    return user.get("college") or user.get("location") or "Not set"

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email via Resend HTTP API.
    Returns True if sent successfully, False otherwise.
    """
    if not RESEND_ENABLED:
        logging.error("Resend API key is not configured")
        return False

    try:
        payload = {
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=30)
        print(f"Resend API response [{response.status_code}]: {response.text}")

        if response.ok:
            logging.info("Email sent successfully to %s", to_email)
            return True

        logging.error("Resend API error sending email to %s: %s", to_email, response.text)
        return False
    except requests.RequestException as e:
        logging.error("Failed to send email to %s via Resend: %s", to_email, str(e))
        return False
    except Exception as e:
        logging.error("Unexpected error sending email to %s via Resend: %s", to_email, str(e))
        return False

async def _send_otp_email(recipient: str, otp: str):
    """
    Send OTP verification email to recipient.
    """
    subject = "CampusMart - Email Verification"
    html_body = f"""
    <div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#111\">
      <h2>CampusMart Email Verification</h2>
      <p>Your verification code is:</p>
      <div style=\"font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0\">{otp}</div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
    """.strip()
    send_email(recipient, subject, html_body)


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

def _normalize_item_payload(item_data: ItemCreate) -> dict:
    listing_type = item_data.type

    effective_price_per_day = item_data.price_per_day
    if item_data.rent_details:
        effective_price_per_day = item_data.rent_details.price_per_day

    if listing_type == "rent":
        if effective_price_per_day is None:
            raise HTTPException(status_code=422, detail="Rent items require pricePerDay")
        rent_details = {
            "pricePerDay": float(effective_price_per_day),
            "isAvailable": item_data.rent_details.is_available if item_data.rent_details else bool(item_data.is_available),
        }
        price_value = None
        is_available = rent_details["isAvailable"]
    else:
        if item_data.price is None:
            raise HTTPException(status_code=422, detail="Sell items require price")
        rent_details = None
        price_value = float(item_data.price)
        effective_price_per_day = None
        is_available = bool(item_data.is_available)

    return {
        "type": listing_type,
        "price": price_value,
        "rentDetails": rent_details,
        "rentRequests": [],
        "requests": [],
        "price_per_day": float(effective_price_per_day) if effective_price_per_day is not None else None,
        "is_available": is_available,
    }

def _apply_item_update_payload(existing_item: dict, update_data: dict) -> dict:
    updated = dict(existing_item)
    updated.update(update_data)

    # Keep backward-compatible fields in sync.
    if "rentDetails" in updated and updated["rentDetails"]:
        updated["price_per_day"] = updated["rentDetails"].get("pricePerDay")
        updated["is_available"] = updated["rentDetails"].get("isAvailable", updated.get("is_available", True))

    if updated.get("type", "rent") == "sell":
        updated["rentDetails"] = None
        updated["price_per_day"] = None
    elif updated.get("type", "rent") == "rent" and not updated.get("rentDetails"):
        fallback_price = updated.get("price_per_day")
        if fallback_price is not None:
            updated["rentDetails"] = {
                "pricePerDay": float(fallback_price),
                "isAvailable": updated.get("is_available", True),
            }

    if "rentRequests" not in updated or updated["rentRequests"] is None:
        updated["rentRequests"] = []

    if "requests" not in updated or updated["requests"] is None:
        updated["requests"] = []

    return updated

# ===================== AUTH ROUTES =====================

@auth_router.post("/signup", response_model=SignupResponse)
async def signup(user_data: UserCreate):
    try:
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        college = user_data.college.strip()
        if not college:
            raise HTTPException(status_code=422, detail="College is required")

        otp = _generate_otp()
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "name": user_data.name,
            "college": college,
            "course": user_data.course.strip() if user_data.course and user_data.course.strip() else None,
            "avatar": None,
            "is_verified": False,
            "otp_hash": hash_password(otp),
            "otp_expiry": _otp_expiry(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        await db.users.insert_one(user)
        await _send_otp_email(user_data.email, otp)

        return SignupResponse(message="OTP sent to your email", email=user_data.email)
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")
    except Exception as e:
        print("signup error:", e)
        traceback.print_exc()
        raise

@auth_router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: VerifyOtpRequest):
    try:
        user = await db.users.find_one({"email": payload.email}, {"_id": 0})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")

    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    if user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Account already verified")

    expiry_raw = user.get("otp_expiry")
    if not expiry_raw:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new code")

    expiry = datetime.fromisoformat(expiry_raw.replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new code")

    otp_hash = user.get("otp_hash")
    if not otp_hash or not verify_password(payload.otp.strip(), otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"is_verified": True}, "$unset": {"otp_hash": "", "otp_expiry": ""}},
    )

    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        college=_get_user_college(user),
        course=user.get("course"),
        created_at=user["created_at"],
        avatar=user.get("avatar"),
    )

    return TokenResponse(access_token=token, user=user_response)

@auth_router.post("/resend-otp", response_model=SignupResponse)
async def resend_otp(payload: ResendOtpRequest):
    try:
        user = await db.users.find_one({"email": payload.email}, {"_id": 0})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")

    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    if user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Account already verified")

    otp = _generate_otp()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"otp_hash": hash_password(otp), "otp_expiry": _otp_expiry()}},
    )
    await _send_otp_email(payload.email, otp)

    return SignupResponse(message="OTP resent to your email", email=payload.email)

@auth_router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again in a few minutes.")
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.get("is_verified") is False:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    token = create_token(user["id"])

    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        college=_get_user_college(user),
        course=user.get("course"),
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
        college=_get_user_college(current_user),
        course=current_user.get("course"),
        created_at=current_user["created_at"],
        avatar=current_user.get("avatar")
    )

# Backward-compatible endpoint for requested /register path
@app.post("/register", response_model=SignupResponse)
async def register_main(user_data: UserCreate):
    try:
        return await signup(user_data)
    except Exception as e:
        print("register_main error:", e)
        import traceback
        traceback.print_exc()
        raise

@auth_router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    college: Optional[str] = None,
    course: Optional[str] = None,
    avatar: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if name:
        update_data["name"] = name
    if college:
        update_data["college"] = college
    if course is not None:
        update_data["course"] = course.strip() or None
    if avatar:
        update_data["avatar"] = avatar
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        name=updated_user["name"],
        college=_get_user_college(updated_user),
        course=updated_user.get("course"),
        created_at=updated_user["created_at"],
        avatar=updated_user.get("avatar")
    )

# ===================== ITEMS ROUTES =====================

@items_router.post("", response_model=ItemResponse)
async def create_item(item_data: ItemCreate, current_user: dict = Depends(get_current_user)):
    item_id = str(uuid.uuid4())
    normalized = _normalize_item_payload(item_data)
    listing_images = [str(image) for image in item_data.images] if item_data.images else []
    item = {
        "id": item_id,
        "owner_id": current_user["id"],
        "owner_name": current_user["name"],
        "owner_avatar": current_user.get("avatar"),
        "title": item_data.title,
        "description": item_data.description,
        "category": item_data.category,
        "type": normalized["type"],
        "price": normalized["price"],
        "rentDetails": normalized["rentDetails"],
        "rentRequests": normalized["rentRequests"],
        "price_per_day": normalized["price_per_day"],
        "deposit": item_data.deposit or 0.0,
        "location": item_data.location,
        "images": listing_images,
        "condition": item_data.condition,
        "size": item_data.size,
        "is_available": normalized["is_available"],
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
    and_conditions = []
    
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        and_conditions.append({"$or": [
            {"price": price_query},
            {"price_per_day": price_query},
        ]})
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if search:
        and_conditions.append({"$or": [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]})
    if and_conditions:
        query["$and"] = and_conditions
    
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
    
    update_data = {k: v for k, v in item_data.model_dump(by_alias=True).items() if v is not None}
    if "images" in update_data:
        update_data["images"] = [str(image) for image in update_data["images"]]
    update_data = _apply_item_update_payload(item, update_data)
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

@products_router.post("", response_model=ItemResponse)
async def create_product(product_data: ItemCreate, current_user: dict = Depends(get_current_user)):
    return await create_item(product_data, current_user)

@products_router.get("", response_model=List[ItemResponse])
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    return await get_items(category, min_price, max_price, location, search, limit, skip)

@api_router.post("/rent-request/{product_id}")
async def create_rent_request(
    product_id: str,
    request_data: RentRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    item = await db.items.find_one({"id": product_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")

    if item.get("type", "rent") != "rent":
        raise HTTPException(status_code=400, detail="Rent requests are only allowed for rent listings")

    if item.get("owner_id") == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot request rent for your own listing")

    start_dt = datetime.fromisoformat(request_data.start_date.replace("Z", "+00:00"))
    end_dt = datetime.fromisoformat(request_data.end_date.replace("Z", "+00:00"))
    if end_dt <= start_dt:
        raise HTTPException(status_code=400, detail="endDate must be after startDate")

    rent_requests = item.get("rentRequests", [])
    rent_request = {
        "userId": current_user["id"],
        "startDate": request_data.start_date,
        "endDate": request_data.end_date,
        "status": "pending",
    }
    rent_requests.append(rent_request)

    update_payload = {
        "rentRequests": rent_requests,
        "is_available": False,
    }

    rent_details = item.get("rentDetails")
    if rent_details:
        rent_details["isAvailable"] = False
        update_payload["rentDetails"] = rent_details

    await db.items.update_one({"id": product_id}, {"$set": update_payload})

    return {
        "message": "Rent request submitted",
        "productId": product_id,
        "request": rent_request,
    }

@api_router.post("/request/{product_id}")
async def create_product_request(
    product_id: str,
    request_data: ProductRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    item = await db.items.find_one({"id": product_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")

    if item.get("owner_id") == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot request your own product")

    if request_data.type == "rent" and item.get("type", "rent") != "rent":
        raise HTTPException(status_code=400, detail="Rent requests are only allowed for rent listings")

    if request_data.type == "rent":
        if not request_data.start_date or not request_data.end_date:
            raise HTTPException(status_code=422, detail="Rent request requires startDate and endDate")
        start_dt = datetime.fromisoformat(request_data.start_date.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(request_data.end_date.replace("Z", "+00:00"))
        if end_dt <= start_dt:
            raise HTTPException(status_code=400, detail="endDate must be after startDate")

    requests = item.get("requests", [])
    new_request = {
        "requestId": str(uuid.uuid4()),
        "buyerId": current_user["id"],
        "buyerName": current_user.get("name"),
        "type": request_data.type,
        "paymentMethod": request_data.payment_method,
        "status": "pending",
        "startDate": request_data.start_date,
        "endDate": request_data.end_date,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    requests.append(new_request)

    await db.items.update_one({"id": product_id}, {"$set": {"requests": requests}})

    return {
        "message": "Request submitted",
        "productId": product_id,
        "request": new_request,
    }

@api_router.patch("/request/{product_id}/{request_id}")
async def update_product_request(
    product_id: str,
    request_id: str,
    decision_data: ProductRequestDecision,
    current_user: dict = Depends(get_current_user)
):
    item = await db.items.find_one({"id": product_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")

    if item.get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only seller can approve/reject requests")

    requests = item.get("requests", [])
    found = False
    for request in requests:
        if request.get("requestId") == request_id:
            request["status"] = decision_data.status
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Request not found")

    update_payload = {"requests": requests}
    approved_request = next((r for r in requests if r.get("requestId") == request_id and r.get("status") == "approved"), None)
    if approved_request:
        update_payload["is_available"] = False
        rent_details = item.get("rentDetails")
        if rent_details:
            rent_details["isAvailable"] = False
            update_payload["rentDetails"] = rent_details

    await db.items.update_one({"id": product_id}, {"$set": update_payload})

    return {
        "message": f"Request {decision_data.status}",
        "productId": product_id,
        "requestId": request_id,
        "status": decision_data.status,
    }

@api_router.get("/seller/requests", response_model=List[SellerRequestResponse])
async def get_seller_requests(current_user: dict = Depends(get_current_user)):
    products = await db.items.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(500)
    seller_requests = []

    for product in products:
        for request in product.get("requests", []):
            seller_requests.append(
                SellerRequestResponse(
                    requestId=request.get("requestId"),
                    productId=product.get("id"),
                    productTitle=product.get("title"),
                    buyerId=request.get("buyerId"),
                    buyerName=request.get("buyerName"),
                    type=request.get("type"),
                    paymentMethod=request.get("paymentMethod", "meet"),
                    status=request.get("status", "pending"),
                    startDate=request.get("startDate"),
                    endDate=request.get("endDate"),
                    createdAt=request.get("createdAt", datetime.now(timezone.utc).isoformat()),
                )
            )

    seller_requests.sort(key=lambda req: req.created_at, reverse=True)
    return seller_requests

# ===================== BOOKING ROUTES =====================

@booking_router.post("", response_model=BookingResponse)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    item = await db.items.find_one({"id": booking_data.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.get("type", "rent") != "rent":
        raise HTTPException(status_code=400, detail="Only rent listings can be booked")
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

# Email testing endpoint (development only)
@auth_router.post("/test-email")
async def test_email(email: str = None):
    """
    Test endpoint to verify SMTP configuration.
    Usage: POST /api/auth/test-email?email=your@email.com
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email parameter required")

    subject = "CampusMart - Test Email"
    body = f"This is a test email from CampusMart SMTP configuration.\n\nIf you received this, SMTP is working correctly."

    html_body = f"<p>{body.replace(chr(10), '<br>')}</p>"
    success = send_email(email, subject, html_body)

    if success:
        return {"status": "success", "message": "Test email sent successfully", "email": email}
    else:
        if RESEND_ENABLED:
            return {
                "status": "error",
                "message": "Failed to send email. Check server logs for details.",
                "email": email
            }
        else:
            return {
                "status": "dev-mode",
                "message": "Resend API key not configured.",
                "email": email
            }

# Include routers
api_router.include_router(auth_router)
api_router.include_router(items_router)
api_router.include_router(products_router)
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

logger.info("Resend email config loaded (enabled=%s from=%s)", RESEND_ENABLED, RESEND_FROM)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
