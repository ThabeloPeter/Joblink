# Admin User Setup Guide

## Creating Your First Admin User

To create an admin user for JobLink, you have two options:

### Option 1: Using the Setup Page (Recommended)

1. Navigate to `/setup` in your browser
2. Fill in the form with:
   - **Admin Email**: Your admin email address
   - **Password**: Minimum 8 characters
   - **Confirm Password**: Re-enter your password
   - **Admin Creation Key**: Leave blank for first admin, or set if creating additional admins
3. Click "Create Admin User"
4. You'll be redirected to the login page once the admin is created

### Option 2: Using the API Directly

You can also create an admin by making a POST request to `/api/auth/create-admin`:

```bash
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@joblink.com",
    "password": "your-secure-password"
  }'
```

## Creating Additional Admin Users

If you want to create additional admin users after the first one:

1. Set an admin creation key in your `.env.local` file:
   ```env
   ADMIN_CREATION_KEY=your-secret-key-here
   ```

2. When creating additional admins, provide this key in the form or API request:
   ```json
   {
     "email": "admin2@joblink.com",
     "password": "secure-password",
     "adminKey": "your-secret-key-here"
   }
   ```

## Access Control

After creating the admin user:

- **Admin users** (`role: 'admin'`) → Access `/admin` dashboard
- **Company users** (`role: 'company'`) → Access `/company` dashboard (after company approval)
- **Provider users** (`role: 'provider'`) → Access provider interface (mobile app)

## Login Flow

1. Admin users can login immediately after creation
2. Company users must wait for admin approval (company status must be `'approved'`)
3. Provider users can login immediately (no approval needed)

## Security Notes

- The setup page (`/setup`) is publicly accessible. Consider protecting it in production.
- Admin creation requires the `ADMIN_CREATION_KEY` environment variable if an admin already exists.
- Store the admin creation key securely and never commit it to version control.
- After initial setup, you may want to add authentication to the `/setup` route.

