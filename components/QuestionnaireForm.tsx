import React from 'react';
import { Question, UserAnswers } from '../types';
import QuestionItem from './QuestionItem';
import ProgressBar from './ProgressBar';

interface QuestionnaireFormProps {
  questions: Question[]; // This will be the current page's questions
  answers: UserAnswers;
  onAnswerChange: (questionId: number, value: number) => void;
  onSubmit: () => void; // For final submission
  onNextPage: () => void;
  onPrevPage: () => void;
  isFormDisabled: boolean; // True if the form elements should be disabled (e.g. during a page transition or final submit if form was still visible)
  canProceed: boolean; // True if current page questions are answered
  currentPageIndex: number; // 0-indexed
  totalPages: number;
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  onNextPage,
  onPrevPage,
  isFormDisabled,
  canProceed,
  currentPageIndex,
  totalPages,
}) => {
  const isLastPage = currentPageIndex === totalPages - 1;
  const isFirstPage = currentPageIndex === 0;

  const getButtonText = () => {
    // isFormDisabled might be true if a global loading state is introduced for page transitions.
    // For now, with AppStep changes, this button text changes when the form itself is replaced.
    return isLastPage ? "Ver Mis Dones" : "Siguiente";
  };

  const getProceedButtonIcon = () => {
    return isLastPage ? "fas fa-check-circle" : "fas fa-arrow-right";
  }

  const getWarningMessage = () => {
    if (canProceed || isFormDisabled) return null;
    
    let message = "";
    if (questions.some(q => answers[q.id] === undefined)) {
       message += isLastPage 
        ? "Responda todas las preguntas de esta página para ver sus dones."
        : "Responda todas las preguntas de esta página para continuar.";
    }
    return message.trim();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-sky-700 mb-4 text-center">
          Cuestionario - Parte {currentPageIndex + 1} de {totalPages}
        </h2>
                
        <ProgressBar currentPage={currentPageIndex} totalPages={totalPages} />

        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              currentAnswer={answers[q.id]}
              onAnswerChange={onAnswerChange}
              isSubmitting={isFormDisabled} // isSubmitting prop on QuestionItem disables radio buttons
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onPrevPage}
          disabled={isFirstPage || isFormDisabled}
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <i className="fas fa-arrow-left mr-2"></i> Anterior
        </button>
        
        <button
          onClick={isLastPage ? onSubmit : onNextPage}
          disabled={!canProceed || isFormDisabled}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label={isLastPage ? "Ver mis dones" : "Siguiente página"}
        >
          <i className={`${getProceedButtonIcon()} mr-2`}></i> {getButtonText()}
        </button>
      </div>
      {getWarningMessage() && !isFormDisabled && (
           <p className="text-sm text-red-600 mt-3 text-center" role="alert">
              {getWarningMessage()}
          </p>
      )}
    </div>
  );
};

export default QuestionnaireForm;