import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@identityhub.com';
  const user = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!user) {
    console.error('Admin user not found');
    return;
  }

  const workspaces = await prisma.workspace.findMany();
  console.log(`Found ${workspaces.length} workspaces.`);

  for (const ws of workspaces) {
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        user_id_workspace_id: {
          user_id: user.id,
          workspace_id: ws.id
        }
      }
    });

    if (!existing) {
      console.log(`Adding membership for workspace: ${ws.name}`);
      await prisma.workspaceMember.create({
        data: {
          user_id: user.id,
          workspace_id: ws.id,
          role: 'ADMIN',
          created_by: 'system',
          updated_by: 'system'
        }
      });
    } else {
      console.log(`User already member of: ${ws.name}`);
    }
  }

  console.log('Membership fix complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
