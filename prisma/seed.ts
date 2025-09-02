import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`🔄 Iniciando o processo de seeding...`);

  // === ADMIN PRINCIPAL ===
  const adminPassword = await bcrypt.hash('supersecret', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@monitore.com' },
    update: {},
    create: {
      email: 'admin@monitore.com',
      name: 'Admin Principal',
      password: adminPassword,
      role: 'ADMIN',
      modules: '*', // libera todos os módulos
    },
  });

  // === ERIVELTON ===
  const eriveltonPassword = await bcrypt.hash('ErvMonitore1569', 10);
  const erivelton = await prisma.user.upsert({
    where: { email: 'erivelton@monitore.com' },
    update: {},
    create: {
      email: 'erivelton@monitore.com',
      name: 'Erivelton',
      password: eriveltonPassword,
      role: 'ADMIN',
      modules: '*',
    },
  });

  console.log(`✅ Usuários criados ou já existentes:`);
  console.log(`- ${admin.name} (${admin.email})`);
  console.log(`- ${erivelton.name} (${erivelton.email})`);

  console.log(`✨ Seeding finalizado.`);
}

main()
  .catch((e) => {
    console.error(`❌ Erro no seeding:`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
