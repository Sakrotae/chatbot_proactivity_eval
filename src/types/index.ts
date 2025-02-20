export type QuestionType = "likert" | "text" | "numeric" | "dropdown";
export type SurveyType = "pre" | "post";

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  survey_type: SurveyType;
  min_value?: number;
  max_value?: number;
  step?: number;
  options?: string[];
}

export interface Response {
  questionId: number;
  answer: string | number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface EvaluationState {
  currentStep: "landing" | "pre-survey" | "chat" | "post-survey" | "results";
  evaluationId?: number;
  sessionId?: string;
  userGoal?: string;
  questions: Record<SurveyType, Question[]>;
  responses: Record<SurveyType, Response[]>;
  chatHistory: ChatMessage[];
  startTime?: Date;
  endTime?: Date;
  loading: boolean;
  error?: string;
}
