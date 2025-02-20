import React, { useEffect, useState } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { LikertScale } from './LikertScale';
import { ArrowRight } from 'lucide-react';
import type { SurveyType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface ValidationError {
  questionId: number;
  message: string;
}

export const DynamicSurvey: React.FC<{ type: SurveyType }> = ({ type }) => {
  const {
    questions,
    responses,
    loading,
    error,
    fetchQuestions,
    setResponse,
    submitResponses,
  } = useEvaluationStore();

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    fetchQuestions(type);
  }, [type]);

  const validateNumericInput = (value: string, min?: number, max?: number): string | null => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'Please enter a valid number';
    //if (min !== undefined && num < min) return `Minimum value is ${min}`;
    if (max !== undefined && num > max) return `Maximum value is ${max}`;
    return null;
  };

  const handleNumericChange = (questionId: number, value: string, min?: number, max?: number) => {
    const error = validateNumericInput(value, min, max);
    setValidationErrors(prev => 
      error 
        ? [...prev.filter(e => e.questionId !== questionId), { questionId, message: error }]
        : prev.filter(e => e.questionId !== questionId)
    );
    
    if (!error) {
      setResponse(type, questionId, parseFloat(value));
    }
  };

  const getQuestionError = (questionId: number) => 
    validationErrors.find(e => e.questionId === questionId)?.message;

  const isComplete = questions[type].every(q => {
    if (!q.required) return true;
    const response = responses[type].find(r => r.questionId === q.id);
    if (!response) return false;
    if (q.type === 'numeric') {
      return !getQuestionError(q.id);
    }
    return true;
  });

  const handleSubmit = async () => {
    if (isComplete && validationErrors.length === 0) {
      await submitResponses(type);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {type === 'pre' ? 'Pre-Interaction Survey' : 'Post-Interaction Survey'}
      </h1>
      
      <div className="space-y-8">
        {questions[type].map((question) => {
          const response = responses[type].find((r) => r.questionId === question.id);
          const errorMessage = getQuestionError(question.id);
          
          return (
            <div key={question.id} className="mb-8">
              <div className="flex items-start gap-2 mb-2">
                <p className="text-lg font-medium flex-grow">{question.text}</p>
                {question.required && (
                  <span className="text-red-500 text-sm">*Required</span>
                )}
              </div>
              
              {question.type === 'likert' && (
                <LikertScale
                  value={response?.answer as number}
                  onChange={(value) => setResponse(type, question.id, value)}
                />
              )}
              
              {question.type === 'text' && (
                <textarea
                  value={response?.answer as string || ''}
                  onChange={(e) => setResponse(type, question.id, e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              )}
              
              {question.type === 'numeric' && (
                <div>
                  <input
                    type="number"
                    value={response?.answer as number || ''}
                    
                    onChange={(e) => handleNumericChange(
                      question.id,
                      e.target.value,
                      question.min_value,
                      question.max_value
                    )}
                    step={question.step || 1}
                    min={question.min_value}
                    max={question.max_value}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                      ${errorMessage ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                  )}
                </div>
              )}
              
              {question.type === 'dropdown' && (
                <select
                  value={response?.answer as string || ''}
                  onChange={(e) => setResponse(type, question.id, e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500
                    bg-white"
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isComplete || validationErrors.length > 0 || loading}
        className={`mt-8 px-6 py-3 rounded-lg flex items-center gap-2
          ${
            isComplete && !loading && validationErrors.length === 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {type === 'pre' ? 'Start Chat' : 'View Results'}
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
};
