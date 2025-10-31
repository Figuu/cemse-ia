# Setup Instructions for CEMSE-IA Case Reporting System

This guide will help you set up and run the case reporting system.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (via Supabase)
- Supabase account and project

## Step 1: Environment Variables

Ensure your `.env.local` file has all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_postgresql_connection_string

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Database Setup

### Run Migrations

Apply the database schema including the Case, AuditLog, and soft delete fields:

```bash
npm run db:migrate
```

This will create:
- ✅ `Case` table with all incident fields
- ✅ `AuditLog` table for action tracking
- ✅ Soft delete fields on `School`, `Profile`, and `Case` models
- ✅ Enums: `ViolenceType`, `CaseStatus`, `CasePriority`

### Seed Database (Optional)

If you want sample data:

```bash
npm run db:seed
```

## Step 4: Storage Buckets Setup

Create the required Supabase storage buckets:

```bash
npm run setup:storage
```

This script will:
- ✅ Create `user-profile-pictures` bucket (5MB limit, images only)
- ✅ Create `case-evidence` bucket (10MB limit, images, PDFs, audio, video)
- ✅ Display SQL policies to configure in Supabase Dashboard

### Configure Storage Policies

After running the script, you need to configure storage policies in the Supabase Dashboard:

1. Go to **Supabase Dashboard** → **Storage** → **Policies**

2. For the **`case-evidence`** bucket, run these SQL policies in the Supabase SQL Editor:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-evidence');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-evidence');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'case-evidence');
```

3. For the **`user-profile-pictures`** bucket, configure similar policies for INSERT, SELECT, and DELETE.

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Initial Login

Use the default admin credentials from your seed data, or create a super admin account:

1. Go to [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Create an account
3. Manually update the user role to `SUPER_ADMIN` in the database:

```sql
UPDATE "Profile"
SET role = 'SUPER_ADMIN'
WHERE email = 'your-email@example.com';
```

## Testing the Case Reporting System

### As a Director or Professor:

1. **Login** to the system
2. Navigate to **"Reportes"** in the sidebar
3. Click **"Reportar Caso"** button
4. Fill out the case form:
   - Incident date and time
   - Violence type
   - Description
   - Victim information (can be anonymous)
   - Aggressor information
   - Witnesses
   - Upload evidence files
5. Click **"Crear Caso"**
6. View the case in the cases list
7. Click on a case to see full details
8. Edit or update case status as needed

### As an Admin:

1. **Login** as admin
2. Access **"Reportes"** to see all cases from all schools
3. Access **"Auditoría"** to view the complete audit log
4. Filter audit logs by:
   - Action type
   - Entity type
   - User
   - Date range

## Feature Overview

### Case Management
- ✅ Create detailed case reports with all incident information
- ✅ Upload evidence files (images, PDFs, audio, video)
- ✅ Track case status (Open → In Progress → Resolved → Closed)
- ✅ Set priority levels (Low, Medium, High, Urgent)
- ✅ Anonymous victim reporting option
- ✅ Search and filter cases
- ✅ Role-based access (Directors/Professors see only their school's cases)

### Audit Logging
- ✅ Every action is logged with timestamp, user, and changes
- ✅ IP address and user agent tracking
- ✅ Before/after value tracking for updates
- ✅ Admin-only access to view audit logs

### Soft Deletes
- ✅ No data is permanently deleted
- ✅ Deleted items are hidden but recoverable
- ✅ Tracks who deleted and when

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cases/              # Case CRUD endpoints
│   │   └── audit-logs/         # Audit log viewer endpoint
│   └── (dashboard)/
│       ├── cases/              # Cases list and detail pages
│       └── audit-logs/         # Audit logs viewer page
├── components/
│   └── cases/
│       └── CaseModal.tsx       # Case creation/edit form
└── lib/
    ├── audit.ts                # Audit logging utilities
    ├── storage.ts              # File upload/storage utilities
    └── translations.ts         # Spanish translations
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio

# Storage
npm run setup:storage    # Create Supabase storage buckets

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
```

## Troubleshooting

### Files not uploading
- Verify the `case-evidence` bucket exists in Supabase
- Check that storage policies are configured correctly
- Ensure environment variables are correct
- Check browser console for CORS errors

### Cannot see cases
- Verify your user has the correct role (DIRECTOR, PROFESOR, ADMIN, or SUPER_ADMIN)
- Check that the user is assigned to a school (for Directors/Professors)
- Verify middleware permissions are working

### Audit logs not appearing
- Ensure you're logged in as ADMIN or SUPER_ADMIN
- Check that audit logging functions are being called in API routes
- Verify the AuditLog table exists in the database

### Database migration errors
- Ensure DATABASE_URL is correct in .env.local
- Try running `npm run db:generate` first
- Check PostgreSQL connection

## Production Deployment

Before deploying to production:

1. ✅ Update environment variables for production
2. ✅ Run `npm run build` to check for errors
3. ✅ Set up Supabase storage buckets in production
4. ✅ Configure storage policies in production Supabase project
5. ✅ Run database migrations in production
6. ✅ Test all features thoroughly
7. ✅ Set up proper backup procedures
8. ✅ Configure monitoring and logging

## Support

For issues or questions:
- Check the documentation in `SUPABASE_STORAGE_SETUP.md`
- Review the code comments in API routes and components
- Check Supabase Dashboard for storage and database status

## Security Notes

- All routes are protected by middleware
- Role-based access control is enforced at API and UI levels
- Files are validated for type and size on both client and server
- Audit logs track all system actions
- Soft deletes ensure data retention and recoverability
- IP addresses and user agents are logged for security tracking

---

**System Status**: ✅ Fully Functional

All core features of the case reporting system are implemented and ready for use!
