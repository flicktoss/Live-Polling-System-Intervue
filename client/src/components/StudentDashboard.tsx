import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatPanel from './ChatPanel';
import { IoChatbubbleSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const { state, submitAnswer, dispatch } = useApp();
  const { currentPoll, pollResults, hasAnswered, timerRemaining, isChatOpen } = state;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  
  const handleSubmit = () => {
    if (selectedOption === null) {
      toast.error('Please select an answer');
      return;
    }
    if (!currentPoll) {
      toast.error('No active poll');
      return;
    }
    submitAnswer(currentPoll.pollId, selectedOption);
    setSelectedOption(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results after poll ends
  if (pollResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-2 bg-gray-dark" />
        <div className="flex-1 px-8 py-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Question Number + Timer */}
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Question {pollResults.questionNumber}</h2>
              <span className="text-red-500 text-base font-semibold flex items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(timerRemaining)}
              </span>
            </div>

            {/* Results card */}
            <div className="border border-primary/30 rounded-xl overflow-hidden">
              {/* Question header */}
              <div className="bg-gray-dark text-white px-5 py-3.5 text-sm font-medium">
                {pollResults.question}
              </div>
              {/* Option bars */}
              <div className="p-4 space-y-2">
                {pollResults.results.map((option, index) => {
                  const pct = option.percentage ?? 0;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {/* Purple fill bar */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                        {/* Black text layer (full width, behind) */}
                        <div className="absolute inset-0 flex items-center h-full px-3 gap-2">
                          <span className="w-7 h-7 rounded-full bg-white/90 text-primary text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{option.text}</span>
                        </div>
                        {/* White text layer (clipped to purple bar) */}
                        <div
                          className="absolute inset-0 flex items-center h-full px-3 gap-2"
                          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
                        >
                          <span className="w-7 h-7 rounded-full bg-white/90 text-primary text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-white">{option.text}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-gray-900 font-semibold mt-8 text-sm">
              Wait for the teacher to ask a new question..
            </p>
          </div>
        </div>

        {/* Chat FAB */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-deeper transition-colors z-40"
        >
          <IoChatbubbleSharp size={24} />
        </button>
        {isChatOpen && <ChatPanel />}
      </div>
    );
  }

  // Show question to answer
  if (currentPoll && !hasAnswered) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-2 bg-gray-dark" />
        <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Question Number + Timer */}
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Question {currentPoll.questionNumber}</h2>
              <span className="text-red-500 text-base font-semibold flex items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(timerRemaining)}
              </span>
            </div>

            {/* Question + Options Card */}
            <div className="border border-primary/30 rounded-xl overflow-hidden">
              {/* Question header */}
              <div className="bg-gray-dark text-white px-5 py-3.5 text-sm font-medium">
                {currentPoll.question}
              </div>

              {/* Options */}
              <div className="p-4 space-y-3">
                {currentPoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all bg-gray-100 border-2 ${
                      selectedOption === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 text-sm font-medium">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-12 py-3 rounded-full transition-colors text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Chat FAB */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-deeper transition-colors z-40"
        >
          <IoChatbubbleSharp size={24} />
        </button>
        {isChatOpen && <ChatPanel />}
      </div>
    );
  }

  // Waiting for answer acknowledgment or poll end after submitting
  if (currentPoll && hasAnswered) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-2 bg-gray-dark" />
        <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Question {currentPoll.questionNumber}</h2>
              <span className="text-red-500 text-base font-semibold flex items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(timerRemaining)}
              </span>
            </div>

            <div className="border border-primary/30 rounded-xl overflow-hidden">
              <div className="bg-gray-dark text-white px-5 py-3.5 text-sm font-medium">
                {currentPoll.question}
              </div>
              <div className="bg-white p-8 text-center">
                <p className="text-green-600 font-semibold text-sm">✓ Answer submitted! Waiting for results...</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-deeper transition-colors z-40"
        >
          <IoChatbubbleSharp size={24} />
        </button>
        {isChatOpen && <ChatPanel />}
      </div>
    );
  }

  // Waiting screen - no poll yet
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          ✦ Intervue Poll
        </span>

        {/* Spinner */}
        <div className="spinner mb-6" />

        <p className="text-gray-900 font-semibold text-base">
          Wait for the teacher to ask questions..
        </p>

        {/* Chat FAB */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-deeper transition-colors z-40"
        >
          <IoChatbubbleSharp size={24} />
        </button>
        {isChatOpen && <ChatPanel />}
      </div>
    </div>
  );
};

export default StudentDashboard;