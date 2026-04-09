import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface CompletionModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (rating: number, reflection: string) => void;
}

export default function CompletionModal({ task, isOpen, onClose, onComplete }: CompletionModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [reflection, setReflection] = useState('');

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[80] p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[360px] bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            
            <div className="space-y-2">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-[22px] font-extrabold text-foreground leading-tight">
                Great Job!
              </h2>
              <p className="text-[13px] text-muted-foreground font-medium">
                You've completed: <span className="text-foreground font-bold">{task.title}</span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">How was your focus?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={32}
                      className={cn(
                        "transition-colors",
                        rating >= star ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reflections (Optional)</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn? Any challenges?"
                className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-[13px] font-medium focus:ring-2 focus:ring-primary/20 resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => onComplete(rating, reflection)}
                disabled={rating === 0}
                className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-white bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                Save & Finish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
