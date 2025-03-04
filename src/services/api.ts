import { ChatMessage } from "../types";

const API_BASE = "http://137.250.171.247:5000/api"; //'http://localhost:5000/api';

export const sendChatMessage = async (
  evaluationId: number,
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
        evaluationId,
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
