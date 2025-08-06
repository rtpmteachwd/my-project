"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { soundManager } from "@/lib/sound";
import { animations, injectAnimationStyles, createConfetti } from "@/lib/animations";

interface Participant {
  id: string;
  nickname: string;
  score: number;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string;
  points: number;
  imageUrl?: string;
  attachmentUrl?: string;
  timerEnabled: boolean;
  timerMinutes: number;
  timerSeconds: number;
}

interface GameState {
  currentQuestionIndex: number;
  buzzOrder: string[];
  currentAnswerer: string | null;
  attempts: number;
  status: 'waiting' | 'question' | 'buzzing' | 'answering' | 'revealed';
}

export default function StudentGamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState("");
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [buzzOrder, setBuzzOrder] = useState<string[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [canBuzz, setCanBuzz] = useState(false);
  const [gameRoom, setGameRoom] = useState<any>(null);
  const [showMonitoringRequest, setShowMonitoringRequest] = useState(false);
  const [monitoringRequestData, setMonitoringRequestData] = useState<any>(null);
  const [isBeingMonitored, setIsBeingMonitored] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  
  const participantId = typeof window !== 'undefined' ? localStorage.getItem('participantId') : null;
  const nickname = typeof window !== 'undefined' ? localStorage.getItem('nickname') : null;
  const buzzerButtonRef = useRef<HTMLButtonElement>(null);
  const answerResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animations
    injectAnimationStyles();
    
    if (!participantId || !nickname) {
      router.push('/student/join');
      return;
    }

    // Timer effect
    let timerInterval: NodeJS.Timeout;
    
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) {
            const newTime = prev - 1;
            if (newTime <= 0) {
              setTimerActive(false);
              // Time's up - disable buzzing
              setCanBuzz(false);
              return 0;
            }
            return newTime;
          }
          return prev;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive, timeLeft, participantId, nickname, router]);

  // Socket connection useEffect
  useEffect(() => {
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        
        socketInstance.on('connect', () => {
          setIsConnected(true);
          socketInstance.emit('join-room', {
            roomId,
            participantId,
            nickname,
          });
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        // Game events
        socketInstance.on('game-state', (state: GameState) => {
          setGameState(state);
          setCanBuzz(state.status === 'question' || state.status === 'buzzing');
        });

        socketInstance.on('participant-joined', (data: Participant) => {
          setParticipants(prev => [...prev, data]);
        });

        socketInstance.on('participant-left', (data: { participantId: string }) => {
          setParticipants(prev => prev.filter(p => p.id !== data.participantId));
        });

        socketInstance.on('question-started', async (data: { questionIndex: number }) => {
          try {
            const response = await fetch(`/api/game-rooms/${roomId}/questions`);
            const questions = await response.json();
            if (questions[data.questionIndex]) {
              const question = questions[data.questionIndex];
              setCurrentQuestion(question);
              setMyAnswer("");
              setShowAnswerDialog(false);
              setAnswerResult(null);
              
              // Initialize timer if enabled
              if (question.timerEnabled) {
                const totalSeconds = (question.timerMinutes || 0) * 60 + (question.timerSeconds || 30);
                setTimeLeft(totalSeconds);
                setTimerActive(true);
              } else {
                setTimeLeft(null);
                setTimerActive(false);
              }
            }
          } catch (error) {
            console.error('Error fetching question:', error);
          }
        });

        socketInstance.on('buzz-received', (data: any) => {
          setBuzzOrder(data.buzzOrder);
          setIsMyTurn(data.isCurrentAnswerer);
          if (data.isCurrentAnswerer) {
            setShowAnswerDialog(true);
            soundManager.play('notification');
            
            // Add haptic feedback if available
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        });

        socketInstance.on('answer-result', (result: any) => {
          setAnswerResult(result);
          setShowAnswerDialog(false);
          
          // Play sound based on answer result
          if (result.isCorrect) {
            soundManager.play('correct');
            // Trigger celebration animation
            triggerCelebration();
          } else {
            soundManager.play('wrong');
          }
          
          // Animate answer result appearance
          setTimeout(() => {
            if (answerResultRef.current) {
              if (result.isCorrect) {
                animations.bounce(answerResultRef.current);
              } else {
                animations.shake(answerResultRef.current);
              }
            }
          }, 100);
          
          // Update participants list with new scores
          if (result.newScore !== undefined) {
            setParticipants(prev => 
              prev.map(p => 
                p.id === result.participantId 
                  ? { ...p, score: result.newScore }
                  : p
              )
            );
          }
        });

        socketInstance.on('next-question', (data: { questionIndex: number }) => {
          setBuzzOrder([]);
          setIsMyTurn(false);
          setCanBuzz(true);
          setTimeLeft(null);
          setTimerActive(false);
        });

        // Screen monitoring events
        socketInstance.on('screen-monitoring-request', (data: { participantId: string; teacherId: string; roomId: string }) => {
          if (data.participantId === participantId) {
            setMonitoringRequestData(data);
            setShowMonitoringRequest(true);
          }
        });

        socketInstance.on('screen-monitoring-stopped', (data: { participantId: string; teacherId: string }) => {
          if (data.participantId === participantId) {
            setIsBeingMonitored(false);
            setShowMonitoringRequest(false);
          }
        });

        socketInstance.on('error', (error: any) => {
          console.error('Socket error:', error.message);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();

    // Fetch initial game room data
    const fetchGameRoom = async () => {
      try {
        const response = await fetch(`/api/game-rooms/${roomId}`);
        const data = await response.json();
        setGameRoom(data);
        setParticipants(data.participants || []);
      } catch (error) {
        console.error('Error fetching game room:', error);
      }
    };

    fetchGameRoom();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId, participantId, nickname, router]);

  const handleBuzz = () => {
    if (socket && canBuzz) {
      socket.emit('buzz');
      setCanBuzz(false);
      soundManager.play('buzz');
      
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (socket && currentQuestion && myAnswer.trim()) {
      socket.emit('submit-answer', {
        answer: myAnswer,
        questionId: currentQuestion.id,
      });
      setMyAnswer("");
    }
  };

  const handleMonitoringResponse = (granted: boolean) => {
    if (socket && monitoringRequestData) {
      socket.emit('screen-monitoring-response', {
        participantId,
        granted,
        teacherId: monitoringRequestData.teacherId,
      });
      
      if (granted) {
        setIsBeingMonitored(true);
      }
      
      setShowMonitoringRequest(false);
      setMonitoringRequestData(null);
      soundManager.play('notification');
    }
  };

  const triggerCelebration = () => {
    createConfetti(50);
  };

  const getMyParticipant = () => {
    return participants.find(p => p.id === participantId);
  };

  const getMyRank = () => {
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    return sortedParticipants.findIndex(p => p.id === participantId) + 1;
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        const options = JSON.parse(currentQuestion.options || '[]');
        return (
          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={myAnswer === option}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  className="w-4 h-4 text-[#FF6F61]"
                />
                <span className="text-[#2E2E2E]">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'TRUE_FALSE':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="answer"
                value="true"
                checked={myAnswer === 'true'}
                onChange={(e) => setMyAnswer(e.target.value)}
                className="w-4 h-4 text-[#FF6F61]"
              />
              <span className="text-[#2E2E2E]">True</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="answer"
                value="false"
                checked={myAnswer === 'false'}
                onChange={(e) => setMyAnswer(e.target.value)}
                className="w-4 h-4 text-[#FF6F61]"
              />
              <span className="text-[#2E2E2E]">False</span>
            </label>
          </div>
        );
      
      case 'IMAGE_BASED':
        return (
          <div className="space-y-4">
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="max-w-full h-auto rounded-lg"
              />
            )}
            <Input
              value={myAnswer}
              onChange={(e) => setMyAnswer(e.target.value)}
              placeholder="Enter your answer..."
            />
          </div>
        );
      
      default:
        return (
          <Input
            value={myAnswer}
            onChange={(e) => setMyAnswer(e.target.value)}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  if (!participantId || !nickname) {
    return <div>Loading...</div>;
  }

  const myParticipant = getMyParticipant();
  const myRank = getMyRank();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#F0F0F0] to-[#FADADD] p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-[#2E2E2E]">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Badge variant={gameRoom?.isActive ? "default" : "secondary"}>
              {gameRoom?.isActive ? 'Game Active' : 'Waiting'}
            </Badge>
          </div>

          {/* Question Display */}
          {currentQuestion && (
            <Card className="bg-white gameshow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-[#2E2E2E]">Question {(gameState?.currentQuestionIndex || 0) + 1}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentQuestion.points} points</Badge>
                    {currentQuestion.timerEnabled && (
                      <Badge variant="outline" className="bg-[#FF6F61] text-white">
                        ⏱️ {currentQuestion.timerMinutes}m {currentQuestion.timerSeconds}s
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer Display */}
                {timerActive && timeLeft !== null && (
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-[#FF6F61]'
                    }`}>
                      ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-[#2E2E2E]">Time Remaining</div>
                  </div>
                )}
                
                <div className="text-lg text-[#2E2E2E]">{currentQuestion.text}</div>
                
                {renderQuestionContent()}
              </CardContent>
            </Card>
          )}

          {/* Buzzer Button */}
          <Card className="bg-white gameshow-card">
            <CardContent className="p-6">
              <Button
                ref={buzzerButtonRef}
                onClick={handleBuzz}
                disabled={!canBuzz || !gameRoom?.isActive || (timerActive && timeLeft === 0)}
                className={`w-full h-32 text-2xl font-bold transition-all duration-200 gameshow-buzzer-button gameshow-interactive ${
                  canBuzz && gameRoom?.isActive && !(timerActive && timeLeft === 0)
                    ? 'bg-[#FF6F61] hover:bg-[#E55A4A] text-white animate-pulse'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!canBuzz || !gameRoom?.isActive ? 'Wait for Question' : 
                 timerActive && timeLeft === 0 ? 'Time\'s Up!' : 'BUZZ!'}
              </Button>
              
              {buzzOrder.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-[#2E2E2E]">Buzz Order:</div>
                  {buzzOrder.map((participantId, index) => {
                    const participant = participants.find(p => p.id === participantId);
                    return (
                      <div key={participantId} className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <span className="text-[#2E2E2E]">{participant?.nickname || 'Unknown'}</span>
                        {index === 0 && isMyTurn && (
                          <Badge className="bg-[#D291BC]">Your Turn!</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer Result */}
          {answerResult && (
            <Card 
              ref={answerResultRef}
              className={`${
                answerResult.isCorrect 
                  ? 'bg-[#B8E1DD] border-[#B8E1DD]' 
                  : 'bg-[#FF5C5C] border-[#FF5C5C]'
              } gameshow-card`}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className={`text-2xl font-bold ${
                    answerResult.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {answerResult.isCorrect ? 'Correct! 🎉' : 'Wrong Answer'}
                  </div>
                  {!answerResult.isCorrect && (
                    <div className="text-[#2E2E2E]">
                      Correct answer: <span className="font-semibold">{answerResult.correctAnswer}</span>
                    </div>
                  )}
                  {answerResult.points && (
                    <div className="text-lg font-semibold text-[#2E2E2E]">
                      +{answerResult.points} points!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Status */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">My Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-[#2E2E2E]">Nickname</div>
                <div className="font-semibold text-[#2E2E2E]">{nickname}</div>
              </div>
              <div>
                <div className="text-sm text-[#2E2E2E]">Score</div>
                <div className="text-2xl font-bold text-[#FF6F61]">{myParticipant?.score || 0}</div>
              </div>
              <div>
                <div className="text-sm text-[#2E2E2E]">Rank</div>
                <div className="text-lg font-semibold text-[#2E2E2E]">#{myRank}</div>
              </div>
              {isBeingMonitored && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-2">
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <span className="text-red-500">📺</span>
                    <span className="font-medium">Screen is being monitored</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {participants
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      participant.id === participantId
                        ? 'bg-[#A1C6EA]'
                        : index === 0
                        ? 'bg-[#FADADD]'
                        : 'bg-[#F0F0F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-[#2E2E2E]">{participant.nickname}</span>
                      {participant.id === participantId && (
                        <Badge className="bg-[#FF6F61]">You</Badge>
                      )}
                    </div>
                    <Badge variant="outline">{participant.score}</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">Game Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-[#2E2E2E]">Room</div>
                <div className="font-mono text-[#2E2E2E]">{gameRoom?.roomCode}</div>
              </div>
              <div>
                <div className="text-sm text-[#2E2E2E]">Title</div>
                <div className="text-[#2E2E2E]">{gameRoom?.title}</div>
              </div>
              <div>
                <div className="text-sm text-[#2E2E2E]">Participants</div>
                <div className="text-[#2E2E2E]">{participants.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Answer Dialog */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>It's Your Turn!</DialogTitle>
            <DialogDescription>
              You buzzed in first! Submit your answer below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentQuestion && renderQuestionContent()}
            <Button
              onClick={handleSubmitAnswer}
              disabled={!myAnswer.trim()}
              className="w-full bg-[#FF6F61] hover:bg-[#E55A4A] text-white"
            >
              Submit Answer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screen Monitoring Request Dialog */}
      <Dialog open={showMonitoringRequest} onOpenChange={setShowMonitoringRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Screen Monitoring Request</DialogTitle>
            <DialogDescription>
              Your teacher is requesting to monitor your screen to ensure fair play.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">Screen Monitoring Request</div>
                  <div className="space-y-1">
                    <div>• Your teacher wants to see your screen to prevent cheating</div>
                    <div>• You can stop sharing at any time</div>
                    <div>• This helps ensure fair play for everyone</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-[#2E2E2E]">
                Do you allow screen monitoring?
              </div>
              <div className="text-sm text-[#2E2E2E]">
                Your choice will be respected either way.
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleMonitoringResponse(true)}
                className="flex-1 bg-[#B8E1DD] hover:bg-[#A8D1CD] text-[#2E2E2E]"
              >
                ✅ Allow Monitoring
              </Button>
              <Button
                onClick={() => handleMonitoringResponse(false)}
                variant="outline"
                className="flex-1 border-[#FF5C5C] text-[#FF5C5C] hover:bg-[#FF5C5C] hover:text-white"
              >
                ❌ Deny Monitoring
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}