import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { SurveyQuestion } from './SurveyQuestion';
import { ArrowRight } from 'lucide-react';

const PRE_SURVEY_QUESTIONS = [
  {
    id: 'pre_1',
    text: 'I am comfortable using chatbots for everyday tasks.',
  },
  {
    id: 'pre_2',
    text: 'I believe chatbots can provide accurate and helpful information.',
  },
  {
    id: 'pre_3',
    text: 'I prefer chatbots over human customer service representatives.',
  },
].map((q) => ({ ...q, response: undefined }));

export const PreSurvey: React.FC = () => {
  const { preSurveyResponses, setPreSurveyResponse, setStep } = useEvaluationStore();
  
  const isComplete = PRE_SURVEY_QUESTIONS.every(
    (q) => preSurveyResponses[q.id] !== undefined
  );

  const handleNext = () => {
    if (isComplete) {
      setStep('chat');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Pre-Interaction Survey</h1>
      <div className="space-y-8">
        {PRE_SURVEY_QUESTIONS.map((question) => (
          <SurveyQuestion
            key={question.id}
            question={{
              ...question,
              response: preSurveyResponses[question.id],
            }}
            onChange={(response) => setPreSurveyResponse(question.id, response)}
          />
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={!isComplete}
        className={`mt-8 px-6 py-3 rounded-lg flex items-center gap-2
          ${
            isComplete
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
      >
        Next
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
