import { useState } from 'react';
import { X, Calendar as CalendarIcon, Flag, Tag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddTaskSheet({ isOpen, onClose, onSubmit }: AddTaskSheetProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState('school');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['school', 'cram_school', 'exam', 'project', 'other'];

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, description, priority, category, due_date: dueDate });
    setTitle('');
    setDescription('');
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
              <h2 className="text-[22px] font-bold text-foreground">{t('tasks.add')}</h2>
              <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                <div className="flex gap-2">
                  {[
                    { id: 'high', label: 'High', color: 'bg-red-500' },
                    { id: 'medium', label: 'Medium', color: 'bg-violet-500' },
                    { id: 'low', label: 'Low', color: 'bg-emerald-500' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriority(p.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all",
                        priority === p.id 
                          ? `${p.color} text-white shadow-lg shadow-${p.id}/20` 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <Flag size={14} fill={priority === p.id ? "currentColor" : "none"} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
                        category === c 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-muted text-muted-foreground border border-transparent"
                      )}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
                <div className="relative">
                  <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-muted border-none rounded-2xl pl-12 pr-4 py-3 text-[15px] font-medium focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                Create Task
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
