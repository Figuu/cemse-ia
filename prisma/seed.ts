import { createAdminClient } from "../src/lib/supabase/admin";
import { prisma } from "../src/lib/prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // Get admin client
  const supabase = createAdminClient();

  // Get environment variables
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL || "admin@admin.com";
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD || "12345678";
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  try {
    // Helper function to create user in Supabase Auth and Prisma
    const createUser = async (
      email: string,
      password: string,
      name: string,
      role: "SUPER_ADMIN" | "ADMIN" | "DIRECTOR" | "PROFESOR" | "USER",
      schoolId?: string
    ) => {
      // Check if profile already exists
      const existingProfile = await prisma.profile.findUnique({
        where: { email },
      });

      if (existingProfile) {
        console.log(`✅ ${role} profile already exists: ${email}`);
        return existingProfile;
      }

      console.log(`📝 Creating ${role} user in Supabase Auth...`);

      // Create user in Supabase Auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            role,
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

      console.log(`✅ User created in Supabase Auth: ${authUser.user.id}`);

      // Create profile in database
      const profile = await prisma.profile.create({
        data: {
          authUserId: authUser.user.id,
          email,
          name,
          role,
          schoolId,
          forcePasswordChange: true,
        },
      });

      console.log(`✅ ${role} profile created: ${email}`);
      return profile;
    };

    // 1. Create Super Admin
    console.log("\n👑 Creating Super Admin...");
    await createUser(
      superAdminEmail,
      superAdminPassword,
      superAdminName,
      "SUPER_ADMIN"
    );

    // 2. Create Admin users
    console.log("\n👨‍💼 Creating Admin users...");
    const adminUsers = [
      {
        email: "admin1@admin.com",
        password: "12345678",
        name: "Admin Usuario 1",
      },
      {
        email: "admin2@admin.com",
        password: "12345678",
        name: "Admin Usuario 2",
      },
    ];

    for (const admin of adminUsers) {
      await createUser(admin.email, admin.password, admin.name, "ADMIN");
    }

    // 3. Create Schools
    console.log("\n🏫 Creating Schools...");
    const schools = [
      {
        name: "Escuela Primaria Central",
        code: "EPC001",
        type: "PUBLIC" as const,
        address: "Calle Principal 123",
        district: "Distrito Central",
        phone: "+1234567890",
        email: "epc001@school.edu",
      },
      {
        name: "Instituto Secundario Moderno",
        code: "ISM002",
        type: "PRIVATE" as const,
        address: "Avenida Libertad 456",
        district: "Distrito Norte",
        phone: "+1234567891",
        email: "ism002@school.edu",
      },
      {
        name: "Colegio Técnico Nacional",
        code: "CTN003",
        type: "SUBSIDIZED" as const,
        address: "Boulevard Tecnológico 789",
        district: "Distrito Sur",
        phone: "+1234567892",
        email: "ctn003@school.edu",
      },
    ];

    const createdSchools = [];
    for (const schoolData of schools) {
      const existingSchool = await prisma.school.findUnique({
        where: { code: schoolData.code },
      });

      if (existingSchool) {
        console.log(`✅ School already exists: ${schoolData.name}`);
        createdSchools.push(existingSchool);
      } else {
        const school = await prisma.school.create({
          data: schoolData,
        });
        console.log(`✅ School created: ${school.name} (${school.code})`);
        createdSchools.push(school);
      }
    }

    // 4. Create Director users and attach to schools
    console.log("\n🎓 Creating Director users...");
    const directors = [
      {
        email: "director1@school.edu",
        password: "12345678",
        name: "Director Primaria Central",
        schoolId: createdSchools[0].id,
      },
      {
        email: "director2@school.edu",
        password: "12345678",
        name: "Director Instituto Moderno",
        schoolId: createdSchools[1].id,
      },
      {
        email: "director3@school.edu",
        password: "12345678",
        name: "Director Colegio Técnico",
        schoolId: createdSchools[2].id,
      },
    ];

    for (const director of directors) {
      await createUser(
        director.email,
        director.password,
        director.name,
        "DIRECTOR",
        director.schoolId
      );
    }

    // 5. Create Teacher (PROFESOR) users and attach to schools
    console.log("\n👨‍🏫 Creating Teacher users...");
    const teachers = [
      {
        email: "profesor1@school.edu",
        password: "12345678",
        name: "Profesor María González",
        schoolId: createdSchools[0].id,
      },
      {
        email: "profesor2@school.edu",
        password: "12345678",
        name: "Profesor Juan Pérez",
        schoolId: createdSchools[0].id,
      },
      {
        email: "profesor3@school.edu",
        password: "12345678",
        name: "Profesora Ana Martínez",
        schoolId: createdSchools[1].id,
      },
      {
        email: "profesor4@school.edu",
        password: "12345678",
        name: "Profesor Carlos Rodríguez",
        schoolId: createdSchools[1].id,
      },
      {
        email: "profesor5@school.edu",
        password: "12345678",
        name: "Profesora Laura Sánchez",
        schoolId: createdSchools[2].id,
      },
      {
        email: "profesor6@school.edu",
        password: "12345678",
        name: "Profesor Miguel Torres",
        schoolId: createdSchools[2].id,
      },
    ];

    for (const teacher of teachers) {
      await createUser(
        teacher.email,
        teacher.password,
        teacher.name,
        "PROFESOR",
        teacher.schoolId
      );
    }

    // Summary
    console.log("\n✨ Seed completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Super Admin: ${superAdminEmail}`);
    console.log(`   - Admin users: ${adminUsers.length}`);
    console.log(`   - Schools: ${createdSchools.length}`);
    console.log(`   - Directors: ${directors.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log("\n⚠️  IMPORTANT: All passwords are '12345678' - change them after first login!");
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

