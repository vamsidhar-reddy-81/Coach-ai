import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 relative">
      <div className="relative flex items-end w-full p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Coach AI..."
          rows={1}
          disabled={disabled}
          className="w-full max-h-[200px] bg-transparent border-0 resize-none focus:ring-0 text-gray-100 placeholder-gray-400 py-2 pl-2 pr-10 leading-6 scrollbar-thin"
          style={{ overflowY: input.length > 100 ? 'auto' : 'hidden' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors ${
            input.trim() && !disabled
              ? 'bg-white text-gray-900 hover:bg-gray-200'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-current"
          >
            <path
              d="M7 11L12 6L17 11M12 18V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-2">
        Coach AI may display inaccurate info, including about people, so double-check its responses.
      </div>
    </div>
  );
};