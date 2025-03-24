import { io } from "socket.io-client"
import { Platform } from "react-native"

// Configuration for Socket.IO connection
const getSocketConnection = (serverUrl = null) => {
  // Default server URL based on platform
  // For Android emulator, 10.0.2.2 points to the host machine's localhost
  // For iOS simulator, localhost works
  const defaultUrl = Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001"

  const url = serverUrl || defaultUrl

  console.log(`Connecting to socket server at: ${url}`)

  // Create and configure socket connection
  const socket = io("http://172.20.10.14:3001", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  })

  // Setup event listeners for connection status
  socket.on("connect", () => {
    console.log('Successfully connected to server at:', url);
    console.log("Socket connected! ID:", socket.id)
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message)
  })

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason)
  })

  return socket
}

export default getSocketConnection

