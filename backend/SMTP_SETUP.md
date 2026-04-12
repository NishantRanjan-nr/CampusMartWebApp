# Gmail SMTP Setup for CampusMart OTP Email Verification

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification" and follow the prompts
3. Add a phone number and verify it

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" under "Select app"
3. Select "Windows Computer" under "Select device"
4. Click "Generate"
5. Copy the 16-character password (ignore spaces)

### Step 3: Update `.env` File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Use the 16 characters (without spaces)
SMTP_FROM=noreply@campusmart.local
SMTP_USE_TLS=true
```

## Testing SMTP Configuration

### Using Test Email Endpoint
```bash
# Start backend server
uvicorn backend.server:app --reload

# In another terminal, test SMTP:
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

**Response in dev mode (SMTP not configured):**
```json
{
  "status": "dev-mode",
  "message": "SMTP not configured. Running in development mode (emails logged only).",
  "email": "your@email.com"
}
```

### Check Server Logs
If SMTP is configured, look for:
```
INFO:     Email sent successfully to your@email.com
```

If SMTP fails, look for errors like:
```
ERROR:    SMTP authentication failed. Check SMTP_USER and SMTP_PASS.
```

## How OTP Emails Work

1. **User signs up** → Backend generates 6-digit OTP
2. **OTP email sent** → `send_email()` function delivers via SMTP
3. **User enters OTP** → Backend verifies and creates account
4. **User logs in** → Login blocked until email verified

## Fallback (Development Mode)

If `SMTP_USER` or `SMTP_PASS` is **empty**, the backend:
- ✅ Accepts signups normally
- ✅ Logs OTP to console (not email)
- ✅ Allows verification with console-logged OTP
- ✅ Perfect for local development

**Example console output:**
```
[DEV MODE] Email to test@example.com
Your verification code is: 123456

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "SMTP authentication failed" | Wrong password | Use 16-char App Password, not Gmail password |
| "Connection timeout" | SMTP_HOST/PORT wrong | Verify SMTP_HOST=smtp.gmail.com, SMTP_PORT=587 |
| Emails not arriving | 2FA not enabled | Enable 2-Step Verification first |
| Still not working after 2FA | Google blocking | Check https://myaccount.google.com/security for alerts |

## Important Security Notes

- ⚠️ **NEVER commit `.env`** to git (add to `.gitignore`)
- ⚠️ **NEVER use regular Gmail password** (use 16-char App Password)
- ⚠️ **NEVER log passwords** (already handled in code)
- ✅ Passwords are hashed in database
- ✅ OTP expires after 10 minutes
- ✅ OTP is single-use

## Other Email Providers

### Outlook/Microsoft 365
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Replace region
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Code Reference

### `send_email()` Function
```python
await send_email(
    to_email="user@example.com",
    subject="CampusMart - Email Verification",
    body="Your OTP is: 123456"
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
| SMTP_HOST | No | smtp.gmail.com | smtp.gmail.com |
| SMTP_PORT | No | 587 | 587 |
| SMTP_USER | Yes*  | (empty) | your-email@gmail.com |
| SMTP_PASS | Yes*  | (empty) | xxxx xxxx xxxx xxxx |
| SMTP_FROM | No | SMTP_USER | noreply@campusmart.local |
| SMTP_USE_TLS | No | true | true or false |

*Yes = Required for production (dev mode works without them)
