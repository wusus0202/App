import { useState } from 'react';
import { Plus, Target, ExternalLink, Sparkles, Loader2, Calendar, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

export default function CollegePlanningSection() {
  const { t } = useLanguage();
  const [colleges, setColleges] = useState<any[]>([
    { id: '1', name: 'Stanford University', major: 'Computer Science', location: 'California, USA', application_type: 'early_action', status: 'planning', website: 'https://stanford.edu' },
    { id: '2', name: 'National Taiwan University', major: 'Electrical Engineering', location: 'Taipei, Taiwan', application_type: 'regular', status: 'in_progress', website: 'https://ntu.edu.tw' },
  ]);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<string | null>(null);

  const handleAutoSchedule = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `Create a 14-day study and application schedule for a high school student targeting these colleges:
            ${colleges.map(c => `${c.name} (${c.major}) - ${c.application_type}`).join('\n')}
            
            Use Markdown headers and bullet points. Focus on balancing school work with application requirements.` }] }
        ],
        config: {
          systemInstruction: "You are an expert college admissions consultant. Provide a detailed, realistic 14-day plan. Use Markdown headers (### 📋 Week 1, ### 📅 Daily Focus).",
        }
      });

      setSchedule(response.text || "Failed to generate schedule.");
    } catch (error) {
      console.error('Auto-Schedule Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {t('profile.college')}
        </h2>
        <button className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {colleges.map((college) => (
          <div key={college.id} className="bg-white rounded-3xl border border-black/5 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-foreground leading-tight">{college.name}</h3>
                  <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">{college.location}</p>
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                college.application_type === 'early_action' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
              )}>
                {college.application_type.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Target size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-foreground">{college.major}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{college.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAutoSchedule}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          AI Auto-Schedule (14 Days)
        </button>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {schedule && (
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSchedule(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[400px] max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar size={20} />
                  <h3 className="text-[18px] font-bold">14-Day Study Plan</h3>
                </div>
                <button onClick={() => setSchedule(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-white">
                <div className="markdown-body prose prose-sm max-w-none">
                  <ReactMarkdown>{schedule}</ReactMarkdown>
                </div>
              </div>
              <div className="p-4 border-t border-black/5 bg-muted/30">
                <button 
                  onClick={() => setSchedule(null)}
                  className="w-full py-3 bg-primary text-white rounded-xl text-[13px] font-bold shadow-md active:scale-95 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
