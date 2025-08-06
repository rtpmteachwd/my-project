# How to Run RTPM Dumaguete Science High School Interactive Game System Locally

This guide will help you set up and run the interactive game system on your computer, even if you have no programming experience.

## Prerequisites

Before you begin, you'll need to install these free tools:

1. **Node.js** - This is a program that runs our application
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Click the "LTS" (Long Term Support) version download button
   - Download and run the installer (follow the on-screen instructions)
   - Restart your computer after installation

2. **Git** - This is used to download the project files
   - Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Download the version for your operating system
   - Run the installer with default settings

## Step 1: Download the Project Files

1. **Open Command Prompt** (on Windows) or **Terminal** (on Mac/Linux):
   - Press Windows Key + R, type `cmd`, and press Enter (Windows)
   - Or search for "Terminal" in your applications (Mac/Linux)

2. **Navigate to where you want to save the project**:
   ```
   cd Desktop
   ```
   (This will save the project on your Desktop, but you can choose any location)

3. **Download the project files**:
   ```
   git clone https://github.com/your-username/rtpm-game-system.git
   ```
   (Replace `your-username` with the actual GitHub username if needed)

4. **Enter the project directory**:
   ```
   cd rtpm-game-system
   ```

## Step 2: Install Required Packages

1. **Install all necessary packages** (this may take a few minutes):
   ```
   npm install
   ```
   - This will download all the tools and libraries needed for the project
   - You'll see a lot of text scrolling by - this is normal!

## Step 3: Set Up the Database

1. **Create the database**:
   ```
   npm run db:push
   ```
   - This command creates a database file that stores all the game information
   - You should see a message like "Database schema has been pushed successfully"

## Step 4: Run the Application

1. **Start the development server**:
   ```
   npm run dev
   ```
   - This will start the application on your computer
   - You'll see messages like:
     ```
     ready - started server on 0.0.0.0:3000, url: http://localhost:3000
     ```

2. **Open the application in your browser**:
   - Open Chrome, Firefox, or any web browser
   - Go to: http://localhost:3000
   - You should now see the RTPM Dumaguete Science High School Interactive Game System

## How to Use the System

### For Teachers:

1. **Create a Game Room**:
   - Click the "Create Game Room" button
   - Enter a room name (e.g., "Science Quiz 101")
   - Click "Create"

2. **Add Questions to Your Game Room**:
   - Find your game room in the list
   - Click "Manage Questions"
   - Click "Add Question"
   - Fill in:
     - Question text (e.g., "What is H2O?")
     - Answer choices (A, B, C, D)
     - Select the correct answer
     - Optionally set a timer (default is 30 seconds)
   - Click "Create Question"
   - Add as many questions as you want

3. **Start the Game**:
   - Go back to the main page
   - Find your game room
   - Click "Start Game"
   - Share the Room Code with your students

4. **Monitor Progress**:
   - You can see which students have joined
   - View their answers in real-time
   - End the game when everyone is finished

### For Students:

1. **Join a Game**:
   - Go to http://localhost:3000
   - Enter the Room Code your teacher gave you
   - Enter your name
   - Click "Join Game"

2. **Answer Questions**:
   - Wait for the teacher to start the game
   - Questions will appear one by one
   - Select your answer
   - If there's a timer, answer before time runs out
   - Click "Submit Answer"

3. **View Results**:
   - After the game ends, you'll see your score
   - You can see how you ranked compared to other students

## Troubleshooting Common Issues

### "Command not found" errors:
- Make sure you've installed Node.js and Git correctly
- Restart your computer after installation
- Try running the commands again

### "Port 3000 is already in use":
- This means another program is using port 3000
- Press Ctrl+C in the terminal to stop the current server
- Try running `npm run dev` again

### Database errors:
- Make sure you've run `npm run db:push` before starting the application
- If you see any errors, try deleting the `dev.db` file and running `npm run db:push` again

### Page doesn't load:
- Make sure the development server is running (you should see "ready - started server" in the terminal)
- Check that you're visiting http://localhost:3000 (not https://)
- Try refreshing the page

## Stopping the Application

When you're finished testing:
1. Go back to the terminal window where the server is running
2. Press Ctrl+C (hold Control and press C)
3. The server will stop

## Starting Again Next Time

1. Open Command Prompt/Terminal
2. Navigate to the project directory:
   ```
   cd Desktop/rtpm-game-system
   ```
3. Start the server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 in your browser

## Need More Help?

If you run into any issues:
1. Take a screenshot of the error message
2. Write down exactly what you were trying to do
3. Share this information with the development team

The system is designed to be intuitive and user-friendly, even for those without programming experience. Don't hesitate to explore all the features!