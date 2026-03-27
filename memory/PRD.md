# CampusMart - Product Requirements Document

## Original Problem Statement
Build a full-stack web application called "CampusMart", a C2C rental marketplace for students where users can rent electronics and clothes with a clean, modern marketplace UI and SaaS-style dashboards.

## User Personas
1. **Student Renter** - Looking to rent electronics/clothes for short periods (events, projects)
2. **Student Lister** - Has items to rent out to earn extra income

## Core Requirements (Static)
- JWT-based authentication (email/password)
- Light + Dark mode with toggle
- Modern blue/teal color scheme
- Basic messaging system (non-real-time)
- Reviews and ratings system
- Public marketplace with browse/search/filters
- SaaS-style dashboard

## What's Been Implemented (March 2026)

### Backend (FastAPI + MongoDB)
- ✅ User authentication (signup/login/JWT)
- ✅ Items CRUD API (/api/items)
- ✅ Bookings API (/api/bookings)
- ✅ Messages API (/api/messages)
- ✅ Reviews API (/api/reviews)
- ✅ Dashboard stats API

### Frontend (React + Shadcn UI)
- ✅ Landing page with hero, categories, featured items
- ✅ Browse page with grid and filter sidebar
- ✅ Item detail page with booking calendar
- ✅ Auth pages (login/signup)
- ✅ Dashboard with sidebar navigation
- ✅ My Listings management
- ✅ My Rentals with booking status
- ✅ Messages inbox
- ✅ Profile page
- ✅ Theme toggle (light/dark)

### Database Collections
- users, items, bookings, messages, reviews

## Prioritized Backlog

### P0 (Critical) - None remaining

### P1 (High Priority)
- Image upload integration (currently URL-based)
- Email notifications for bookings
- Password reset flow

### P2 (Medium Priority)
- Real-time messaging (WebSocket)
- Search autocomplete
- Item availability calendar view
- Payment integration (Stripe)

### P3 (Low Priority)
- Social sharing
- Wishlist/favorites
- Push notifications
- Mobile app

## Next Tasks
1. Add image upload via object storage
2. Implement email notifications for booking status changes
3. Add password reset functionality
4. Consider payment integration for deposits
