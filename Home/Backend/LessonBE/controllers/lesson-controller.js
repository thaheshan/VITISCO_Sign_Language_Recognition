import { lessonService } from "../services/lesson-service.js"

const lessonController = {
  getAllLessons: (req, res) => {
    try {
      const lessons = lessonService.getAllLessons()
      res.status(200).json(lessons)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getLessonById: (req, res) => {
    try {
      const { lessonId } = req.params
      const lesson = lessonService.getLessonById(Number.parseInt(lessonId))

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" })
      }

      res.status(200).json(lesson)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getLessonsByLanguage: (req, res) => {
    try {
      const { language } = req.params
      const lessons = lessonService.getLessonsByLanguage(language)
      res.status(200).json(lessons)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getLessonsByLevel: (req, res) => {
    try {
      const { level } = req.params
      const lessons = lessonService.getLessonsByLevel(Number.parseInt(level))
      res.status(200).json(lessons)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getLessonQuiz: (req, res) => {
    try {
      const { lessonId } = req.params
      const quiz = lessonService.getLessonQuiz(Number.parseInt(lessonId))

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found for this lesson" })
      }

      res.status(200).json(quiz)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  completeLesson: (req, res) => {
    try {
      const { lessonId } = req.params
      const { userId } = req.user
      const { score } = req.body

      const result = lessonService.completeLesson(userId, Number.parseInt(lessonId), score)
      res.status(200).json(result)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getLanguages: (req, res) => {
    try {
      const languages = lessonService.getLanguages()
      res.status(200).json(languages)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}

export { lessonController }

