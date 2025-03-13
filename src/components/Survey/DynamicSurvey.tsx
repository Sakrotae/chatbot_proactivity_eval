import React, { useEffect } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { LikertScale } from './LikertScale';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { SurveyType } from '../../types';

interface DynamicSurveyProps {
  type: SurveyType;
}

export const DynamicSurvey: React.FC<DynamicSurveyProps> = ({ type }) => {
  const {
    questions,
    responses,
    loading,
    error,
    fetchQuestions,
    setResponse,
    submitResponses,
    activeChatSession
  } = useEvaluationStore();

  useEffect(() => {
    fetchQuestions(type);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitResponses(type);
  };

  const handleTextChange = (questionId: number, value: string) => {
    setResponse(type, questionId, value);
  };

  const isComplete = questions[type].every(q => {
    if (!q.required) return true;
    const response = responses[type].find(r => r.questionId === q.id);
    if (!response) return false;
    return true;
  });

  const handleLikertChange = (questionId: number, value: number) => {
    setResponse(type, questionId, value);
  };

  const handleNumericChange = (questionId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setResponse(type, questionId, numValue);
    }
  };

  const handleDropdownChange = (questionId: number, value: string) => {
    setResponse(type, questionId, value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const surveyQuestions = questions[type];
  
  const getResponseValue = (questionId: number) => {
    const response = responses[type].find(r => r.questionId === questionId);
    return response ? response.answer : '';
  };

  const formatUseCase = (useCase: string) => {
    return useCase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        {type === 'pre' ? 'Pre-Chat Survey' : 'Post-Chat Survey'}
      </h2>
      
      {type === 'post' && activeChatSession && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-center text-blue-800">
            Please provide your feedback about the chat on <strong>{formatUseCase(activeChatSession.useCase)}</strong>
          </p>
        </div>
      )}

      <div>
        {surveyQuestions.map((question) => (
          <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-md">
            <label className="block mb-2 font-medium">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.type === 'likert' && (
              <LikertScale
                value={Number(getResponseValue(question.id)) || 0}
                onChange={(value) => handleLikertChange(question.id, value)}
              />
            )}

            {question.type === 'text' && (
              <textarea
                value={getResponseValue(question.id) as string}
                onChange={(e) => handleTextChange(question.id, e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required={question.required}
              />
            )}

            {question.type === 'numeric' && (
              <input
                type="number"
                value={getResponseValue(question.id) as string}
                onChange={(e) => handleNumericChange(question.id, e.target.value)}
                min={question.min_value}
                max={question.max_value}
                step={question.step}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={question.required}
              />
            )}

            {question.type === 'dropdown' && (
              <select
                value={getResponseValue(question.id) as string}
                onChange={(e) => handleDropdownChange(question.id, e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={question.required}
              >
                <option value="">Select an option</option>
                {question.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={!isComplete}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};
