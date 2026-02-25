import React from 'react';

const KickedOut: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-dark flex flex-col">
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-4">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          ✦ Intervue Poll
        </span>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You've been Kicked out !
        </h1>
        <p className="text-gray-mid text-sm text-center max-w-sm">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOut;
