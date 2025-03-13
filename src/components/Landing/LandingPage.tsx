import React from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { ArrowRight, MessageSquare, Clock, ThumbsUp } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { startEvaluation } = useEvaluationStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chatbot Evaluation Study
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Help us by participating in this brief evaluation. Your feedback is valuable in enhancing the user experience.
        </p>

        <p className="text-lg text-gray-600 mb-2">
          During this study, you'll interact with chatbots to complete a specific task. You'll be given a goal to achieve through your conversation.
        </p>
        <p className="text-lg text-gray-600 mb-2">
          If you haven't experienced the exact situation in real life, don't worry! You can imagine yourself in the scenario and interact accordingly.
        </p>
        <p className="font-medium text-lg text-gray-600 mb-8">
          The key is to engage naturally with the chatbot while working towards your assigned goal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Interactive Chat</h3>
              <p className="text-sm text-gray-500">Engage with our AI chatbot on different topics</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quick Process</h3>
              <p className="text-sm text-gray-500">Takes about 10-15 minutes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Easy Feedback</h3>
              <p className="text-sm text-gray-500">Simple rating system</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-2">What to expect:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Brief pre-interaction survey</li>
            <li>Chatbot interaction session</li>
            <li>Post-interaction feedback</li>
            <li>Results summary</li>
          </ol>
        </div>

        <button
          onClick={() => startEvaluation()}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2
            focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Start Evaluation
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
