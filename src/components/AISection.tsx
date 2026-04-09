import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Globe, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useLanguage, AI_LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';

export default function AISection({ id }: { id?: string }) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [aiLang, setAiLang] = useState(AI_LANGUAGES.find(l => l.code === (lang === 'zh' ? 'zh-tw' : lang)) || AI_LANGUAGES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // In a real app, we would build context here from Firebase
      // For now, we'll use a placeholder context
      const context = `
        Today is ${new Date().toLocaleDateString()}.
        The student is using the Focus app.
        Current language preference: ${aiLang.label}.
        ${aiLang.prompt}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `${context}\n\nUser Question: ${userMsg}` }] }
        ],
        config: {
          systemInstruction: "You are an expert academic strategist for high school students. Reference real student data when provided. Use Markdown headers (### 📋 Summary, ### 📅 Schedule, ### 🌅 Morning, ### ☀️ Afternoon, ### 🌙 Evening, ### 📌 Action Items). End actionable responses with reminders.",
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to AI assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="mt-8 mb-4">
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-primary/5 flex justify-between items-center border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Sparkles size={16} />
            </div>
            <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider">
              Focus AI Assistant
            </h3>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-black/5 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              <Globe size={12} />
              {aiLang.label}
              <ChevronDown size={12} className={cn("transition-transform", showLanguages && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-32 bg-white border border-black/5 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  {AI_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setAiLang(l);
                        setShowLanguages(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-[11px] font-medium transition-colors",
                        aiLang.code === l.code ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-white/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary/40">
                <Sparkles size={24} />
              </div>
              <p className="text-[13px] text-muted-foreground font-medium">
                {t('ai.intro')}
              </p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-muted text-foreground rounded-tl-none border border-black/5"
              )}>
                {msg.role === 'ai' ? (
                  <div className="markdown-body prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-black/5">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('ai.placeholder')}
              className="w-full bg-muted border-none rounded-2xl px-4 py-3 pr-12 text-[13px] focus:ring-2 focus:ring-primary/20 resize-none min-h-[48px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:bg-muted-foreground transition-all hover:scale-105 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
