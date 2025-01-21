import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import {Clock, MessageSquare } from 'lucide-react';

export const ResultsSummary: React.FC = () => {
  const { chatHistory, startTime, endTime } =
    useEvaluationStore();

  const duration = endTime && startTime
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Thank you for participating</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    </div>
  );
};
