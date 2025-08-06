import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameRoom = await db.gameRoom.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: {
            score: 'desc',
          },
        },
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
    });
    
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game room not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(gameRoom);
  } catch (error) {
    console.error('Error fetching game room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Delete related records first
    await db.gameSession.deleteMany({
      where: { roomId: id },
    });
    
    await db.answer.deleteMany({
      where: {
        question: {
          roomId: id,
        },
      },
    });
    
    await db.question.deleteMany({
      where: { roomId: id },
    });
    
    await db.participant.deleteMany({
      where: { roomId: id },
    });
    
    // Delete the game room
    await db.gameRoom.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Game room deleted successfully' });
  } catch (error) {
    console.error('Error deleting game room:', error);
    return NextResponse.json(
      { error: 'Failed to delete game room' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json();
    
    switch (action) {
      case 'start':
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
        
        return NextResponse.json({ message: 'Game started' });
        
      case 'end':
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
        
        return NextResponse.json({ message: 'Game ended' });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating game room:', error);
    return NextResponse.json(
      { error: 'Failed to update game room' },
      { status: 500 }
    );
  }
}