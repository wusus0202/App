import { useState, useEffect } from 'react';
import { ExternalLink, MessageSquare, ArrowBigUp, RefreshCw, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RedditFeed() {
  const [subreddits, setSubreddits] = useState([
    { name: 'homeworkhelp', subject: 'General' },
    { name: 'math', subject: 'Math' },
    { name: 'science', subject: 'Science' }
  ]);
  const [feeds, setFeeds] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState('');

  const fetchFeed = async (sub: string) => {
    setLoading(prev => ({ ...prev, [sub]: true }));
    try {
      // Using allorigins.win as a CORS proxy for Reddit API
      const targetUrl = `https://www.reddit.com/r/${sub}/hot.json?limit=5`;
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      
      if (data.contents) {
        const redditData = JSON.parse(data.contents);
        if (redditData.data && redditData.data.children) {
          setFeeds(prev => ({ ...prev, [sub]: redditData.data.children.map((c: any) => c.data) }));
        } else {
          console.warn(`No posts found for r/${sub}`);
        }
      }
    } catch (error) {
      console.error('Reddit fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [sub]: false }));
    }
  };

  useEffect(() => {
    subreddits.forEach(sub => fetchFeed(sub.name));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reddit Communities</p>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <AnimatePresence>
        {subreddits.map((sub) => (
          <motion.section
            key={sub.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs">
                  r/
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-foreground leading-none">r/{sub.name}</h3>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{sub.subject}</span>
                </div>
              </div>
              <button 
                onClick={() => fetchFeed(sub.name)}
                disabled={loading[sub.name]}
                className="p-2 text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading[sub.name] ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="space-y-2">
              {feeds[sub.name]?.map((post) => (
                <a
                  key={post.id}
                  href={`https://reddit.com${post.permalink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-accent/20 transition-all active:scale-[0.99]"
                >
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-bold leading-snug line-clamp-2">{post.title}</h4>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ArrowBigUp size={14} className="text-accent" />
                        {post.ups}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {post.num_comments}
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-accent">
                        <ExternalLink size={12} />
                        Reddit
                      </div>
                    </div>
                  </div>
                </a>
              ))}
              
              {(!feeds[sub.name] || feeds[sub.name].length === 0) && !loading[sub.name] && (
                <div className="py-8 text-center bg-muted/30 rounded-2xl border border-dashed border-black/5">
                  <p className="text-[12px] text-muted-foreground font-medium">No posts found for r/{sub.name}</p>
                </div>
              )}
              
              {loading[sub.name] && (
                <div className="py-8 flex justify-center">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground/30" />
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>

      {/* Add Subreddit Dialog */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-[320px] bg-white rounded-3xl p-6 space-y-4"
            >
              <h3 className="text-[18px] font-bold">Add Subreddit</h3>
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                placeholder="e.g. physics"
                className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-accent/20"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-muted-foreground bg-muted"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (newSub) {
                      setSubreddits(prev => [...prev, { name: newSub.toLowerCase(), subject: 'Custom' }]);
                      fetchFeed(newSub.toLowerCase());
                      setNewSub('');
                      setShowAdd(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-accent"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
