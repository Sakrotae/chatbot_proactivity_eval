import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { SurveyQuestion } from './SurveyQuestion';
import { ArrowRight } from 'lucide-react';

const POST_SURVEY_QUESTIONS = [
  {
    id: 'post_1',
    text: 'The chatbot understood my questions and provided relevant responses.',
  },
  {
    id: 'post_2',
    text: 'The chatbot responses were clear and easy to understand.',
  },
  {
    id: 'post_3',
    text: 'I would use this chatbot again for similar tasks.',
  },
].map((q) => ({ ...q, response: undefined }));

export const PostSurvey: React.FC = () => {
  const { postSurveyResponses, setPostSurveyResponse, setStep } = useEvaluationStore();
  
  const isComplete = POST_SURVEY_QUESTIONS.every(
    (q) => postSurveyResponses[q.id] !== undefined
  );

  const handleNext = () => {
    if (isComplete) {
      setStep('results');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Post-Interaction Survey</h1>
      <div className="space-y-8">
        {POST_SURVEY_QUESTIONS.map((question) => (
          <SurveyQuestion
            key={question.id}
            question={{
              ...question,
              response: postSurveyResponses[question.id],
            }}
            onChange={(response) => setPostSurveyResponse(question.id, response)}
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
        View Results
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
