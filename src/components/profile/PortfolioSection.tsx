import { useState } from 'react';
import { Plus, BookOpen, Sparkles, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { GoogleGenAI } from '@google/genai';

export default function PortfolioSection() {
  const { t } = useLanguage();
  const [portfolios, setPortfolios] = useState<any[]>([
    { id: '1', title: 'Science Fair Project', description: 'Impact of microplastics on local marine life.', target_college: 'Stanford', target_major: 'Biology', ai_score: 8.5, ai_feedback: 'Excellent research methodology. Consider expanding on the mitigation strategies.' },
    { id: '2', title: 'History Research Paper', description: 'The role of women in the French Revolution.', target_college: 'Yale', target_major: 'History', ai_score: 7.2, ai_feedback: 'Strong thesis. Could use more primary source citations in the second chapter.' },
  ]);
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleEvaluate = async (portfolio: any) => {
    setLoading(portfolio.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `Evaluate this student portfolio project for college admission:
            Title: ${portfolio.title}
            Description: ${portfolio.description}
            Target College: ${portfolio.target_college}
            Target Major: ${portfolio.target_major}
            
            Provide a score from 1 to 10 and constructive feedback.
            Return ONLY a JSON object: { "score": number, "feedback": "string" }` }] }
        ],
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      setPortfolios(prev => prev.map(p => p.id === portfolio.id ? { ...p, ai_score: result.score, ai_feedback: result.feedback } : p));
    } catch (error) {
      console.error('AI Evaluation Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {t('profile.portfolio')}
        </h2>
        <button className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {portfolios.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-foreground leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">{item.target_college} • {item.target_major}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-xl text-[13px] font-extrabold shadow-sm",
                  item.ai_score >= 8 ? "bg-emerald-500 text-white" :
                  item.ai_score >= 6 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                )}>
                  {item.ai_score?.toFixed(1) || 'N/A'}
                </div>
              </div>

              {/* Score Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.ai_score || 0) * 10}%` }}
                  className={cn(
                    "h-full transition-all duration-1000",
                    item.ai_score >= 8 ? "bg-emerald-500" :
                    item.ai_score >= 6 ? "bg-amber-500" : "bg-red-500"
                  )}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleEvaluate(item)}
                  disabled={loading === item.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-[11px] font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {loading === item.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI Evaluate
                </button>
                <button 
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="px-3 py-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
                >
                  <ChevronDown size={16} className={cn("transition-transform", expanded === item.id && "rotate-180")} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expanded === item.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-muted/30 border-t border-black/5 p-5 overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">AI Feedback</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-medium italic">
                      "{item.ai_feedback || 'No feedback yet. Click Evaluate to get AI insights.'}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
