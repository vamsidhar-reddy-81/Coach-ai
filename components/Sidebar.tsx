import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-950 flex flex-col border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onToggle();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/50"
          >
            <span className="p-1 bg-white/10 rounded">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span>
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2">Recents</div>
          {sessions.length === 0 && (
            <div className="text-sm text-gray-600 px-3 italic">No history yet.</div>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onToggle();
              }}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors truncate ${
                currentSessionId === session.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-900'
              }`}
            >
              {session.title}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">User</div>
              <div className="text-xs text-gray-500">Free Plan</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};