import { config } from "dotenv";
import { createAdminClient } from "../src/lib/supabase/admin";

// Load environment variables
config();

interface BucketConfig {
  name: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
  description: string;
}

const BUCKETS: BucketConfig[] = [
  {
    name: "user-profile-pictures",
    public: true,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    fileSizeLimit: 5242880, // 5MB
    description: "Profile pictures for users",
  },
  {
    name: "case-evidence",
    public: true,
    allowedMimeTypes: [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-m4a",
      // Video
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ],
    fileSizeLimit: 10485760, // 10MB
    description: "Evidence files for case reports",
  },
  {
    name: "library",
    public: true,
    allowedMimeTypes: [], // Allow all file types for library
    fileSizeLimit: 52428800, // 50MB
    description: "Library files for educational resources",
  },
];

async function createBucket(
  supabase: any,
  config: BucketConfig
): Promise<boolean> {
  const { name, public: isPublic, allowedMimeTypes, fileSizeLimit } = config;

  console.log(`\n📝 Creating bucket "${name}"...`);

  const { error: createError } = await supabase.storage.createBucket(name, {
    public: isPublic,
    allowedMimeTypes,
    fileSizeLimit,
  });

  if (createError) {
    console.error(`❌ Failed to create bucket "${name}":`, createError.message);
    return false;
  }

  console.log(`✅ Bucket "${name}" created successfully!`);
  console.log(`   Description: ${config.description}`);
  console.log(`   Public: ${isPublic}`);
  console.log(`   File size limit: ${(fileSizeLimit / 1024 / 1024).toFixed(0)}MB`);
  console.log(`   Allowed MIME types: ${allowedMimeTypes.length} types`);

  return true;
}

async function setupStorage() {
  console.log("🗂️  Setting up Supabase Storage buckets...\n");

  const supabase = createAdminClient();

  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    console.log(`📊 Found ${existingBuckets?.length || 0} existing bucket(s)\n`);

    let createdCount = 0;
    let skippedCount = 0;

    // Process each bucket
    for (const bucketConfig of BUCKETS) {
      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === bucketConfig.name
      );

      if (bucketExists) {
        console.log(`⏭️  Bucket "${bucketConfig.name}" already exists - skipping`);
        skippedCount++;
        continue;
      }

      const created = await createBucket(supabase, bucketConfig);
      if (created) {
        createdCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Created: ${createdCount} bucket(s)`);
    console.log(`⏭️  Skipped: ${skippedCount} bucket(s)`);
    console.log(`📦 Total: ${BUCKETS.length} bucket(s) configured`);

    // Policy configuration instructions
    console.log("\n" + "=".repeat(60));
    console.log("⚠️  IMPORTANT: Configure Storage Policies");
    console.log("=".repeat(60));
    console.log("\nGo to Supabase Dashboard → Storage → [Bucket] → Policies\n");

    console.log("📝 For 'user-profile-pictures' bucket:");
    console.log("   1. Public read: Allow SELECT for public/anonymous users");
    console.log("   2. Authenticated upload: Allow INSERT/UPDATE for authenticated users\n");

    console.log("📝 For 'case-evidence' bucket:");
    console.log("   1. Public read: Allow SELECT for public users");
    console.log("   2. Authenticated upload: Allow INSERT for authenticated users");
    console.log("   3. Authenticated delete: Allow DELETE for authenticated users\n");

    console.log("💡 Example SQL policies (run in Supabase SQL Editor):\n");
    console.log("-- For case-evidence bucket:");
    console.log(`
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
    `);

    console.log("\n✨ Storage setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up storage:", error);
    throw error;
  }
}

setupStorage()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n💥 Setup failed:", error);
    process.exit(1);
  });
