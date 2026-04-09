import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { CalendarDays, Calendar, MessageCircleQuestion, Gamepad2, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: CalendarDays, label: t('nav.tasks') },
    { path: '/calendar', icon: Calendar, label: t('nav.calendar') },
    { path: '/forum', icon: MessageCircleQuestion, label: t('nav.forum') },
    { path: '/game', icon: Gamepad2, label: t('nav.game') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-white/80 backdrop-blur-lg border-t border-black/5 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) => 
                  cn(
                    "flex flex-col items-center gap-1 transition-all duration-300",
                    isActive ? "text-primary scale-105" : "text-muted-foreground/70"
                  )
                }
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors duration-300",
                  isActive ? "bg-primary/12" : "bg-transparent"
                )}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
