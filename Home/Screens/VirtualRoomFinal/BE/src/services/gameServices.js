import { Question } from "../models/Question.js"
import { GameResult } from "../models/GameResult.js"
import { Room } from "../models/Room.js"
import { rooms } from "../config/socket.js"
import { logger } from "../utils/logger.js"

export const gameService = {
  async getRandomQuestions(limit) {
    return await Question.getRandomQuestions(limit)
  },

  prepareQuestionForClient(question) {
    return {
      id: question.id,
      question: question.question_text,
      options: [question.option_a, question.option_b, question.option_c, question.option_d],
      videoUrl: question.video_url,
    }
  },

  startQuestionTimer(io, roomCode, seconds) {
    const room = rooms.get(roomCode)

    if (!room) return

    let timeLeft = seconds

    // Send initial time
    io.to(roomCode).emit("time-update", { timeLeft })

    // Clear any existing timer
    if (room.timer) {
      clearTimeout(room.timer)
    }

    // Set up interval to update time
    const interval = setInterval(() => {
      timeLeft--

      io.to(roomCode).emit("time-update", { timeLeft })

      if (timeLeft <= 0) {
        clearInterval(interval)
        this.moveToNextQuestion(io, roomCode)
      }
    }, 1000)

    room.timer = interval
  },

  async moveToNextQuestion(io, roomCode) {
    const room = rooms.get(roomCode)

    if (!room) return

    // Reset player answers
    room.playerAnswers = {}

    // Move to next question
    room.currentQuestion++

    // Check if we have more questions
    if (room.currentQuestion < room.questions.length) {
      const nextQuestion = this.prepareQuestionForClient(room.questions[room.currentQuestion])

      io.to(roomCode).emit("next-question", {
        question: nextQuestion,
        questionNumber: room.currentQuestion + 1,
        totalQuestions: room.questions.length,
        timeLeft: 20,
        scores: room.scores,
      })

      // Start timer for next question
      this.startQuestionTimer(io, roomCode, 20)
    } else {
      // Game is over
      try {
        // Update room status in database
        await Room.updateStatus(room.id, "finished")

        // Save game results
        for (const [playerId, score] of Object.entries(room.scores)) {
          await GameResult.create(room.id, playerId, score)
        }

        // Send final results to clients
        io.to(roomCode).emit("game-over", {
          scores: room.scores,
        })

        // Update room status in memory
        room.status = "finished"

        logger.info(`Game over in room: ${roomCode}`)
      } catch (error) {
        logger.error("Error ending game:", error)
      }
    }
  },
}

