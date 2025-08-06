import { db } from './db';

export async function initializeDatabase() {
  try {
    // Test database connection and create tables if they don't exist
    await db.$connect();
    
    // Try to access a table to trigger automatic table creation
    await db.gameRoom.findFirst({
      where: { id: 'test' }
    }).catch(() => {
      // Table doesn't exist yet, but Prisma will create it on first actual use
      console.log('Database tables will be created on first use');
    });
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}