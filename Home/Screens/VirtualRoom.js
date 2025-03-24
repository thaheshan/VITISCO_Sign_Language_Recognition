"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import Video from "react-native-video"
import getSocketConnection from "./utilities/config/socket-config"

const VirtualRoom = () => {
  // Socket.IO reference
  const socketRef = useRef(null)

  const [gameState, setGameState] = useState({
    phase: "initial", // initial, creating, joining, waiting, playing, finished
    roomCode: null,
    players: [],
    currentQuestion: null,
    scores: {},
    messages: [],
    timeLeft: 0,
    questionNumber: 0,
    totalQuestions: 5,
    isCreator: false,
  })

  const [userInput, setUserInput] = useState({
    roomCode: "",
    message: "",
    selectedAnswer: null,
  })

  const [notification, setNotification] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    socketRef.current = getSocketConnection()

    // Setup socket event listeners
    setupSocketListeners()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Setup all socket event listeners
  const setupSocketListeners = () => {
    const socket = socketRef.current
    if (!socket) return

    // Room events
    socket.on("room-joined", handleRoomJoined)
    socket.on("player-joined", handlePlayerJoined)
    socket.on("player-left", handlePlayerLeft)

    // Game events
    socket.on("game-started", handleGameStarted)
    socket.on("next-question", handleNextQuestion)
    socket.on("time-update", handleTimeUpdate)
    socket.on("question-ended", handleQuestionEnded)
    socket.on("answer-result", handleAnswerResult)
    socket.on("game-finished", handleGameFinished)
    socket.on("game-ended", handleGameEnded)

    // Chat events
    socket.on("new-message", handleNewMessage)

    // Error events
    socket.on("error", handleError)
  }

  // Event handlers for socket events
  const handleRoomJoined = (data) => {
    setGameState((prev) => ({
      ...prev,
      phase: "waiting",
      roomCode: data.roomCode,
      players: data.players,
      isCreator: data.isCreator,
    }));
    showNotification(`Joined room: ${data.roomCode}`)
  }

  const handlePlayerJoined = (data) => {
    setGameState((prev) => ({
      ...prev,
      players: data.players,
    }))
    showNotification("A new player has joined!")
  }

  const handlePlayerLeft = (data) => {
    setGameState((prev) => ({
      ...prev,
      players: data.players,
    }))
    showNotification("A player has left the room")
  }

  const handleGameStarted = (data) => {
    setGameState((prev) => ({
      ...prev,
      phase: "playing",
      currentQuestion: data.currentQuestion,
      totalQuestions: data.totalQuestions,
      questionNumber: data.questionNumber,
      timeLeft: data.timeLeft,
    }))
  }

  const handleNextQuestion = (data) => {
    setGameState((prev) => ({
      ...prev,
      currentQuestion: data.currentQuestion,
      questionNumber: data.questionNumber,
      timeLeft: data.timeLeft,
    }))
    setUserInput((prev) => ({ ...prev, selectedAnswer: null }))
  }

  const handleTimeUpdate = (data) => {
    setGameState((prev) => ({
      ...prev,
      timeLeft: data.timeLeft,
    }))
  }

  const handleQuestionEnded = (data) => {
    // Show correct answer
    showNotification(`Correct answer: ${data.correctAnswer}`, "success")
  }

  const handleAnswerResult = (data) => {
    if (data.correct) {
      showNotification(`Correct! +${data.points} points`, "success")
    } else {
      showNotification("Incorrect answer", "error")
    }

    // Update local score
    setGameState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [socketRef.current.id]: data.totalScore,
      },
    }))
  }

  const handleGameFinished = (data) => {
    setGameState((prev) => ({
      ...prev,
      phase: "finished",
      scores: data.scores.reduce((acc, player) => {
        acc[player.id] = player.score
        return acc
      }, {}),
    }))
  }

  const handleGameEnded = (data) => {
    setGameState((prev) => ({
      ...prev,
      phase: "waiting",
    }))
    showNotification(`Game ended: ${data.reason}`, "error")
  }

  const handleNewMessage = (message) => {
    setGameState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  }

  const handleError = (data) => {
    showNotification(data.message, "error")
  }

  // Notification component
  const NotificationComponent = ({ message, type, onClose }) => (
    <View style={[styles.notification, type === "error" ? styles.errorNotification : styles.successNotification]}>
      <Text style={type === "error" ? styles.errorText : styles.successText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  )

  // Chat Message component
  const ChatMessage = ({ message, sender }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageSender}>{sender}</Text>
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  )

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const createRoom = () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    socketRef.current.emit("create-room", { roomCode })
  }

  const joinRoom = () => {
    if (!userInput.roomCode) {
      showNotification("Please enter a room code", "error")
      return
    }
    socketRef.current.emit("join-room", { roomCode: userInput.roomCode })
  }

  const joinRandomRoom = () => {
    socketRef.current.emit("join-random")
  }

  const startGame = () => {
    if (!gameState.roomCode){
      showNotification("Room code not found", "error");
      return;
    } 
    console.log("Starting game for room: ", gameState.roomCode);
    socketRef.current.emit("start-game", { roomCode: gameState.roomCode });
  }

  const submitAnswer = () => {
    if (!userInput.selectedAnswer || !gameState.roomCode) return

    socketRef.current.emit("submit-answer", {
      roomCode: gameState.roomCode,
      answer: userInput.selectedAnswer,
    })
  }

  const sendMessage = () => {
    if (!userInput.message.trim() || !gameState.roomCode) return

    socketRef.current.emit("send-message", {
      roomCode: gameState.roomCode,
      message: userInput.message,
    })

    setUserInput((prev) => ({ ...prev, message: "" }))
  }

  const copyToClipboard = (text) => {
    Clipboard.setString(text)
    showNotification("Room code copied!")
  }

  const renderInitialScreen = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("./assets/vitisco logo PNG.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome to Virtual Room</Text>
        <Text style={styles.subheaderText}>Create a new room or join an existing one</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={createRoom}>
          <Text style={styles.buttonText}>Create New Room</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Room Code"
            value={userInput.roomCode}
            onChangeText={(text) => setUserInput((prev) => ({ ...prev, roomCode: text }))}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={joinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <Text style={styles.orText}>or</Text>
        </View>

        <TouchableOpacity style={styles.outlineButton} onPress={joinRandomRoom}>
          <Text style={styles.outlineButtonText}>Join Random Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderWaitingRoom = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              setGameState((prev) => ({
                ...prev,
                phase: "initial",
                roomCode: null,
              }))
            }
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Waiting Room</Text>
        </View>
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeText}>Room Code: {gameState.roomCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => (gameState.roomCode ? copyToClipboard(gameState.roomCode) : null)}
          >
            <Ionicons name="copy-outline" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.playersContainer}>
        <Text style={styles.mediumTitle}>Players ({gameState.players.length}/2)</Text>
        <View style={styles.playersList}>
          {gameState.players.map((player, index) => (
            <View key={index} style={styles.playerItem}>
              <Ionicons name="people-outline" size={16} color="#333" />
              <Text style={styles.playerName}>{player.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {gameState.isCreator && (
        <TouchableOpacity
          style={[styles.primaryButton, gameState.players.length < 2 && styles.disabledButton]}
          onPress={startGame}
          disabled={gameState.players.length < 2}
        >
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      )}

      {!gameState.isCreator && (
        <View style={styles.waitingMessage}>
          <Text style={styles.waitingText}>Waiting for host to start the game...</Text>
        </View>
      )}
    </View>
  )

  const renderGame = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.regularText}>
          Question {gameState.questionNumber}/{gameState.totalQuestions}
        </Text>
        <View style={styles.timerContainer}>
          <Ionicons name="timer-outline" size={16} color="#333" />
          <Text style={styles.regularText}>{gameState.timeLeft}s</Text>
        </View>
      </View>

      {gameState.currentQuestion?.videoUrl && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: gameState.currentQuestion.videoUrl }}
            style={styles.video}
            controls={true}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{gameState.currentQuestion?.question}</Text>

        <View style={styles.optionsContainer}>
          {gameState.currentQuestion?.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, userInput.selectedAnswer === option && styles.selectedOption]}
              onPress={() => setUserInput((prev) => ({ ...prev, selectedAnswer: option }))}
            >
              <Text style={[styles.optionText, userInput.selectedAnswer === option && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !userInput.selectedAnswer && styles.disabledButton]}
          onPress={submitAnswer}
          disabled={!userInput.selectedAnswer}
        >
          <Text style={styles.buttonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoresSection}>
        <Text style={styles.mediumTitle}>Scores</Text>
        <View style={styles.scoresList}>
          {Object.entries(gameState.scores).map(([player, score]) => (
            <View key={player} style={styles.scoreRow}>
              <Text style={styles.regularText}>{player}</Text>
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <Ionicons name="trophy" size={64} color="#FFD700" style={styles.trophyIcon} />
      <Text style={styles.resultsTitle}>Game Complete!</Text>

      <ScrollView style={styles.resultsScrollView}>
        {Object.entries(gameState.scores)
          .sort(([, a], [, b]) => b - a)
          .map(([player, score], index) => (
            <View key={player} style={[styles.resultItem, index === 0 && styles.winnerItem]}>
              <View style={styles.resultNameContainer}>
                {index === 0 && <Ionicons name="trophy" size={16} color="#FFD700" />}
                <Text style={styles.resultName}>{player}</Text>
              </View>
              <Text style={styles.resultScore}>{score}</Text>
            </View>
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setGameState((prev) => ({ ...prev, phase: "initial" }))}
      >
        <Text style={styles.buttonText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  )

  const renderChat = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.chatContainer}>
      <View style={styles.chatDivider} />
      <ScrollView style={styles.messagesScrollView}>
        {gameState.messages.map((message) => (
          <ChatMessage key={message.id} message={message.text} sender={message.sender} />
        ))}
      </ScrollView>

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={userInput.message}
          onChangeText={(text) => setUserInput((prev) => ({ ...prev, message: text }))}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      {notification && (
        <NotificationComponent
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {gameState.phase === "initial" && renderInitialScreen()}
          {gameState.phase === "waiting" && renderWaitingRoom()}
          {gameState.phase === "playing" && renderGame()}
          {gameState.phase === "finished" && renderResults()}
        </View>

        {(gameState.phase === "waiting" || gameState.phase === "playing") && renderChat()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
    transform: [{ scale: 1 }],
  },
  logo: {
    height: 300,
    width: "100%",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subheaderText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  orContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  orText: {
    color: "#666",
    fontSize: 14,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 16,
  },
  notification: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 100,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: "90%",
  },
  successNotification: {
    backgroundColor: "#ECFDF5",
  },
  errorNotification: {
    backgroundColor: "#FEF2F2",
  },
  successText: {
    color: "#065F46",
  },
  errorText: {
    color: "#B91C1C",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  roomCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomCodeText: {
    fontSize: 10,
    fontWeight: "200",
    marginRight: 8,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  playersContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  mediumTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  playersList: {
    marginTop: 8,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  playerName: {
    marginLeft: 8,
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  regularText: {
    fontSize: 14,
    fontWeight: "500",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  selectedOption: {
    backgroundColor: "#EBF5FF",
    borderColor: "#3B82F6",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  scoresSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  scoresList: {
    marginTop: 8,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreText: {
    fontWeight: "600",
    fontSize: 14,
  },
  resultsContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  trophyIcon: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  resultsScrollView: {
    width: "100%",
    maxHeight: 300,
    marginBottom: 24,
  },
  resultItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  winnerItem: {
    backgroundColor: "#FFF9DB",
  },
  resultNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  resultScore: {
    fontSize: 22,
    fontWeight: "700",
  },
  chatContainer: {
    marginTop: 24,
  },
  chatDivider: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: 16,
  },
  messagesScrollView: {
    maxHeight: 200,
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  messageContent: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 8,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#3B82F6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  waitingMessage: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
  },
  waitingText: {
    color: "#666",
    fontStyle: "italic",
  },
})

export default VirtualRoom
