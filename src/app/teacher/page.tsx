"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GameRoom {
  id: string;
  roomCode: string;
  title: string;
  isActive: boolean;
  maxAttempts: number;
  createdAt: string;
  participants: any[] | null | undefined;
  questions: any[] | null | undefined;
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
  timerEnabled: boolean;
  timerMinutes: number;
  timerSeconds: number;
  order: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: "", maxAttempts: 3 });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    options: "",
    correctAnswer: "",
    points: 1,
    imageUrl: "",
    attachmentUrl: "",
    timerEnabled: false,
    timerMinutes: 0,
    timerSeconds: 30
  });

  // Fetch real data from the database
  useEffect(() => {
    const fetchGameRooms = async () => {
      try {
        const response = await fetch("/api/game-rooms");
        if (response.ok) {
          const rooms = await response.json();
          setGameRooms(rooms);
        }
      } catch (error) {
        console.error("Error fetching game rooms:", error);
        // Fallback to mock data if API fails
        const mockRooms: GameRoom[] = [
          {
            id: "1",
            roomCode: "ABC123",
            title: "Science Quiz - Chapter 5",
            isActive: true,
            maxAttempts: 3,
            createdAt: "2024-01-15T10:00:00Z",
            participants: [
              { id: "1", nickname: "Alice", score: 15 },
              { id: "2", nickname: "Bob", score: 10 }
            ],
            questions: [
              {
                id: "1",
                text: "What is the chemical symbol for gold?",
                type: "MULTIPLE_CHOICE",
                correctAnswer: "Au",
                points: 5,
                order: 1
              }
            ]
          }
        ];
        setGameRooms(mockRooms);
      }
    };

    fetchGameRooms();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await fetch("/api/game-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom)
      });
      
      if (response.ok) {
        const room = await response.json();
        setGameRooms([...gameRooms, room]);
        setShowCreateRoom(false);
        setNewRoom({ title: "", maxAttempts: 3 });
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedRoom) return;
    
    try {
      const response = await fetch(`/api/game-rooms/${selectedRoom.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newQuestion,
          order: (selectedRoom.questions || []).length + 1
        })
      });
      
      if (response.ok) {
        const question = await response.json();
        // Update the room in the gameRooms array
        setGameRooms(gameRooms.map(room => {
          if (room.id === selectedRoom.id) {
            return {
              ...room,
              questions: [...(room.questions || []), question]
            };
          }
          return room;
        }));
        
        setShowAddQuestion(false);
        setNewQuestion({
          text: "",
          type: "MULTIPLE_CHOICE",
          options: "",
          correctAnswer: "",
          points: 1,
          imageUrl: "",
          attachmentUrl: "",
          timerEnabled: false,
          timerMinutes: 0,
          timerSeconds: 30
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const startGame = async (roomId: string) => {
    try {
      await fetch(`/api/game-rooms/${roomId}/start`, { method: "POST" });
      setGameRooms(gameRooms.map(room => 
        room.id === roomId ? { ...room, isActive: true } : room
      ));
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const endGame = async (roomId: string) => {
    try {
      await fetch(`/api/game-rooms/${roomId}/end`, { method: "POST" });
      setGameRooms(gameRooms.map(room => 
        room.id === roomId ? { ...room, isActive: false } : room
      ));
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/game-rooms/${roomId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setGameRooms(gameRooms.filter(room => room.id !== roomId));
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const deleteQuestion = async (roomId: string, questionId: string) => {
    try {
      const response = await fetch(`/api/game-rooms/${roomId}/questions/${questionId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setGameRooms(gameRooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              questions: (room.questions || []).filter(q => q.id !== questionId)
            };
          }
          return room;
        }));
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#F0F0F0] to-[#FADADD] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E]">Teacher Dashboard</h1>
            <p className="text-[#2E2E2E]">Manage your game rooms and questions</p>
          </div>
          <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
            <DialogTrigger asChild>
              <Button className="bg-[#D291BC] hover:bg-[#C17FA9] text-white">
                Create New Game Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Game Room</DialogTitle>
                <DialogDescription>
                  Create a new game room for your students to join.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Room Title</Label>
                  <Input
                    id="title"
                    value={newRoom.title}
                    onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                    placeholder="Enter room title"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAttempts">Max Attempts per Question</Label>
                  <Select 
                    value={newRoom.maxAttempts.toString()} 
                    onValueChange={(value) => setNewRoom({ ...newRoom, maxAttempts: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateRoom}
                  className="w-full bg-[#D291BC] hover:bg-[#C17FA9] text-white"
                >
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Game Rooms List */}
        <div className="grid gap-4">
          {gameRooms.map((room) => (
            <Card key={room.id} className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#2E2E2E]">{room.title}</CardTitle>
                    <CardDescription className="text-[#2E2E2E]">
                      Room Code: <span className="font-mono bg-[#F0F0F0] px-2 py-1 rounded">{room.roomCode}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={room.isActive ? "default" : "secondary"}>
                      {room.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {(room.participants || []).length} participants
                    </Badge>
                    <Badge variant="outline">
                      {(room.questions || []).length} questions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-[#F0F0F0]">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-[#2E2E2E]">{(room.participants || []).length}</div>
                          <div className="text-sm text-[#2E2E2E]">Participants</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#F0F0F0]">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-[#2E2E2E]">{(room.questions || []).length}</div>
                          <div className="text-sm text-[#2E2E2E]">Questions</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#F0F0F0]">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-[#2E2E2E]">{room.maxAttempts}</div>
                          <div className="text-sm text-[#2E2E2E]">Max Attempts</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {room.isActive ? (
                        <Button 
                          onClick={() => endGame(room.id)}
                          variant="destructive"
                          className="bg-[#FF5C5C] hover:bg-[#E54C4C]"
                        >
                          End Game
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => startGame(room.id)}
                          className="bg-[#B8E1DD] hover:bg-[#A8D1CD] text-[#2E2E2E]"
                        >
                          Start Game
                        </Button>
                      )}
                      <Button 
                        onClick={() => {
                          router.push(`/teacher/game/${room.id}`);
                        }}
                        variant="outline"
                        className="border-[#D291BC] text-[#D291BC]"
                      >
                        Control Game
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowAddQuestion(true);
                        }}
                        variant="outline"
                        className="border-[#D291BC] text-[#D291BC]"
                      >
                        Add Question
                      </Button>
                      <Button 
                        onClick={() => deleteRoom(room.id)}
                        variant="destructive"
                        className="bg-[#FF5C5C] hover:bg-[#E54C4C]"
                      >
                        Delete Room
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="space-y-4">
                    <div className="space-y-2">
                      {(room.questions || []).map((question, index) => (
                        <Card key={question.id} className="bg-[#F0F0F0]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-[#2E2E2E]">
                                  {index + 1}. {question.text}
                                </div>
                                <div className="text-sm text-[#2E2E2E]">
                                  Type: {question.type} | Points: {question.points}
                                  {question.timerEnabled && (
                                    <span className="ml-2">
                                      | Timer: {question.timerMinutes}m {question.timerSeconds}s
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{question.type}</Badge>
                                <Button 
                                  onClick={() => deleteQuestion(room.id, question.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="bg-[#FF5C5C] hover:bg-[#E54C4C] h-8"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(!room.questions || room.questions.length === 0) && (
                        <Alert>
                          <AlertDescription>
                            No questions added yet. Click "Add Question" to get started.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="participants" className="space-y-4">
                    <div className="space-y-2">
                      {(room.participants || []).map((participant) => (
                        <Card key={participant.id} className="bg-[#F0F0F0]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-[#2E2E2E]">{participant.nickname}</div>
                              <Badge variant="outline" className="bg-[#A1C6EA] text-[#2E2E2E]">
                                {participant.score} points
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(!room.participants || room.participants.length === 0) && (
                        <Alert>
                          <AlertDescription>
                            No participants yet. Share the room code with your students.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
          
          {gameRooms.length === 0 && (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-[#2E2E2E] mb-2">No Game Rooms Yet</h3>
                <p className="text-[#2E2E2E] mb-4">Create your first game room to get started!</p>
                <Button 
                  onClick={() => setShowCreateRoom(true)}
                  className="bg-[#D291BC] hover:bg-[#C17FA9] text-white"
                >
                  Create Game Room
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Question Dialog */}
        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>
                Add a new question to the game room.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-text">Question Text</Label>
                <Textarea
                  id="question-text"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question-type">Question Type</Label>
                  <Select 
                    value={newQuestion.type} 
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                      <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                      <SelectItem value="MATCHING_TYPE">Matching Type</SelectItem>
                      <SelectItem value="IMAGE_BASED">Image-Based</SelectItem>
                      <SelectItem value="FILE_ATTACHMENT">File Attachment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="question-points">Points</Label>
                  <Select 
                    value={newQuestion.points.toString()} 
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, points: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Timer Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="timer-enabled"
                    checked={newQuestion.timerEnabled}
                    onChange={(e) => setNewQuestion({ ...newQuestion, timerEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#D291BC] focus:ring-[#D291BC]"
                  />
                  <Label htmlFor="timer-enabled">Enable Timer</Label>
                </div>
                
                {newQuestion.timerEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timer-minutes">Minutes</Label>
                      <Select 
                        value={newQuestion.timerMinutes.toString()} 
                        onValueChange={(value) => setNewQuestion({ ...newQuestion, timerMinutes: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timer-seconds">Seconds</Label>
                      <Select 
                        value={newQuestion.timerSeconds.toString()} 
                        onValueChange={(value) => setNewQuestion({ ...newQuestion, timerSeconds: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="45">45</SelectItem>
                          <SelectItem value="60">60</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              {newQuestion.type === "MULTIPLE_CHOICE" && (
                <div>
                  <Label htmlFor="question-options">Options (JSON format)</Label>
                  <Textarea
                    id="question-options"
                    value={newQuestion.options}
                    onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                    placeholder='["Option A", "Option B", "Option C", "Option D"]'
                    rows={2}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="correct-answer">Correct Answer</Label>
                <Input
                  id="correct-answer"
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  placeholder="Enter the correct answer"
                />
              </div>
              
              <Button 
                onClick={handleAddQuestion}
                className="w-full bg-[#D291BC] hover:bg-[#C17FA9] text-white"
              >
                Add Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}