"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function StudentJoinPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);

  const handleJoinGame = async () => {
    if (!nickname.trim() || !roomCode.trim()) {
      setError("Please enter both nickname and room code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check if room exists
      const roomResponse = await fetch(`/api/game-rooms/validate/${roomCode.toUpperCase()}`);
      const roomData = await roomResponse.json();

      if (!roomResponse.ok) {
        setError(roomData.error || "Invalid room code");
        setIsLoading(false);
        return;
      }

      // Join the room
      const joinResponse = await fetch(`/api/game-rooms/${roomData.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      const joinData = await joinResponse.json();

      if (!joinResponse.ok) {
        setError(joinData.error || "Failed to join room");
        setIsLoading(false);
        return;
      }

      // Store participant info in localStorage
      localStorage.setItem("participantId", joinData.id);
      localStorage.setItem("roomId", roomData.id);
      localStorage.setItem("nickname", nickname.trim());

      // Redirect to game room
      router.push(`/student/game/${roomData.id}`);
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Failed to join game. Please try again.");
      setIsLoading(false);
    }
  };

  const checkRoomCode = async () => {
    if (!roomCode.trim()) {
      setRoomInfo(null);
      return;
    }

    setIsCheckingRoom(true);
    try {
      const response = await fetch(`/api/game-rooms/validate/${roomCode.toUpperCase()}`);
      const data = await response.json();

      if (response.ok) {
        setRoomInfo(data);
        setError("");
      } else {
        setRoomInfo(null);
        setError(data.error || "Room not found");
      }
    } catch (error) {
      console.error("Error checking room code:", error);
      setRoomInfo(null);
    } finally {
      setIsCheckingRoom(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roomCode.length >= 3) {
        checkRoomCode();
      } else {
        setRoomInfo(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roomCode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#F0F0F0] to-[#FADADD] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#FF6F61] rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">👨‍🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2E2E2E]">Join Game</h1>
          <p className="text-[#2E2E2E]">
            Enter your nickname and room code to join the gameshow!
          </p>
        </div>

        {/* Join Form */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#2E2E2E]">Game Details</CardTitle>
            <CardDescription className="text-[#2E2E2E]">
              Provide your information to join the game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nickname" className="text-[#2E2E2E]">Your Nickname</Label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your nickname"
                className="mt-1"
                maxLength={20}
              />
              <p className="text-xs text-[#2E2E2E] mt-1">
                This is how you'll appear in the game
              </p>
            </div>

            <div>
              <Label htmlFor="roomCode" className="text-[#2E2E2E]">Room Code</Label>
              <Input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter room code"
                className="mt-1 font-mono uppercase"
                maxLength={6}
              />
              <p className="text-xs text-[#2E2E2E] mt-1">
                6-character code provided by your teacher
              </p>
            </div>

            {isCheckingRoom && (
              <div className="flex items-center gap-2 text-sm text-[#2E2E2E]">
                <div className="animate-spin w-4 h-4 border-2 border-[#D291BC] border-t-transparent rounded-full"></div>
                Checking room code...
              </div>
            )}

            {roomInfo && (
              <div className="bg-[#F0F0F0] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2E2E2E]">Room Found!</span>
                  <Badge variant={roomInfo.isActive ? "default" : "secondary"}>
                    {roomInfo.isActive ? "Active" : "Waiting"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#2E2E2E]">{roomInfo.title}</div>
                  <div className="text-xs text-[#2E2E2E]">
                    {roomInfo.participants?.length || 0} participants • {roomInfo.questions?.length || 0} questions
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleJoinGame}
              disabled={isLoading || !nickname.trim() || !roomCode.trim() || !roomInfo}
              className="w-full bg-[#FF6F61] hover:bg-[#E55A4A] text-white font-semibold"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Joining...
                </div>
              ) : (
                "Join Game"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#2E2E2E]">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#D291BC] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">1</span>
              </div>
              <div>
                <div className="font-medium text-[#2E2E2E]">Enter your nickname</div>
                <div className="text-sm text-[#2E2E2E]">Choose a fun nickname that your classmates will recognize</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#D291BC] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">2</span>
              </div>
              <div>
                <div className="font-medium text-[#2E2E2E]">Enter room code</div>
                <div className="text-sm text-[#2E2E2E]">Get the 6-character code from your teacher</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#D291BC] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">3</span>
              </div>
              <div>
                <div className="font-medium text-[#2E2E2E]">Join and play!</div>
                <div className="text-sm text-[#2E2E2E]">Buzz in to answer questions and earn points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="w-full border-[#2E2E2E] text-[#2E2E2E]"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}