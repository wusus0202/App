import { useState, useEffect } from 'react';
import { Plus, Diamond, Sparkles, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, handleFirestoreError, OperationType, auth } from '@/firebase';
import { cn } from '@/lib/utils';
import AISection from '@/components/AISection';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskSheet from '@/components/tasks/AddTaskSheet';
import CompletionModal from '@/components/tasks/CompletionModal';
import LoginScreen from '@/components/LoginScreen';
import { toast } from 'sonner';

export default function TasksPage() {
  const { t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading || !auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => unsubscribe();
  }, [user]);

  const totalPoints = profile?.points || 0;
  const filteredTasks = tasks.filter(task => {
    if (filter === 'todo') return !task.completed;
    if (filter === 'done') return task.completed;
    return true;
  });

  const todoCount = tasks.filter(t => !t.completed).length;
  const doneCount = tasks.filter(t => t.completed).length;

  const generatePhases = async (task: any, taskId: string) => {
    const toastId = toast.loading('AI is breaking down your task into study phases...');
    const today = new Date().toISOString().split('T')[0];
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `Break down this study task into logical phases for a student calendar:
            Title: ${task.title}
            Description: ${task.description}
            Due Date: ${task.due_date}
            Current Date: ${today}
            
            Return ONLY a JSON object: { "phases": [{ "day_offset": number, "title": "string", "notes": "string" }] }
            day_offset should be how many days before the due date this phase should happen. 
            Example: if due date is Friday and a phase should be on Monday, day_offset is 4.
            
            CRITICAL RULES:
            1. The resulting date (Due Date minus day_offset) MUST NOT be earlier than the Current Date (${today}).
            2. Provide 2-4 logical phases.
            3. If the task is due today or tomorrow, provide fewer, more immediate phases.` }] }
        ],
        config: { responseMimeType: 'application/json' }
      });

      const text = response.text || '{}';
      const result = JSON.parse(text);
      
      // Add the main task as a deadline event
      await addDoc(collection(db, 'calendar_events'), {
        uid: user?.uid,
        taskId: taskId,
        title: `DEADLINE: ${task.title}`,
        notes: task.description || 'Main task deadline',
        date: task.due_date,
        type: 'deadline',
        createdAt: serverTimestamp()
      });
      
      // Create CalendarEvent records for each phase in Firestore
      if (result.phases && Array.isArray(result.phases)) {
        for (const phase of result.phases) {
          const dueDate = new Date(task.due_date);
          const phaseDate = new Date(dueDate);
          phaseDate.setDate(dueDate.getDate() - phase.day_offset);
          
          await addDoc(collection(db, 'calendar_events'), {
            uid: user?.uid,
            taskId: taskId,
            title: phase.title,
            notes: phase.notes,
            date: phaseDate.toISOString().split('T')[0],
            type: 'phase',
            createdAt: serverTimestamp()
          });
        }
      }
      toast.success('AI generated study phases for your calendar!', { id: toastId });
    } catch (error) {
      console.error('Phase Generation Error:', error);
      toast.error('Failed to generate study phases, but task was created.', { id: toastId });
    }
  };

  const handleAddTask = async (data: any) => {
    if (!user) return;
    try {
      const taskData = {
        ...data,
        uid: user.uid,
        completed: false,
        points_earned: 0,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      setShowAddSheet(false);
      
      if (data.due_date) {
        generatePhases(taskData, docRef.id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const handleCompleteTask = async (rating: number, reflection: string) => {
    if (!selectedTask || !user) return;
    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      const points = 10;
      await updateDoc(taskRef, {
        completed: true,
        rating,
        reflection,
        points_earned: points
      });

      // Update user points
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: (profile?.points || 0) + points
      });

      setSelectedTask(null);
      toast.success(`Task completed! +${points} points earned.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${selectedTask.id}`);
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
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-[28px] font-extrabold text-foreground tracking-tight leading-none">
            {t('app.name')}
          </h1>
          <p className="text-[13px] text-muted-foreground font-medium">
            {t('app.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-2xl border border-accent/10">
            <Diamond size={16} fill="currentColor" />
            <span className="text-[15px] font-bold">{totalPoints}</span>
          </div>
          <button 
            onClick={() => setShowAddSheet(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            {t('tasks.add')}
          </button>
        </div>
      </header>

      {/* Today's Focus Widget */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {t('tasks.today')}
          </h2>
          <span className="text-[11px] font-semibold text-primary">
            {todoCount} {t('tasks.todo')}
          </span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          <AnimatePresence mode="popLayout">
            {tasks.filter(t => !t.completed).slice(0, 6).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  "flex-shrink-0 w-[160px] p-4 rounded-3xl text-white shadow-lg shadow-primary/20 cursor-pointer transition-transform active:scale-95",
                  task.priority === 'high' ? "bg-gradient-to-br from-red-400 to-rose-500" :
                  task.priority === 'medium' ? "bg-gradient-to-br from-violet-400 to-purple-500" :
                  "bg-gradient-to-br from-emerald-400 to-teal-500"
                )}
              >
                <div className="h-full flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {task.category}
                    </span>
                    <h3 className="text-[15px] font-bold leading-tight line-clamp-2">
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <Clock size={12} />
                    <span className="text-[11px] font-semibold">Today</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todoCount === 0 && (
            <div className="w-full py-8 text-center bg-white rounded-3xl border border-black/5">
              <p className="text-[13px] text-muted-foreground font-medium">{t('tasks.empty')}</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Quick Bar */}
      <button 
        onClick={() => document.getElementById('ai-section-anchor')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm group active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
            <Sparkles size={18} />
          </div>
          <span className="text-[13px] text-muted-foreground font-medium">
            {t('ai.placeholder')}
          </span>
        </div>
        <div className="p-2 bg-primary/5 text-primary rounded-xl">
          <ChevronRight size={18} />
        </div>
      </button>

      {/* Filter Pills */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'todo', label: `${t('tasks.todo')} (${todoCount})` },
          { id: 'done', label: `${t('tasks.done')} (${doneCount})` }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-bold transition-all",
              filter === btn.id 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-white border border-black/8 text-muted-foreground hover:bg-muted"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onComplete={() => setSelectedTask(task)} 
            />
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-[13px] text-muted-foreground font-medium">No tasks found in this category.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-[88px] right-4 w-[52px] h-[52px] rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* AI Section Anchor */}
      <AISection id="ai-section-anchor" />

      {/* Sheets & Modals */}
      <AddTaskSheet 
        isOpen={showAddSheet} 
        onClose={() => setShowAddSheet(false)} 
        onSubmit={handleAddTask}
      />
      
      <CompletionModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        onComplete={handleCompleteTask}
      />
    </div>
  );
}
