"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: "teacher" | "student") => {
    setSelectedRole(role);
    if (role === "teacher") {
      router.push("/teacher");
    } else {
      router.push("/student/join");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#F0F0F0] to-[#FADADD] gameshow-container flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-[#D291BC] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">🎮</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#2E2E2E]">
              RTPM Dumaguete
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]">
            Science High School Interactive Gameshow
          </h2>
          <p className="text-lg text-[#2E2E2E] max-w-2xl mx-auto">
            Transform classroom learning into an exciting, competitive experience with real-time quizzes, 
            buzzer systems, and engaging multimedia content.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-[#A1C6EA] text-[#2E2E2E]">
              Real-time Buzzer
            </Badge>
            <Badge variant="secondary" className="bg-[#B8E1DD] text-[#2E2E2E]">
              Live Leaderboard
            </Badge>
            <Badge variant="secondary" className="bg-[#D291BC] text-white">
              Multiple Question Types
            </Badge>
            <Badge variant="secondary" className="bg-[#FF6F61] text-white">
              No Account Required
            </Badge>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Teacher Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedRole === "teacher" ? "ring-4 ring-[#D291BC]" : ""
            }`}
            onClick={() => handleRoleSelect("teacher")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-[#D291BC] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">👩‍🏫</span>
              </div>
              <CardTitle className="text-2xl text-[#2E2E2E]">Teacher/Admin</CardTitle>
              <CardDescription className="text-[#2E2E2E]">
                Host and control game sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-[#2E2E2E]">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Create game rooms with unique codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Design custom questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Monitor student progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Control buzzer system</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>View real-time leaderboard</span>
                </div>
              </div>
              <Button 
                className="w-full bg-[#D291BC] hover:bg-[#C17FA9] text-white font-semibold"
                size="lg"
              >
                Continue as Teacher
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedRole === "student" ? "ring-4 ring-[#FF6F61]" : ""
            }`}
            onClick={() => handleRoleSelect("student")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-[#FF6F61] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">👨‍🎓</span>
              </div>
              <CardTitle className="text-2xl text-[#2E2E2E]">Student/Participant</CardTitle>
              <CardDescription className="text-[#2E2E2E]">
                Join games and compete with classmates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-[#2E2E2E]">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>No account required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Join with nickname & room code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Buzz in to answer questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Earn points for correct answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Compete on live leaderboard</span>
                </div>
              </div>
              <Button 
                className="w-full bg-[#FF6F61] hover:bg-[#E55A4A] text-white font-semibold"
                size="lg"
              >
                Continue as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12 text-center space-y-4">
          <h3 className="text-2xl font-bold text-[#2E2E2E]">Supported Question Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-[#2E2E2E]">True/False</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">❓</div>
              <div className="text-sm font-medium text-[#2E2E2E]">Multiple Choice</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">✍️</div>
              <div className="text-sm font-medium text-[#2E2E2E]">Short Answer</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-sm font-medium text-[#2E2E2E]">Image-Based</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}