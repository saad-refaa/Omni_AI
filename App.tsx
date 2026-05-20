import { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import AdminPanel from '@/components/AdminPanel';
import OmniCoreDashboard from '@/components/OmniCoreDashboard';
import { 
  isSessionUsed, 
  markSessionUsed, 
  resetSession,
  getStoredLanguage,
  setLanguage,
  saveChats,
  getStoredChats,
} from '@/services/storage';
import type { Language, Chat } from '@/types';
import './App.css';

function App() {
  const [lang, setLangState] = useState<Language>(() => getStoredLanguage());
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      return JSON.parse(getStoredChats());
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOmniCore, setShowOmniCore] = useState(true);

  // Persist chats
  useEffect(() => {
    saveChats(JSON.stringify(chats));
  }, [chats]);

  const handleUpdateChat = useCallback((updatedChat: Chat) => {
    setChats(prev => {
      const existing = prev.findIndex(c => c.id === updatedChat.id);
      if (existing >= 0) {
        const newChats = [...prev];
        newChats[existing] = updatedChat;
        return newChats;
      }
      return [updatedChat, ...prev];
    });
    setActiveChatId(updatedChat.id);
  }, []);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: lang === 'ar' ? 'محادثة جديدة' : 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  }, [lang]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeChatId === id) {
        setActiveChatId(filtered[0]?.id || null);
      }
      return filtered;
    });
  }, [activeChatId]);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLangState(newLang);
    setLanguage(newLang);
  }, []);

  const handleResetSession = useCallback(() => {
    resetSession();
    setShowAdmin(false);
    setActiveChatId(null);
    setChats([]);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  if (showOmniCore) {
    return (
      <div className="relative h-screen w-full">
        <OmniCoreDashboard />
        <button 
          onClick={() => setShowOmniCore(false)}
          className="absolute bottom-4 left-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          العودة للواجهة القديمة
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f1019] overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 left-4 z-50">
         <button 
          onClick={() => setShowOmniCore(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
        >
          تجربة OmniCore OS
        </button>
      </div>
      
      <Sidebar
        lang={lang}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatInterface
        lang={lang}
        chat={activeChat}
        onUpdateChat={handleUpdateChat}
        onOpenAdmin={() => setShowAdmin(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLanguageChange={handleLanguageChange}
      />

      {showAdmin && (
        <AdminPanel
          lang={lang}
          onClose={() => setShowAdmin(false)}
          onReset={handleResetSession}
        />
      )}
    </div>
  );
}

export default App;
