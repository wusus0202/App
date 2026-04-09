import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, MessageSquare, CheckCircle2, Crown, Send, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType, addDoc, updateDoc, serverTimestamp, increment, getDoc, auth } from '@/firebase';
import { cn } from '@/lib/utils';
import AISection from '@/components/AISection';
import LoginScreen from '@/components/LoginScreen';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user || authLoading || !auth.currentUser) return;

    const postRef = doc(db, 'posts', id);
    const unsubscribePost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/forum');
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${id}`);
    });

    const answersQuery = query(
      collection(db, 'comments'),
      where('post_id', '==', id),
      orderBy('created_at', 'asc')
    );

    const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
      const answerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnswers(answerList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });

    return () => {
      unsubscribePost();
      unsubscribeAnswers();
    };
  }, [id, navigate]);

  const handleAddAnswer = async () => {
    if (!user || !newAnswer.trim() || !id) return;

    try {
      await addDoc(collection(db, 'comments'), {
        post_id: id,
        uid: user.uid,
        author_name: user.displayName || 'Anonymous',
        author_photo: user.photoURL || null,
        content: newAnswer.trim(),
        likes: 0,
        is_best: false,
        created_at: serverTimestamp(),
      });

      await updateDoc(doc(db, 'posts', id), {
        answer_count: increment(1)
      });

      setNewAnswer('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  };

  const handleMarkBest = async (answerId: string) => {
    if (!user || !id || post.uid !== user.uid) return;

    try {
      // Mark answer as best
      await updateDoc(doc(db, 'comments', answerId), {
        is_best: true
      });

      // Mark post as solved
      await updateDoc(doc(db, 'posts', id), {
        solved: true
      });

      // Award points to the answerer
      const answer = answers.find(a => a.id === answerId);
      if (answer && answer.uid) {
        await updateDoc(doc(db, 'users', answer.uid), {
          points: increment(50)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${answerId}`);
    }
  };

  const handleLikePost = async () => {
    if (!user || !id) return;
    try {
      await updateDoc(doc(db, 'posts', id), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const handleLikeAnswer = async (answerId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'comments', answerId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${answerId}`);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <ShieldCheck size={24} />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Please sign in to view this post.</p>
        <button 
          onClick={() => navigate('/forum')}
          className="px-6 py-2 bg-primary text-white rounded-xl text-[13px] font-bold"
        >
          Back to Forum
        </button>
      </div>
    );
  }

  if (authLoading || loading) return <div className="flex items-center justify-center h-screen text-muted-foreground">{t('common.loading')}</div>;
  if (!post) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/forum')} className="p-2 bg-white rounded-xl border border-black/5 shadow-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[18px] font-bold text-foreground tracking-tight truncate">
          {post.title}
        </h1>
      </header>

      {/* Post Content */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-500 text-white">
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

        <div className="space-y-3">
          <h2 className="text-[18px] font-bold leading-tight">{post.title}</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.image_url && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-black/5">
          <button 
            onClick={handleLikePost}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <Heart size={18} className={post.likes > 0 ? "text-rose-500 fill-rose-500" : ""} />
            <span className="text-[13px] font-bold">{post.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare size={18} />
            <span className="text-[13px] font-bold">{post.answer_count}</span>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Answers</h2>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {answers.map((answer) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative p-5 rounded-2xl border transition-all",
                  answer.is_best 
                    ? "bg-amber-50/50 border-amber-200 shadow-md shadow-amber-100" 
                    : "bg-white border-black/5 shadow-sm"
                )}
              >
                {answer.is_best && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-200 border-4 border-white">
                    <Crown size={20} />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground">{answer.author_name}</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <button 
                        onClick={() => handleLikeAnswer(answer.id)}
                        className="flex items-center gap-1.5 hover:text-rose-500 transition-colors"
                      >
                        <Heart size={14} className={answer.likes > 0 ? "text-rose-500 fill-rose-500" : ""} />
                        <span className="text-[11px] font-bold">{answer.likes}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-foreground leading-relaxed">{answer.content}</p>
                  
                  {!post.solved && user && post.uid === user.uid && (
                    <button 
                      onClick={() => handleMarkBest(answer.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-600 rounded-lg text-[11px] font-bold hover:bg-amber-200 transition-colors"
                    >
                      <Star size={12} fill="currentColor" />
                      Mark as Best
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Answer Input */}
      {user ? (
        <div className="sticky bottom-24 bg-white rounded-2xl border border-black/5 shadow-lg p-3 flex gap-2">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer..."
            className="flex-1 bg-muted border-none rounded-xl px-4 py-2.5 text-[13px] font-medium focus:ring-2 focus:ring-primary/20 resize-none h-12"
          />
          <button 
            onClick={handleAddAnswer}
            disabled={!newAnswer.trim()}
            className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      ) : (
        <div className="sticky bottom-24 bg-white rounded-2xl border border-black/5 shadow-lg p-4 text-center">
          <p className="text-[13px] text-muted-foreground font-medium mb-2">Sign in to join the discussion</p>
          <button 
            onClick={() => navigate('/profile')}
            className="px-6 py-2 bg-primary text-white rounded-xl text-[13px] font-bold"
          >
            Sign In
          </button>
        </div>
      )}

      <AISection />
    </div>
  );
}
