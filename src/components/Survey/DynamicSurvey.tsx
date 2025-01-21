import React, { useEffect } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { LikertScale } from './LikertScale';
import { ArrowRight } from 'lucide-react';
import type { SurveyType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

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
  } = useEvaluationStore();

  useEffect(() => {
    fetchQuestions(type);
  }, [type]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const currentQuestions = questions[type];
  const currentResponses = responses[type];

  const isComplete = currentQuestions.every(
    (q) => !q.required || currentResponses.some((r) => r.questionId === q.id)
  );

  const handleSubmit = async () => {
    if (isComplete) {
      await submitResponses(type);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {type === 'pre' ? 'Pre-Interaction Survey' : 'Post-Interaction Survey'}
      </h1>
      
      <div className="space-y-8">
        {currentQuestions.map((question) => {
          const response = currentResponses.find((r) => r.questionId === question.id);
          
          return (
            <div key={question.id} className="mb-8">
              <div className="flex items-start gap-2">
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
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isComplete || loading}
        className={`mt-8 px-6 py-3 rounded-lg flex items-center gap-2
          ${
            isComplete && !loading
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
