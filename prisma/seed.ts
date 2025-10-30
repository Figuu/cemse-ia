import { createAdminClient } from "../src/lib/supabase/admin";
import { prisma } from "../src/lib/prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // Get admin client
  const supabase = createAdminClient();

  // Get environment variables
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@cemse-ia.com";
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin123!";
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  try {
    // Check if Super Admin profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingProfile) {
      console.log("✅ Super Admin profile already exists. Skipping creation.");
      console.log(`📧 Email: ${existingProfile.email}`);
      console.log(`👤 Name: ${existingProfile.name}`);
      console.log(`🔐 Role: ${existingProfile.role}`);
      return;
    }

    console.log("📝 Creating Super Admin user in Supabase Auth...");

    // Create user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: superAdminEmail,
        password: superAdminPassword,
        email_confirm: true,
        user_metadata: {
          name: superAdminName,
          role: "SUPER_ADMIN",
        },
      });

    if (authError) {
      throw new Error(
        `Failed to create user in Supabase Auth: ${authError.message}`
      );
    }

    if (!authUser.user) {
      throw new Error(
        "User created but no user data returned from Supabase Auth"
      );
    }

    console.log("✅ User created in Supabase Auth");
    console.log(`📧 Auth User ID: ${authUser.user.id}`);

    // Create profile in database
    console.log("📝 Creating Super Admin profile in database...");

    const profile = await prisma.profile.create({
      data: {
        authUserId: authUser.user.id,
        email: superAdminEmail,
        name: superAdminName,
        role: "SUPER_ADMIN",
        forcePasswordChange: true,
      },
    });

    console.log("✅ Super Admin profile created successfully!");
    console.log(`📧 Email: ${profile.email}`);
    console.log(`👤 Name: ${profile.name}`);
    console.log(`🔐 Role: ${profile.role}`);
    console.log(`🆔 Profile ID: ${profile.id}`);
    console.log(`⚠️  Password change required: ${profile.forcePasswordChange}`);
    console.log("\n📋 Login credentials:");
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: ${superAdminPassword}`);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✨ Seed completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  });

