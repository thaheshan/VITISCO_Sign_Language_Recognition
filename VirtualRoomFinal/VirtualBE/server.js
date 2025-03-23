// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "34.67.39.101",
  user: process.env.DB_USER || "admin123",
  password: process.env.DB_PASSWORD || "vitisco123",
  database: process.env.DB_NAME || "vitisco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database with required tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create rooms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_code VARCHAR(10) UNIQUE NOT NULL,
        status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create players table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        socket_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        room_code VARCHAR(10),
        score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_code) REFERENCES rooms(room_code) ON DELETE CASCADE
      )
    `);

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_code) REFERENCES rooms(room_code) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES players(id) ON DELETE CASCADE
      )
    `);

    // Create questions table for sign language game
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(255) NOT NULL,
        correct_answer VARCHAR(255) NOT NULL,
        options JSON NOT NULL
      )
    `);

    // Insert some sample questions if none exist
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM questions"
    );
    if (rows[0].count === 0) {
      await connection.execute(`
      INSERT INTO questions (question, correct_answer, options) VALUES
      ('What is the sign for "Hello"?', 'Wave hand', JSON_ARRAY('Wave hand', 'Touch forehead', 'Cross arms', 'Point up')),
      ('What is the sign for "Thank you"?', 'Touch lips and move hand forward', JSON_ARRAY('Touch lips and move hand forward', 'Thumbs up', 'Tap chest twice', 'Pat head')),
      ('What is the sign for "Help"?', 'One hand on top of other with thumbs up', JSON_ARRAY('One hand on top of other with thumbs up', 'Hands crossed', 'Fist in palm', 'Finger pointing down')),
      ('What is the sign for "Sorry"?', 'Fist circling chest', JSON_ARRAY('Fist circling chest', 'Hand over heart', 'Hands together as in prayer', 'Two fingers crossed')),
      ('What is the sign for "Friend"?', 'Hook index fingers together', JSON_ARRAY('Hook index fingers together', 'Shake hands', 'Hands side by side', 'Thumbs touching'));
      `);
    }

    connection.release();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Room data in memory for quick access
const rooms = new Map();
// Available room codes for random joining
const availableRooms = new Set();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user creates a room
  socket.on("create-room", async ({ roomCode }) => {
    try {
      // Insert room in database
      await pool.execute("INSERT INTO rooms (room_code) VALUES (?)", [
        roomCode,
      ]);

      // Default player name (can be updated later)
      const playerName = `Player_${socket.id.substring(0, 5)}`;

      // Insert player in database
      await pool.execute(
        "INSERT INTO players (socket_id, name, room_code) VALUES (?, ?, ?)",
        [socket.id, playerName, roomCode]
      );

      // Add room to memory
      rooms.set(roomCode, {
        players: [{ id: socket.id, name: playerName, score: 0 }],
        status: "waiting",
        messages: [],
      });

      availableRooms.add(roomCode);

      // Join socket room
      socket.join(roomCode);

      // Send room info to client
      socket.emit("room-joined", {
        roomCode,
        players: rooms.get(roomCode).players,
        isCreator: true,
      });

      console.log(`Room created: ${roomCode}`);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  });

  // When a user joins a room
  socket.on("join-room", async ({ roomCode }) => {
    try {
      // Check if room exists
      const [roomRows] = await pool.execute(
        'SELECT * FROM rooms WHERE room_code = ? AND status = "waiting"',
        [roomCode]
      );

      if (roomRows.length === 0) {
        return socket.emit("error", {
          message: "Room not found or game already started.",
        });
      }

      // Get current players in room
      const [playerRows] = await pool.execute(
        "SELECT * FROM players WHERE room_code = ?",
        [roomCode]
      );

      // Check if room is full (max 2 players)
      if (playerRows.length >= 2) {
        return socket.emit("error", { message: "Room is full." });
      }

      // Default player name (can be updated later)
      const playerName = `Player_${socket.id.substring(0, 5)}`;

      // Insert player in database
      await pool.execute(
        "INSERT INTO players (socket_id, name, room_code) VALUES (?, ?, ?)",
        [socket.id, playerName, roomCode]
      );

      // Update room in memory or create if doesn't exist
      if (!rooms.has(roomCode)) {
        const players = playerRows.map((p) => ({
          id: p.socket_id,
          name: p.name,
          score: p.score,
        }));
        players.push({ id: socket.id, name: playerName, score: 0 });

        rooms.set(roomCode, {
          players,
          status: "waiting",
          messages: [],
        });
      } else {
        rooms.get(roomCode).players.push({
          id: socket.id,
          name: playerName,
          score: 0,
        });
      }

      // Join socket room
      socket.join(roomCode);

      // Notify all clients in room about new player
      io.to(roomCode).emit("player-joined", {
        players: rooms.get(roomCode).players,
      });

      // Send room info to client
      socket.emit("room-joined", {
        roomCode,
        players: rooms.get(roomCode).players,
        isCreator: false,
      });

      console.log(`Player ${socket.id} joined room: ${roomCode}`);

      // If room is now full, remove from available rooms
      if (rooms.get(roomCode).players.length >= 2) {
        availableRooms.delete(roomCode);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", {
        message: "Failed to join room. Please try again.",
      });
    }
  });

  // When a user wants to join a random room
  socket.on("join-random", async () => {
    try {
      // If no available rooms, create a new one
      if (availableRooms.size === 0) {
        const roomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        // Insert room in database
        await pool.execute("INSERT INTO rooms (room_code) VALUES (?)", [
          roomCode,
        ]);

        // Default player name
        const playerName = `Player_${socket.id.substring(0, 5)}`;

        // Insert player in database
        await pool.execute(
          "INSERT INTO players (socket_id, name, room_code) VALUES (?, ?, ?)",
          [socket.id, playerName, roomCode]
        );

        // Add room to memory
        rooms.set(roomCode, {
          players: [{ id: socket.id, name: playerName, score: 0 }],
          status: "waiting",
          messages: [],
        });

        availableRooms.add(roomCode);

        // Join socket room
        socket.join(roomCode);

        // Send room info to client
        socket.emit("room-joined", {
          roomCode,
          players: rooms.get(roomCode).players,
          isCreator: true,
        });

        console.log(`Random room created: ${roomCode}`);
      } else {
        // Join an existing room
        const roomCode = [...availableRooms][0]; // Get first available room

        // Default player name
        const playerName = `Player_${socket.id.substring(0, 5)}`;

        // Insert player in database
        await pool.execute(
          "INSERT INTO players (socket_id, name, room_code) VALUES (?, ?, ?)",
          [socket.id, playerName, roomCode]
        );

        // Update room in memory
        rooms.get(roomCode).players.push({
          id: socket.id,
          name: playerName,
          score: 0,
        });

        // Join socket room
        socket.join(roomCode);

        // Notify all clients in room about new player
        io.to(roomCode).emit("player-joined", {
          players: rooms.get(roomCode).players,
        });

        // Send room info to client
        socket.emit("room-joined", {
          roomCode,
          players: rooms.get(roomCode).players,
          isCreator: false,
        });

        console.log(`Player ${socket.id} joined random room: ${roomCode}`);

        // If room is now full, remove from available rooms
        if (rooms.get(roomCode).players.length >= 2) {
          availableRooms.delete(roomCode);
        }
      }
    } catch (error) {
      console.error("Error joining random room:", error);
      socket.emit("error", {
        message: "Failed to join random room. Please try again.",
      });
    }
  });

  // Start the game
  socket.on("start-game", async ({ roomCode }) => {
    console.log(`Start game requested for room: ${roomCode}`); // Debugging log
    const room = rooms.get(roomCode);
    console.log(`Current player count: ${room.players.length}`); // Debugging log
    try {
      const room = rooms.get(roomCode);

      if (!room) {
        return socket.emit("error", { message: "Room not found." });
      }

      // Check if player is allowed to start game (must be creator)
      const isCreator = room.players[0].id === socket.id;
      if (!isCreator) {
        return socket.emit("error", {
          message: "Only room creator can start the game.",
        });
      }

      // Check if enough players
      if (room.players.length < 2) {
        return socket.emit("error", {
          message: "Need at least 2 players to start.",
        });
      }

      // Update room status in database
      await pool.execute(
        'UPDATE rooms SET status = "playing" WHERE room_code = ?',
        [roomCode]
      );

      // Get questions from database
      const [questions] = await pool.execute(
        "SELECT * FROM questions ORDER BY RAND() LIMIT 5"
      );

      console.log("Questions fetched from DB:", questions);

      // Format questions for the client
      const formattedQuestions = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        correctAnswer: q.correct_answer,
      }));

      // Update room in memory
      room.status = "playing";
      room.questions = formattedQuestions;
      room.currentQuestionIndex = 0;
      room.timeLeft = 20;

      // Start game for all clients in room
      io.to(roomCode).emit("game-started", {
        currentQuestion: {
          ...formattedQuestions[0],
          correctAnswer: undefined, // Don't send correct answer to clients
        },
        totalQuestions: formattedQuestions.length,
        questionNumber: 1,
        timeLeft: 20,
      });

      // Start countdown timer
      let countdown = 20;
      const timer = setInterval(() => {
        countdown--;

        // Send time update to clients
        io.to(roomCode).emit("time-update", { timeLeft: countdown });

        // If time runs out, move to next question
        if (countdown <= 0) {
          clearInterval(timer);

          // Show correct answer to everyone
          io.to(roomCode).emit("question-ended", {
            correctAnswer:
              formattedQuestions[room.currentQuestionIndex].correctAnswer,
          });

          // Wait 3 seconds before showing next question
          setTimeout(() => {
            nextQuestion(roomCode);
          }, 3000);
        }
      }, 1000);

      // Store timer reference in room object to clear it if needed
      room.timer = timer;

      console.log(`Game started in room: ${roomCode}`);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", {
        message: "Failed to start game. Please try again.",
      });
    }
  });

  // Handle answer submission
  socket.on("submit-answer", async ({ roomCode, answer }) => {
    try {
      const room = rooms.get(roomCode);

      if (!room || room.status !== "playing") {
        return;
      }

      // Find player
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex === -1) return;

      // Check if answer is correct
      const currentQuestion = room.questions[room.currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;

      // Update score based on time left and correctness
      if (isCorrect) {
        // Award points based on time left (faster = more points)
        const points = 10 + Math.floor(room.timeLeft * 0.5);
        room.players[playerIndex].score += points;

        // Update score in database
        await pool.execute(
          "UPDATE players SET score = score + ? WHERE socket_id = ?",
          [points, socket.id]
        );

        // Notify player about their score
        socket.emit("answer-result", {
          correct: true,
          points,
          totalScore: room.players[playerIndex].score,
        });
      } else {
        // Notify player their answer was wrong
        socket.emit("answer-result", {
          correct: false,
          points: 0,
          totalScore: room.players[playerIndex].score,
        });
      }

      // Check if all players have answered
      const allAnswered = room.players.every((p) => p.hasAnswered);

      if (allAnswered) {
        // Clear timer
        clearInterval(room.timer);

        // Show correct answer to everyone
        io.to(roomCode).emit("question-ended", {
          correctAnswer: currentQuestion.correctAnswer,
        });

        // Wait 3 seconds before showing next question
        setTimeout(() => {
          nextQuestion(roomCode);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  });

  // Send chat message
  socket.on("send-message", async ({ roomCode, message }) => {
    try {
      const room = rooms.get(roomCode);

      if (!room) return;

      // Find player
      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      // Get player id from database
      const [rows] = await pool.execute(
        "SELECT id FROM players WHERE socket_id = ?",
        [socket.id]
      );

      if (rows.length === 0) return;

      const playerId = rows[0].id;

      // Store message in database
      await pool.execute(
        "INSERT INTO messages (room_code, sender_id, message) VALUES (?, ?, ?)",
        [roomCode, playerId, message]
      );

      // Add message to room memory
      const newMessage = {
        id: Date.now(),
        sender: player.name,
        text: message,
      };

      room.messages.push(newMessage);

      // Send message to all clients in room
      io.to(roomCode).emit("new-message", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      // Find which room the player was in
      for (const [roomCode, room] of rooms.entries()) {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);

        if (playerIndex !== -1) {
          // Remove player from room
          room.players.splice(playerIndex, 1);

          // Remove player from database
          await pool.execute("DELETE FROM players WHERE socket_id = ?", [
            socket.id,
          ]);

          // If room is empty, remove it
          if (room.players.length === 0) {
            rooms.delete(roomCode);
            availableRooms.delete(roomCode);

            // Remove room from database
            await pool.execute("DELETE FROM rooms WHERE room_code = ?", [
              roomCode,
            ]);

            console.log(`Room deleted: ${roomCode}`);
          } else {
            // Notify remaining players
            io.to(roomCode).emit("player-left", {
              players: room.players,
            });

            // If game was in progress, end it
            if (room.status === "playing") {
              // Clear timer if exists
              if (room.timer) {
                clearInterval(room.timer);
              }

              // Update room status in database
              await pool.execute(
                'UPDATE rooms SET status = "waiting" WHERE room_code = ?',
                [roomCode]
              );

              room.status = "waiting";

              // Notify remaining players that game ended
              io.to(roomCode).emit("game-ended", {
                reason: "Player disconnected",
              });
            }

            // If room now has space, add to available rooms
            if (room.players.length === 1 && room.status === "waiting") {
              availableRooms.add(roomCode);
            }
          }

          break;
        }
      }
    } catch (error) {
      console.error("Error handling disconnection:", error);
    }
  });
});

// Helper function to move to next question
async function nextQuestion(roomCode) {
  try {
    const room = rooms.get(roomCode);
    if (!room) return;

    // Move to next question
    room.currentQuestionIndex++;

    // If all questions answered, end game
    if (room.currentQuestionIndex >= room.questions.length) {
      // Update room status in database
      await pool.execute(
        'UPDATE rooms SET status = "finished" WHERE room_code = ?',
        [roomCode]
      );

      room.status = "finished";

      // Send final scores to all clients
      io.to(roomCode).emit("game-finished", {
        scores: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
        })),
      });

      return;
    }

    // Reset timer
    room.timeLeft = 20;

    // Reset player answer status
    room.players.forEach((p) => {
      p.hasAnswered = false;
    });

    // Send next question to all clients
    const currentQuestion = room.questions[room.currentQuestionIndex];
    io.to(roomCode).emit("next-question", {
      currentQuestion: {
        ...currentQuestion,
        correctAnswer: undefined, // Don't send correct answer
      },
      questionNumber: room.currentQuestionIndex + 1,
      timeLeft: 20,
    });

    // Start new countdown timer
    let countdown = 20;
    room.timer = setInterval(() => {
      countdown--;

      // Update time left in room
      room.timeLeft = countdown;

      // Send time update to clients
      io.to(roomCode).emit("time-update", { timeLeft: countdown });

      // If time runs out, move to next question
      if (countdown <= 0) {
        clearInterval(room.timer);

        // Show correct answer to everyone
        io.to(roomCode).emit("question-ended", {
          correctAnswer: currentQuestion.correctAnswer,
        });

        // Wait 3 seconds before showing next question
        setTimeout(() => {
          nextQuestion(roomCode);
        }, 3000);
      }
    }, 1000);
  } catch (error) {
    console.error("Error moving to next question:", error);
  }
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
