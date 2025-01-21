import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBotMessage = message.sender === 'bot';

  return (
    <div
      className={`flex gap-3 ${isBotMessage ? 'justify-start' : 'justify-end'}`}
    >
      {isBotMessage && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot size={20} className="text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isBotMessage
            ? 'bg-gray-100'
            : 'bg-blue-600 text-white ml-auto'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {!isBotMessage && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
};
