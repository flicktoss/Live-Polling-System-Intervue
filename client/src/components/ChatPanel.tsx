import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const ChatPanel: React.FC = () => {
  const { state, sendMessage, kickStudent, dispatch } = useApp();
  const { chatMessages, participants, activeTab, userId } = state;
  const role = state.role;
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const students = participants.filter((p) => p.role === 'student');

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border border-primary/30 z-50 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'chat' })}
          className={`flex-1 py-3 text-base font-semibold transition-colors ${
            activeTab === 'chat'
              ? 'text-gray-900 border-b-2 border-primary'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'participants' })}
          className={`flex-1 py-3 text-base font-semibold transition-colors ${
            activeTab === 'participants'
              ? 'text-gray-900 border-b-2 border-primary'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Participants
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.length === 0 && (
              <p className="text-center text-gray-400 text-xs mt-8">No messages yet</p>
            )}
            {chatMessages.map((msg) => {
              const isOwn = msg.senderId === userId;
              return (
                <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs font-semibold mb-1 text-primary">
                    {isOwn ? 'You' : msg.senderName}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                      isOwn
                        ? 'bg-primary text-white'
                        : 'bg-gray-dark text-white'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-2 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              className="bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Participants header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">Name</span>
            {role === 'teacher' && <span className="text-xs font-medium text-gray-500">Action</span>}
          </div>

          {/* Participants list */}
          <div className="divide-y divide-gray-50">
            {students.map((p) => (
              <div key={p.socketId} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-900">{p.name}</span>
                {role === 'teacher' && (
                  <button
                    onClick={() => kickStudent(p.socketId)}
                    className="text-red-500 text-xs font-medium hover:text-red-700 transition-colors"
                  >
                    Kick out
                  </button>
                )}
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-8">No students have joined yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
