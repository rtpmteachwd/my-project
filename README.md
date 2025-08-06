# 🎓 RTPM Dumaguete Science High School Interactive Game System

A comprehensive interactive quiz and game platform designed specifically for educational institutions. This system enables teachers to create engaging quiz rooms, manage questions, and conduct real-time interactive sessions with students.

## ✨ Key Features

### 👩‍🏫 For Teachers
- **📝 Create Game Rooms** - Set up custom quiz rooms with unique codes
- **❓ Question Management** - Add, edit, and delete multiple-choice questions
- **⏱️ Timer System** - Optional timers for each question (default 30 seconds)
- **📊 Real-time Monitoring** - Track student participation and answers
- **🎮 Game Control** - Start, pause, and end game sessions
- **📈 Results Tracking** - View student scores and performance analytics

### 👨‍🎓 For Students
- **🔑 Easy Join** - Enter room code and nickname to participate
- **📱 Responsive Interface** - Works on all devices (mobile, tablet, desktop)
- **⏰ Timer Display** - Visual countdown with progress bars
- **🏆 Instant Feedback** - See scores and rankings immediately
- **🎯 Interactive Experience** - Engaging quiz interface with real-time updates

### 🛠️ Technical Features
- **⚡ Real-time Communication** - Powered by Socket.IO for instant updates
- **🗄️ Database Management** - Prisma ORM with SQLite for data persistence
- **🎨 Modern UI** - Built with Next.js 15, TypeScript, and Tailwind CSS
- **📱 Mobile-First Design** - Responsive design that works on all devices
- **🔒 Type Safety** - Full TypeScript implementation with proper validation
- **🚀 Performance Optimized** - Fast loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rtpm-game-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🚀 One-Click Start (For Windows Users)

Simply double-click the `start.bat` file to automatically:
- Check if Node.js is installed
- Install dependencies
- Set up the database
- Start the application

### 🚀 One-Click Start (For Mac/Linux Users)

Run the start script:
```bash
./start.sh
```

## 🎯 How to Use

### For Teachers

1. **Create a Game Room**
   - Click "Create Game Room" on the main page
   - Enter a room name (e.g., "Science Quiz 101")
   - Click "Create" to generate the room

2. **Add Questions**
   - Find your room in the list and click "Manage Questions"
   - Click "Add Question"
   - Fill in:
     - Question text
     - Four answer choices (A, B, C, D)
     - Select the correct answer
     - Optionally set a timer (default: 30 seconds)
   - Click "Create Question"

3. **Start the Game**
   - Go back to the main page
   - Click "Start Game" on your room
   - Share the Room Code with your students

4. **Monitor Progress**
   - View joined students in real-time
   - Track answers as they come in
   - End the game when everyone is finished

### For Students

1. **Join a Game**
   - Go to the main page
   - Enter the Room Code provided by your teacher
   - Enter your nickname
   - Click "Join Game"

2. **Answer Questions**
   - Wait for the teacher to start the game
   - Questions will appear one by one
   - Select your answer before time runs out
   - Click "Submit Answer"

3. **View Results**
   - See your score immediately after the game
   - View your ranking compared to other students

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main landing page
│   ├── teacher/                 # Teacher-facing pages
│   │   ├── page.tsx            # Teacher dashboard
│   │   └── game/[id]/          # Game management interface
│   └── student/                 # Student-facing pages
│       ├── join/page.tsx       # Join game interface
│       └── game/[id]/          # Student game interface
├── components/                  # Reusable React components
│   └── ui/                     # shadcn/ui components
├── lib/                         # Utility functions
│   ├── db.ts                   # Database connection
│   └── socket.ts               # Socket.IO configuration
└── hooks/                       # Custom React hooks
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client

### Database Schema

The system uses the following main entities:
- **GameRoom** - Quiz rooms with unique codes
- **Question** - Multiple-choice questions with timer options
- **Participant** - Students joining the game
- **GameSession** - Active game sessions
- **Answer** - Student responses to questions

## 🐛 Troubleshooting

### Common Issues

**"Command not found" errors**
- Ensure Node.js and Git are properly installed
- Restart your computer after installation

**"Port 3000 is already in use"**
- Press Ctrl+C in the terminal to stop the current server
- Try running `npm run dev` again

**Database errors**
- Make sure you've run `npm run db:push` before starting
- Try deleting the database file and running the command again

### Getting Help

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the detailed instructions in `RUNNING_INSTRUCTIONS.md`
3. Contact the development team with specific error messages

## 📄 License

This project is developed for RTPM Dumaguete Science High School for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for RTPM Dumaguete Science High School 🎓
