
import React from 'react';
import { Question } from '../types';
import { RATING_LABELS } from '../constants';
import RadioInput from './RadioInput';

interface QuestionItemProps {
  question: Question;
  currentAnswer?: number;
  onAnswerChange: (questionId: number, value: number) => void;
  isSubmitting: boolean; // Changed from isCalculating to be more specific to final submission phase
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, currentAnswer, onAnswerChange, isSubmitting }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(question.id, parseInt(event.target.value, 10));
  };

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <p className="text-md sm:text-lg text-gray-800 mb-3">{question.text}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {RATING_LABELS.map(({ value, label }) => (
          <RadioInput
            key={value}
            name={`question-${question.id}`}
            value={value}
            label={label} 
            checked={currentAnswer === value}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        ))}
      </div>
      {/* Individual question warning removed, will be handled at page/form level for better UX with pagination */}
    </div>
  );
};

export default QuestionItem;
