import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { title, maxAttempts = 3 } = await request.json();
    
    // Generate a unique room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create the game room
    const gameRoom = await db.gameRoom.create({
      data: {
        roomCode,
        title,
        maxAttempts,
        isActive: false,
      },
    });
    
    return NextResponse.json(gameRoom);
  } catch (error) {
    console.error('Error creating game room:', error);
    return NextResponse.json(
      { error: 'Failed to create game room' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const gameRooms = await db.gameRoom.findMany({
      include: {
        participants: true,
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        gameSessions: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(gameRooms);
  } catch (error) {
    console.error('Error fetching game rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game rooms' },
      { status: 500 }
    );
  }
}