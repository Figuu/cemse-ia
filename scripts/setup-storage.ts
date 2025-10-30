import { config } from "dotenv";
import { createAdminClient } from "../src/lib/supabase/admin";

// Load environment variables
config();

async function setupStorage() {
  console.log("🗂️  Setting up Supabase Storage bucket...");

  const supabase = createAdminClient();
  const bucketName = "user-profile-pictures";

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" already exists.`);
      console.log("\n📝 To configure permissions, go to Supabase Dashboard:");
      console.log("   Storage > Buckets > user-profile-pictures > Policies");
      console.log("\n   Configure the following policies:");
      console.log(
        "   1. Public read access: Enable public bucket or create SELECT policy"
      );
      console.log(
        "   2. Authenticated write: Create INSERT/UPDATE policy for authenticated users"
      );
      return;
    }

    console.log(`📝 Creating bucket "${bucketName}"...`);

    // Create bucket
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        fileSizeLimit: 5242880, // 5MB
      }
    );

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }

    console.log(`✅ Bucket "${bucketName}" created successfully!`);

    console.log("\n📋 Bucket Configuration:");
    console.log(`   Name: ${bucketName}`);
    console.log(`   Public: true`);
    console.log(
      `   Allowed MIME types: image/jpeg, image/png, image/gif, image/webp`
    );
    console.log(`   File size limit: 5MB`);

    console.log(
      "\n⚠️  Note: Configure RLS (Row Level Security) policies in Supabase Dashboard:"
    );
    console.log("   Storage > Buckets > user-profile-pictures > Policies");
    console.log("\n   Recommended policies:");
    console.log("   1. Public read: Allow SELECT for public/anonymous users");
    console.log(
      "   2. Authenticated upload: Allow INSERT/UPDATE for authenticated users only"
    );

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
