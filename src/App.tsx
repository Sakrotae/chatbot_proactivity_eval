import React, { useEffect } from 'react';
import { useEvaluationStore } from './store/evaluationStore';
import { LandingPage } from './components/Landing/LandingPage';
import { PreSurvey } from './components/Survey/PreSurvey';
import { ChatInterface } from './components/Chat/ChatInterface';
import { PostSurvey } from './components/Survey/PostSurvey';
import { ResultsSummary } from './components/Results/ResultsSummary';

function App() {
  const { currentStep, startEvaluation, endEvaluation } = useEvaluationStore();

  useEffect(() => {
    startEvaluation();
    return () => endEvaluation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {currentStep === 'landing' && <LandingPage />}
      {currentStep === 'pre-survey' && <PreSurvey />}
      {currentStep === 'chat' && <ChatInterface />}
      {currentStep === 'post-survey' && <PostSurvey />}
      {currentStep === 'results' && <ResultsSummary />}
    </div>
  );
}

export default App;
