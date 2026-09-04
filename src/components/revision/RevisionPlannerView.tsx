import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { RevisionTask } from '../../types';
import { getAIProvider } from '../../lib/ai/provider';
import { StorageService } from '../../lib/storage/db';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface RevisionPlannerViewProps {
  tasks: RevisionTask[];
  onUpdateTasks: (tasks: RevisionTask[]) => void;
  onNavigate: (tab: string, topicId?: string) => void;
}

export const RevisionPlannerView: React.FC<RevisionPlannerViewProps> = ({
  tasks,
  onUpdateTasks,
  onNavigate
}) => {
  const [examDate, setExamDate] = useState('2026-09-15');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const provider = getAIProvider();
      const newTasks = await provider.generateRevisionPlan(examDate, hoursPerDay, [
        'Binary Search Trees',
        'AVL Tree Balancing'
      ]);
      StorageService.saveRevisionTasks(newTasks);
      onUpdateTasks(newTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskStatus = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status: t.status === 'completed' ? ('pending' as const) : ('completed' as const) } : t
    );
    StorageService.saveRevisionTasks(updated);
    onUpdateTasks(updated);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-400" />
            Personalized Revision Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-scheduled spaced repetition timetable based on your exam date and quiz weak areas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={isGenerating}
          icon={<Sparkles className="w-4 h-4" />}
          onClick={handleGeneratePlan}
        >
          {isGenerating ? 'Planning with NOVA...' : 'Regenerate Revision Plan'}
        </Button>
      </div>

      {/* PLANNER INPUT CONTROLS CARD */}
      <GlassCard className="border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Upcoming Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Daily Study Capacity: <span className="text-cyan-400">{hoursPerDay} Hours/Day</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              icon={<Sliders className="w-4 h-4 text-cyan-400" />}
              onClick={handleGeneratePlan}
            >
              Update AI Schedule
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* SPACED REPETITION ALERTS */}
      <GlassCard className="border-amber-500/40 bg-gradient-to-r from-slate-900 to-amber-950/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Spaced Repetition Trigger
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                RECOMMENDED
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              NOVA recommends reviewing <strong>Binary Search Trees</strong> tomorrow at 6:00 PM to consolidate memory retention.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* REVISION TASK TIMELINE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-cyan-400" />
          Scheduled Study Timetable ({tasks.length} Sessions)
        </h2>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <GlassCard
                key={task.id}
                glowOnHover={false}
                className={`border-slate-800 transition-all ${
                  isDone ? 'opacity-60 bg-slate-950/50' : 'bg-slate-900/80 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-colors mt-1 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-700 hover:border-cyan-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <Badge variant={task.priority}>{task.priority} Priority</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        🗓 {task.date} • ⏱ {task.timeSlot} ({task.durationMinutes} min)
                      </p>
                      {task.reason && (
                        <p className="text-xs text-cyan-400 italic mt-1">"Why: {task.reason}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigate('explain', task.topicId)}
                    >
                      Start Task
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
