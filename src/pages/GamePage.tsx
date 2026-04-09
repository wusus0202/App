import { useState, useEffect } from 'react';
import { Gift, Sparkles, Diamond, Zap, Star, Trophy, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, updateDoc, increment, handleFirestoreError, OperationType } from '@/firebase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AISection from '@/components/AISection';
import LoginScreen from '@/components/LoginScreen';

export default function GamePage() {
  const { t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const [pulling, setPulling] = useState(false);
  const [reveal, setReveal] = useState<any>(null);

  const points = profile?.points || 0;
  const completedToday = profile?.tasks_completed_today || 0;

  const rarities = [
    { id: 'common', label: 'Common', icon: '📘', chance: 0.5, points: 5, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'rare', label: 'Rare', icon: '💎', chance: 0.3, points: 10, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'epic', label: 'Epic', icon: '🔮', chance: 0.15, points: 20, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'legendary', label: 'Legendary', icon: '🌟', chance: 0.05, points: 50, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const handlePull = async () => {
    if (!user || points < 10 || pulling) return;

    setPulling(true);
    setReveal(null);

    try {
      // Deduct 10 points
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-10)
      });

      // Pull logic
      setTimeout(async () => {
        const rand = Math.random();
        let cumulative = 0;
        let result = rarities[0];
        for (const r of rarities) {
          cumulative += r.chance;
          if (rand <= cumulative) {
            result = r;
            break;
          }
        }
        
        // Add reward points
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(result.points)
        });

        setReveal(result);
        setPulling(false);
        toast.success(`You got a ${result.label} reward! +${result.points} pts`);
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setPulling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          {t('game.title')}
        </h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-2xl border border-accent/10 shadow-sm">
          <Diamond size={18} fill="currentColor" />
          <span className="text-[17px] font-bold">{points}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Points</span>
          </div>
          <p className="text-[22px] font-extrabold text-foreground">{points}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Tasks</span>
          </div>
          <p className="text-[22px] font-extrabold text-foreground">{completedToday}</p>
        </div>
      </div>

      {/* Gacha Machine */}
      <section className="relative aspect-square w-full max-w-[320px] mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/20 rounded-full blur-3xl opacity-50" />
        
        <AnimatePresence mode="wait">
          {!reveal ? (
            <motion.div
              key="machine"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: pulling ? [0, -20, 0] : [0, -10, 0],
                rotate: pulling ? [0, 10, -10, 10, -10, 0] : 0
              }}
              transition={{ 
                y: { repeat: Infinity, duration: pulling ? 0.2 : 2, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 0.2, ease: "linear" }
              }}
              className="relative z-10"
            >
              <div className="w-48 h-48 bg-white rounded-[40px] shadow-2xl border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <Gift size={80} className={cn("text-primary transition-all", pulling ? "scale-125 animate-pulse" : "scale-100")} />
              </div>
              
              {pulling && (
                <div className="absolute -inset-4 border-4 border-primary rounded-[48px] animate-ping opacity-20" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative z-20"
            >
              <div className={cn(
                "w-56 p-8 rounded-[40px] shadow-2xl border-4 border-white flex flex-col items-center gap-4 text-center",
                reveal.bg
              )}>
                <div className="text-6xl">{reveal.icon}</div>
                <div className="space-y-1">
                  <h3 className={cn("text-[20px] font-extrabold uppercase tracking-tight", reveal.color)}>
                    {reveal.label}
                  </h3>
                  <p className="text-[15px] font-bold text-muted-foreground">+{reveal.points} Points</p>
                </div>
                <button 
                  onClick={() => setReveal(null)}
                  className="mt-2 px-6 py-2 bg-white rounded-full text-[13px] font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Awesome!
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -inset-12 z-[-1]"
              >
                <Sparkles size={200} className={cn("opacity-20 animate-spin-slow", reveal.color)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Pull Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handlePull}
          disabled={points < 10 || pulling}
          className={cn(
            "w-full max-w-[280px] py-4 rounded-2xl text-[17px] font-extrabold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3",
            pulling ? "bg-muted-foreground" : "bg-primary shadow-primary/30"
          )}
        >
          {pulling ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Pulling...
            </>
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              {t('game.pull')}
            </>
          )}
        </button>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          10 points per pull • Win up to 50 points
        </p>
      </div>

      {/* How to Earn */}
      <section className="bg-white rounded-3xl border border-black/5 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-primary" />
          <h3 className="text-[13px] font-bold uppercase tracking-wider">How to Earn Points</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Complete a Task', points: '+10' },
            { label: 'Daily Login', points: '+5' },
            { label: 'Help in Forum', points: '+15' },
            { label: 'Weekly Goal', points: '+50' }
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
              <span className="text-[13px] font-medium text-muted-foreground">{item.label}</span>
              <span className="text-[13px] font-bold text-primary">{item.points}</span>
            </div>
          ))}
        </div>
      </section>

      <AISection />
    </div>
  );
}
