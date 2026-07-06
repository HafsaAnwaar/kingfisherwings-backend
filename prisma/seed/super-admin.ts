import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../../src/common/utils/password.util';

const prisma = new PrismaClient();

const EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'owner@fresagold.internal';
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'ChangeMe@2026!';
const FIRST_NAME = process.env.SUPER_ADMIN_FIRST_NAME ?? 'Platform';
const LAST_NAME = process.env.SUPER_ADMIN_LAST_NAME ?? 'Owner';

async function main() {
  const existing = await prisma.superAdmin.findFirst({ where: { email: EMAIL } });

  if (existing) {
    console.log(`Super admin already exists: ${EMAIL}`);
    return;
  }

  const passwordHash = await PasswordUtil.hash(PASSWORD);

  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: EMAIL,
      password_hash: passwordHash,
      first_name: FIRST_NAME,
      last_name: LAST_NAME,
    },
  });

  console.log('Super admin created:');
  console.log(`  id:       ${superAdmin.id}`);
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  console.log('\nLog in at POST /auth/super-admin/login, then rotate this password.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
