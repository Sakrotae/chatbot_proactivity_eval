import React, { useState } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { ChatMessage } from './ChatMessage';
import { Send } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const { chatHistory, addChatMessage, setStep } = useEvaluationStore();

  const handleSend = () => {
    if (!message.trim()) return;

    addChatMessage({
      text: message,
      sender: 'user',
    });

    // Simulate bot response
    setTimeout(() => {
      addChatMessage({
        text: 'This is a simulated response from the chatbot.',
        sender: 'bot',
      });
    }, 1000);

    setMessage('');
  };

  const handleComplete = () => {
    setStep('post-survey');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Send size={20} />
          </button>
        </div>
        <button
          onClick={handleComplete}
          className="mt-4 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Complete Chat Interaction
        </button>
      </div>
    </div>
  );
};
