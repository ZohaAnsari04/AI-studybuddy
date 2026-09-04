import { getAIService, AIService, ExplanationResult, GroundedChatResult } from './aiService';

export type { ExplanationResult, GroundedChatResult, AIService as AIProvider };

export function getAIProvider() {
  return getAIService();
}
