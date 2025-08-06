import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Create or update game session
    const existingSession = await db.gameSession.findFirst({
      where: {
        roomId: id,
        status: 'ACTIVE',
      },
    });
    
    if (!existingSession) {
      await db.gameSession.create({
        data: {
          roomId: id,
          status: 'ACTIVE',
          startedAt: new Date(),
          currentQuestionIndex: 0,
        },
      });
    }
    
    // Update room status
    await db.gameRoom.update({
      where: { id },
      data: { isActive: true },
    });
    
    return NextResponse.json({ message: 'Game started successfully' });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}