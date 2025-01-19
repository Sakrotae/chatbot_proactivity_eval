import { create } from "zustand";
import type { ChatMessage, EvaluationState, LikertScale } from "../types";

interface EvaluationStore extends EvaluationState {
  setStep: (step: EvaluationState["currentStep"]) => void;
  setPreSurveyResponse: (questionId: string, response: LikertScale) => void;
  setPostSurveyResponse: (questionId: string, response: LikertScale) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  startEvaluation: () => void;
  endEvaluation: () => void;
}

export const useEvaluationStore = create<EvaluationStore>((set) => ({
  currentStep: "landing",
  preSurveyResponses: {},
  postSurveyResponses: {},
  chatHistory: [],

  setStep: (step) => set({ currentStep: step }),

  setPreSurveyResponse: (questionId, response: LikertScale) =>
    set((state) => ({
      preSurveyResponses: {
        ...state.preSurveyResponses,
        [questionId]: response,
      },
    })),

  setPostSurveyResponse: (questionId, response: LikertScale) =>
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
