# Authentication API Endpoints

This document describes the REST API endpoints for authentication in the JobLink platform.

## Endpoints

### POST `/api/auth/login`
Authenticates a user and returns a session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "company_manager",
    "companyId": "company-uuid"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `403`: Company account pending approval
- `400`: Validation error
- `500`: Server error

---

### POST `/api/auth/register`
Registers a new company and creates a company manager account.

**Request Body:**
```json
{
  "companyName": "ABC Corporation",
  "contactPerson": "John Doe",
  "email": "contact@abc.com",
  "phone": "+1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration successful! Your account is pending admin approval.",
  "user": {
    "id": "user-uuid",
    "email": "contact@abc.com",
    "companyId": "company-uuid"
  },
  "requiresApproval": true
}
```

**Error Responses:**
- `409`: Email or company name already exists
- `400`: Validation error
- `500`: Server error

---

### POST `/api/auth/logout`
Logs out the current user.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/api/auth/me`
Gets the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "company_manager",
    "companyId": "company-uuid",
    "company": {
      "id": "company-uuid",
      "name": "ABC Corporation",
      "status": "approved"
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized or invalid token
- `500`: Server error

## Database Schema Requirements

The following tables are expected to exist in your Supabase database:

### `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'company_manager', 'service_provider')),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `companies` table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

Ensure RLS is enabled and appropriate policies are set:

```sql
-- Users can read their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Companies can be read by authenticated users
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);
```

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Notes

- All endpoints use JSON for request/response bodies
- Error responses include a descriptive `error` field
- Session tokens should be stored securely (consider httpOnly cookies for production)
- Registration creates accounts with `status: 'pending'` requiring admin approval
- Login checks company approval status for company managers

