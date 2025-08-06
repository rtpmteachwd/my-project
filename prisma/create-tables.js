const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTables() {
  console.log('Creating database tables...');
  
  try {
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    
    // Create tables using raw SQL
    console.log('Creating tables...');
    
    // Create GameRoom table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS GameRoom (
        id TEXT PRIMARY KEY,
        roomCode TEXT UNIQUE,
        title TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 0,
        maxAttempts INTEGER DEFAULT 3,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        teacherId TEXT,
        FOREIGN KEY (teacherId) REFERENCES Teacher(id)
      )
    `;
    
    // Create Teacher table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Teacher (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create Participant table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Participant (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        roomId TEXT NOT NULL,
        FOREIGN KEY (roomId) REFERENCES GameRoom(id) ON DELETE CASCADE
      )
    `;
    
    // Create Question table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Question (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT,
        correctAnswer TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        imageUrl TEXT,
        attachmentUrl TEXT,
        "order" INTEGER NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        roomId TEXT NOT NULL,
        FOREIGN KEY (roomId) REFERENCES GameRoom(id) ON DELETE CASCADE
      )
    `;
    
    // Create Answer table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Answer (
        id TEXT PRIMARY KEY,
        answer TEXT NOT NULL,
        isCorrect BOOLEAN NOT NULL,
        attemptNumber INTEGER DEFAULT 1,
        timeTaken INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        questionId TEXT NOT NULL,
        participantId TEXT NOT NULL,
        gameSessionId TEXT NOT NULL,
        FOREIGN KEY (questionId) REFERENCES Question(id) ON DELETE CASCADE,
        FOREIGN KEY (participantId) REFERENCES Participant(id) ON DELETE CASCADE,
        FOREIGN KEY (gameSessionId) REFERENCES GameSession(id) ON DELETE CASCADE
      )
    `;
    
    // Create GameSession table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS GameSession (
        id TEXT PRIMARY KEY,
        currentQuestionIndex INTEGER DEFAULT 0,
        status TEXT DEFAULT 'WAITING',
        startedAt DATETIME,
        endedAt DATETIME,
        currentBuzzes TEXT,
        roomId TEXT NOT NULL,
        FOREIGN KEY (roomId) REFERENCES GameRoom(id) ON DELETE CASCADE
      )
    `;
    
    console.log('All tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();