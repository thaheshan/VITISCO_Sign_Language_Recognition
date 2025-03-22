
CREATE TABLE User (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(50) NOT NULL,
    password VARCHAR(15) NOT NULL,
    dob DATE,
    phoneNumber VARCHAR(15),
    gender CHAR(1),
    nativeLanguage VARCHAR(15)
    
);

CREATE TABLE Language (
    languageId INT PRIMARY KEY AUTO_INCREMENT,
    languageName VARCHAR(15) NOT NULL
);

CREATE TABLE UserLanguage (
    userId INT,
    languageId INT,
    PRIMARY KEY (userId, languageId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (languageId) REFERENCES Language(languageId)
);

CREATE TABLE Category (
    categoryId INT PRIMARY KEY AUTO_INCREMENT,
    categoryName VARCHAR(15) NOT NULL
);

CREATE TABLE Lesson (
    lessonId INT PRIMARY KEY AUTO_INCREMENT,
    contentURL VARCHAR(100),
    lessonText VARCHAR(100),
    XPPoints INT,
    categoryId INT,
    languageId INT,
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId),
    FOREIGN KEY (languageId) REFERENCES Language(languageId)
);


CREATE TABLE Challenge (
    challengeId INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50),
    description VARCHAR(100),
    XPPoints INT
);

CREATE TABLE UserChallenge (
    userId INT,
    challengeId INT,
    completionDateTime DATETIME,
    PRIMARY KEY (userId, challengeId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (challengeId) REFERENCES Challenge(challengeId)
);

CREATE TABLE Quiz (
    quizId INT PRIMARY KEY AUTO_INCREMENT,
    XPPoints INT,
    optionA VARCHAR(100),
    optionB VARCHAR(100),
    optionC VARCHAR(100),
    optionD VARCHAR(100),
    question VARCHAR(100),
    categoryId INT,
    languageId INT,
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId),
    FOREIGN KEY (languageId) REFERENCES Language(languageId)
);



CREATE TABLE VirtualRoom (
    roomCode VARCHAR(20) PRIMARY KEY,
    winnerId INT,
    hostId INT,
    winnerXPPoints INT,
    FOREIGN KEY (winnerId) REFERENCES User(userId),
    FOREIGN KEY (hostId) REFERENCES User(userId)
);



CREATE TABLE UserVirtualRoom (
    userId INT,
    roomCode VARCHAR(20),
    PRIMARY KEY (userId, roomCode),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (roomCode) REFERENCES VirtualRoom(roomCode)
);

CREATE TABLE Schedule (
    scheduleId INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50),
    description VARCHAR(100),
    status VARCHAR(20),
    dateTime DATETIME,
    userId INT,
    FOREIGN KEY (userId) REFERENCES User(userId)
);


 CREATE TABLE UserXP (
     userId INT,
     date DATE,
     XPPoints INT,
     PRIMARY KEY (userId, date),
     FOREIGN KEY (userId) REFERENCES User(userId)
 );




CREATE TABLE Session(
    sessionId INT,
    lessonId Int,
    PRIMARY KEY (sessionId, lessonId),
    FOREIGN KEY (lessonId) REFERENCES Lesson(lessonId)
);

CREATE TABLE UserSession(
    userId INT,
    sessionId INT,
    completionDateTime DATETIME,
    PRIMARY KEY (userId, sessionId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (sessionId) REFERENCES Session(sessionId)
);

CREATE TABLE QuizSession( 
    quizSessionId INT, 
    quizId Int, 
    PRIMARY KEY (quizSessionId, quizId), 
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId) 
);
CREATE TABLE UserQuizSession (
    userId INT,
    quizSessionId INT,
    completionDateTime DATETIME,
    marksPercentage DECIMAL(5,2),
    marksXPPoints INT,
    minutes INT,   
    seconds INT,
    PRIMARY KEY (userId, quizSessionId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (quizSessionId) REFERENCES QuizSession(quizSessionId)
);
CREATE TABLE VirtualRoomQuiz (
    roomCode VARCHAR(20),
    quizSessionId INT,
    PRIMARY KEY (roomCode, quizSessionId),
    FOREIGN KEY (roomCode) REFERENCES VirtualRoom(roomCode),
    FOREIGN KEY (quizSessionId) REFERENCES QuizSession(quizSessionId)
);
CREATE TABLE LanguageCategorySession (
    sessionNo INT,
    sessionId INT,
    languageId INT,
    categoryId INT,
    PRIMARY KEY (sessionNo, languageId, categoryId), 
    FOREIGN KEY (languageId) REFERENCES Language(languageId),
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId)
);