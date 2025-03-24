import { gameService } from "../services/gameService.js"
import { roomService } from "../services/roomService.js"
import { rooms } from "../config/socket.js"
import { logger } from "../utils/logger.js"

export const gameController = {
  async startGame(io, socket, { roomCode }) {
    try {
      const room = rooms.get(roomCode)

      if (!room) {
        return socket.emit("error", { message: "Room not found" })
      }

      // Check if user is the host
      const isHost = room.players.find((player) => player.id === socket.id)?.isHost
      if (!isHost) {
        return socket.emit("error", { message: "Only the host can start the game" })
      }

      // Check if we have enough players
      if (room.players.length < 2) {
        return socket.emit("error", { message: "Need at least 2 players to start" })
      }

      // Update room status in database
      await roomService.updateRoomStatus(room.id, "playing")

      // Get questions from database
      const questions = await gameService.getRandomQuestions(5)

      // Update room status in memory
      room.status = "playing"
      room.questions = questions
      room.currentQuestion = 0
      room.scores = {}
      room.playerAnswers = {}
      room.players.forEach((player) => {
        room.scores[player.id] = 0
      })

      // Send first question to all players
      const firstQuestion = gameService.prepareQuestionForClient(questions[0])

      io.to(roomCode).emit("game-started", {
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: questions.length,
        timeLeft: 20,
      })

      // Start the timer for the first question
      gameService.startQuestionTimer(io, roomCode, 20)

      logger.info(`Game started in room: ${roomCode}`)
    } catch (error) {
      logger.error("Error starting game:", error)
      socket.emit("error", { message: "Failed to start game" })
    }
  },

  async submitAnswer(io, socket, { roomCode, answer }) {
    try {
      const room = rooms.get(roomCode)

      if (!room || room.status !== "playing") {
        return socket.emit("error", { message: "Game not in progress" })
      }

      const currentQuestion = room.questions[room.currentQuestion]

      // Check if answer is correct
      const isCorrect = answer === currentQuestion.correct_option

      // Update score
      if (isCorrect) {
        room.scores[socket.id] = (room.scores[socket.id] || 0) + 10
      }

      // Notify player of result
      socket.emit("answer-result", {
        correct: isCorrect,
        correctAnswer: currentQuestion.correct_option,
      })

      // Record player's answer
      if (!room.playerAnswers) {
        room.playerAnswers = {}
      }

      room.playerAnswers[socket.id] = answer

      // Check if all players have answered
      if (Object.keys(room.playerAnswers).length >= room.players.length) {
        // All players have answered, move to next question
        if (room.timer) {
          clearTimeout(room.timer)
        }
        gameService.moveToNextQuestion(io, roomCode)
      }

      logger.info(`Player ${socket.id} submitted answer in room: ${roomCode}`)
    } catch (error) {
      logger.error("Error submitting answer:", error)
      socket.emit("error", { message: "Failed to submit answer" })
    }
  },
}

