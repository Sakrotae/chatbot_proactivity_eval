import React from 'react';

interface LikertScaleProps {
  value?: number;
  onChange: (value: number) => void;
}

export const LikertScale: React.FC<LikertScaleProps> = ({ value, onChange }) => {
  const options = [
    { label: 'Strongly Disagree', color: '#FF4D4D', hoverColor: '#FF6666' },
    { label: 'Disagree', color: '#FF8080', hoverColor: '#FF9999' },
    { label: 'Neutral', color: '#E0E0E0', hoverColor: '#EBEBEB' },
    { label: 'Agree', color: '#90EE90', hoverColor: '#A1F4A1' },
    { label: 'Strongly Agree', color: '#28A745', hoverColor: '#2FBF4F' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2 mt-2">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onChange(index + 1)}
          className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all
            duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{
            backgroundColor: value === index + 1 ? option.color : '#F3F4F6',
            color: value === index + 1 ? '#FFFFFF' : '#374151',
            ':hover': {
              backgroundColor: option.hoverColor,
            },
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
