import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nickname } = await request.json();
    
    if (!nickname || !nickname.trim()) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }
    
    // Check if room exists and is active
    const gameRoom = await db.gameRoom.findUnique({
      where: { id },
    });
    
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game room not found' },
        { status: 404 }
      );
    }
    
    // Check if nickname is already taken in this room
    const existingParticipant = await db.participant.findFirst({
      where: {
        roomId: id,
        nickname: nickname.trim(),
      },
    });
    
    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Nickname already taken in this room' },
        { status: 400 }
      );
    }
    
    // Create participant
    const participant = await db.participant.create({
      data: {
        roomId: id,
        nickname: nickname.trim(),
        score: 0,
        isActive: true,
      },
    });
    
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error joining game room:', error);
    return NextResponse.json(
      { error: 'Failed to join game room' },
      { status: 500 }
    );
  }
}