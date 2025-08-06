import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const roomCode = code.toUpperCase();
    
    const gameRoom = await db.gameRoom.findUnique({
      where: { roomCode },
      include: {
        participants: true,
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(gameRoom);
  } catch (error) {
    console.error('Error validating room code:', error);
    return NextResponse.json(
      { error: 'Failed to validate room code' },
      { status: 500 }
    );
  }
}