import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
      <div>
        <h3 className="font-semibold text-red-800">Error</h3>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
};
