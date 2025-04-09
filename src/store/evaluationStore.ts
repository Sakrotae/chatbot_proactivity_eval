import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import {
  getNextTopic,
  sendChatMessage,
  startChatSession,
} from "../services/api";
import type {
  ChatMessage,
  ChatSession,
  EvaluationState,
  SurveyType,
} from "../types";

/**
 * These are used as fallback in case the API fails to fetch questions.
 */
const PRE_QUESTIONS_EXAMPLES = [
  {
    id: 1,
    text: "I am comfortable using chatbots for everyday tasks.",
    type: "likert",
    required: true,
    order: 1,
    survey_type: "pre",
  },
  {
    id: 2,
    text: "I believe chatbots can provide accurate and helpful information.",
    type: "likert",
    required: true,
    order: 2,
    survey_type: "pre",
  },
  {
    id: 3,
    text: "I prefer chatbots over human customer service representatives.",
    type: "likert",
    required: true,
    order: 3,
    survey_type: "pre",
  },
  {
    id: 4,
    text: "Please describe your previous experiences with chatbots.",
    type: "text",
    required: true,
    order: 4,
    survey_type: "pre",
  },
];

const POST_QUESTIONS_EXAMPLES = [
  {
    id: 5,
    text: "The chatbot understood my questions and provided relevant responses.",
    type: "likert",
    required: true,
    order: 1,
    survey_type: "post",
  },
  {
    id: 6,
    text: "The chatbot responses were clear and easy to understand.",
    type: "likert",
    required: true,
    order: 2,
    survey_type: "post",
  },
  {
    id: 7,
    text: "I would use this chatbot again for similar tasks.",
    type: "likert",
    required: true,
    order: 3,
    survey_type: "post",
  },
  {
    id: 8,
    text: "What aspects of the chatbot interaction could be improved?",
    type: "text",
    required: false,
    order: 4,
    survey_type: "post",
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
  startNextChatSession: () => Promise<void>;
  endCurrentChatSession: () => void;
  endEvaluation: () => void;
  setError: (error: string | undefined) => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (message: string, isInitial?: boolean) => Promise<void>;
  checkNextTopic: () => Promise<void>;
}

const API_BASE =
  import.meta.env.VITE_USE_LOCAL_API === "true"
    ? "http://localhost:5000/api"
    : "http://137.250.171.247:5000/api";

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  currentStep: "landing",
  questions: { pre: [], post: [] },
  responses: { pre: [], post: [] },
  chatSessions: [],
  remainingTopics: [],
  allTopicsCompleted: false,
  loading: false,

  /**
   * Sets the current step in the evaluation process.
   * @param step - The step to set as the current step.
   */
  setStep: (step) => set({ currentStep: step }),

  /**
   * Initializes a new session by requesting a session ID from the API.
   * Updates the state with the session ID.
   */
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

  /**
   * Fetches survey questions (pre or post) from the API.
   * Falls back to example questions if the API request fails.
   * @param type - The type of survey ("pre" or "post").
   */
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

  /**
   * Submits user responses for the specified survey type to the API.
   * Clears responses and moves to the next step after successful submission.
   * @param type - The type of survey ("pre" or "post").
   */
  submitResponses: async (type) => {
    const { currentChatSessionId, responses, evaluationId } = get();
    try {
      set({ loading: true });
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_session_id: currentChatSessionId,
          eval_id: evaluationId,
          type,
          responses: responses[type],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Move to next step after successful submission
      if (type === "pre") {
        await get().startNextChatSession();
        set({ currentStep: "chat" });
      } else {
        // After post-survey, check if there are more topics
        await get().checkNextTopic();
      }

      // Clear responses for the next survey
      set((state) => ({
        responses: {
          ...state.responses,
          [type]: [],
        },
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to submit responses",
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Updates or adds a response for a specific question in the survey.
   * @param type - The type of survey ("pre" or "post").
   * @param questionId - The ID of the question being answered.
   * @param answer - The user's answer to the question.
   */
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

  /**
   * Adds a new chat message to the active chat session's history.
   * Updates the chat session in the state.
   * @param message - The message to add (excluding ID and timestamp).
   */
  addChatMessage: (message) =>
    set((state) => {
      const newMessage = {
        ...message,
        id: uuidv4(),
        timestamp: new Date(),
      };

      // Update the active chat session with the new message
      if (state.activeChatSession) {
        const updatedActiveChatSession = {
          ...state.activeChatSession,
          chatHistory: [...state.activeChatSession.chatHistory, newMessage],
        };

        // Update the chat session in the chatSessions array
        const updatedChatSessions = state.chatSessions.map((session) =>
          session.id === updatedActiveChatSession.id
            ? updatedActiveChatSession
            : session
        );

        return {
          activeChatSession: updatedActiveChatSession,
          chatSessions: updatedChatSessions,
        };
      }

      return state;
    }),

  /**
   * Starts the evaluation process by creating an evaluation session.
   * Fetches pre-survey questions and sets the current step to "pre-survey".
   */
  startEvaluation: async () => {
    let { sessionId } = get();
    if (!sessionId) {
      await get().initializeSession();
      sessionId = get().sessionId;
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
        currentStep: "pre-survey",
      });

      // Fetch pre-survey questions
      await get().fetchQuestions("pre");
    } catch (error) {
      set({ error: "Failed to start evaluation" });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Starts the next chat session by fetching the next topic and creating a new session.
   * Updates the state with the new chat session and fetches post-survey questions.
   */
  startNextChatSession: async () => {
    const { evaluationId } = get();
    try {
      set({ loading: true });

      // Check if there's a next topic
      const nextTopicData = await getNextTopic(evaluationId!);

      if (nextTopicData.completed) {
        // All topics completed, go to results
        set({
          allTopicsCompleted: true,
          currentStep: "results",
        });
        return;
      }

      // Start a new chat session for the next topic
      const chatSessionData = await startChatSession(
        evaluationId!,
        nextTopicData.next_use_case
      );

      // Create a new chat session object
      const newChatSession: ChatSession = {
        id: chatSessionData.chat_session_id,
        useCase: chatSessionData.config.use_case,
        promptType: chatSessionData.config.prompt_type,
        userGoal: chatSessionData.config.user_goal,
        completed: false,
        chatHistory: [],
        responses: [],
      };

      // Update state with the new chat session
      set((state) => ({
        currentChatSessionId: newChatSession.id,
        activeChatSession: newChatSession,
        chatSessions: [...state.chatSessions, newChatSession],
        currentStep: "chat",
      }));

      // Fetch post-survey questions
      await get().fetchQuestions("post");
    } catch (error) {
      set({ error: "Failed to start next chat session" });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Ends the current chat session by marking it as completed.
   * Updates the state and moves to the "post-survey" step.
   */
  endCurrentChatSession: () => {
    set((state) => {
      if (!state.activeChatSession) return state;

      // Mark the current chat session as completed
      const updatedActiveChatSession = {
        ...state.activeChatSession,
        completed: true,
      };

      // Update the chat session in the chatSessions array
      const updatedChatSessions = state.chatSessions.map((session) =>
        session.id === updatedActiveChatSession.id
          ? updatedActiveChatSession
          : session
      );

      return {
        activeChatSession: updatedActiveChatSession,
        chatSessions: updatedChatSessions,
        currentStep: "post-survey",
      };
    });
  },

  /**
   * Ends the evaluation process by marking all topics as completed.
   * Sets the current step to "results".
   */
  endEvaluation: () => {
    set({
      currentStep: "results",
      allTopicsCompleted: true,
    });
  },

  /**
   * Sets an error message in the state.
   * @param error - The error message to set.
   */
  setError: (error) => set({ error }),

  /**
   * Sets the loading state.
   * @param loading - A boolean indicating whether loading is in progress.
   */
  setLoading: (loading: boolean) => set({ loading }),

  /**
   * Sends a message to the chatbot API and updates the chat history with the bot's response.
   * Adds the user's message to the chat history if it's not the initial message.
   * @param message - The message to send.
   * @param isInitial - Whether this is the initial message in the chat session.
   */
  sendMessage: async (message, isInitial = false) => {
    const { currentChatSessionId, activeChatSession } = get();

    if (!currentChatSessionId || !activeChatSession) {
      set({ error: "No active chat session" });
      return;
    }

    try {
      set({ loading: true });

      // Add user message to chat history if not initial message
      if (!isInitial) {
        get().addChatMessage({
          sender: "user",
          text: message,
        });
      }

      // Send message to API
      const result = await sendChatMessage(
        currentChatSessionId,
        message,
        activeChatSession.chatHistory
      );

      if (result.success) {
        // Add bot message to chat history
        get().addChatMessage({
          sender: "bot",
          text: result.message.content,
          reasoning: result.message.reasoning,
        });
      } else {
        set({ error: result.error });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Checks if there are more topics available for the evaluation.
   * Updates the state to transition to the next topic or mark all topics as completed.
   */
  checkNextTopic: async () => {
    const { evaluationId } = get();
    try {
      set({ loading: true });

      // Check if there's a next topic
      const nextTopicData = await getNextTopic(evaluationId!);

      if (nextTopicData.completed) {
        // All topics completed, go to results
        set({
          allTopicsCompleted: true,
          currentStep: "results",
        });
      } else {
        // More topics available, go to transition screen
        set({
          currentStep: "topic-transition",
          remainingTopics: [
            nextTopicData.next_use_case,
            ...get().remainingTopics,
          ],
        });
      }
    } catch (error) {
      set({ error: "Failed to check next topic" });
    } finally {
      set({ loading: false });
    }
  },
}));
