import { useState } from 'react';
import { X, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface CreatePostSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreatePostSheet({ isOpen, onClose, onSubmit }: CreatePostSheetProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('math');
  const [imageUrl, setImageUrl] = useState('');

  const subjects = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography', 'civics', 'other'];

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, subject, image_url: imageUrl || null, author_name: 'Student' });
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-white rounded-t-3xl shadow-2xl z-[70] p-6 pb-[calc(24px+env(safe-area-inset-bottom))]"
          >
            <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] font-bold text-foreground">{t('forum.new')}</h2>
              <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                        subject === s 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain your problem in detail..."
                  className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-muted border-none rounded-2xl pl-12 pr-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Post Question
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
