import React from 'react';
import type { PollResults as PollResultsType } from '../types';

interface PollResultsProps {
  results: PollResultsType;
  showPercentage: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({ results, showPercentage }) => {
  return (
    <div className="max-w-md mx-auto">
      {/* Question header bar */}
      <div className="bg-gray-dark text-white px-4 py-3 rounded-t-lg text-sm font-medium border border-primary/30 border-b-0">
        {results.question}
      </div>

      {/* Results bars */}
      <div className="border border-primary/30 rounded-b-lg p-4 space-y-2.5">
        {results.results.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1 relative h-9 bg-gray-100 rounded-lg overflow-hidden">
              {/* Fill bar */}
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-lg transition-all duration-500"
                style={{ width: `${Math.max(option.percentage, 5)}%` }}
              />
              {/* Content on top of bar */}
              <div className="relative flex items-center h-full px-3 gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-dark text-white text-[10px] flex items-center justify-center font-bold shrink-0 z-10">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-900 z-10 font-medium">{option.text}</span>
              </div>
            </div>
            {showPercentage && (
              <span className="text-sm font-semibold text-gray-900 w-10 text-right">
                {option.percentage}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollResults;
