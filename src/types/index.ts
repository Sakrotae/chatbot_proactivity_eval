export type QuestionType = 'likert' | 'text' | 'multiple_choice' | 'boolean';
export type SurveyType = 'pre' | 'post';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  survey_type: SurveyType;
}

export interface Response {
  questionId: number;
  answer: string | number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface EvaluationState {
  currentStep: 'landing' | 'pre-survey' | 'chat' | 'post-survey' | 'results';
  evaluationId?: number;
  sessionId?: string;
  questions: Record<SurveyType, Question[]>;
  responses: Record<SurveyType, Response[]>;
  chatHistory: ChatMessage[];
  startTime?: Date;
  endTime?: Date;
  loading: boolean;
  error?: string;
}
