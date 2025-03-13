import React, { useEffect } from 'react';
import { useEvaluationStore } from './store/evaluationStore';
import { LandingPage } from './components/Landing/LandingPage';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ResultsSummary } from './components/Results/ResultsSummary';
import { DynamicSurvey } from './components/Survey/DynamicSurvey';
import { TopicTransition } from './components/Chat/TopicTransition';

function App() {
  const { currentStep } = useEvaluationStore();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {currentStep === 'landing' && <LandingPage />}
      {currentStep === 'pre-survey' && <DynamicSurvey type="pre" />}
      {currentStep === 'chat' && <ChatInterface />}
      {currentStep === 'post-survey' && <DynamicSurvey type="post" />}
      {currentStep === 'topic-transition' && <TopicTransition />}
      {currentStep === 'results' && <ResultsSummary />}
    </div>
  );
}

export default App;
