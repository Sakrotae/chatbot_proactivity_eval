import React, { useState, useRef, useEffect } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { ChatMessage } from './ChatMessage';
import { Send, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { sendChatMessage } from '../../services/api';


export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSendInitialMessage, setIsSendInitialMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  
  const {
    activeChatSession,
    loading,
    error,
    sendMessage,
    endCurrentChatSession,
    setError,
    addChatMessage, currentChatSessionId
  } = useEvaluationStore();

  const sendInitialMessage = async () => {
    try {
      setIsSendInitialMessage(true);
      const initialMessage = "Introduce yourself to the user";
      const response = await sendChatMessage(currentChatSessionId!, initialMessage, []);

      if (response.success) {
        addChatMessage({
          text: response.message.content,
          sender: 'bot',
        });
      }
    } catch (error) {
      console.error('Failed to send initial message:', error);
      setError('Failed to send initial message');
    }
    finally{
      setIsSendInitialMessage(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatSession?.chatHistory]);

  useEffect(() => {
    if (!initialMessageSentRef.current && currentChatSessionId) {
      initialMessageSentRef.current = true;
      sendInitialMessage();
    }
  }, [currentChatSessionId]);


  const handleSend = async () => {
    if (!message.trim()) return;
    const message_copy = message;
    setMessage('');

    try {
      await sendMessage(message_copy.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleComplete = () => {
    endCurrentChatSession();
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4 border-b">
        <h3 className="text-gray-700"><strong>Goal:</strong> {activeChatSession?.userGoal}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isSendInitialMessage && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {activeChatSession?.chatHistory.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {loading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
            <div>
              <p className="text-red-600">{error}</p>
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
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={loading || isSendInitialMessage || !message.trim()}
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
          disabled={(activeChatSession?.chatHistory.length ?? 0) < 4}
        >
          Complete Chat Interaction
        </button>
      </div>
    </div>
  );
};
