import { ChatMessage } from "../types";

const API_BASE = "http://localhost:5000/api"; //"http://137.250.171.247:5000/api";

export const sendChatMessage = async (
  chatSessionId: number,
  message: string,
  history: ChatMessage[]
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatSessionId,
        message,
        history: history.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send message");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getNextTopic = async (evaluationId: number): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE}/chat/next-topic?evaluation_id=${evaluationId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get next topic");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const startChatSession = async (
  evaluationId: number,
  useCase?: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/chat/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        evaluation_id: evaluationId,
        use_case: useCase,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start chat session");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
