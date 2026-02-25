import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const StudentLanding: React.FC = () => {
  const { joinSession } = useApp();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    joinSession(name.trim(), 'student');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleContinue();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          ✦ Intervue Poll
        </span>

        <h1 className="text-3xl font-normal text-gray-900 mb-2">
          Let's <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-mid text-sm mb-8 max-w-md mx-auto">
          If you're a student, you'll be able to <span className="font-bold">submit your answers</span>, participate in live
          polls, and see how your responses compare with your classmates
        </p>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-dark mb-2">Enter your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={30}
            className="w-full max-w-sm mx-auto block border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-10 py-2.5 rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StudentLanding;
