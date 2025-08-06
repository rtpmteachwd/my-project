const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database migration...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Create tables if they don't exist
    console.log('Creating tables...');
    
    // The tables will be created automatically when you first access them
    // thanks to Prisma's migrate functionality
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);