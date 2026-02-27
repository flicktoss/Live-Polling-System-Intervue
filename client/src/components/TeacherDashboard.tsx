import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatPanel from './ChatPanel';
import PollHistory from './PollHistory';
import toast from 'react-hot-toast';
import { IoChatbubbleSharp } from 'react-icons/io5';

const TeacherDashboard: React.FC = () => {
  const { state, createPoll, dispatch } = useApp();
  const { currentPoll, pollResults, liveResults, isChatOpen, timerRemaining } = state;

  const [question, setQuestion] = useState('');
  const [timer, setTimer] = useState(60);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const charCount = question.length;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addOption = () => {
    if (options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionText = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text };
    setOptions(updated);
  };

  const toggleCorrect = (index: number, value: boolean) => {
    const updated = [...options];
    updated[index] = { ...updated[index], isCorrect: value };
    setOptions(updated);
  };

  const handleAskQuestion = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    if (options.some((o) => !o.text.trim())) {
      toast.error('All options must have text');
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      toast.error('Please mark at least one correct answer');
      return;
    }
    if (timer < 5 || timer > 300) {
      toast.error('Timer must be between 5 and 300 seconds');
      return;
    }

    createPoll(question.trim(), options, timer);
    setQuestion('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setTimer(60);
  };

  const handleNewQuestion = () => {
    dispatch({ type: 'RESET_POLL' });
  };

  if (showHistory) {
    return <PollHistory onBack={() => setShowHistory(false)} />;
  }

  // Show results after poll ends
  if (pollResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col">

        {/* View Poll History — top right */}
        <div className="flex justify-end px-8 pt-6">
          <button
            onClick={() => setShowHistory(true)}
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            </svg>
            View Poll history
          </button>
        </div>

        <div className="flex-1 px-8 py-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Question Number + Timer */}
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Question {pollResults.questionNumber}</h2>
              <span className="text-red-500 text-base font-semibold flex items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(0)}
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

            <div className="flex justify-center mt-8">
              <button
                onClick={handleNewQuestion}
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-3 rounded-full transition-colors text-sm"
              >
                + Ask a new question
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

  // Show live results while poll is active
  if (currentPoll && liveResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-2 bg-gray-dark" />
        <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Question</h2>

            <div className="border border-primary/30 rounded-xl overflow-hidden">
              <div className="bg-gray-dark text-white px-5 py-3.5 text-sm font-medium">
                {liveResults.question}
              </div>
              <div className="p-4 space-y-2">
                {liveResults.results.map((option, index) => {
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

  // Show question being asked (waiting for answers)
  if (currentPoll) {
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
            <div className="border border-primary/30 rounded-xl overflow-hidden">
              <div className="bg-gray-dark text-white px-5 py-3.5 text-sm font-medium">
                {currentPoll.question}
              </div>
              <div className="p-4 space-y-3">
                {currentPoll.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-gray-100">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 text-sm font-medium">{option.text}</span>
                  </div>
                ))}
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

  // Poll creation form (matches Figma exactly)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="w-full h-2 bg-gray-dark" />

      <div className="flex-1 p-6 pb-24 relative max-w-3xl mx-auto w-full">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          ✦ Intervue Poll
        </span>

        <h1 className="text-3xl font-normal text-gray-900 mb-1">
          Let's <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-mid text-sm mb-6 max-w-md">
          you'll have the ability to create and manage polls, ask questions, and monitor your
          students' responses in real-time.
        </p>

        {/* Question Input Header */}
        <div className="flex items-center justify-between mb-3">
          <label className="font-semibold text-gray-900 text-sm">Enter your question</label>
          <div className="relative">
            <select
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-primary pointer-events-none">▼</span>
          </div>
        </div>

        {/* Question Textarea */}
        <div className="relative mb-6">
          <textarea
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => {
              if (e.target.value.length <= 100) setQuestion(e.target.value);
            }}
            rows={3}
            className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="absolute bottom-3 right-3 text-xs text-gray-400">{charCount}/100</span>
        </div>

        {/* Options Editor */}
        <div>
          <div className="flex items-center mb-3">
            <span className="font-semibold text-gray-900 text-sm flex-1">Edit Options</span>
            <span className="font-semibold text-gray-900 text-sm w-32 text-center">Is it Correct?</span>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                {/* Option input */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Yes/No radio */}
                <div className="flex items-center justify-center gap-3 w-32">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === true}
                      onChange={() => toggleCorrect(index, true)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === false}
                      onChange={() => toggleCorrect(index, false)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Option */}
          <button
            onClick={addOption}
            className="mt-3 text-primary text-sm font-medium border border-primary rounded-lg px-4 py-1.5 hover:bg-primary hover:text-white transition-colors"
          >
            + Add More option
          </button>
        </div>
      </div>

      {/* Bottom Ask Question Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-center">
        <button
          onClick={handleAskQuestion}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors"
        >
          Ask Question
        </button>
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
};

export default TeacherDashboard;
