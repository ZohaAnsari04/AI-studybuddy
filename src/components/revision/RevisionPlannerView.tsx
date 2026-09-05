import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  UploadCloud,
  FileQuestion
} from 'lucide-react';
import { RevisionTask } from '../../types';
import { getAIProvider } from '../../lib/ai/provider';
import { StorageService } from '../../lib/storage/db';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface RevisionPlannerViewProps {
  tasks: RevisionTask[];
  courses?: import('../../types').Course[];
  onUpdateTasks: (tasks: RevisionTask[]) => void;
  onNavigate: (tab: string, topicId?: string) => void;
}

export const RevisionPlannerView: React.FC<RevisionPlannerViewProps> = ({
  tasks,
  courses: coursesProp,
  onUpdateTasks,
  onNavigate
}) => {
  const activeCourses = coursesProp && coursesProp.length > 0 ? coursesProp : StorageService.getCourses();
  const allCourseTopics = activeCourses.flatMap((c) => c.units.flatMap((u) => u.topics.map((t) => t.title)));
  const quizAttempts = StorageService.getQuizAttempts();

  // Extract detected weak & strong topics from actual quiz history
  const recordedWeakTopics = Array.from(new Set(quizAttempts.flatMap((a) => a.weakTopicsDetected || [])));
  const recordedStrongTopics = Array.from(new Set(quizAttempts.flatMap((a) => a.strongTopicsDetected || [])));

  const [examDate, setExamDate] = useState('');
  const [durationPreset, setDurationPreset] = useState<'7' | '14' | '30'>('7');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  const hasContent = activeCourses.length > 0 && allCourseTopics.length > 0;

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const provider = getAIProvider();

      // If no explicit exam date is chosen, calculate target date based on duration preset
      let targetExamDate = examDate;
      if (!targetExamDate) {
        const days = parseInt(durationPreset, 10);
        targetExamDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
      }

      const newTasks = await provider.generateRevisionPlan(
        targetExamDate,
        hoursPerDay,
        recordedWeakTopics,
        recordedStrongTopics,
        allCourseTopics
      );

      StorageService.saveRevisionTasks(newTasks);
      onUpdateTasks(newTasks);
    } catch (err) {
      console.error('Revision plan generation error:', err);
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

  if (!hasContent) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-400" />
            Personalized Revision Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Builds spaced repetition schedules strictly based on your uploaded syllabus and quiz diagnostics.
          </p>
        </div>

        <GlassCard className="border-cyan-500/40 p-12 text-center bg-slate-950/80">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <CalendarIcon className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">No study material uploaded yet</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Upload your syllabus or course notes to automatically generate a personalized revision schedule adapted to your exam date.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => onNavigate('upload')}
          >
            Upload Study Material
          </Button>
        </GlassCard>
      </div>
    );
  }

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
            Adaptive spaced repetition timetable based on your uploaded topics, exam timeline, and weak areas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={isGenerating}
          icon={<Sparkles className="w-4 h-4" />}
          onClick={handleGeneratePlan}
        >
          {isGenerating ? 'Planning with NOVA...' : 'Generate Adaptive Revision Plan'}
        </Button>
      </div>

      {/* WEAK TOPICS ADAPTATION NOTICE */}
      {recordedWeakTopics.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">
                {recordedWeakTopics.length} Weak Area{recordedWeakTopics.length > 1 ? 's' : ''} Identified from Quiz Diagnostics
              </span>
              <p className="text-[11px] text-amber-200/90">
                Topics scoring &lt; 60% are given priority scheduling and extended revision sessions (45–60 mins).
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<FileQuestion className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => onNavigate('quizzes')}
          >
            Practice Quizzes
          </Button>
        </div>
      )}

      {/* PLANNER INPUT CONTROLS CARD */}
      <GlassCard className="border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Exam Date or Preset */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Upcoming Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:outline-none focus:border-cyan-400"
            />
            {!examDate && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Or plan duration:</span>
                {(['7', '14', '30'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationPreset(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      durationPreset === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d}-Day
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Capacity Slider */}
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
            <span className="text-[11px] text-slate-500 block mt-1">
              Weak topics receive 45–60 min; maintenance reviews receive 20–30 min.
            </span>
          </div>

          {/* Trigger Button */}
          <div>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              icon={<Sliders className="w-4 h-4 text-cyan-400" />}
              onClick={handleGeneratePlan}
            >
              Update Timetable
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* REVISION TASKS TIMETABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Scheduled Spaced Repetition Sessions ({tasks.length})
          </h2>
          <span className="text-xs text-slate-400">
            {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Completed
          </span>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <GlassCard
                  key={task.id}
                  className={`border-slate-800 p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone ? 'opacity-60 bg-slate-950/40' : 'hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-700 hover:border-cyan-400'
                      }`}
                      aria-label="Toggle task status"
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <Badge variant={task.priority === 'high' ? 'high' : task.priority === 'low' ? 'low' : 'medium'}>
                          {task.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.type.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Date: <strong className="text-slate-300">{task.date}</strong> • Slot: <strong className="text-slate-300">{task.timeSlot}</strong> • Duration: <span className="text-cyan-400 font-bold">{task.durationMinutes} mins</span>
                      </p>

                      {task.reason && (
                        <p className="text-[11px] text-slate-500 italic">
                          {task.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigate('explain', task.topicId)}
                    >
                      Review
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="border-slate-800 p-8 text-center bg-slate-950/60">
            <h4 className="text-base font-bold text-white mb-1">No revision plan generated yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Click "Generate Adaptive Revision Plan" to create your personalized spaced repetition timetable.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleGeneratePlan}
            >
              Generate Revision Plan
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
