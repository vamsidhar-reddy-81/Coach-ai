import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { geminiService } from './services/gemini';
import { Message, Role, ChatSession, Source } from './types';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load sessions from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_sessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      } else {
        createNewSession();
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
      createNewSession();
    }
  }, []);

  // Save sessions when changed
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('gemini_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Sync current messages with session
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
        
        // Restore history for the service
        const historyForService = session.messages.map(m => ({
          role: m.role === Role.USER ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
        
        geminiService.startChat(historyForService);
      }
    }
  }, [currentSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    geminiService.startChat([]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Update title if it's the first user message
        let title = s.title;
        if (s.messages.length === 0 && newMessages.length > 0) {
          const firstUserMsg = newMessages.find(m => m.role === Role.USER);
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...s, messages: newMessages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    updateSessionMessages(currentSessionId, newMessages);
    setIsLoading(true);

    try {
      // Create a placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsgPlaceholder: Message = {
        id: aiMsgId,
        role: Role.MODEL,
        content: '',
        isStreaming: true,
        timestamp: Date.now()
      };
      
      let currentAiMsg = aiMsgPlaceholder;
      setMessages(prev => [...prev, currentAiMsg]);

      // Stream response
      let fullText = '';
      let accumulatedSources: Source[] = [];
      const stream = geminiService.sendMessageStream(text);

      for await (const chunk of stream) {
        fullText += chunk.text;
        
        // Accumulate unique sources if provided
        if (chunk.sources && chunk.sources.length > 0) {
           const existingUris = new Set(accumulatedSources.map(s => s.uri));
           chunk.sources.forEach(s => {
             if (!existingUris.has(s.uri)) {
               accumulatedSources.push(s);
               existingUris.add(s.uri);
             }
           });
        }

        currentAiMsg = { 
          ...currentAiMsg, 
          content: fullText,
          sources: accumulatedSources.length > 0 ? accumulatedSources : undefined
        };
        
        setMessages(prev => prev.map(m => m.id === aiMsgId ? currentAiMsg : m));
      }

      // Finalize
      const finalAiMsg = { ...currentAiMsg, isStreaming: false };
      setMessages(prev => prev.map(m => m.id === aiMsgId ? finalAiMsg : m));
      
      // Update session with final state
      updateSessionMessages(currentSessionId, [...newMessages, finalAiMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: "**Error:** Could not generate response. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      updateSessionMessages(currentSessionId, [...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 font-sans text-gray-100 overflow-hidden">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-gray-800">
        {/* Header for Mobile */}
        <div className="md:hidden flex items-center p-3 border-b border-white/10 bg-gray-800 text-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-700 rounded-lg">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="ml-3 font-medium">Coach AI</div>
          <button onClick={createNewSession} className="ml-auto p-2 hover:bg-gray-700 rounded-lg">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        {/* Top Model Selector */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-sm border-b border-white/5">
           <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-colors">
              <span className="font-semibold text-gray-200">Coach AI 2.5</span>
              <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 rounded">Online</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
           </div>
        </div>

        <MessageList messages={messages} />

        <div className="p-4 bg-gradient-to-t from-gray-800 via-gray-800 to-transparent">
          <InputArea onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;