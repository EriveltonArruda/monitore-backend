"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(`Iniciando o processo de seeding...`);
    const user1 = await prisma.user.create({
        data: {
            email: 'admin@monitore.com',
            name: 'Admin Principal',
            password: 'supersecret',
        },
    });
    console.log(`Usuário criado: ${user1.name} (ID: ${user1.id})`);
    console.log(`Seeding finalizado.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map