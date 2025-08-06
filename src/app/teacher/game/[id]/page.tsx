"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { soundManager } from "@/lib/sounds";

interface Participant {
  id: string;
  nickname: string;
  score: number;
  isActive: boolean;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string;
  correctAnswer: string;
  points: number;
  imageUrl?: string;
  attachmentUrl?: string;
  order: number;
}

interface GameSession {
  id: string;
  currentQuestionIndex: number;
  status: string;
  startedAt?: string;
  currentBuzzes?: string;
}

export default function TeacherGameControlPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameRoom, setGameRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [buzzOrder, setBuzzOrder] = useState<string[]>([]);
  const [currentAnswerer, setCurrentAnswerer] = useState<string | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'question' | 'buzzing' | 'answering' | 'revealed'>('waiting');
  const [showScreenMonitoring, setShowScreenMonitoring] = useState(false);
  const [selectedParticipantForMonitoring, setSelectedParticipantForMonitoring] = useState<Participant | null>(null);
  const [monitoringPermission, setMonitoringPermission] = useState<{[key: string]: boolean}>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  const questionStartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        
        socketInstance.on('connect', () => {
          setIsConnected(true);
          socketInstance.emit('join-room', {
            roomId,
            participantId: `teacher-${roomId}`,
            nickname: 'Teacher',
          });
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        // Game events
        socketInstance.on('participant-joined', (data: Participant) => {
          setParticipants(prev => [...prev, data]);
          soundManager.play('notification');
        });

        socketInstance.on('participant-left', (data: { participantId: string }) => {
          setParticipants(prev => prev.filter(p => p.id !== data.participantId));
        });

        socketInstance.on('buzz-received', (data: any) => {
          setBuzzOrder(data.buzzOrder);
          setCurrentAnswerer(data.isCurrentAnswerer ? data.participantId : null);
          setGameStatus(data.isCurrentAnswerer ? 'answering' : 'buzzing');
          
          // Play buzz sound for first buzz
          if (data.buzzOrder.length === 1) {
            soundManager.play('buzz');
          }
        });

        socketInstance.on('answer-result', (result: any) => {
          // Play sound based on answer result
          if (result.isCorrect) {
            soundManager.play('correct');
          } else {
            soundManager.play('wrong');
          }
          
          // Update participants with new scores
          if (result.newScore !== undefined) {
            setParticipants(prev => 
              prev.map(p => 
                p.id === result.participantId 
                  ? { ...p, score: result.newScore }
                  : p
              )
            );
          }
          
          if (result.maxAttemptsReached) {
            setGameStatus('revealed');
          } else if (result.nextAnswerer) {
            setCurrentAnswerer(result.nextAnswerer);
            setGameStatus('answering');
          } else {
            setGameStatus('question');
            setBuzzOrder([]);
            setCurrentAnswerer(null);
          }
        });

        socketInstance.on('next-question', (data: { questionIndex: number }) => {
          setGameStatus('waiting');
          setBuzzOrder([]);
          setCurrentAnswerer(null);
          setSelectedQuestionIndex(data.questionIndex);
          setCurrentQuestion(questions[data.questionIndex] || null);
        });

        // Screen monitoring events
        socketInstance.on('screen-monitoring-request', (data: { participantId: string; teacherId: string }) => {
          if (data.teacherId === `teacher-${roomId}`) {
            // This would typically show a permission dialog to the student
            console.log(`Screen monitoring requested for participant ${data.participantId}`);
          }
        });

        socketInstance.on('screen-monitoring-response', (data: { participantId: string; granted: boolean }) => {
          setMonitoringPermission(prev => ({
            ...prev,
            [data.participantId]: data.granted
          }));
          
          if (data.granted && selectedParticipantForMonitoring?.id === data.participantId) {
            setIsMonitoring(true);
          }
        });

        socketInstance.on('screen-monitoring-stopped', (data: { participantId: string }) => {
          if (selectedParticipantForMonitoring?.id === data.participantId) {
            setIsMonitoring(false);
          }
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
        setQuestions(data.questions || []);
        
        // Set current question
        if (data.questions && data.questions.length > 0) {
          setCurrentQuestion(data.questions[0]);
        }
        
        // Get active game session
        if (data.gameSessions && data.gameSessions.length > 0) {
          setGameSession(data.gameSessions[0]);
          setSelectedQuestionIndex(data.gameSessions[0].currentQuestionIndex);
          if (data.questions[data.gameSessions[0].currentQuestionIndex]) {
            setCurrentQuestion(data.questions[data.gameSessions[0].currentQuestionIndex]);
          }
        }
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
  }, [roomId, questions]);

  const handleStartQuestion = () => {
    if (socket && currentQuestion) {
      socket.emit('start-question');
      setGameStatus('question');
      setBuzzOrder([]);
      setCurrentAnswerer(null);
      soundManager.play('notification');
    }
  };

  const handleSelectQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setCurrentQuestion(questions[index] || null);
  };

  const requestScreenMonitoring = (participant: Participant) => {
    setSelectedParticipantForMonitoring(participant);
    setShowScreenMonitoring(true);
  };

  const handleStopScreenMonitoring = () => {
    stopScreenMonitoring();
    setShowScreenMonitoring(false);
  };

  const stopScreenMonitoring = () => {
    if (socket && selectedParticipantForMonitoring) {
      socket.emit('stop-screen-monitoring', {
        participantId: selectedParticipantForMonitoring.id,
      });
      setIsMonitoring(false);
      setSelectedParticipantForMonitoring(null);
    }
  };

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  const getSortedParticipants = () => {
    return [...participants].sort((a, b) => b.score - a.score);
  };

  const renderQuestionPreview = (question: Question) => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        const options = JSON.parse(question.options || '[]');
        return (
          <div className="space-y-1">
            {options.map((option: string, index: number) => (
              <div key={index} className="text-sm text-[#2E2E2E]">
                {String.fromCharCode(65 + index)}. {option}
              </div>
            ))}
          </div>
        );
      
      case 'TRUE_FALSE':
        return (
          <div className="space-y-1">
            <div className="text-sm text-[#2E2E2E]">A. True</div>
            <div className="text-sm text-[#2E2E2E]">B. False</div>
          </div>
        );
      
      case 'IMAGE_BASED':
        return (
          <div className="space-y-2">
            {question.imageUrl && (
              <div className="text-sm text-[#2E2E2E]">Image: {question.imageUrl}</div>
            )}
            <div className="text-sm text-[#2E2E2E]">Answer: {question.correctAnswer}</div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-[#2E2E2E]">
            Answer: {question.correctAnswer}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#F0F0F0] to-[#FADADD] p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-[#2E2E2E]">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={gameRoom?.isActive ? "default" : "secondary"}>
                {gameRoom?.isActive ? 'Game Active' : 'Game Inactive'}
              </Badge>
              <Badge variant="outline">
                {participants.length} participants
              </Badge>
            </div>
          </div>

          {/* Current Question Display */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#2E2E2E]">Current Question</CardTitle>
                <Badge variant="outline">
                  {selectedQuestionIndex + 1} of {questions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion ? (
                <>
                  <div className="text-lg text-[#2E2E2E]">{currentQuestion.text}</div>
                  <div className="text-sm text-[#2E2E2E]">
                    Type: {currentQuestion.type} | Points: {currentQuestion.points}
                  </div>
                  <div className="bg-[#F0F0F0] p-3 rounded-lg">
                    <div className="text-sm font-medium text-[#2E2E2E] mb-2">Question Preview:</div>
                    {renderQuestionPreview(currentQuestion)}
                  </div>
                  
                  <Button
                    ref={questionStartRef}
                    onClick={handleStartQuestion}
                    disabled={!gameRoom?.isActive || gameStatus !== 'waiting'}
                    className={`w-full ${
                      gameRoom?.isActive && gameStatus === 'waiting'
                        ? 'bg-[#D291BC] hover:bg-[#C17FA9] text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {gameStatus === 'waiting' ? 'Start Question' : 'Question in Progress'}
                  </Button>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    No questions available. Add questions to get started.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Buzz Status */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">Buzz Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={gameStatus === 'question' ? 'default' : 'secondary'}>
                  Status: {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
                </Badge>
                {buzzOrder.length > 0 && (
                  <Badge variant="outline">
                    {buzzOrder.length} buzz{buzzOrder.length !== 1 ? 'es' : ''}
                  </Badge>
                )}
              </div>

              {buzzOrder.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-[#2E2E2E]">Buzz Order:</div>
                  {buzzOrder.map((participantId, index) => {
                    const participant = getParticipantById(participantId);
                    return (
                      <div
                        key={participantId}
                        className={`flex items-center justify-between p-2 rounded ${
                          participantId === currentAnswerer
                            ? 'bg-[#FF6F61] text-white'
                            : 'bg-[#F0F0F0]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={participantId === currentAnswerer ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                          <span>{participant?.nickname || 'Unknown'}</span>
                        </div>
                        {participantId === currentAnswerer && (
                          <Badge>Answering</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {gameStatus === 'waiting' && buzzOrder.length === 0 && (
                <Alert>
                  <AlertDescription>
                    Waiting for teacher to start the question...
                  </AlertDescription>
                </Alert>
              )}

              {gameStatus === 'question' && buzzOrder.length === 0 && (
                <Alert>
                  <AlertDescription>
                    Question is active. Students can now buzz in!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Questions List */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => handleSelectQuestion(index)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    index === selectedQuestionIndex
                      ? 'bg-[#D291BC] text-white'
                      : 'bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#2E2E2E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {index + 1}. {question.text.substring(0, 30)}...
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {question.points}pts
                    </Badge>
                  </div>
                </button>
              ))}
              {questions.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No questions added yet.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#2E2E2E]">Live Leaderboard</CardTitle>
                <Button
                  onClick={() => setShowScreenMonitoring(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  📺 Monitor Screens
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {getSortedParticipants().map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    index === 0
                      ? 'bg-[#A1C6EA]'
                      : 'bg-[#F0F0F0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="text-[#2E2E2E]">{participant.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{participant.score}</Badge>
                    <Button
                      onClick={() => requestScreenMonitoring(participant)}
                      variant="outline"
                      size="sm"
                      className="text-xs p-1 h-6 w-6"
                      title="Monitor Screen"
                    >
                      📺
                    </Button>
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No participants yet.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Game Controls */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2E2E2E]">Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push(`/teacher`)}
                variant="outline"
                className="w-full border-[#2E2E2E] text-[#2E2E2E]"
              >
                ← Back to Dashboard
              </Button>
              
              <div className="text-sm text-[#2E2E2E] space-y-1">
                <div><strong>Room:</strong> {gameRoom?.roomCode}</div>
                <div><strong>Title:</strong> {gameRoom?.title}</div>
                <div><strong>Max Attempts:</strong> {gameRoom?.maxAttempts}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Screen Monitoring Dialog */}
      <Dialog open={showScreenMonitoring} onOpenChange={setShowScreenMonitoring}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screen Monitoring</DialogTitle>
            <DialogDescription>
              Monitor participant screens to prevent cheating during the game.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedParticipantForMonitoring ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E2E2E]">
                      Monitoring: {selectedParticipantForMonitoring.nickname}
                    </h3>
                    <p className="text-sm text-[#2E2E2E]">
                      Status: {isMonitoring ? 'Active' : 'Requesting Permission...'}
                    </p>
                  </div>
                  <Button
                    onClick={handleStopScreenMonitoring}
                    variant="destructive"
                    className="bg-[#FF5C5C] hover:bg-[#E54C4C]"
                  >
                    Stop Monitoring
                  </Button>
                </div>

                {/* Screen Preview Area */}
                <div className="bg-gray-900 rounded-lg p-4 aspect-video flex items-center justify-center">
                  {isMonitoring ? (
                    <div className="text-center space-y-2">
                      <div className="text-green-400 text-4xl">📺</div>
                      <div className="text-green-400 font-medium">Screen Sharing Active</div>
                      <div className="text-gray-400 text-sm">
                        Live screen preview would appear here
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="text-yellow-400 text-4xl">⏳</div>
                      <div className="text-yellow-400 font-medium">Waiting for Permission</div>
                      <div className="text-gray-400 text-sm">
                        Student must approve screen sharing request
                      </div>
                    </div>
                  )}
                </div>

                {/* Monitoring Info */}
                <div className="bg-[#F0F0F0] rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-[#2E2E2E]">Monitoring Information</h4>
                  <div className="text-sm text-[#2E2E2E] space-y-1">
                    <div>• Student has been notified of monitoring request</div>
                    <div>• Screen sharing requires explicit student permission</div>
                    <div>• Monitoring session will be recorded for security</div>
                    <div>• Student can stop sharing at any time</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#2E2E2E]">Select Participant to Monitor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {participants.map((participant) => (
                    <Card 
                      key={participant.id}
                      className={`cursor-pointer transition-colors ${
                        selectedParticipantForMonitoring?.id === participant.id
                          ? 'ring-2 ring-[#D291BC]'
                          : 'hover:bg-[#F0F0F0]'
                      }`}
                      onClick={() => setSelectedParticipantForMonitoring(participant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[#2E2E2E]">{participant.nickname}</div>
                            <div className="text-sm text-[#2E2E2E]">Score: {participant.score}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {monitoringPermission[participant.id] ? (
                              <Badge className="bg-[#B8E1DD] text-[#2E2E2E]">✓ Allowed</Badge>
                            ) : (
                              <Badge variant="outline">Request Needed</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}