# Task List: Authentication & Role-Based Access Management System

**PRD:** `prds/prd-authentication-and-role-management-system.md`  
**Status:** In Progress  
**Date Created:** 2025-01-27

---

## Relevant Files

### Core Configuration

- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `prisma/schema.prisma` - Database schema definition
- `.env.local` - Environment variables
- `.env.example` - Environment variables template

### Database & Prisma

- `src/lib/prisma/client.ts` - Prisma client singleton
- `prisma/migrations/` - Database migrations
- `prisma/seed.ts` - Database seed script
- `src/types/database.ts` - Generated Prisma types

### Supabase Integration

- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/supabase/admin.ts` - Admin Supabase client

### Middleware & Auth

- `middleware.ts` - Next.js middleware for auth/role checks
- `src/lib/auth.ts` - Auth utility functions
- `src/lib/permissions.ts` - Permission checking utilities

### Context Providers

- `src/context/AuthContext.tsx` - Authentication state
- `src/context/ThemeContext.tsx` - Theme state
- `src/context/QueryProvider.tsx` - React Query provider
- `src/providers.tsx` - Root providers wrapper
- `src/app/layout.tsx` - Root layout

### Type Definitions

- `src/types/auth.ts` - Authentication types
- `src/types/user.ts` - User/Profile types
- `src/types/api.ts` - API response types
- `src/lib/validations.ts` - Zod schemas

### API Routes - Authentication

- `src/app/api/auth/sign-in/route.ts` - POST login
- `src/app/api/auth/logout/route.ts` - POST logout
- `src/app/api/auth/register/route.ts` - POST registration
- `src/app/api/auth/reset-password/route.ts` - POST password reset

### API Routes - Users

- `src/app/api/users/route.ts` - GET list, POST create
- `src/app/api/users/[id]/route.ts` - GET, PATCH, DELETE user
- `src/app/api/users/[id]/reset-password/route.ts` - POST admin password reset

### API Routes - Files

- `src/app/api/files/upload/route.ts` - POST file upload
- `src/app/api/files/delete/route.ts` - DELETE file

### API Routes - Profile

- `src/app/api/profile/route.ts` - GET, PATCH current user profile
- `src/app/api/profile/change-password/route.ts` - POST change password

### Pages - Authentication

- `src/app/(auth)/sign-in/page.tsx` - Login page
- `src/app/(auth)/sign-up/page.tsx` - Registration page
- `src/app/(auth)/forgot-password/page.tsx` - Password reset request
- `src/app/(auth)/reset-password/page.tsx` - Password reset confirmation
- `src/app/(auth)/verify-email/page.tsx` - Email verification
- `src/app/(auth)/layout.tsx` - Auth layout

### Pages - Dashboard

- `src/app/(dashboard)/layout.tsx` - Dashboard layout
- `src/app/(dashboard)/dashboard/page.tsx` - Role-based dashboard
- `src/app/(dashboard)/profile/page.tsx` - User profile
- `src/app/(dashboard)/users/page.tsx` - User list (Admin/Super Admin)
- `src/app/(dashboard)/users/create/page.tsx` - Create user
- `src/app/(dashboard)/users/[id]/page.tsx` - User detail/edit

### Layout Components

- `src/components/layout/Header.tsx` - App header with user info
- `src/components/layout/Sidebar.tsx` - Desktop sidebar navigation
- `src/components/layout/MobileNav.tsx` - Mobile bottom navigation
- `src/components/layout/ThemeToggle.tsx` - Dark/light theme toggle

### Authentication Components

- `src/components/auth/LoginForm.tsx` - Login form (Spanish UI)
- `src/components/auth/SignUpForm.tsx` - Registration form (Spanish UI)
- `src/components/auth/PasswordResetForm.tsx` - Password reset form (Spanish UI)
- `src/components/auth/EmailVerification.tsx` - Email verification display

### Dashboard Components

- `src/components/dashboard/UserDashboard.tsx` - Regular user dashboard
- `src/components/dashboard/AdminDashboard.tsx` - Admin dashboard with stats
- `src/components/dashboard/SuperAdminDashboard.tsx` - Super Admin dashboard with system stats

### User Management Components

- `src/components/users/UserList.tsx` - User list container
- `src/components/users/UserTable.tsx` - User table with search/filter
- `src/components/users/CreateUserForm.tsx` - Create user form
- `src/components/users/EditUserForm.tsx` - Edit user form
- `src/components/users/ResetPasswordDialog.tsx` - Password reset dialog

### Profile Components

- `src/components/profile/ProfileView.tsx` - Profile display
- `src/components/profile/ProfileEdit.tsx` - Profile edit form
- `src/components/profile/ChangePasswordForm.tsx` - Change password form
- `src/components/profile/ProfilePictureUpload.tsx` - File upload component

### Custom Hooks

- `src/hooks/useAuth.ts` - Authentication state hook
- `src/hooks/useUser.ts` - User data hook
- `src/hooks/useUsers.ts` - User list hook (for admins)
- `src/hooks/useProfile.ts` - Profile management hook
- `src/hooks/useFileUpload.ts` - File upload hook

### Utility Functions

- `src/lib/utils.ts` - General utilities (cn, etc.)
- `src/lib/constants.ts` - App constants

### Notes

- All user-facing text (component labels, buttons, messages) must be in Spanish
- All backend code (function names, variables, comments, API routes) must be in English
- Use ONLY shadcn/ui components from `src/components/ui/`
- All forms should use React Hook Form + Zod validation
- All API routes must validate authentication and roles
- Mobile-first responsive design approach
- Implement proper error handling with Spanish error messages for users

---

## Tasks

- [x] 1.0 Project Foundation & Setup
  - [x] 1.1 Initialize Next.js 15 project with TypeScript, App Router, and src directory structure with the name "cemse-ia"
  - [x] 1.2 Install and configure Tailwind CSS 3.4.17 with PostCSS and Autoprefixer
  - [x] 1.3 Initialize shadcn/ui, install base dependencies (@radix-ui, class-variance-authority, clsx, tailwind-merge)
  - [x] 1.4 Install Supabase dependencies (@supabase/supabase-js, @supabase/ssr)
  - [x] 1.5 Install Prisma 6.4.0 and @prisma/client
  - [x] 1.6 Install additional dependencies (react-hook-form, zod, @tanstack/react-query, framer-motion, lucide-react, crypto-js)
  - [x] 1.7 Create Supabase project and configure Authentication, Database, and Storage
  - [x] 1.8 Setup environment variables (.env.local, .env.example) for Supabase connection
  - [x] 1.9 Install and configure ESLint and Prettier
  - [x] 1.10 Setup TypeScript strict mode configuration

- [x] 2.0 Database Schema & Prisma Configuration
  - [x] 2.1 Create Prisma schema file with Profile model (id, authUserId, email, name, phone, department, pfpUrl, biography, role, forcePasswordChange, timestamps)
  - [x] 2.2 Define Role enum (SUPER_ADMIN, ADMIN, USER)
  - [x] 2.3 Add database indexes for email and role fields
  - [x] 2.4 Configure Prisma client singleton in src/lib/prisma/client.ts
  - [x] 2.5 Create initial database migration
  - [x] 2.6 Create seed script (prisma/seed.ts) for initial Super Admin user
  - [x] 2.7 Generate Prisma client and types
  - [x] 2.8 Run migrations and seed database
  - [x] 2.9 Configure Supabase Storage bucket "user-profile-pictures" with proper permissions (public read, authenticated write)

- [x] 3.0 Authentication System Implementation
  - [x] 3.1 Create Supabase client utilities (browser, server, admin) in src/lib/supabase/
  - [x] 3.2 Create authentication utility functions in src/lib/auth.ts
  - [x] 3.3 Create permission checking utilities in src/lib/permissions.ts
  - [x] 3.4 Create Zod validation schemas in src/lib/validations.ts for sign-up, login, password reset
  - [x] 3.5 Create API route /api/auth/register (POST) - handle user registration with default "user" role
  - [x] 3.6 Create API route /api/auth/sign-in (POST) - authenticate and create session
  - [x] 3.7 Create API route /api/auth/logout (POST) - clear session
  - [x] 3.8 Create API route /api/auth/reset-password (POST) - handle password reset requests
  - [x] 3.9 Create /app/(auth)/sign-in/page.tsx - Login page with Spanish UI
  - [x] 3.10 Create /app/(auth)/sign-up/page.tsx - Registration page with Spanish UI
  - [x] 3.11 Create /app/(auth)/forgot-password/page.tsx - Password reset request page
  - [x] 3.12 Create /app/(auth)/reset-password/page.tsx - Password reset confirmation page
  - [x] 3.13 Create /app/(auth)/verify-email/page.tsx - Email verification page
  - [x] 3.14 Create auth layout in /app/(auth)/layout.tsx
  - [x] 3.15 Create LoginForm, SignUpForm, PasswordResetForm components in src/components/auth/ with Spanish labels
  - [x] 3.16 Implement email verification flow
  - [x] 3.17 Implement password reset flow with Supabase Auth

- [x] 4.0 User Profile Management
  - [x] 4.1 Create API route /api/profile (GET, PATCH) - get and update current user profile
  - [x] 4.2 Create API route /api/profile/change-password (POST) - handle password change with forcePasswordChange logic
  - [x] 4.3 Create API route /api/files/upload (POST) - handle file upload to Supabase Storage
  - [x] 4.4 Create API route /api/files/delete (DELETE) - handle file deletion from Supabase Storage
  - [x] 4.5 Create /app/(dashboard)/profile/page.tsx - Profile page
  - [x] 4.6 Create ProfileView component in src/components/profile/
  - [x] 4.7 Create ProfileEdit component in src/components/profile/
  - [x] 4.8 Create ChangePasswordForm component with conditional current password requirement
  - [x] 4.9 Create ProfilePictureUpload component with file validation, preview, and upload progress
  - [x] 4.10 Implement useProfile hook for profile CRUD operations
  - [x] 4.11 Implement useFileUpload hook for file upload management
  - [x] 4.12 Handle profile picture upload with unique filename generation
  - [x] 4.13 Handle old profile picture deletion when replaced

- [x] 5.0 Role-Based Authorization & Middleware
  - [x] 5.1 Create middleware.ts in root for authentication and role-based route protection
  - [x] 5.2 Implement authentication check in middleware
  - [x] 5.3 Implement role-based authorization logic (USER, ADMIN, SUPER_ADMIN)
  - [x] 5.4 Implement route protection for /dashboard group (authenticated users only)
  - [x] 5.5 Implement route protection for /users (Admin and Super Admin only)
  - [x] 5.6 Implement route protection for /users/create (role-based permissions)
  - [x] 5.7 Handle forcePasswordChange redirect to password change page
  - [x] 5.8 Create AuthContext for global auth state management
  - [x] 5.9 Create useAuth hook for accessing auth state
  - [x] 5.10 Implement session persistence across page refreshes
  - [x] 5.11 Create permission checking utilities for API routes
  - [x] 5.12 Add role validation to all protected API routes

- [ ] 6.0 User Management Features (Admin/Super Admin)
  - [x] 6.1 Create API route /api/users (GET list, POST create) with role-based filtering
  - [x] 6.2 Create API route /api/users/[id] (GET, PATCH, DELETE) with permission checks
  - [x] 6.3 Create API route /api/users/[id]/reset-password (POST) for admin password resets
  - [x] 6.4 Create /app/(dashboard)/users/page.tsx - User list page (Admin/Super Admin)
  - [x] 6.5 Create /app/(dashboard)/users/create/page.tsx - Create user page
  - [x] 6.6 Create /app/(dashboard)/users/[id]/page.tsx - User detail/edit page
  - [x] 6.7 Create UserList component in src/components/users/
  - [x] 6.8 Create UserTable component with search, filter, pagination, and sorting
  - [x] 6.9 Create CreateUserForm component with role selection (Admin can only create Users)
  - [x] 6.10 Create EditUserForm component with permission-based field editing
  - [x] 6.11 Create ResetPasswordDialog component for admin-triggered password resets
  - [x] 6.12 Implement useUsers hook for user list operations
  - [x] 6.13 Implement user creation with random password generation and email notification
  - [x] 6.14 Implement user update with role change restrictions (Admin cannot create Admins)
  - [x] 6.15 Implement user deletion with confirmation dialog
  - [x] 6.16 Implement admin password reset with forcePasswordChange flag
  - [x] 6.17 Implement prevention of self-deletion

  - [ ] 7.0 UI Components & Layouts
  - [x] 7.1 Install and configure all required shadcn/ui components (button, input, card, table, dialog, toast, select, textarea, label, badge, avatar, sheet, skeleton, dropdown-menu)
  - [x] 7.2 Create ThemeContext for dark/light theme management
  - [x] 7.3 Create ThemeToggle component with localStorage persistence
  - [x] 7.4 Setup root layout (src/app/layout.tsx) with theme provider
  - [x] 7.5 Create providers wrapper (src/providers.tsx) with AuthContext, ThemeContext, QueryProvider
  - [x] 7.6 Create dashboard layout (src/app/(dashboard)/layout.tsx) with Header and Sidebar
  - [x] 7.7 Create Header component with user info, theme toggle, and logout button
  - [x] 7.8 Create Sidebar component with navigation (Desktop)
  - [x] 7.9 Create MobileNav component with bottom navigation bar
  - [x] 7.10 Implement responsive navigation (sidebar for desktop, bottom nav for mobile)
  - [x] 7.11 Create React Query provider setup
  - [x] 7.12 Implement toast notifications with Spanish messages
  - [x] 7.13 Create 404 page for invalid routes
  - [x] 7.14 Create 403 page for unauthorized access

- [ ] 8.0 Dashboard Views & Statistics
  - [x] 8.1 Create /app/(dashboard)/dashboard/page.tsx - Main dashboard
  - [x] 8.2 Create UserDashboard component with personalized welcome, profile completeness, quick actions
  - [x] 8.3 Create AdminDashboard component with organization statistics (total users, new users this month/week, activity timeline)
  - [x] 8.4 Create SuperAdminDashboard component with system-wide statistics (all users count by role, recent registrations, user growth charts)
  - [x] 8.5 Implement role-based dashboard content switching
  - [x] 8.6 Create statistics cards with responsive grid layout
  - [x] 8.7 Implement charts/graphs for user growth and activity (responsive)
  - [x] 8.8 Add quick action buttons in dashboards (Edit profile, Create user, etc.)
  - [x] 8.9 Implement empty states for dashboards

- [x] 9.0 Polish, Responsive Design & Testing
  - [x] 9.1 Ensure all forms have proper validation with Spanish error messages
  - [x] 9.2 Implement loading states (skeleton loaders) for async content
  - [x] 9.3 Add proper ARIA labels and accessibility attributes to all interactive elements
  - [x] 9.4 Implement keyboard navigation support throughout the app
  - [x] 9.5 Ensure WCAG AA color contrast standards
  - [x] 9.6 Test responsive design on mobile (iPhone, Android), tablet, and desktop
  - [x] 9.7 Optimize images using Next.js Image component
  - [x] 9.8 Add proper error boundaries and error handling
  - [x] 9.9 Implement proper form loading states and disabled buttons during submission
  - [x] 9.10 Add success confirmations for all user actions
  - [x] 9.11 Test all authentication flows (sign-up, login, logout, password reset)
  - [x] 9.12 Test all profile management operations (CRUD, file upload, password change)
  - [x] 9.13 Test role-based access (try accessing unauthorized routes)
  - [x] 9.14 Test user management features (create, edit, delete, reset password)
  - [x] 9.15 Test forcePasswordChange functionality
  - [x] 9.16 Verify all UI text is in Spanish
  - [x] 9.17 Verify all code/backend is in English
  - [x] 9.18 Run TypeScript compilation check
  - [x] 9.19 Run ESLint and fix all warnings
  - [x] 9.20 Test build process
  - [x] 9.21 Cross-browser testing (Chrome, Firefox, Safari, Edge)
