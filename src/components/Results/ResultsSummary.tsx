import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { BarChart, Clock, MessageSquare } from 'lucide-react';

export const ResultsSummary: React.FC = () => {
  const { preSurveyResponses, postSurveyResponses, chatHistory, startTime, endTime } =
    useEvaluationStore();

  const calculateAverage = (responses: Record<string, number>) => {
    const values = Object.values(responses);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const duration = endTime && startTime
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Evaluation Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="text-blue-600" />
            <h3 className="font-semibold">Average Ratings</h3>
          </div>
          <p className="text-2xl font-bold">
            {calculateAverage(postSurveyResponses).toFixed(1)}/5.0
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="text-blue-600" />
            <h3 className="font-semibold">Messages</h3>
          </div>
          <p className="text-2xl font-bold">{chatHistory.length}</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600" />
            <h3 className="font-semibold">Duration</h3>
          </div>
          <p className="text-2xl font-bold">{duration} minutes</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pre-Survey Results</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {Object.entries(preSurveyResponses).map(([id, value]) => (
              <div key={id} className="mb-2">
                <p className="text-gray-600">{id}: {value}/5</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Post-Survey Results</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {Object.entries(postSurveyResponses).map(([id, value]) => (
              <div key={id} className="mb-2">
                <p className="text-gray-600">{id}: {value}/5</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
