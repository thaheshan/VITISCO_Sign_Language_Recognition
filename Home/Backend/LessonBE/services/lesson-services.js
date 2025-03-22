// In-memory data store for lessons
const lessons = [
    {
      id: 1,
      title: "Basic Alphabet (අ-ඉ)",
      language: "sinhala",
      level: 1,
      cards: [
        { letter: "අ", pronunciation: "a", example: "apple", signImageUrl: "/signs/sinhala/a.png" },
        { letter: "ආ", pronunciation: "aa", example: "art", signImageUrl: "/signs/sinhala/aa.png" },
        { letter: "ඇ", pronunciation: "ae", example: "ant", signImageUrl: "/signs/sinhala/ae.png" },
        { letter: "ඈ", pronunciation: "aae", example: "ask", signImageUrl: "/signs/sinhala/aae.png" },
        { letter: "ඉ", pronunciation: "i", example: "if", signImageUrl: "/signs/sinhala/i.png" },
      ],
      xpReward: 75,
    },
    {
      id: 2,
      title: "More Vowels (ඊ-ඖ)",
      language: "sinhala",
      level: 2,
      cards: [
        { letter: "ඊ", pronunciation: "ii", example: "eel", signImageUrl: "/signs/sinhala/ii.png" },
        { letter: "උ", pronunciation: "u", example: "put", signImageUrl: "/signs/sinhala/u.png" },
        { letter: "ඌ", pronunciation: "uu", example: "food", signImageUrl: "/signs/sinhala/uu.png" },
        { letter: "ඍ", pronunciation: "ru", example: "rhythm", signImageUrl: "/signs/sinhala/ru.png" },
        { letter: "ඎ", pronunciation: "ruu", example: "root", signImageUrl: "/signs/sinhala/ruu.png" },
      ],
      xpReward: 75,
    },
    {
      id: 3,
      title: "Basic Consonants",
      language: "sinhala",
      level: 3,
      cards: [
        { letter: "ක", pronunciation: "ka", example: "cat", signImageUrl: "/signs/sinhala/ka.png" },
        { letter: "ග", pronunciation: "ga", example: "gun", signImageUrl: "/signs/sinhala/ga.png" },
        { letter: "ච", pronunciation: "cha", example: "chair", signImageUrl: "/signs/sinhala/cha.png" },
        { letter: "ජ", pronunciation: "ja", example: "jar", signImageUrl: "/signs/sinhala/ja.png" },
        { letter: "ට", pronunciation: "ta", example: "top", signImageUrl: "/signs/sinhala/ta.png" },
      ],
      xpReward: 100,
    },
    {
      id: 4,
      title: "Simple Greetings",
      language: "sinhala",
      level: 4,
      cards: [
        {
          phrase: "ආයුබෝවන්",
          meaning: "Hello/Greetings",
          usage: "Formal greeting",
          signImageUrl: "/signs/sinhala/hello.png",
        },
        {
          phrase: "සුභ උදෑසනක්",
          meaning: "Good morning",
          usage: "Morning greeting",
          signImageUrl: "/signs/sinhala/good-morning.png",
        },
        {
          phrase: "කොහොමද",
          meaning: "How are you?",
          usage: "Asking about wellbeing",
          signImageUrl: "/signs/sinhala/how-are-you.png",
        },
        {
          phrase: "හොඳින්",
          meaning: "Well/Good",
          usage: 'Response to "How are you?"',
          signImageUrl: "/signs/sinhala/well.png",
        },
        {
          phrase: "ස්තුතියි",
          meaning: "Thank you",
          usage: "Expressing gratitude",
          signImageUrl: "/signs/sinhala/thank-you.png",
        },
      ],
      xpReward: 100,
    },
    {
      id: 5,
      title: "Numbers 1-10",
      language: "sinhala",
      level: 5,
      cards: [
        { number: "1", sinhala: "එක", pronunciation: "eka", signImageUrl: "/signs/sinhala/1.png" },
        { number: "2", sinhala: "දෙක", pronunciation: "deka", signImageUrl: "/signs/sinhala/2.png" },
        { number: "3", sinhala: "තුන", pronunciation: "thuna", signImageUrl: "/signs/sinhala/3.png" },
        { number: "4", sinhala: "හතර", pronunciation: "hathara", signImageUrl: "/signs/sinhala/4.png" },
        { number: "5", sinhala: "පහ", pronunciation: "paha", signImageUrl: "/signs/sinhala/5.png" },
      ],
      xpReward: 125,
    },
    // Tamil lessons
    {
      id: 6,
      title: "Tamil Basic Alphabet",
      language: "tamil",
      level: 1,
      cards: [
        { letter: "அ", pronunciation: "a", example: "apple", signImageUrl: "/signs/tamil/a.png" },
        { letter: "ஆ", pronunciation: "aa", example: "art", signImageUrl: "/signs/tamil/aa.png" },
        { letter: "இ", pronunciation: "i", example: "in", signImageUrl: "/signs/tamil/i.png" },
        { letter: "ஈ", pronunciation: "ii", example: "eat", signImageUrl: "/signs/tamil/ii.png" },
        { letter: "உ", pronunciation: "u", example: "put", signImageUrl: "/signs/tamil/u.png" },
      ],
      xpReward: 75,
    },
    // English lessons
    {
      id: 7,
      title: "English Alphabet A-E",
      language: "english",
      level: 1,
      cards: [
        { letter: "A", pronunciation: "a", example: "apple", signImageUrl: "/signs/english/a.png" },
        { letter: "B", pronunciation: "b", example: "ball", signImageUrl: "/signs/english/b.png" },
        { letter: "C", pronunciation: "c", example: "cat", signImageUrl: "/signs/english/c.png" },
        { letter: "D", pronunciation: "d", example: "dog", signImageUrl: "/signs/english/d.png" },
        { letter: "E", pronunciation: "e", example: "egg", signImageUrl: "/signs/english/e.png" },
      ],
      xpReward: 75,
    },
  ]
  
  // In-memory data store for quizzes
  const quizzes = [
    {
      lessonId: 1,
      questions: [
        {
          question: "What is the pronunciation of 'අ'?",
          options: ["a", "aa", "ae", "i"],
          correctAnswer: 0,
        },
        {
          question: "Which letter is pronounced as 'aa'?",
          options: ["අ", "ආ", "ඇ", "ඉ"],
          correctAnswer: 1,
        },
        {
          question: "Match the letter 'ඇ' with its pronunciation:",
          options: ["a", "aa", "ae", "i"],
          correctAnswer: 2,
        },
      ],
    },
    {
      lessonId: 2,
      questions: [
        {
          question: "What is the pronunciation of 'ඊ'?",
          options: ["i", "ii", "u", "uu"],
          correctAnswer: 1,
        },
        {
          question: "Which letter is pronounced as 'u'?",
          options: ["ඊ", "උ", "ඌ", "ඍ"],
          correctAnswer: 1,
        },
        {
          question: "Match the letter 'ඌ' with its pronunciation:",
          options: ["u", "uu", "ru", "ruu"],
          correctAnswer: 1,
        },
      ],
    },
    {
      lessonId: 3,
      questions: [
        {
          question: "What is the pronunciation of 'ක'?",
          options: ["ka", "ga", "cha", "ja"],
          correctAnswer: 0,
        },
        {
          question: "Which letter is pronounced as 'ga'?",
          options: ["ක", "ග", "ච", "ජ"],
          correctAnswer: 1,
        },
        {
          question: "Match the letter 'ජ' with its pronunciation:",
          options: ["ka", "ga", "cha", "ja"],
          correctAnswer: 3,
        },
      ],
    },
  ]
  
  // In-memory data store for user progress
  const userProgress = {}
  
  const lessonService = {
    getAllLessons: () => {
      return lessons
    },
  
    getLessonById: (lessonId) => {
      return lessons.find((lesson) => lesson.id === lessonId)
    },
  
    getLessonsByLanguage: (language) => {
      return lessons.filter((lesson) => lesson.language === language)
    },
  
    getLessonsByLevel: (level) => {
      return lessons.filter((lesson) => lesson.level === level)
    },
  
    getLessonQuiz: (lessonId) => {
      return quizzes.find((quiz) => quiz.lessonId === lessonId)
    },
  
    completeLesson: (userId, lessonId, score) => {
      // Initialize user progress if it doesn't exist
      if (!userProgress[userId]) {
        userProgress[userId] = {
          completedLessons: [],
          xp: 0,
          unlockedLevel: 1,
        }
      }
  
      const lesson = lessons.find((l) => l.id === lessonId)
  
      if (!lesson) {
        throw new Error("Lesson not found")
      }
  
      // Check if lesson was already completed
      const alreadyCompleted = userProgress[userId].completedLessons.some((l) => l.lessonId === lessonId)
  
      // If not completed, add XP and update progress
      if (!alreadyCompleted) {
        userProgress[userId].xp += lesson.xpReward
        userProgress[userId].completedLessons.push({
          lessonId,
          completedAt: new Date().toISOString(),
          score,
        })
  
        // Unlock next level if needed
        if (lesson.level === userProgress[userId].unlockedLevel) {
          userProgress[userId].unlockedLevel += 1
        }
      }
  
      return {
        message: "Lesson completed successfully",
        xpEarned: alreadyCompleted ? 0 : lesson.xpReward,
        totalXp: userProgress[userId].xp,
        unlockedLevel: userProgress[userId].unlockedLevel,
      }
    },
  
    getLanguages: () => {
      const uniqueLanguages = [...new Set(lessons.map((lesson) => lesson.language))]
      return uniqueLanguages.map((language) => ({
        code: language,
        name: language.charAt(0).toUpperCase() + language.slice(1),
      }))
    },
  }
  
  export { lessonService }
  
  