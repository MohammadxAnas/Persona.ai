const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed_password',
      confirmationCode: '123456',
      codeExpiresAt: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
    },
  });

  // Create an AICharacter linked to that user
  const aiCharacter = await prisma.aICharacter.create({
    data: {
      name: 'NeoBot',
      avatar: 'https://example.com/avatar.png',
      description: 'A friendly AI companion',
      personality: 'Witty and smart',
      aiModel: 'gpt-4',
      userId: user.id, // Link via userId
    },
  });

  console.log('✅ User Created:', user);
  console.log('🤖 AI Character Created:', aiCharacter);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
