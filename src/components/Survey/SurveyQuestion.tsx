import React from 'react';
import { LikertScale } from './LikertScale';
import type { SurveyQuestion as SurveyQuestionType } from '../../types';

interface SurveyQuestionProps {
  question: SurveyQuestionType;
  onChange: (response: number) => void;
}

export const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  onChange,
}) => {
  return (
    <div className="mb-8">
      <p className="text-lg font-medium mb-2">{question.text}</p>
      <LikertScale value={question.response} onChange={onChange} />
    </div>
  );
};
