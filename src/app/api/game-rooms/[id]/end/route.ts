import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // End active game session
    await db.gameSession.updateMany({
      where: {
        roomId: id,
        status: 'ACTIVE',
      },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });
    
    // Update room status
    await db.gameRoom.update({
      where: { id },
      data: { isActive: false },
    });
    
    return NextResponse.json({ message: 'Game ended successfully' });
  } catch (error) {
    console.error('Error ending game:', error);
    return NextResponse.json(
      { error: 'Failed to end game' },
      { status: 500 }
    );
  }
}