import { create } from 'zustand';
import type { EvaluationState } from '../types';

interface EvaluationStore extends EvaluationState {
  setStep: (step: EvaluationState['currentStep']) => void;
  setPreSurveyResponse: (questionId: string, response: number) => void;
  setPostSurveyResponse: (questionId: string, response: number) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  startEvaluation: () => void;
  endEvaluation: () => void;
}

export const useEvaluationStore = create<EvaluationStore>((set) => ({
  currentStep: 'landing',
  preSurveyResponses: {},
  postSurveyResponses: {},
  chatHistory: [],
  
  setStep: (step) => set({ currentStep: step }),
  
  setPreSurveyResponse: (questionId, response) =>
    set((state) => ({
      preSurveyResponses: {
        ...state.preSurveyResponses,
        [questionId]: response,
      },
    })),
    
  setPostSurveyResponse: (questionId, response) =>
    set((state) => ({
      postSurveyResponses: {
        ...state.postSurveyResponses,
        [questionId]: response,
      },
    })),
    
  addChatMessage: (message) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
    
  startEvaluation: () => set({ startTime: new Date() }),
  endEvaluation: () => set({ endTime: new Date() }),
}));
