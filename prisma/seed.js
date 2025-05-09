import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultCharacters = [
    {
      name: 'Eleanor',
      description: 'A wise mentor with deep empathy.',
      overview: 'Helps users explore thoughtful questions.',
      avatar: 'https://example.com/eleanor.png',
      gender: 'Female'
    },
    {
      name: 'Max',
      description: 'A playful and clever AI.',
      overview: 'Engages users in creative thinking.',
      avatar: 'https://example.com/max.png',
      gender: 'Male'
    }
  ];

  for (const character of defaultCharacters) {
    const exists = await prisma.DFTcharacter.findFirst({
      where: { name: character.name }
    });

    if (!exists) {
      await prisma.DFTcharacter.create({ data: character });
    }
  }

  console.log('Default characters seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
