import { useEffect } from 'react';
import { socket } from '../socket';
import type { PollQuestion, PollResults, Participant, ChatMessage } from '../types';
import toast from 'react-hot-toast';

type Dispatch = React.Dispatch<any>;

/**
 * Manages all socket.io event listeners and dispatches
 * state updates via the provided dispatch function.
 */
export function useSocketEvents(dispatch: Dispatch): void {
  useEffect(() => {
    const handlers = {
      connect: () => dispatch({ type: 'SET_CONNECTED', payload: true }),
      disconnect: () => dispatch({ type: 'SET_CONNECTED', payload: false }),

      joined: (data: { id: string; name: string; role: 'teacher' | 'student' }) => {
        dispatch({
          type: 'SET_JOINED',
          payload: { userId: data.id, userName: data.name, role: data.role },
        });
        localStorage.setItem('poll_session', JSON.stringify({ name: data.name, role: data.role }));
        toast.success(`Welcome, ${data.name}!`);
      },

      error_message: (data: { message: string }) => toast.error(data.message),

      new_question: (data: PollQuestion) => {
        dispatch({ type: 'SET_CURRENT_POLL', payload: data });
        toast('New question!', { icon: '📝' });
      },

      timer_update: (data: { remaining: number }) =>
        dispatch({ type: 'SET_TIMER', payload: data.remaining }),

      poll_results: (data: PollResults) =>
        dispatch({ type: 'SET_POLL_RESULTS', payload: data }),

      live_results: (data: PollResults) =>
        dispatch({ type: 'SET_LIVE_RESULTS', payload: data }),

      answer_submitted: (data: { message: string }) => {
        dispatch({ type: 'SET_HAS_ANSWERED', payload: true });
        toast.success(data.message);
      },

      participants_update: (data: Participant[]) =>
        dispatch({ type: 'SET_PARTICIPANTS', payload: data }),

      chat_history: (data: ChatMessage[]) =>
        dispatch({ type: 'SET_CHAT_HISTORY', payload: data }),

      new_chat_message: (data: ChatMessage) =>
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: data }),

      kicked: () => {
        dispatch({ type: 'SET_KICKED' });
        localStorage.removeItem('poll_session');
        toast.error('You have been kicked out by the teacher');
      },
    };

    // Register all handlers
    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler as (...args: any[]) => void);
    }

    // Cleanup on unmount
    return () => {
      for (const event of Object.keys(handlers)) {
        socket.off(event);
      }
    };
  }, [dispatch]);
}
