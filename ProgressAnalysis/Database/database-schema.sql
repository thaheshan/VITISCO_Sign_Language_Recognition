
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

CREATE TABLE UserLesson (
    userId INT,
    lessonId INT,
    completionStatus BOOLEAN,
    completionDateTime DATETIME,
    PRIMARY KEY (userId, lessonId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (lessonId) REFERENCES Lesson(lessonId)
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
    optionA VARCHAR(50),
    optionB VARCHAR(50),
    optionC VARCHAR(50),
    optionD VARCHAR(50),
    question VARCHAR(50),
    categoryId INT,
    languageId INT,
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId),
    FOREIGN KEY (languageId) REFERENCES Language(languageId)
);

CREATE TABLE UserQuiz (
    userId INT,
    quizId INT,
    completionStatus BOOLEAN,
    completionDateTime DATETIME,
    marksPercentage DECIMAL(5,2),
    marksXPPoints INT,
    minutes INT,   
    seconds INT,
    PRIMARY KEY (userId, quizId),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId)
);

CREATE TABLE VirtualRoom (
    roomCode INT PRIMARY KEY AUTO_INCREMENT,
    winnerId INT,
    hostId INT,
    winnerXPPoints INT,
    FOREIGN KEY (winnerId) REFERENCES User(userId),
    FOREIGN KEY (hostId) REFERENCES User(userId)
);

CREATE TABLE VirtualRoomQuiz (
    roomCode INT,
    quizId INT,
    PRIMARY KEY (roomCode, quizId),
    FOREIGN KEY (roomCode) REFERENCES VirtualRoom(roomCode),
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId)
);

CREATE TABLE UserVirtualRoom (
    userId INT,
    roomCode INT,
    PRIMARY KEY (userId, roomCode),
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (roomCode) REFERENCES VirtualRoom(roomCode)
);

CREATE TABLE Schedule (
    scheduleId INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50),
    Description VARCHAR(100),
    Status VARCHAR(20),
    DateTime DATETIME,
    UserId INT,
    FOREIGN KEY (UserId) REFERENCES User(UserId)
);


 CREATE TABLE UserXP (
     userId INT,
     date DATE,
     xpPoints INT,
     PRIMARY KEY (userId, date),
     FOREIGN KEY (userId) REFERENCES User(userId)
 );


