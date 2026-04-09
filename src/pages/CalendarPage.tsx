import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Trash2, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, handleFirestoreError, OperationType, deleteDoc, doc, auth } from '@/firebase';
import { cn } from '@/lib/utils';
import AISection from '@/components/AISection';
import LoginScreen from '@/components/LoginScreen';

export default function CalendarPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading || !auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'calendar_events'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'calendar_events');
    });

    return () => unsubscribe();
  }, [user]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  }, [selectedDate, events]);

  const getDayEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'calendar_events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `calendar_events/${eventId}`);
    }
  };

  if (authLoading || loading) {
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
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          {t('nav.calendar')}
        </h1>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-[15px] font-bold min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-black/5 p-4 shadow-sm">
        <div className="grid grid-cols-7 mb-4">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dayEvents = getDayEvents(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDay = isToday(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all active:scale-95",
                  !isCurrentMonth && "opacity-20",
                  isSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : 
                  isTodayDay ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <span className="text-[13px] font-bold">{format(day, 'd')}</span>
                
                <div className="absolute bottom-1.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        e.type === 'phase' ? (isSelected ? "bg-white" : "bg-primary") :
                        e.type === 'deadline' ? (isSelected ? "bg-white" : "bg-red-500") :
                        (isSelected ? "bg-white" : "bg-emerald-500")
                      )} 
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 px-4">
        {[
          { color: 'bg-primary', label: 'Phase' },
          { color: 'bg-red-500', label: 'Deadline' },
          { color: 'bg-emerald-500', label: 'Manual' }
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", item.color)} />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Selected Day Panel */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Upcoming Events'}
          </h2>
          <button 
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[11px] font-bold hover:bg-primary/20 transition-colors"
          >
            <Plus size={14} />
            {t('common.add')}
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      event.type === 'phase' ? "bg-primary/10 text-primary" :
                      event.type === 'deadline' ? "bg-red-500/10 text-red-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {event.type === 'phase' ? <Clock size={20} /> : <CalendarIcon size={20} />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                          event.type === 'phase' ? "bg-primary/10 text-primary" :
                          event.type === 'deadline' ? "bg-red-500/10 text-red-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {event.type}
                        </span>
                        <h3 className="text-[14px] font-bold text-foreground">{event.title}</h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{event.notes}</p>
                    </div>
                  </div>
                  
                  {(event.type === 'manual' || event.type === 'phase') && (
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center bg-white rounded-3xl border border-black/5 border-dashed">
                <p className="text-[13px] text-muted-foreground font-medium">No events for this day.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AISection />
    </div>
  );
}
