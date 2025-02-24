import { useState} from 'react';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Timer, X, Copy, Crown } from 'lucide-react';


// Mock socket.io client - Replace with actual socket.io implementation
const mockSocket = {
  id: 'mock-user-1',  // Add mock ID
  emit: (event: any, data: any = {}) => console.log('Socket emit:', event, data),
  on: (event: any) => console.log('Socket on:', event)
};

interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface Question {
  id: number;
  question: string;
  options: string[];
  videoUrl: string;
}

const VirtualRoom = () => {
  const [gameState, setGameState] = useState({
    phase: 'initial', // initial, creating, joining, waiting, playing, finished
    roomCode: null as string | null,  // Allow both string and null
    players: [] as any[],
    currentQuestion: null as Question | null,
    scores: {} as Record<string, number>,
    messages: [] as any[],
    timeLeft: 0,
    questionNumber: 0,
    totalQuestions: 5
  });
  
  const [userInput, setUserInput] = useState({
    roomCode: '',
    message: '',
    selectedAnswer: null as string | null,
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  // Notification component
  const Notification = ({ message, type, onClose }: any) => (
    <div className={`
      fixed top-4 right-4 p-4 rounded-lg shadow-lg
      flex items-center justify-between space-x-4
      ${type === 'error' ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}
    `}>
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={16} />
      </button>
    </div>
  );

  // Chat Message component
  const ChatMessage = ({ message, sender }: any) => (
    <div className="flex flex-col space-y-1 mb-2">
      <span className="text-sm font-medium">{sender}</span>
      <div className="bg-gray-100 rounded-lg p-2 max-w-xs">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const createRoom = () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameState(prev => ({
      ...prev,
      phase: 'waiting',
      roomCode
    }));
    mockSocket.emit('create-room', { roomCode });
    showNotification('Room created successfully!');
  };

  const joinRoom = () => {
    if (!userInput.roomCode) {
      showNotification('Please enter a room code', 'error');
      return;
    }
    setGameState(prev => ({
      ...prev,
      phase: 'waiting',
      roomCode: userInput.roomCode
    }));
    mockSocket.emit('join-room', { roomCode: userInput.roomCode });
  };

  const joinRandomRoom = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'waiting',
      roomCode: 'RANDOM'
    }));
    mockSocket.emit('join-random');
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      questionNumber: 1,
      timeLeft: 20,
      currentQuestion: {
        id: 1,
        question: "What is the sign for 'Hello'?",
        options: ["Wave hand", "Touch forehead", "Cross arms", "Point up"],
        videoUrl: "/signs/hello.mp4"
      }
    }));
  };

  const submitAnswer = () => {
    if (!userInput.selectedAnswer) return;
    
    // Mock score calculation
    const newScores = {
      ...gameState.scores,
      [mockSocket.id]: (gameState.scores[mockSocket.id] || 0) + 10
    };
    
    setGameState(prev => ({
      ...prev,
      scores: newScores,
      questionNumber: prev.questionNumber + 1,
      currentQuestion: prev.questionNumber >= prev.totalQuestions ? null : {
        id: prev.questionNumber + 1,
        question: `What is the sign for 'Question ${prev.questionNumber + 1}'?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        videoUrl: `/signs/question${prev.questionNumber + 1}.mp4`
      }
    }));

    setUserInput(prev => ({ ...prev, selectedAnswer: null }));

    if (gameState.questionNumber >= gameState.totalQuestions) {
      setGameState(prev => ({ ...prev, phase: 'finished' }));
    }
  };

  const sendMessage = () => {
    if (!userInput.message.trim()) return;
    
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now(),
        sender: 'You',
        text: userInput.message
      }]
    }));
    
    setUserInput(prev => ({ ...prev, message: '' }));
  };

  const renderInitialScreen = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Virtual Room</h2>
        <p className="text-gray-600">Create a new room or join an existing one</p>
      </div>
      
      <div className="space-y-4">
        <Button onClick={createRoom} className="w-full">
          Create New Room
        </Button>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={userInput.roomCode}
            onChange={(e) => setUserInput(prev => ({ ...prev, roomCode: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
          <Button onClick={joinRoom} className="w-full mt-2">
            Join Room
          </Button>
        </div>
        
        <div className="text-center">
          <span className="text-gray-500">or</span>
        </div>
        
        <Button onClick={joinRandomRoom} variant="outline" className="w-full text-white hover:text-white">
          Join Random Room
        </Button>
      </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Waiting Room</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Room Code: {gameState.roomCode}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (gameState.roomCode) {
                navigator.clipboard.writeText(gameState.roomCode);
                showNotification('Room code copied!');
              }
            }}
          >
            <Copy size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Players ({gameState.players.length}/2)</h3>
        <div className="space-y-2">
          {gameState.players.map((player, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Users size={16} />
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={startGame}
        disabled={gameState.players.length < 2}
        className="w-full"
      >
        Start Game
      </Button>
    </div>
  );

  const renderGame = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="font-medium">Question {gameState.questionNumber}/{gameState.totalQuestions}</span>
        <div className="flex items-center space-x-2">
          <Timer size={16} />
          <span>{gameState.timeLeft}s</span>
        </div>
      </div>

      {gameState.currentQuestion?.videoUrl && (
        <div className="aspect-video bg-gray-100 rounded-lg">
          <video
            src={gameState.currentQuestion.videoUrl}
            controls
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">{gameState.currentQuestion?.question}</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {gameState.currentQuestion?.options.map((option, index) => (
            <Button
              key={index}
              variant={userInput.selectedAnswer === option ? "secondary" : "outline"}
              className="justify-start h-auto py-3 px-4"
              onClick={() => setUserInput(prev => ({ ...prev, selectedAnswer: option }))}
            >
              {option}
            </Button>
          ))}
        </div>

        <Button
          onClick={submitAnswer}
          disabled={!userInput.selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Scores</h3>
        <div className="space-y-2">
          {Object.entries(gameState.scores).map(([player, score]) => (
            <div key={player} className="flex justify-between">
              <span>{player}</span>
              <span className="font-medium">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6 text-center">
      <Crown className="h-16 w-16 text-yellow-500 mx-auto" />
      <h2 className="text-2xl font-bold">Game Complete!</h2>
      
      <div className="space-y-4">
        {Object.entries(gameState.scores)
          .sort(([,a], [,b]) => b - a)
          .map(([player, score], index) => (
            <div
              key={player}
              className={`p-4 rounded-lg ${index === 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {index === 0 && <Crown size={16} className="text-yellow-500" />}
                  <span className="font-medium">{player}</span>
                </div>
                <span className="text-2xl font-bold">{score}</span>
              </div>
            </div>
          ))}
      </div>

      <Button
        onClick={() => setGameState(prev => ({ ...prev, phase: 'initial' }))}
        className="w-full"
      >
        Play Again
      </Button>
    </div>
  );

  const renderChat = () => (
    <div className="border-t pt-4 mt-6">
      <div className="h-48 overflow-y-auto mb-4 space-y-2">
        {gameState.messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
          />
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput.message}
          onChange={(e) => setUserInput(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>
          <MessageCircle size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        {gameState.phase === 'initial' && renderInitialScreen()}
        {gameState.phase === 'waiting' && renderWaitingRoom()}
        {gameState.phase === 'playing' && renderGame()}
        {gameState.phase === 'finished' && renderResults()}
        
        {(gameState.phase === 'waiting' || gameState.phase === 'playing') && renderChat()}
      </div>
    </div>
  );
};

export default VirtualRoom;
