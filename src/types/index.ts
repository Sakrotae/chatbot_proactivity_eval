export type SurveyType = 'pre' | 'post';

export interface Question {
  id: number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  survey_type: string;
  min_value?: number;
  max_value?: number;
  step?: number;
  options?: string[];
}

export interface SurveyResponse {
  questionId: number;
  answer: string | number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: number;
  useCase: string;
  promptType: string;
  userGoal: string;
  completed: boolean;
  chatHistory: ChatMessage[];
  responses: SurveyResponse[];
}

export interface EvaluationState {
  currentStep: 'landing' | 'pre-survey' | 'chat' | 'post-survey' | 'topic-transition' | 'results';
  sessionId?: string;
  evaluationId?: number;
  currentChatSessionId?: number;
  questions: {
    pre: Question[];
    post: Question[];
  };
  responses: {
    pre: SurveyResponse[];
    post: SurveyResponse[];
  };
  chatSessions: ChatSession[];
  activeChatSession?: ChatSession;
  remainingTopics: string[];
  allTopicsCompleted: boolean;
  loading: boolean;
  error?: string;
}
