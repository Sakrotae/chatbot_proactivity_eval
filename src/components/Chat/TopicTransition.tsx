import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

export const TopicTransition: React.FC = () => {
  const { startNextChatSession, loading, error, activeChatSession } = useEvaluationStore();

  const handleContinue = () => {
    startNextChatSession();
  };

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
      <h2 className="text-2xl font-bold text-center mb-6">Topic Completed</h2>
      
      {activeChatSession && (
        <div className="mb-6">
          <p className="text-lg mb-2">
            You've completed the chat about <span className="font-semibold">{formatUseCase(activeChatSession.useCase)}</span>.
          </p>
          <p className="text-gray-700">
            Thank you for your responses. We'll now move on to the next topic.
          </p>
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Next Topic
        </button>
      </div>
    </div>
  );
};
