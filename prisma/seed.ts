import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hash = (password: string) => bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: await hash('Admin123!'),
      name: 'Alice Admin',
      role: Role.ADMIN,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'bob@demo.com',
      password: await hash('Member123!'),
      name: 'Bob Smith',
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'carol@demo.com',
      password: await hash('Member123!'),
      name: 'Carol Jones',
      role: Role.MEMBER,
    },
  });

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up CI/CD pipeline',
        description:
          'Configure GitHub Actions for automated testing and deployment.',
        deadline: nextWeek,
        status: TaskStatus.IN_PROGRESS,
        assigneeId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST endpoints with request/response examples.',
        deadline: nextWeek,
        status: TaskStatus.TODO,
        assigneeId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Design database schema v2',
        description: 'Add support for task categories and priorities.',
        deadline: nextMonth,
        status: TaskStatus.TODO,
        assigneeId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Fix login page responsiveness',
        description: 'Ensure the login form looks good on mobile devices.',
        deadline: nextWeek,
        status: TaskStatus.DONE,
        assigneeId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Code review for PR #42',
        description: 'Review and approve the authentication module changes.',
        deadline: nextMonth,
        status: TaskStatus.TODO,
        assigneeId: member1.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Seeded successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin : admin@demo.com  / Admin123!');
  console.log('  Member: bob@demo.com    / Member123!');
  console.log('  Member: carol@demo.com  / Member123!');
  console.log('');
  console.log('Tasks created: 5');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
