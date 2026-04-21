import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function AIChat({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your 0ops2Ops AI Assistant. How can I help you with your deployments or infrastructure today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMsgs = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { messages: newMsgs });
      if (res.data.success) {
        setMessages([...newMsgs, { role: 'assistant', content: res.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMsgs, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my models right now. Make sure Ollama is running!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all z-[9999] flex items-center justify-center gap-2 transform hover:scale-105 border border-blue-400"
      >
        <Bot size={20} />
        Ask AI ✨
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 rounded-2xl shadow-2xl z-50 flex flex-col border overflow-hidden"
            style={{ backgroundColor: theme?.card?.bg || '#fff', borderColor: theme?.navbar?.border || '#e5e7eb' }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Ollama AI Assistant</h3>
                  <p className="text-xs opacity-60">Connected locally to your Host</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors opacity-70 hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 h-96 custom-scrollbar"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 mt-1">
                      {m.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <User size={14} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Bot size={14} />
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-zinc-100 dark:bg-zinc-800 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Bot size={14} />
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 rounded-tl-sm flex items-center gap-2 text-sm opacity-70">
                      <Loader2 size={16} className="animate-spin" /> Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-4 pr-12 py-3 text-sm rounded-xl border bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-zinc-200 dark:border-zinc-700"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
