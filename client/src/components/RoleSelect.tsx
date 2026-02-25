import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'student' | 'teacher' | null>(null);

  const handleContinue = () => {
    if (selected === 'teacher') navigate('/teacher');
    else if (selected === 'student') navigate('/student');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          ✦ Intervue Poll
        </span>

        <h1 className="text-3xl font-normal text-gray-900 mb-2">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        <p className="text-gray-mid text-sm mb-8">
          Please select the role that best describes you to begin using the live polling system
        </p>

        {/* Role Cards */}
        <div className="flex gap-4 justify-center mb-8">
          {/* Student Card */}
          <button
            onClick={() => setSelected('student')}
            className={`flex-1 max-w-60 border-2 rounded-lg p-5 text-left cursor-pointer transition-all ${
              selected === 'student'
                ? 'border-primary bg-white shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 text-base mb-1">I'm a Student</h3>
            <p className="text-gray-mid text-xs leading-relaxed">
              Participate in live polls, submit your answers, and see how your class responds.
            </p>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => setSelected('teacher')}
            className={`flex-1 max-w-60 border-2 rounded-lg p-5 text-left cursor-pointer transition-all ${
              selected === 'teacher'
                ? 'border-primary bg-white shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 text-base mb-1">I'm a Teacher</h3>
            <p className="text-gray-mid text-xs leading-relaxed">
              Create and manage polls, ask questions, and monitor responses in real-time.
            </p>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-10 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelect;
