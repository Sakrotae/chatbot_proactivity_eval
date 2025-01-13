export type LikertScale = 1 | 2 | 3 | 4 | 5;

export interface SurveyQuestion {
  id: string;
  text: string;
  response?: LikertScale;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface EvaluationState {
  currentStep: 'landing' | 'pre-survey' | 'chat' | 'post-survey' | 'results';
  preSurveyResponses: Record<string, LikertScale>;
  postSurveyResponses: Record<string, LikertScale>;
  chatHistory: ChatMessage[];
  startTime?: Date;
  endTime?: Date;
}
