import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      text,
      type,
      options,
      correctAnswer,
      points = 1,
      imageUrl,
      attachmentUrl,
      timerEnabled = false,
      timerMinutes = 0,
      timerSeconds = 30,
    } = await request.json();
    
    // Get the current highest order number for this room
    const lastQuestion = await db.question.findFirst({
      where: { roomId: id },
      orderBy: { order: 'desc' },
    });
    
    const order = lastQuestion ? lastQuestion.order + 1 : 1;
    
    // Create the question
    const question = await db.question.create({
      data: {
        roomId: id,
        text,
        type,
        options: options || null,
        correctAnswer,
        points,
        imageUrl: imageUrl || null,
        attachmentUrl: attachmentUrl || null,
        timerEnabled,
        timerMinutes,
        timerSeconds,
        order,
      },
    });
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await db.question.findMany({
      where: { roomId: id },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}