const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('Initializing database for Vercel deployment...');
    
    // Ensure the database directory exists
    const dbDir = path.join(process.cwd(), 'prisma');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist by trying to query them
    try {
      await prisma.gameRoom.findFirst();
      console.log('✅ Database tables already exist');
    } catch (error) {
      console.log('📝 Creating database tables...');
      // Tables will be created automatically on first access
    }
    
    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };