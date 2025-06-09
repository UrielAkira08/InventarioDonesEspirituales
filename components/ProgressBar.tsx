
import React from 'react';

interface ProgressBarProps {
  currentPage: number; // 0-indexed
  totalPages: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentPage, totalPages }) => {
  const progressPercentage = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  return (
    <div className="my-6">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-sky-700">
          Página {currentPage + 1} de {totalPages}
        </span>
        <span className="text-sm font-medium text-sky-700">{Math.round(progressPercentage)}% Completo</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-sky-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`Progreso del cuestionario: ${Math.round(progressPercentage)}%`}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
