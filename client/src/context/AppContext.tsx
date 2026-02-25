import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { socket } from '../socket';
import type { PollQuestion, PollResults, Participant, ChatMessage } from '../types';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useSessionPersistence } from '../hooks/useSessionPersistence';

// State
interface AppState {
  // User
  userId: string | null;
  userName: string | null;
  role: 'teacher' | 'student' | null;
  isJoined: boolean;
  isKicked: boolean;

  // Poll
  currentPoll: PollQuestion | null;
  pollResults: PollResults | null;
  liveResults: PollResults | null;
  hasAnswered: boolean;
  timerRemaining: number;

  // Participants
  participants: Participant[];

  // Chat
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  activeTab: 'chat' | 'participants';

  // Connection
  isConnected: boolean;
}

const initialState: AppState = {
  userId: null,
  userName: null,
  role: null,
  isJoined: false,
  isKicked: false,
  currentPoll: null,
  pollResults: null,
  liveResults: null,
  hasAnswered: false,
  timerRemaining: 0,
  participants: [],
  chatMessages: [],
  isChatOpen: false,
  activeTab: 'chat',
  isConnected: false,
};

// Actions
type Action =
  | { type: 'SET_JOINED'; payload: { userId: string; userName: string; role: 'teacher' | 'student' } }
  | { type: 'SET_KICKED' }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CURRENT_POLL'; payload: PollQuestion }
  | { type: 'SET_POLL_RESULTS'; payload: PollResults }
  | { type: 'SET_LIVE_RESULTS'; payload: PollResults }
  | { type: 'SET_HAS_ANSWERED'; payload: boolean }
  | { type: 'SET_TIMER'; payload: number }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_ACTIVE_TAB'; payload: 'chat' | 'participants' }
  | { type: 'RESET_POLL' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_JOINED':
      return {
        ...state,
        userId: action.payload.userId,
        userName: action.payload.userName,
        role: action.payload.role,
        isJoined: true,
        isKicked: false,
      };
    case 'SET_KICKED':
      return { ...state, isKicked: true, isJoined: false };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_CURRENT_POLL':
      return {
        ...state,
        currentPoll: action.payload,
        pollResults: null,
        liveResults: null,
        hasAnswered: false,
        timerRemaining: action.payload.timer,
      };
    case 'SET_POLL_RESULTS':
      return { ...state, pollResults: action.payload };
    case 'SET_LIVE_RESULTS':
      return { ...state, liveResults: action.payload };
    case 'SET_HAS_ANSWERED':
      return { ...state, hasAnswered: action.payload };
    case 'SET_TIMER':
      return { ...state, timerRemaining: action.payload };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatMessages: action.payload };
    case 'TOGGLE_CHAT':
      return { ...state, isChatOpen: !state.isChatOpen };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'RESET_POLL':
      return {
        ...state,
        currentPoll: null,
        pollResults: null,
        liveResults: null,
        hasAnswered: false,
        timerRemaining: 0,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  joinSession: (name: string, role: 'teacher' | 'student') => void;
  createPoll: (question: string, options: { text: string; isCorrect: boolean }[], timer: number) => void;
  submitAnswer: (pollId: string, selectedOption: number) => void;
  sendMessage: (message: string) => void;
  kickStudent: (studentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Socket event listeners (extracted to custom hook)
  useSocketEvents(dispatch);

  // Auto-rejoin on page refresh (extracted to custom hook)
  useSessionPersistence(state.isJoined, state.isKicked);

  const joinSession = useCallback((name: string, role: 'teacher' | 'student') => {
    if (!socket.connected) {
      socket.connect();
    }
    // Wait for connection, then emit
    const emitJoin = () => {
      socket.emit('join', { name, role });
    };
    if (socket.connected) {
      emitJoin();
    } else {
      socket.once('connect', emitJoin);
    }
  }, []);

  const createPoll = useCallback(
    (question: string, options: { text: string; isCorrect: boolean }[], timer: number) => {
      socket.emit('create_poll', { question, options, timer });
    },
    []
  );

  const submitAnswer = useCallback((pollId: string, selectedOption: number) => {
    socket.emit('submit_answer', { pollId, selectedOption });
  }, []);

  const sendMessage = useCallback((message: string) => {
    socket.emit('send_message', { message });
  }, []);

  const kickStudent = useCallback((studentId: string) => {
    socket.emit('kick_student', { studentId });
  }, []);

  return (
    <AppContext.Provider
      value={{ state, dispatch, joinSession, createPoll, submitAnswer, sendMessage, kickStudent }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
