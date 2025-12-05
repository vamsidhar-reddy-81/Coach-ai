import React, { useEffect, useRef } from 'react';
import { Message, Role } from '../types';
import { MarkdownView } from './MarkdownView';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom only if user is already near bottom or it's a new message start
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content, messages[messages.length - 1]?.sources]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-0 scrollbar-thin">
      <div className="flex flex-col pb-4">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-400 max-w-md">
                I can explain complex concepts, browse the web for real-time info, write code, or visualize data for you.
              </p>
           </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`w-full border-b border-black/5 dark:border-white/5 ${
              message.role === Role.USER ? 'bg-transparent' : 'bg-transparent'
            }`}
          >
            <div className="max-w-3xl mx-auto p-4 md:py-6 flex gap-4 md:gap-6">
              <div className="flex-shrink-0 flex flex-col relative items-end">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === Role.USER 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-500'
                }`}>
                  {message.role === Role.USER ? (
                    <img 
                      src="https://picsum.photos/32/32" 
                      alt="User" 
                      className="w-8 h-8 rounded-full opacity-90"
                    />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="relative flex-1 overflow-hidden">
                <div className="font-semibold text-white mb-1">
                  {message.role === Role.USER ? 'You' : 'Coach AI'}
                </div>
                <div className="text-gray-300">
                  <MarkdownView content={message.content} />
                </div>
                
                {/* Sources / Citations */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-gray-300 transition-colors truncate max-w-[200px]"
                          title={source.title}
                        >
                          <span className="truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {message.isStreaming && (
                  <div className="flex items-center gap-1 mt-2 text-gray-500">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};