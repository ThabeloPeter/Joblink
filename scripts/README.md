# Admin User Creation Scripts

## Quick Start (Recommended)

The **simplest method** is to use the Supabase Dashboard + SQL:

### Step 1: Create Auth User in Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"** > **"Create New User"**
4. Fill in:
   - **Email**: `thabelot@nsfas.org.za`
   - **Password**: `Peterson1!`
   - **Auto Confirm User**: ✅ **YES** (important!)
5. Click **"Create User"**

### Step 2: Run SQL Script
1. Go to **SQL Editor** in Supabase Dashboard
2. Run `create_admin_simple.sql`
3. This will create the admin profile linked to the auth user

## Alternative Methods

### Method 2: Complete SQL Script
If you want to do everything in SQL (requires direct auth.users access), use `create_admin_user.sql` which includes a DO block that creates both the auth user and profile.

**Note**: This requires the `pgcrypto` extension and appropriate permissions.

### Method 3: Using the Setup Page
1. Navigate to `/setup` in your application
2. Create admin user via the web form

### Method 4: Using the API
```bash
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "thabelot@nsfas.org.za",
    "password": "Peterson1!"
  }'
```

## Verification

After creating the admin user, verify it works:

```sql
-- Check if user exists
SELECT 
  u.id,
  u.email,
  u.role,
  u.company_id,
  u.created_at
FROM public.users u
WHERE u.email = 'thabelot@nsfas.org.za';

-- Should return:
-- id: <uuid>
-- email: thabelot@nsfas.org.za
-- role: admin
-- company_id: null
```

## Login

After creation, you can login at `/auth` with:
- **Email**: `thabelot@nsfas.org.za`
- **Password**: `Peterson1!`

You should be redirected to `/admin` dashboard.

