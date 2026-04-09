import { Heart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const subjectColors = {
    math: "bg-blue-500",
    chinese: "bg-rose-500",
    english: "bg-emerald-500",
    physics: "bg-violet-500",
    chemistry: "bg-amber-500",
    biology: "bg-green-500",
    history: "bg-orange-500",
    geography: "bg-cyan-500",
    civics: "bg-pink-500",
    other: "bg-gray-500"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/forum/${post.id}`)}
      className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 space-y-3 cursor-pointer hover:border-primary/20 transition-all active:scale-[0.98]"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md text-white",
            subjectColors[post.subject as keyof typeof subjectColors]
          )}>
            {post.subject}
          </span>
          {post.solved && (
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={10} />
              Solved
            </div>
          )}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{post.author_name}</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-[15px] font-bold leading-tight line-clamp-1">{post.title}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">{post.content}</p>
      </div>

      {post.image_url && (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-black/5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart size={14} className={post.likes > 0 ? "text-rose-500 fill-rose-500" : ""} />
          <span className="text-[11px] font-bold">{post.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageSquare size={14} />
          <span className="text-[11px] font-bold">{post.answer_count}</span>
        </div>
      </div>
    </motion.div>
  );
}
