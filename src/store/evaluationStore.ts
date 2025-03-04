import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import type { ChatMessage, EvaluationState, SurveyType } from "../types";

const PRE_QUESTIONS_EXAMPLES = [
  {
    text: "I am comfortable using chatbots for everyday tasks.",
    type: "likert",
    required: true,
    order: 1,
    survey_type: "pre",
  },
  {
    text: "I believe chatbots can provide accurate and helpful information.",
    type: "likert",
    required: true,
    order: 2,
    surveyType: "pre",
  },
  {
    text: "I prefer chatbots over human customer service representatives.",
    type: "likert",
    required: true,
    order: 3,
    surveyType: "pre",
  },
  {
    text: "Please describe your previous experiences with chatbots.",
    type: "text",
    required: true,
    order: 4,
    surveyType: "pre",
  },
];

const POST_QUESTIONS_EXAMPLES = [
  {
    text: "The chatbot understood my questions and provided relevant responses.",
    type: "likert",
    required: true,
    order: 1,
    surveyType: "post",
  },
  {
    text: "The chatbot responses were clear and easy to understand.",
    type: "likert",
    required: true,
    order: 2,
    surveyType: "post",
  },
  {
    text: "I would use this chatbot again for similar tasks.",
    type: "likert",
    required: true,
    order: 3,
    surveyType: "post",
  },
  {
    text: "What aspects of the chatbot interaction could be improved?",
    type: "text",
    required: false,
    order: 4,
    surveyType: "post",
  },
];

interface EvaluationStore extends EvaluationState {
  setStep: (step: EvaluationState["currentStep"]) => void;
  initializeSession: () => Promise<void>;
  fetchQuestions: (type: SurveyType) => Promise<void>;
  submitResponses: (type: SurveyType) => Promise<void>;
  setResponse: (
    type: SurveyType,
    questionId: number,
    answer: string | number
  ) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  startEvaluation: () => Promise<void>;
  endEvaluation: () => void;
  setError: (error: string | undefined) => void;
}

const API_BASE = "http://137.250.171.247:5000/api"; // "http://localhost:5000/api";

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  currentStep: "landing",
  questions: { pre: [], post: [] },
  responses: { pre: [], post: [] },
  chatHistory: [],
  loading: false,

  setStep: (step) => set({ currentStep: step }),

  initializeSession: async () => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_BASE}/session`, {
        method: "POST",
      });
      const data = await response.json();
      set({ sessionId: data.session_id });
    } catch (error) {
      set({ error: "Failed to initialize session" });
    } finally {
      set({ loading: false });
    }
  },

  fetchQuestions: async (type) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_BASE}/questions?type=${type}`);
      const data = await response.json();
      set((state) => ({
        questions: {
          ...state.questions,
          [type]: data.questions,
        },
      }));
    } catch (error) {
      set({ error: "Failed to fetch questions" });
      set((state) => ({
        questions: {
          ...state.questions,
          [type]:
            type === "pre" ? PRE_QUESTIONS_EXAMPLES : POST_QUESTIONS_EXAMPLES,
        },
      }));
    } finally {
      set({ loading: false });
    }
  },

  submitResponses: async (type) => {
    const { evaluationId, responses } = get();
    try {
      set({ loading: true });
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluation_id: evaluationId,
          type,
          responses: responses[type],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Move to next step after successful submission
      const nextStep = type === "pre" ? "chat" : "results";
      set({ currentStep: nextStep });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to submit responses",
      });
    } finally {
      set({ loading: false });
    }
  },

  setResponse: (type, questionId, answer) => {
    set((state) => {
      const existingResponses = state.responses[type];
      const responseIndex = existingResponses.findIndex(
        (r) => r.questionId === questionId
      );

      if (responseIndex > -1) {
        const newResponses = [...existingResponses];
        newResponses[responseIndex] = { questionId, answer };
        return {
          responses: {
            ...state.responses,
            [type]: newResponses,
          },
        };
      }

      return {
        responses: {
          ...state.responses,
          [type]: [...existingResponses, { questionId, answer }],
        },
      };
    });
  },

  addChatMessage: (message) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        },
      ],
    })),

  startEvaluation: async () => {
    let { sessionId } = get();
    if (!sessionId) {
      await get().initializeSession();
      sessionId = get()["sessionId"];
    }
    try {
      set({ loading: true });
      const response = await fetch(`${API_BASE}/evaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await response.json();
      set({
        evaluationId: data.evaluation_id,
        userGoal: data.config.user_goal,
        startTime: new Date(),
      });
    } catch (error) {
      set({ error: "Failed to start evaluation" });
    } finally {
      set({ loading: false });
    }
  },

  endEvaluation: () => set({ endTime: new Date() }),

  setError: (error) => set({ error }),
}));
