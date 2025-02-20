import React, { useState, useRef, useEffect } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { ChatMessage } from './ChatMessage';
import { Send, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  
  const {
    chatHistory,
    addChatMessage,
    setStep,
    evaluationId, 
    userGoal
  } = useEvaluationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendInitialMessage = async () => {
    try {
      const initialMessage = "Introduce yourself to the user";
      const response = await sendChatMessage(evaluationId!, initialMessage, []);

      if (response.success) {
        addChatMessage({
          text: response.message.content,
          sender: 'bot',
        });
      }
    } catch (error) {
      console.error('Failed to send initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (!initialMessageSentRef.current && evaluationId) {
      initialMessageSentRef.current = true;
      sendInitialMessage();
    }
  }, [evaluationId]);


  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      // Add user message immediately
      const userMessage = {
        text: message,
        sender: 'user' as const,
      };
      addChatMessage(userMessage);
      setMessage('');

      // Send to API
      const response = await sendChatMessage(
        evaluationId!,
        message,
        chatHistory
      );

      if (response.success) {
        addChatMessage({
          text: response.message.content,
          sender: 'bot',
        });
      } else {
        setError('Failed to get response from chatbot');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (chatHistory.length < 2) {
      setError('Please have at least one conversation with the chatbot before completing.');
      return;
    }
    setStep('post-survey');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4 border-b">
        <h3 className="text-gray-700"><strong>Goal:</strong> {userGoal}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
            <div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 text-sm hover:underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
              disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        
        <button
          onClick={handleComplete}
          className="mt-4 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={chatHistory.length < 4}
        >
          Complete Chat Interaction
        </button>
      </div>
    </div>
  );
};
