import React, { useEffect, useState } from 'react';
import type { PollHistoryItem } from '../types';
import toast from 'react-hot-toast';

interface PollHistoryProps {
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PollHistory: React.FC<PollHistoryProps> = ({ onBack }) => {
  const [polls, setPolls] = useState<PollHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch(`${API_URL}/api/polls`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPolls(data);
      } catch (err) {
        console.error('Failed to fetch poll history:', err);
        toast.error('Failed to load poll history');
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="mb-8 w-full max-w-2xl">
        <button
          onClick={onBack}
          className="text-primary hover:text-primary-dark font-medium text-sm transition-colors mb-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl text-gray-900">
          View <span className="font-bold">Poll History</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="spinner mb-4" />
          <p className="text-gray-mid text-sm">Loading poll history...</p>
        </div>
      ) : polls.length === 0 ? (
        <p className="text-center text-gray-mid py-20 text-sm">No polls have been created yet.</p>
      ) : (
        <div className="space-y-8 w-full max-w-2xl">
          {[...polls].reverse().map((poll) => (
            <div key={poll._id}>
              {/* Question number heading */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
          Question {poll.questionNumber}
              </h3>

              <div className="border border-primary/30 rounded-xl overflow-hidden">
          {/* Question header */}
          <div className="bg-gray-dark text-white px-4 py-3">
            <span className="text-sm font-medium">{poll.question}</span>
          </div>

          {/* Results */}
          <div className="p-4 space-y-2">
            {poll.results.map((option, idx) => {
              const pct = option.percentage ?? 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {/* Purple fill bar */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    {/* Black text layer (full width, behind) */}
                    <div className="absolute inset-0 flex items-center h-full px-3 gap-2">
                      <span className="w-7 h-7 rounded-full bg-white/90 text-primary text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{option.text}</span>
                    </div>
                    {/* White text layer (clipped to purple bar) */}
                    <div
                      className="absolute inset-0 flex items-center h-full px-3 gap-2"
                      style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
                    >
                      <span className="w-7 h-7 rounded-full bg-white/90 text-primary text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {idx + 1}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PollHistory;
