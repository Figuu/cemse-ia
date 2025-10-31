# Supabase Storage Bucket Setup for Case Evidence Files

This document explains how to set up the Supabase storage bucket for uploading case evidence files (images, PDFs, audio, video).

## Steps to Create the Storage Bucket

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### 2. Navigate to Storage

1. In the left sidebar, click on **Storage**
2. You'll see the Storage buckets page

### 3. Create New Bucket

1. Click the **"New bucket"** button
2. Fill in the bucket details:
   - **Name**: `case-evidence`
   - **Public bucket**: ✅ **Check this** (files need to be publicly accessible via URLs)
   - **File size limit**: `10485760` (10 MB in bytes)
   - **Allowed MIME types**: Leave empty or specify:
     ```
     image/jpeg
     image/jpg
     image/png
     image/gif
     image/webp
     application/pdf
     audio/mpeg
     audio/mp3
     audio/wav
     audio/x-m4a
     video/mp4
     video/quicktime
     video/x-msvideo
     ```

3. Click **"Create bucket"**

### 4. Configure Bucket Policies

After creating the bucket, you need to set up the policies for file access:

1. Click on the `case-evidence` bucket
2. Go to the **Policies** tab
3. Click **"New policy"**

#### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'case-evidence'
);
```

#### Policy 2: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'case-evidence'
);
```

#### Policy 3: Allow Authenticated Users to Delete Their Files

```sql
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'case-evidence'
);
```

### 5. Verify Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Organization Structure

Files uploaded to the bucket will be organized with the following structure:

```
case-evidence/
├── [caseId]/
│   ├── [userId]/
│   │   ├── [timestamp1].[ext]
│   │   ├── [timestamp2].[ext]
│   │   └── ...
```

Example:
```
case-evidence/
├── case-123-abc/
│   ├── user-456-def/
│   │   ├── 1704067200000.jpg
│   │   ├── 1704067201000.pdf
│   │   └── 1704067202000.mp4
```

## Supported File Types

The system supports the following file types:

### Images
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Documents
- PDF (`.pdf`)

### Audio
- MP3 (`.mp3`)
- WAV (`.wav`)
- M4A (`.m4a`)

### Video
- MP4 (`.mp4`)
- MOV (`.mov`)
- AVI (`.avi`)

## File Size Limits

- **Maximum file size**: 10 MB per file
- **Validation**: Performed both on client-side and server-side

## Security Considerations

1. **Public Access**: The bucket is set to public to allow viewing evidence files via URLs. However:
   - File uploads are restricted to authenticated users only
   - File deletions are restricted to authenticated users only
   - The case detail pages are protected by role-based access control

2. **File Naming**: Files are renamed with timestamps to prevent conflicts and hide original filenames

3. **Access Control**: Even though files are publicly accessible via direct URL:
   - Case pages are protected by middleware
   - Only users with proper roles can view cases and their associated files
   - File URLs are only displayed to authorized users through the case detail page

## Testing the Setup

After creating the bucket, you can test it by:

1. Starting the development server:
   ```bash
   npm run dev
   ```

2. Logging in as a Director or Professor

3. Creating a new case and uploading evidence files

4. Verifying:
   - Files appear in the Supabase Storage dashboard
   - Files are accessible via the generated URLs
   - Files display correctly in the case detail page

## Troubleshooting

### Files not uploading
- Check that the bucket name in `src/lib/storage.ts` matches: `case-evidence`
- Verify environment variables are correct
- Check browser console for CORS errors
- Ensure the bucket is set to public

### Permission denied errors
- Verify the storage policies are correctly set
- Check that the user is authenticated
- Ensure the Supabase anon key is correct

### Files not displaying
- Check that the bucket is set to public
- Verify the file URLs are being generated correctly
- Check browser console for loading errors
- Ensure the file types are supported

## Additional Configuration (Optional)

### Add Image Transformation

You can enable Supabase's image transformation features for thumbnails:

1. Go to Storage settings
2. Enable image transformation
3. Update code to use transformed URLs:

```typescript
const { data: urlData } = supabase.storage
  .from(CASE_EVIDENCE_BUCKET)
  .getPublicUrl(data.path, {
    transform: {
      width: 300,
      height: 300,
      quality: 80,
    }
  });
```

### Set up Lifecycle Policies

To automatically delete old files:

1. Go to bucket settings
2. Add lifecycle rule to delete files older than X days
3. Useful for managing storage costs

## Summary

Once the `case-evidence` bucket is created with the correct policies:

✅ Authenticated users can upload evidence files
✅ Files are organized by case and user
✅ Public URLs are generated for viewing
✅ File access is controlled through role-based page protection
✅ Files can be deleted by authorized users

The case reporting system is now fully functional with file upload support!
