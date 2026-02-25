import React from 'react';
import { useApp } from '../context/AppContext';

const TeacherLanding: React.FC = () => {
  const { joinSession } = useApp();

  const handleStart = () => {
    joinSession('Teacher', 'teacher');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="flex-1 p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          ✦ Intervue Poll
        </span>

        <h1 className="text-3xl font-normal text-gray-900 mb-2">
          Let's <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-mid text-sm mb-8 max-w-md">
          you'll have the ability to create and manage polls, ask questions, and monitor your
          students' responses in real-time.
        </p>

        <button
          onClick={handleStart}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-10 py-2.5 rounded-full transition-colors"
        >
          Continue as Teacher
        </button>
      </div>
    </div>
  );
};

export default TeacherLanding;
