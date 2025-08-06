import { Server } from 'socket.io';
import { db } from './db';

interface GameSession {
  roomId: string;
  currentQuestionIndex: number;
  buzzOrder: string[];
  currentAnswerer: string | null;
  attempts: number;
  status: 'waiting' | 'question' | 'buzzing' | 'answering' | 'revealed';
}

const activeGameSessions = new Map<string, GameSession>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join game room
    socket.on('join-room', async (data: { roomId: string; participantId: string; nickname: string }) => {
      try {
        const { roomId, participantId, nickname } = data;
        
        // Verify participant exists and belongs to room
        const participant = await db.participant.findFirst({
          where: {
            id: participantId,
            roomId: roomId,
          },
        });

        if (!participant) {
          socket.emit('error', { message: 'Invalid participant or room' });
          return;
        }

        // Join socket room
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.participantId = participantId;
        socket.data.nickname = nickname;

        // Initialize game session if not exists
        if (!activeGameSessions.has(roomId)) {
          activeGameSessions.set(roomId, {
            roomId,
            currentQuestionIndex: 0,
            buzzOrder: [],
            currentAnswerer: null,
            attempts: 0,
            status: 'waiting',
          });
        }

        // Notify room
        io.to(roomId).emit('participant-joined', {
          participantId,
          nickname,
          score: participant.score,
        });

        // Send current game state
        const gameSession = activeGameSessions.get(roomId)!;
        socket.emit('game-state', gameSession);

        console.log(`${nickname} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Buzzer pressed
    socket.on('buzz', async () => {
      try {
        const { roomId, participantId, nickname } = socket.data;
        
        if (!roomId || !participantId) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        const gameSession = activeGameSessions.get(roomId)!;
        
        // Check if buzzing is allowed
        if (gameSession.status !== 'question' && gameSession.status !== 'buzzing') {
          return;
        }

        // Check if participant already buzzed
        if (gameSession.buzzOrder.includes(participantId)) {
          return;
        }

        // Add to buzz order
        gameSession.buzzOrder.push(participantId);
        gameSession.status = 'buzzing';

        // If this is the first buzz, set as current answerer
        if (gameSession.buzzOrder.length === 1) {
          gameSession.currentAnswerer = participantId;
          gameSession.status = 'answering';
        }

        // Notify room
        io.to(roomId).emit('buzz-received', {
          participantId,
          nickname,
          buzzOrder: gameSession.buzzOrder,
          isCurrentAnswerer: gameSession.currentAnswerer === participantId,
        });

        console.log(`${nickname} buzzed in room ${roomId}`);
      } catch (error) {
        console.error('Error handling buzz:', error);
        socket.emit('error', { message: 'Failed to buzz' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data: { answer: string; questionId: string }) => {
      try {
        const { roomId, participantId, nickname } = socket.data;
        const { answer, questionId } = data;
        
        if (!roomId || !participantId) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        const gameSession = activeGameSessions.get(roomId)!;
        
        // Verify current answerer
        if (gameSession.currentAnswerer !== participantId) {
          socket.emit('error', { message: 'Not your turn to answer' });
          return;
        }

        // Get question and check answer
        const question = await db.question.findUnique({
          where: { id: questionId },
        });

        if (!question) {
          socket.emit('error', { message: 'Question not found' });
          return;
        }

        const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        
        // Record answer
        await db.answer.create({
          data: {
            questionId,
            participantId,
            answer,
            isCorrect,
            attemptNumber: gameSession.attempts + 1,
            gameSessionId: roomId, // This should be the actual game session ID
          },
        });

        if (isCorrect) {
          // Update participant score
          await db.participant.update({
            where: { id: participantId },
            data: {
              score: {
                increment: question.points,
              },
            },
          });

          // Get updated participant data
          const participant = await db.participant.findUnique({
            where: { id: participantId },
          });

          // Notify room of correct answer
          io.to(roomId).emit('answer-result', {
            participantId,
            nickname,
            answer,
            isCorrect,
            correctAnswer: question.correctAnswer,
            newScore: participant?.score || 0,
            points: question.points,
          });

          // Reset for next question
          gameSession.buzzOrder = [];
          gameSession.currentAnswerer = null;
          gameSession.attempts = 0;
          gameSession.status = 'waiting';

          // Move to next question after delay
          setTimeout(() => {
            gameSession.currentQuestionIndex++;
            gameSession.status = 'question';
            io.to(roomId).emit('next-question', {
              questionIndex: gameSession.currentQuestionIndex,
            });
          }, 3000);
        } else {
          // Wrong answer
          gameSession.attempts++;
          
          // Get max attempts from room
          const room = await db.gameRoom.findUnique({
            where: { id: roomId },
          });

          if (gameSession.attempts >= (room?.maxAttempts || 3)) {
            // Max attempts reached, reveal answer
            io.to(roomId).emit('answer-result', {
              participantId,
              nickname,
              answer,
              isCorrect: false,
              correctAnswer: question.correctAnswer,
              maxAttemptsReached: true,
            });

            // Reset for next question
            gameSession.buzzOrder = [];
            gameSession.currentAnswerer = null;
            gameSession.attempts = 0;
            gameSession.status = 'waiting';

            // Move to next question after delay
            setTimeout(() => {
              gameSession.currentQuestionIndex++;
              gameSession.status = 'question';
              io.to(roomId).emit('next-question', {
                questionIndex: gameSession.currentQuestionIndex,
              });
            }, 3000);
          } else {
            // Allow next person to answer
            gameSession.currentAnswerer = null;
            
            // Find next buzzer
            const nextIndex = gameSession.buzzOrder.indexOf(participantId) + 1;
            if (nextIndex < gameSession.buzzOrder.length) {
              gameSession.currentAnswerer = gameSession.buzzOrder[nextIndex];
              gameSession.status = 'answering';
            } else {
              gameSession.status = 'buzzing';
            }

            io.to(roomId).emit('answer-result', {
              participantId,
              nickname,
              answer,
              isCorrect: false,
              attemptsRemaining: (room?.maxAttempts || 3) - gameSession.attempts,
              nextAnswerer: gameSession.currentAnswerer,
            });
          }
        }

        console.log(`${nickname} submitted answer: ${answer} (${isCorrect ? 'correct' : 'wrong'})`);
      } catch (error) {
        console.error('Error handling answer submission:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Start question (teacher only)
    socket.on('start-question', async () => {
      try {
        const { roomId } = socket.data;
        
        if (!roomId) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        const gameSession = activeGameSessions.get(roomId)!;
        gameSession.status = 'question';
        gameSession.buzzOrder = [];
        gameSession.currentAnswerer = null;
        gameSession.attempts = 0;

        io.to(roomId).emit('question-started', {
          questionIndex: gameSession.currentQuestionIndex,
        });

        console.log(`Question started in room ${roomId}`);
      } catch (error) {
        console.error('Error starting question:', error);
        socket.emit('error', { message: 'Failed to start question' });
      }
    });

    // Screen monitoring events
    socket.on('request-screen-monitoring', (data: { participantId: string; teacherId: string }) => {
      try {
        const { roomId } = socket.data;
        const { participantId, teacherId } = data;
        
        if (!roomId) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        // Forward request to specific participant
        io.to(participantId).emit('screen-monitoring-request', {
          participantId,
          teacherId,
          roomId,
        });

        console.log(`Screen monitoring requested for ${participantId} by ${teacherId}`);
      } catch (error) {
        console.error('Error requesting screen monitoring:', error);
        socket.emit('error', { message: 'Failed to request screen monitoring' });
      }
    });

    socket.on('stop-screen-monitoring', (data: { participantId: string; teacherId: string }) => {
      try {
        const { roomId } = socket.data;
        const { participantId, teacherId } = data;
        
        if (!roomId) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        // Notify participant and teacher
        io.to(participantId).emit('screen-monitoring-stopped', {
          participantId,
          teacherId,
        });

        io.to(teacherId).emit('screen-monitoring-stopped', {
          participantId,
        });

        console.log(`Screen monitoring stopped for ${participantId}`);
      } catch (error) {
        console.error('Error stopping screen monitoring:', error);
        socket.emit('error', { message: 'Failed to stop screen monitoring' });
      }
    });

    socket.on('screen-monitoring-response', (data: { participantId: string; granted: boolean; teacherId: string }) => {
      try {
        const { participantId, granted, teacherId } = data;
        
        // Forward response to teacher
        io.to(teacherId).emit('screen-monitoring-response', {
          participantId,
          granted,
        });

        console.log(`Screen monitoring ${granted ? 'granted' : 'denied'} for ${participantId}`);
      } catch (error) {
        console.error('Error handling screen monitoring response:', error);
        socket.emit('error', { message: 'Failed to handle screen monitoring response' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const { roomId, nickname } = socket.data;
      if (roomId && nickname) {
        io.to(roomId).emit('participant-left', {
          participantId: socket.data.participantId,
          nickname,
        });
        console.log(`${nickname} disconnected from room ${roomId}`);
      }
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Gameshow Server!',
      timestamp: new Date().toISOString(),
    });
  });
};