/* eslint-disable react-hooks/purity */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiTrash2, FiCopy, FiCheck, FiZap, FiUser } from 'react-icons/fi';

const suggestedPrompts = [
  '🔢 Explain DBMS normalization with examples',
  '⚛️ Explain all React Hooks with code',
  '📊 Create a DSA study plan for interviews',
  '🐍 Explain Python OOP concepts',
  '🌐 What is the OSI model?',
  '🚀 How does JWT authentication work?',
  '🎯 Generate a 30-day Web Dev roadmap',
  '💡 Explain Big O notation simply',
];

const TypingIndicator = () => (
  <div className="flex items-start gap-3 message-ai">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
      <FiZap size={14} className="text-white" />
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2 h-2 bg-blue-500 rounded-full typing-dot`} style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  </div>
);

const Message = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse message-user' : 'message-ai'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
          : 'bg-gradient-to-br from-purple-500 to-blue-600'
      }`}>
        {isUser
          ? <FiUser size={14} className="text-white" />
          : <FiZap size={14} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] group relative ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-md text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
        }`}>
          {isUser ? (
            <p className="leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose-custom max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400">
            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <button onClick={copyToClipboard} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              {copied ? <FiCheck size={12} className="text-emerald-500" /> : <FiCopy size={12} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `## 👋 Hello, ${user?.name?.split(' ')[0] || 'Student'}!\n\nI'm your **Rapid Revision Hub AI Study Assistant** — powered by advanced AI to help you learn faster and smarter.\n\n### What can I help you with?\n- 📚 **Explain concepts** — DBMS, DSA, OS, CN, React, Node.js\n- 📝 **Create study notes** — Structured markdown notes on any topic\n- 🗓️ **Study plans** — Personalized roadmaps for interviews or exams\n- 💡 **Code examples** — Working code snippets with explanations\n- ❓ **Answer questions** — Any academic or programming question\n\nJust type your question or pick a suggestion below! 🚀`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const res = await axios.get('/api/assistant/history');
          if (res.data.success && res.data.history?.length > 0) {
            // Load the most recent session's messages
            const latestSession = res.data.history[0];
            setSessionId(latestSession._id);
            if (latestSession.messages && latestSession.messages.length > 0) {
              setMessages(latestSession.messages);
            }
          }
        } catch (err) {
          console.warn('Failed to load chat history from server:', err);
        }
      }
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/assistant/chat', { message: content, sessionId });
      if (res.data.sessionId) setSessionId(res.data.sessionId);
      const aiMsg = { role: 'assistant', content: res.data.response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallback = { role: 'assistant', content: '⚠️ Connection error. Please make sure the backend server is running on port 5000, then try again.', timestamp: Date.now() };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const initialMsg = [
      {
        role: 'assistant',
        content: `## 👋 Hello, ${user?.name?.split(' ')[0] || 'Student'}!\n\nI'm your **Rapid Revision Hub AI Study Assistant** — powered by advanced AI to help you learn faster and smarter.\n\n### What can I help you with?\n- 📚 **Explain concepts** — DBMS, DSA, OS, CN, React, Node.js\n- 📝 **Create study notes** — Structured markdown notes on any topic\n- 🗓️ **Study plans** — Personalized roadmaps for interviews or exams\n- 💡 **Code examples** — Working code snippets with explanations\n- ❓ **Answer questions** — Any academic or programming question\n\nJust type your question or pick a suggestion below! 🚀`,
        timestamp: Date.now(),
      }
    ];
    setMessages(initialMsg);
    setSessionId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FiZap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold font-poppins text-gray-900 dark:text-white">AI Study Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online · Ready to help</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">{messages.length - 1} messages</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            id="clear-chat-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <FiTrash2 size={13} /> Clear
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-3"
        >
          <p className="text-xs text-gray-400 mb-2 text-center">💡 Try these prompts:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedPrompts.map((prompt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies... (Press Enter to send)"
              rows={1}
              className="w-full resize-none px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm overflow-hidden"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            id="ai-send-btn"
            className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FiSend size={16} />
          </motion.button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Shift+Enter for new line · Enter to send · Powered by Rapid Revision Hub AI
        </p>
      </motion.div>
    </div>
  );
};

export default AIAssistant;
