import React from 'react';
import {
  Sparkles,
  MessageSquare,
  FileQuestion,
  Calendar,
  UploadCloud,
  Play
} from 'lucide-react';
import { UserProfile, Course } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  user: UserProfile;
  courses: Course[];
  isDemoMode: boolean;
  onNavigate: (tab: string, topicId?: string) => void;
  onLaunchDemo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  courses,
  isDemoMode,
  onNavigate,
  onLaunchDemo
}) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const hasCourses = courses.length > 0;
  const activeCourse = hasCourses ? courses[0] : null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* DEMO MODE PROMINENT HEADER BANNER */}
      {isDemoMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-amber-300">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase text-xs tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-white">
              DEMO WORKSPACE ACTIVE
            </span>
            <span className="text-xs text-amber-200 hidden sm:inline">
              Pre-loaded sample dataset for hackathon evaluation.
            </span>
          </div>
          <span className="text-xs font-bold text-amber-400">Sample Data</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {hasCourses ? `${greeting}, ` : 'Welcome to StudySphere AI, '}
            <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {hasCourses
              ? 'Your personalized AI study companion.'
              : 'Upload your syllabus or notes to get started.'}
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
          {!isDemoMode && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
              onClick={onLaunchDemo}
            >
              Try Demo
            </Button>
          )}
        </div>
      </div>

      {/* CURRENT STUDY MATERIAL CARD OR EMPTY UPLOAD CALLOUT */}
      {hasCourses && activeCourse ? (
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 relative overflow-hidden p-8">
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

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
            <p className="text-xs font-semibold text-slate-300">
              Extracted Material: {activeCourse.description}
            </p>
          </div>

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
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">Your study space is empty</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Upload your syllabus, lecture notes, or textbooks to get started with AI explanations, doubt solving, practice quizzes, and revision planning.
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
              <span className="text-cyan-400 font-bold">✓</span> Study Guides
            </div>
          </div>
        </GlassCard>
      )}

      {/* QUICK ACTIONS GRID FOR EMPTY OR ACTIVE STATE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard onClick={() => onNavigate('chat')} className="border-blue-500/30 flex flex-col justify-between cursor-pointer">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Ask AI</h4>
            <p className="text-xs text-slate-400">Doubt solver grounded in your notes with page citations.</p>
          </div>
          <span className="text-xs font-semibold text-blue-400 mt-4 flex items-center gap-1">
            Open Chat →
          </span>
        </GlassCard>

        <GlassCard onClick={() => onNavigate('explain')} className="border-purple-500/30 flex flex-col justify-between cursor-pointer">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Explain Topic</h4>
            <p className="text-xs text-slate-400">Simplified explanations and "Explain Like I'm 10" analogies.</p>
          </div>
          <span className="text-xs font-semibold text-purple-400 mt-4 flex items-center gap-1">
            Explain Concept →
          </span>
        </GlassCard>

        <GlassCard onClick={() => onNavigate('quizzes')} className="border-amber-500/30 flex flex-col justify-between cursor-pointer">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Generate Quiz</h4>
            <p className="text-xs text-slate-400">Create multiple-choice practice tests from your material.</p>
          </div>
          <span className="text-xs font-semibold text-amber-400 mt-4 flex items-center gap-1">
            Create Quiz →
          </span>
        </GlassCard>

        <GlassCard onClick={() => onNavigate('revision')} className="border-emerald-500/30 flex flex-col justify-between cursor-pointer">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Revision Plan</h4>
            <p className="text-xs text-slate-400">Build a daily exam schedule tailored to your study hours.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1">
            Build Schedule →
          </span>
        </GlassCard>
      </div>
    </div>
  );
};
