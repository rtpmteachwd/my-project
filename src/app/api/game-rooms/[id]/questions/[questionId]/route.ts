import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const {
      text,
      type,
      options,
      correctAnswer,
      points,
      imageUrl,
      attachmentUrl,
      timerEnabled,
      timerMinutes,
      timerSeconds,
    } = await request.json();
    
    // Update the question
    const question = await db.question.update({
      where: { 
        id: questionId,
        roomId: id,
      },
      data: {
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
      },
    });
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    
    // Delete related answers first
    await db.answer.deleteMany({
      where: {
        questionId,
      },
    });
    
    // Delete the question
    await db.question.delete({
      where: { 
        id: questionId,
        roomId: id,
      },
    });
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}