import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Search, Filter, MessageSquare, Heart, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, onSnapshot, handleFirestoreError, OperationType, addDoc, serverTimestamp, auth } from '@/firebase';
import { cn } from '@/lib/utils';
import AISection from '@/components/AISection';
import PostCard from '@/components/forum/PostCard';
import CreatePostSheet from '@/components/forum/CreatePostSheet';
import RedditFeed from '@/components/forum/RedditFeed';
import LoginScreen from '@/components/LoginScreen';

export default function ForumPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reddit'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  const subjects = [
    'all', 'math', 'chinese', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography', 'civics', 'other'
  ];

  useEffect(() => {
    // 雙重檢查：確保 user 存在且 Firebase Auth 實例也已就緒
    if (!user || authLoading || !auth.currentUser) return;

    console.log("📡 開始監聽討論區貼文...");
    const q = query(
      collection(db, 'posts'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleCreatePost = async (data: any) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'posts'), {
        ...data,
        uid: user.uid,
        author_name: user.displayName || 'Anonymous',
        author_photo: user.photoURL || null,
        likes: 0,
        answer_count: 0,
        solved: false,
        created_at: serverTimestamp(),
      });
      setShowCreateSheet(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const filteredPosts = posts.filter(p => filter === 'all' || p.subject === filter);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <ShieldCheck size={24} />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Please sign in to view the forum.</p>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          {t('nav.forum')}
        </h1>
        <div className="flex bg-muted p-1 rounded-2xl border border-black/5">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              "px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              activeTab === 'posts' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('forum.posts')}
          </button>
          <button
            onClick={() => setActiveTab('reddit')}
            className={cn(
              "px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2",
              activeTab === 'reddit' ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <RefreshCw size={14} className={activeTab === 'reddit' ? "animate-spin-slow" : ""} />
            {t('forum.reddit')}
          </button>
        </div>
      </header>

      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {/* Subject Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  filter === s 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white border border-black/8 text-muted-foreground hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Post List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </AnimatePresence>
            
            {filteredPosts.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                  <MessageSquare size={32} />
                </div>
                <p className="text-[13px] text-muted-foreground font-medium">No posts found for this subject.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              if (!user) {
                // Handle login redirect or show login modal
                return;
              }
              setShowCreateSheet(true);
            }}
            className="fixed bottom-[88px] right-4 w-[52px] h-[52px] rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-40"
          >
            <Plus size={28} />
          </button>
        </div>
      ) : (
        <RedditFeed />
      )}

      <AISection />

      <CreatePostSheet 
        isOpen={showCreateSheet} 
        onClose={() => setShowCreateSheet(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
