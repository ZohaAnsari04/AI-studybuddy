import React from 'react';
import {
  Sparkles,
  MessageSquare,
  FileQuestion,
  Calendar,
  UploadCloud
} from 'lucide-react';
import { UserProfile, Course, QuizAttempt } from '../../types';
import { StorageService } from '../../lib/storage/db';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StrokeText } from '../common/StrokeText';
import { GlareHover } from '../common/GlareHover';

interface DashboardViewProps {
  user: UserProfile | null;
  courses: Course[];
  onNavigate: (tab: string, topicId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  courses,
  onNavigate
}) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const hasCourses = courses.length > 0;
  const activeCourse = hasCourses ? courses[0] : null;

  const displayName = user ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="sr-only">{`${greeting}, ${displayName} 👋`}</h1>
          <StrokeText
            text={`${greeting}, ${displayName} 👋`}
            strokeColor="#00f2fe"
            fillColor="#F8FAFC"
            strokeWidth={1.4}
            drawDuration={1.6}
            fillDelay={0.2}
            stagger={0.04}
            ease="power2.out"
            trigger="mount"
            fillMode="wipe"
            fontSize={44}
            fontWeight={800}
            letterSpacing={-1}
            className="w-full max-w-2xl"
          />
          <p className="text-sm text-slate-400 mt-1">
            {hasCourses
              ? 'Your personalized AI study companion.'
              : 'Upload your syllabus or notes to start learning.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => onNavigate('upload')}
          >
            Upload Study Material
          </Button>
        </div>
      </div>

      {/* CURRENT STUDY MATERIAL CARD OR EMPTY UPLOAD CALLOUT */}
      {hasCourses && activeCourse ? (
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/40 backdrop-blur-md relative overflow-hidden p-8 group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Current Study Material
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">{activeCourse.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeCourse.code} • {activeCourse.units.length} Units • {activeCourse.totalTopics} Extracted Topics
              </p>
            </div>
            <Badge variant="cyan">Active Material</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-6 backdrop-blur-sm">
            <p className="text-xs font-semibold text-slate-300">
              Extracted Material: {activeCourse.description}
            </p>
          </div>

          {/* REAL PROGRESS METRICS GRID */}
          {(() => {
            const attempts = StorageService.getQuizAttempts(user?.id);
            const avgScore = attempts.length > 0
              ? Math.round(attempts.reduce((sum: number, a: QuizAttempt) => sum + a.scorePercent, 0) / attempts.length)
              : 0;
            const weakCount = Array.from(new Set(attempts.flatMap((a: QuizAttempt) => a.weakTopicsDetected || []))).length;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Topics Detected</span>
                  <span className="text-xl font-extrabold text-white mt-0.5 block">{activeCourse.totalTopics} Topics</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Quizzes Taken</span>
                  <span className="text-xl font-extrabold text-cyan-400 mt-0.5 block">{attempts.length} Attempt{attempts.length === 1 ? '' : 's'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Average Score</span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{attempts.length > 0 ? `${avgScore}%` : 'Not tested'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Weak Areas</span>
                  <span className={`text-xl font-extrabold mt-0.5 block ${weakCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {weakCount > 0 ? `${weakCount} Topics` : 'None'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* 4 CORE QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => onNavigate('chat')}
            >
              Ask AI
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              onClick={() => onNavigate('explain', activeCourse.units[0]?.topics[0]?.id)}
            >
              Explain Topic
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<FileQuestion className="w-4 h-4 text-amber-400" />}
              onClick={() => onNavigate('quizzes')}
            >
              Generate Quiz
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Calendar className="w-4 h-4 text-emerald-400" />}
              onClick={() => onNavigate('revision')}
            >
              Revision Plan
            </Button>
          </div>
        </GlassCard>
      ) : (
        /* PRISTINE EMPTY STUDY SPACE HERO CARD */
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-cyan-950/50 backdrop-blur-md p-10 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">Your study space is empty</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            You haven't uploaded any study material yet. Upload your first syllabus, lecture notes, or textbooks to start learning.
          </p>

          <Button
            variant="primary"
            size="lg"
            icon={<UploadCloud className="w-5 h-5" />}
            onClick={() => onNavigate('upload')}
          >
            Upload Study Material
          </Button>

          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 text-left max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Syllabus PDF
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Lecture Notes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Textbooks
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Question Papers
            </div>
          </div>
        </GlassCard>
      )}

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlareHover
          onClick={() => onNavigate('chat')}
          glareColor="#3b82f6"
          glareOpacity={0.35}
          glareAngle={-30}
          glareSize={280}
          transitionDuration={700}
          borderColor="rgba(59, 130, 246, 0.3)"
          className="p-6 flex flex-col justify-between cursor-pointer"
        >
          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Ask AI</h4>
              <p className="text-xs text-slate-400">Doubt solver strictly grounded in your notes with page citations.</p>
            </div>
            <span className="text-xs font-semibold text-blue-400 mt-4 flex items-center gap-1">
              Open Chat →
            </span>
          </div>
        </GlareHover>

        <GlareHover
          onClick={() => onNavigate('explain')}
          glareColor="#a855f7"
          glareOpacity={0.35}
          glareAngle={-30}
          glareSize={280}
          transitionDuration={700}
          borderColor="rgba(168, 85, 247, 0.3)"
          className="p-6 flex flex-col justify-between cursor-pointer"
        >
          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Explain Topic</h4>
              <p className="text-xs text-slate-400">Simplified explanations and "Explain Like I'm 10" analogies.</p>
            </div>
            <span className="text-xs font-semibold text-purple-400 mt-4 flex items-center gap-1">
              Explain Concept →
            </span>
          </div>
        </GlareHover>

        <GlareHover
          onClick={() => onNavigate('quizzes')}
          glareColor="#f59e0b"
          glareOpacity={0.35}
          glareAngle={-30}
          glareSize={280}
          transitionDuration={700}
          borderColor="rgba(245, 158, 11, 0.3)"
          className="p-6 flex flex-col justify-between cursor-pointer"
        >
          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Generate Quiz</h4>
              <p className="text-xs text-slate-400">Create multiple-choice practice tests from your material on demand.</p>
            </div>
            <span className="text-xs font-semibold text-amber-400 mt-4 flex items-center gap-1">
              Create Quiz →
            </span>
          </div>
        </GlareHover>

        <GlareHover
          onClick={() => onNavigate('revision')}
          glareColor="#10b981"
          glareOpacity={0.35}
          glareAngle={-30}
          glareSize={280}
          transitionDuration={700}
          borderColor="rgba(16, 185, 129, 0.3)"
          className="p-6 flex flex-col justify-between cursor-pointer"
        >
          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Revision Plan</h4>
              <p className="text-xs text-slate-400">Build an adaptive timetable prioritizing weak quiz topics.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1">
              Build Schedule →
            </span>
          </div>
        </GlareHover>
      </div>
    </div>
  );
};

export default DashboardView;
