import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: any;
  onComplete: () => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-violet-500",
    low: "bg-emerald-500"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm transition-all hover:border-primary/20",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!task.completed) onComplete();
          }}
          className={cn(
            "transition-all duration-300 active:scale-90",
            task.completed ? "text-primary" : "text-muted-foreground/30 hover:text-primary/50"
          )}
        >
          {task.completed ? (
            <CheckCircle2 size={24} fill="currentColor" className="text-primary" />
          ) : (
            <Circle size={24} strokeWidth={2.5} />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", priorityColors[task.priority as keyof typeof priorityColors])} />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {task.category}
            </span>
          </div>
          <h3 className={cn(
            "text-[15px] font-bold leading-tight truncate",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span className="text-[11px] font-semibold">{task.due_date}</span>
          </div>
        </div>
      </div>

      <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
    </motion.div>
  );
}
