TEDx Ticket & QR Management System
Documentation

Project Overview
A high-performance, secure backend system designed for event management, featuring
role-based access control, real-time ticket validation, and automated QR generation.

Dependencies
This project relies on the following key dependencies:

express
mongoose
dotenv
cors
jsonwebtoken
bcrypt
cookie-parser
express-rate-limit

Development Dependencies
typescript
ts-node
tsx
@types/express
@types/jsonwebtoken
@types/bcrypt
@types/cookie-parser
@types/cors


RUN COMMANDS

Install all dependencies:
npm install

Create your .env file
STRUCTURE OF ENV FILE:

PORT
MONGO_URI
JWT_SECRET
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_VOLUNTEER_EMAILS
SEED_VOLUNTEER_PASSWORD

Seed the database:
npx tsx src/seed.ts

Running the Server:
npm run dev


API Reference

1. Authentication Endpoints
These are public routes (no token required).
POST /api/auth/login
Payload:
JSON
{
  "email": "admin@tedx.com",
  "password": "YourSecurePassword"
}

POST /api/auth/logout
Payload:
JSON
{
  "email": "admin@tedx.com",
  "password": "YourSecurePassword"
}



2. Admin-Only QR Endpoints
These require an active Admin session (the auth_token cookie).

POST /api/qr/generate

Payload:

JSON
{
  "userId": "guest_123",
  "session": "SESSION_1"
}

PATCH /api/qr/admin/ticket/revoke

Payload:

JSON
{
  "ticketId": "TEDXIITP-26-81-0001"
}

GET /api/qr/admin/attendance


3. Validation Endpoint (Admin & Volunteer)
This requires an active session (any role).

POST /api/qr/validate

Payload:

JSON
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "currentScanningSession": "SESSION_1"
}