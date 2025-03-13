import React, { useEffect } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

export const ResultsSummary: React.FC = () => {
  const { chatSessions, loading, error, allTopicsCompleted } = useEvaluationStore();

  const formatUseCase = (useCase: string) => {
    return useCase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Evaluation Complete</h2>
      
      {allTopicsCompleted ? (
        <div className="text-center mb-8">
          <p className="text-lg text-green-600 mb-4">
            You have completed all the chat topics! Thank you for your participation.
          </p>
          <p className="text-gray-700">
            Your feedback is valuable and will help us improve our chatbot systems.
          </p>
        </div>
      ) : (
        <div className="text-center mb-8 text-yellow-600">
          <p>The evaluation was ended before all topics were completed.</p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Topics Completed</h3>
        
        {chatSessions.length === 0 ? (
          <p className="text-gray-500 text-center">No chat sessions completed</p>
        ) : (
          <div className="space-y-4">
            {chatSessions.map((session, index) => (
              <div key={session.id} className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium">
                  Topic {index + 1}: {formatUseCase(session.useCase)}
                </h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Messages: {session.chatHistory.length}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-10 text-center">
        <p className="text-gray-600">
          You may now close this window or refresh the page to start a new evaluation.
        </p>
      </div>
    </div>
  );
};
