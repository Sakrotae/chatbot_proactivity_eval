import React, { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const isBotMessage = message.sender === 'bot';
  const hasReasoning = isBotMessage && message.reasoning;

  const toggleReasoning = () => {
    setIsReasoningExpanded(!isReasoningExpanded);
  };

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
        className={`max-w-[80%] p-3 rounded-lg prose ${
          isBotMessage
            ? 'bg-gray-100'
            : 'bg-blue-600 text-white ml-auto'
        }`}
      >
        <ReactMarkdown>{message.text}</ReactMarkdown>

        {hasReasoning && (
          <div className="mt-2">
            <button
              onClick={toggleReasoning}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Brain size={14} />
              {isReasoningExpanded ? 'Hide reasoning' : 'Show reasoning'}
              {isReasoningExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {isReasoningExpanded && (
              <div className="mt-2 p-2 bg-gray-200 rounded text-sm text-gray-700 border-l-2 border-blue-400">
                <ReactMarkdown>{message.reasoning}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <span className="text-xs opacity-70 mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
