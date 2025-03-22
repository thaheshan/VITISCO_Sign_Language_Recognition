import express from "express"
import { lessonController } from "../controllers/lesson-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// Public routes
router.get("/languages", lessonController.getLanguages)

// Protected routes
router.get("/", authMiddleware, lessonController.getAllLessons)
router.get("/:lessonId", authMiddleware, lessonController.getLessonById)
router.get("/language/:language", authMiddleware, lessonController.getLessonsByLanguage)
router.get("/level/:level", authMiddleware, lessonController.getLessonsByLevel)
router.get("/:lessonId/quiz", authMiddleware, lessonController.getLessonQuiz)
router.post("/:lessonId/complete", authMiddleware, lessonController.completeLesson)

export { router as lessonRoutes }

