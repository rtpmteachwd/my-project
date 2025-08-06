const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTimerColumns() {
  console.log('Adding timer columns to Question table...');
  
  try {
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    
    // Add timer columns to Question table
    console.log('Adding timer columns...');
    
    await prisma.$executeRaw`
      ALTER TABLE Question ADD COLUMN timerEnabled BOOLEAN DEFAULT 0
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE Question ADD COLUMN timerMinutes INTEGER DEFAULT 0
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE Question ADD COLUMN timerSeconds INTEGER DEFAULT 30
    `;
    
    console.log('Timer columns added successfully!');
    
  } catch (error) {
    console.error('Error adding timer columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTimerColumns();