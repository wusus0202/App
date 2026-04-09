import { Sparkles, MessageCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import AISection from '@/components/AISection';

export default function AIAssistantPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          {t('nav.ai')}
        </h1>
        <div className="p-2 bg-primary/10 text-primary rounded-xl">
          <Sparkles size={20} />
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Info size={20} />
          </div>
          <h2 className="text-[15px] font-bold">Your Academic Strategist</h2>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
          I am your AI-powered study assistant. I have full context of your tasks, calendar, and college goals. 
          Ask me to help you plan your week, explain complex topics, or evaluate your portfolio.
        </p>
      </section>

      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">Quick Suggestions</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            "How should I prioritize my tasks for today?",
            "Can you help me break down my Physics project?",
            "What are the requirements for Stanford CS?",
            "Give me a 3-day study plan for my Math exam."
          ].map((q) => (
            <button 
              key={q}
              className="text-left p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-primary/20 transition-all active:scale-[0.98] group flex items-center justify-between"
            >
              <span className="text-[13px] font-medium text-foreground">{q}</span>
              <MessageCircle size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <AISection />
    </div>
  );
}
