import { ChatMessage } from "../types";

const API_BASE =
  import.meta.env.VITE_USE_LOCAL_API === "true"
    ? "http://localhost:5000/api"
    : "http://137.250.171.247:5000/api";

/**
 * Sends a chat message to the server along with the chat history.
 * @param chatSessionId - The ID of the current chat session.
 * @param message - The message to be sent.
 * @param history - The chat history containing previous messages.
 * @returns A promise resolving to the server's response.
 */
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

/**
 * Retrieves the next topic for the chat session based on the evaluation ID.
 * @param evaluationId - The ID of the evaluation.
 * @returns A promise resolving to the next topic data from the server.
 */
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

/**
 * Starts a new chat session for a given evaluation ID and optional use case.
 * @param evaluationId - The ID of the evaluation.
 * @param useCase - (Optional) The specific use case for the chat session.
 * @returns A promise resolving to the server's response for the new session.
 */
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
