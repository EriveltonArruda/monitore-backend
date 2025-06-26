import { PrismaClient } from '@prisma/client';

// Inicializa o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o processo de seeding...`);

  // Cria nosso primeiro usuário administrador
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@monitore.com',
      name: 'Admin Principal',
      // No mundo real, esta senha seria "hasheada" (criptografada)
      // antes de ser salva. Por enquanto, deixaremos como texto simples.
      password: 'supersecret', 
    },
  });

  console.log(`Usuário criado: ${user1.name} (ID: ${user1.id})`);
  console.log(`Seeding finalizado.`);
}

// Executa a função principal e lida com erros
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Fecha a conexão com o banco de dados
    await prisma.$disconnect();
  });
