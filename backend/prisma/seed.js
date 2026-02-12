import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // Clear existing data to avoid conflicts during re-seed
  // Order matters due to foreign keys
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleared existing data');

  // 1. Create Default User with Password
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@identityhub.com',
      name: 'System Admin',
      password_hash: passwordHash,
    },
  });
  console.log(`✅ Created user: ${adminUser.email}`);

  // 2. Create Default Workspace
  const mainWorkspace = await prisma.workspace.create({
    data: {
      name: 'IdentityHub Main',
      created_by: adminUser.id,
      updated_by: adminUser.id
    },
  });
  console.log(`✅ Created workspace: ${mainWorkspace.name}`);

  // 3. Link User to Workspace
  await prisma.workspaceMember.create({
    data: {
      user_id: adminUser.id,
      workspace_id: mainWorkspace.id,
      role: 'ADMIN',
      created_by: adminUser.id,
      updated_by: adminUser.id
    },
  });
  console.log(`✅ Linked user to workspace as ADMIN`);

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
