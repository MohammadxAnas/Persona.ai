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

  // Create a chat session between the user and AI
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      characterId: aiCharacter.id,
      startedAt: new Date(),
    },
  });

  // Create a message from the user to the AI character within the chat session
  const userMessage = await prisma.message.create({
    data: {
      userId: user.id,
      characterId: aiCharacter.id,
      chatSessionId: chatSession.id, // Link to chat session
      sender: 'USER',
      content: 'Hello NeoBot! How are you today?',
    },
  });

  // AI responds to the user's message
  const aiResponse = await prisma.message.create({
    data: {
      userId: user.id,
      characterId: aiCharacter.id,
      chatSessionId: chatSession.id, // Link to chat session
      sender: 'AI',
      content: 'I am doing great, Alice! How can I assist you today?',
    },
  });

  console.log('✅ User Created:', user);
  console.log('🤖 AI Character Created:', aiCharacter);
  console.log('💬 Chat Session Created:', chatSession);
  console.log('💬 User Message Created:', userMessage);
  console.log('💬 AI Response Created:', aiResponse);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
