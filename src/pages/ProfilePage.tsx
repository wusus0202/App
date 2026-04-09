import { useState, useEffect } from 'react';
import { User, LogOut, Settings, Globe, ChevronRight, Trophy, Target, Award, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, UI_LANGUAGES } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { auth, signOut } from '@/firebase';
import { cn } from '@/lib/utils';
import AISection from '@/components/AISection';
import PortfolioSection from '@/components/profile/PortfolioSection';
import CollegePlanningSection from '@/components/profile/CollegePlanningSection';
import LoginScreen from '@/components/LoginScreen';

export default function ProfilePage() {
  const { t, lang, setLanguage } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
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

  const initials = user.displayName ? user.displayName.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          {t('profile.title')}
        </h1>
        <button className="p-2 bg-white rounded-xl border border-black/5 shadow-sm text-muted-foreground hover:text-primary transition-colors">
          <Settings size={20} />
        </button>
      </header>

      {/* User Info */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="w-24 h-24 rounded-[32px] shadow-xl shadow-primary/20 border-4 border-white object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-400 rounded-[32px] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-primary/20">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border border-black/5 shadow-md flex items-center justify-center text-primary">
            <Award size={18} fill="currentColor" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-[22px] font-extrabold text-foreground">{user.displayName}</h2>
          <p className="text-[13px] text-muted-foreground font-medium">{user.email}</p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Tasks', value: profile?.total_tasks_completed || 0, color: 'text-blue-500' },
          { icon: Target, label: 'Rate', value: `${profile?.completion_rate || 0}%`, color: 'text-emerald-500' },
          { icon: Trophy, label: 'Points', value: profile?.points || 0, color: 'text-amber-500' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-3xl border border-black/5 shadow-sm text-center space-y-1">
            <div className={cn("w-8 h-8 rounded-xl bg-muted flex items-center justify-center mx-auto", stat.color)}>
              <stat.icon size={16} />
            </div>
            <p className="text-[15px] font-extrabold text-foreground">{stat.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Language Switcher */}
      <section className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <button 
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Globe size={18} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold">UI Language</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {UI_LANGUAGES.find(l => l.code === lang)?.label}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={cn("text-muted-foreground transition-transform", showLangPicker && "rotate-90")} />
        </button>
        
        <AnimatePresence>
          {showLangPicker && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-black/5"
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                {UI_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setShowLangPicker(false);
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                      lang === l.code 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* College Planning Section */}
      <CollegePlanningSection />

      {/* Menu Items */}
      <section className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        {[
          { label: 'Study History', icon: BookOpen },
          { label: 'Goal Analysis', icon: Target },
          { label: 'Achievements', icon: Award }
        ].map((item, i) => (
          <button 
            key={item.label}
            className={cn(
              "w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors",
              i !== 2 && "border-b border-black/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <item.icon size={18} />
              </div>
              <p className="text-[13px] font-bold">{item.label}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </section>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-5 bg-destructive/10 text-destructive rounded-3xl font-bold text-[15px] hover:bg-destructive/20 transition-colors active:scale-95"
      >
        <LogOut size={20} />
        {t('profile.logout')}
      </button>

      <AISection />
    </div>
  );
}
