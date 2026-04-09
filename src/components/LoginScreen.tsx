import { motion } from 'framer-motion';
import { LogIn, Sparkles, Diamond, UserCircle } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../firebase';
import { useLanguage } from '../lib/i18n';

export default function LoginScreen() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-8 bg-background">
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/40"
        >
          <Sparkles size={48} className="text-white" />
        </motion.div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
          <Diamond size={16} fill="currentColor" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {t('app.name')}
        </h1>
        <p className="text-muted-foreground font-medium max-w-[240px] mx-auto leading-relaxed">
          {t('app.subtitle')}
        </p>
      </div>

      <div className="w-full space-y-4 pt-8">
        {/* Google 登入按鈕 */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-black/10 rounded-2xl font-bold text-[15px] shadow-sm active:scale-95 transition-all hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        {/* 訪客登入按鈕 */}
        <button
          onClick={signInAsGuest}
          className="w-full flex items-center justify-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl font-bold text-[15px] text-primary active:scale-95 transition-all hover:bg-primary/20"
        >
          <UserCircle size={20} />
          Continue as Guest
        </button>
        
        <p className="text-[11px] text-muted-foreground px-8 leading-relaxed">
          By continuing, you agree to our Study Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
