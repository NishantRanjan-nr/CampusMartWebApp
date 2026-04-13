# Resend Setup for CampusMart OTP Email Verification

## Quick Setup

### Step 1: Create a Resend account
1. Go to https://resend.com
2. Sign in and open the API keys page
3. Generate a new API key

### Step 2: Verify your sending domain
1. Add `campusmartnr.me` in Resend
2. Add the DNS records Resend gives you
3. Wait until the domain is verified

### Step 3: Update `.env` File
```env
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=no-reply@campusmartnr.me
```

## Testing Resend Configuration

### Using Test Email Endpoint
```bash
# Start backend server
uvicorn backend.server:app --reload

# In another terminal, test Resend:
curl -X POST "http://localhost:8000/api/auth/test-email?email=your@email.com"
```

**Response when working:**
```json
{
  "status": "success",
  "message": "Test email sent successfully",
  "email": "your@email.com"
}
```

**Response in dev mode (Resend not configured):**
```json
{
  "status": "dev-mode",
  "message": "Resend API key not configured.",
  "email": "your@email.com"
}
```

### Check Server Logs
If Resend is configured, look for:
```
INFO:     Email sent successfully to your@email.com
```

If Resend fails, look for errors like:
```
ERROR:    Resend API error sending email to your@email.com: ...
```

## How OTP Emails Work

1. **User signs up** → Backend generates 6-digit OTP
2. **OTP email sent** → `send_email()` function delivers via Resend API
3. **User enters OTP** → Backend verifies and creates account
4. **User logs in** → Login blocked until email verified

## Fallback (Development Mode)

If `RESEND_API_KEY` is **empty**, the backend:
- ✅ Accepts signups normally
- ✅ Returns a clear email error in logs
- ✅ Keeps the app running without email delivery

**Example console output:**
```
Resend API key not configured.

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Resend API key is not configured" | Missing `RESEND_API_KEY` | Set `RESEND_API_KEY` in Render |
| "Resend API error" | Invalid API key or unverified sender | Verify domain and key in Resend |
| Emails not arriving | Domain not verified | Add DNS records for `campusmartnr.me` |

## Important Security Notes

- ⚠️ **NEVER commit `.env`** to git (add to `.gitignore`)
- ⚠️ **NEVER log API keys**
- ✅ Passwords are hashed in database
- ✅ OTP expires after 10 minutes
- ✅ OTP is single-use

## Resend Reference

```env
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=no-reply@campusmartnr.me
```

## Code Reference

### `send_email()` Function
```python
send_email(
    to_email="user@example.com",
    subject="CampusMart - Email Verification",
    html_content="<p>Your OTP is: 123456</p>"
)
```

### OTP Signup Flow (in `@auth_router.post("/signup")`)
```python
otp = _generate_otp()  # 6-digit code
await _send_otp_email(user_data.email, otp)
# Returns "OTP sent to your email"
```

### OTP Verification (in `@auth_router.post("/verify-otp")`)
```python
# User submits email + OTP
# Backend verifies OTP
# Returns login token if valid
```

## Environment Variable Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| RESEND_API_KEY | Yes* | (empty) | re_xxx |
| RESEND_FROM | Yes* | no-reply@campusmartnr.me | no-reply@campusmartnr.me |

*Yes = Required for production