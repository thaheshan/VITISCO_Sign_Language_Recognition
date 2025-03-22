import { lessonService } from "./lesson-service.js"

// In-memory data store for users
const users = []

// In-memory data store for user progress
const userProgress = {}

// In-memory data store for user rewards
const userRewards = {}

// In-memory data store for user pathways
const userPathways = {}

const userService = {
  getUserById: (userId) => {
    return users.find((user) => user.id === userId)
  },

  updateUser: (userId, userData) => {
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      return null
    }

    // Don't allow updating sensitive fields
    const { password, id, ...updatableData } = userData

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updatableData,
      updatedAt: new Date().toISOString(),
    }

    return users[userIndex]
  },

  getUserProgress: (userId) => {
    // Initialize progress if it doesn't exist
    if (!userProgress[userId]) {
      userProgress[userId] = {
        completedLessons: [],
        xp: 0,
        unlockedLevel: 1,
        streak: 0,
        lastActive: new Date().toISOString(),
      }
    }

    // Get all lessons
    const allLessons = lessonService.getAllLessons()

    // Map lessons with completion status
    const lessonsWithStatus = allLessons.map((lesson) => {
      const isCompleted = userProgress[userId].completedLessons.some((l) => l.lessonId === lesson.id)

      const isUnlocked = lesson.level <= userProgress[userId].unlockedLevel

      return {
        ...lesson,
        isCompleted,
        isUnlocked,
      }
    })

    return {
      xp: userProgress[userId].xp,
      unlockedLevel: userProgress[userId].unlockedLevel,
      streak: userProgress[userId].streak,
      lastActive: userProgress[userId].lastActive,
      completedLessons: userProgress[userId].completedLessons,
      lessons: lessonsWithStatus,
    }
  },

  customizePathway: (userId, level, topics) => {
    // Initialize user pathway if it doesn't exist
    if (!userPathways[userId]) {
      userPathways[userId] = {
        level: "Basic",
        topics: [],
        customizedAt: null,
      }
    }

    // Update pathway
    userPathways[userId] = {
      level: level || "Basic",
      topics: topics || [],
      customizedAt: new Date().toISOString(),
    }

    // Get all lessons
    const allLessons = lessonService.getAllLessons()

    // Filter lessons based on customization
    let customizedLessons = allLessons

    // Filter by level if specified
    if (level) {
      const levelMap = {
        Beginner: 1,
        Basic: [2, 3],
        Intermediate: [4, 5],
        Advanced: [6, 7, 8],
      }

      const levelValues = levelMap[level]

      if (Array.isArray(levelValues)) {
        customizedLessons = customizedLessons.filter((lesson) => levelValues.includes(lesson.level))
      } else if (levelValues) {
        customizedLessons = customizedLessons.filter((lesson) => lesson.level === levelValues)
      }
    }

    // Filter by topics if specified
    if (topics && topics.length > 0) {
      // This is a simplified example - in a real app, you'd have topic tags for each lesson
      const topicMap = {
        Alphabet: [1, 2, 6, 7],
        Numbers: [5],
        Greetings: [4],
        Family: [],
        Food: [],
        Animals: [],
      }

      const lessonIds = topics.flatMap((topic) => topicMap[topic] || [])

      if (lessonIds.length > 0) {
        customizedLessons = customizedLessons.filter((lesson) => lessonIds.includes(lesson.id))
      }
    }

    return {
      pathway: userPathways[userId],
      recommendedLessons: customizedLessons,
    }
  },

  getUserRewards: (userId) => {
    // Initialize rewards if they don't exist
    if (!userRewards[userId]) {
      userRewards[userId] = {
        badges: [],
        achievements: [],
        dailyRewards: {
          lastClaimed: null,
          streak: 0,
        },
      }
    }

    return userRewards[userId]
  },

  claimDailyReward: (userId) => {
    // Initialize rewards if they don't exist
    if (!userRewards[userId]) {
      userRewards[userId] = {
        badges: [],
        achievements: [],
        dailyRewards: {
          lastClaimed: null,
          streak: 0,
        },
      }
    }

    // Initialize progress if it doesn't exist
    if (!userProgress[userId]) {
      userProgress[userId] = {
        completedLessons: [],
        xp: 0,
        unlockedLevel: 1,
        streak: 0,
        lastActive: new Date().toISOString(),
      }
    }

    const now = new Date()
    const lastClaimed = userRewards[userId].dailyRewards.lastClaimed
      ? new Date(userRewards[userId].dailyRewards.lastClaimed)
      : null

    // Check if user already claimed today's reward
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastClaimedDay = lastClaimed
      ? new Date(lastClaimed.getFullYear(), lastClaimed.getMonth(), lastClaimed.getDate())
      : null

    if (lastClaimedDay && today.getTime() === lastClaimedDay.getTime()) {
      throw new Error("Daily reward already claimed today")
    }

    // Check if streak should continue or reset
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutiveDay = lastClaimedDay && lastClaimedDay.getTime() === yesterday.getTime()

    // Update streak
    if (isConsecutiveDay) {
      userRewards[userId].dailyRewards.streak += 1
    } else if (!lastClaimed) {
      userRewards[userId].dailyRewards.streak = 1
    } else {
      userRewards[userId].dailyRewards.streak = 1 // Reset streak
    }

    // Update last claimed date
    userRewards[userId].dailyRewards.lastClaimed = now.toISOString()

    // Calculate reward based on streak
    const streakMultiplier = Math.min(Math.floor(userRewards[userId].dailyRewards.streak / 5) + 1, 5)
    const xpReward = 50 * streakMultiplier

    // Add XP to user
    userProgress[userId].xp += xpReward

    // Determine bonus rewards based on streak
    const bonusRewards = []

    if (userRewards[userId].dailyRewards.streak === 7) {
      bonusRewards.push("New Avatar Accessory")
    } else if (userRewards[userId].dailyRewards.streak === 30) {
      bonusRewards.push("Bonus Lesson Unlocked")
    }

    return {
      xpEarned: xpReward,
      totalXp: userProgress[userId].xp,
      streak: userRewards[userId].dailyRewards.streak,
      bonusRewards,
    }
  },
}

export { userService }

