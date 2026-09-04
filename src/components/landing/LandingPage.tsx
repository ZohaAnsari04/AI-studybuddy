import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileQuestion,
  Calendar,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { NOVAOrb } from '../ai/NOVAOrb';

interface LandingPageProps {
  onStartStudying: () => void;
  onNavigateUpload: () => void;
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartStudying,
  onNavigateUpload,
  onNavigateLogin
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 gradient-bg-hero pointer-events-none" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-nav px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight gradient-text">
            StudySphere AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#nova" className="hover:text-cyan-400 transition-colors">Meet NOVA</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onNavigateLogin}>
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onStartStudying}
          >
            Start Studying
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-8 animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Your AI-Powered Study Companion
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Study smarter.{' '}
          <span className="gradient-text">Understand faster.</span>
        </h1>

        <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Upload your syllabus or notes and let AI explain concepts, generate quizzes, and build your revision plan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={onStartStudying}
          >
            Start Studying
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<UploadCloud className="w-5 h-5 text-cyan-400" />}
            onClick={onNavigateUpload}
          >
            Upload Material
          </Button>
        </div>

        {/* Central Floating AI Core Visualization */}
        <div className="relative max-w-4xl mx-auto mt-4">
          <div className="p-8 lg:p-12 rounded-3xl glass-card border-cyan-500/30 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-transparent to-blue-900/10 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-10">
              <NOVAOrb size="xl" state="THINKING" />

              <h2 className="mt-8 text-2xl font-bold text-white tracking-wide">
                NOVA AI Study Companion Core
              </h2>
              <p className="text-sm text-cyan-400 font-medium mt-1">
                Grounded in Your Uploaded Course Notes & Syllabus
              </p>
            </div>

            {/* Floating Academic Cards around Orb */}
            <div className="hidden lg:block">
              {/* Card 1: Your Notes */}
              <div className="absolute top-10 left-8 p-3.5 rounded-2xl glass-card border-cyan-500/40 animate-float text-left w-52 shadow-xl">
                <div className="flex items-center gap-2 mb-1 text-cyan-400 font-semibold text-xs">
                  <UploadCloud className="w-4 h-4" /> Your Notes
                </div>
                <p className="text-xs font-bold text-white">Course Syllabus PDF</p>
                <p className="text-[10px] text-slate-400">Content extracted & ready</p>
              </div>

              {/* Card 2: AI Explanation */}
              <div className="absolute top-12 right-8 p-3.5 rounded-2xl glass-card border-purple-500/40 animate-float text-left w-56 shadow-xl" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 mb-1 text-purple-400 font-semibold text-xs">
                  <Sparkles className="w-4 h-4" /> AI Explanation
                </div>
                <p className="text-xs font-bold text-white">"Explain Like I'm 10"</p>
                <p className="text-[10px] text-slate-400">Simplified everyday analogies</p>
              </div>

              {/* Card 3: Quiz Ready */}
              <div className="absolute bottom-8 left-12 p-3.5 rounded-2xl glass-card border-amber-500/40 animate-float text-left w-56 shadow-xl" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-2 mb-1 text-amber-400 font-semibold text-xs">
                  <FileQuestion className="w-4 h-4" /> Quiz Ready
                </div>
                <p className="text-xs font-bold text-white">5-Question Test</p>
                <p className="text-[10px] text-slate-400">Dynamic question generation</p>
              </div>

              {/* Card 4: Revision Plan */}
              <div className="absolute bottom-8 right-12 p-3.5 rounded-2xl glass-card border-emerald-500/40 animate-float text-left w-56 shadow-xl" style={{ animationDelay: '2.2s' }}>
                <div className="flex items-center gap-2 mb-1 text-emerald-400 font-semibold text-xs">
                  <Calendar className="w-4 h-4" /> Revision Plan
                </div>
                <p className="text-xs font-bold text-white">Exam Timetable Ready</p>
                <p className="text-[10px] text-slate-400">Daily study schedule</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Cards Section */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Everything You Need to Master Your Syllabus
          </h2>
          <p className="text-slate-400 text-base">
            Five simple, powerful capabilities designed specifically around college and engineering syllabi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="border-cyan-500/30">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Upload Study Material</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag and drop your syllabus or notes (PDF, DOCX, TXT). NOVA extracts topics and builds your study space.
            </p>
          </GlassCard>

          <GlassCard className="border-purple-500/30">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Simplified Explanations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand difficult concepts through multi-level explanations and "Explain Like I'm 10" everyday analogies.
            </p>
          </GlassCard>

          <GlassCard className="border-blue-500/30">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Grounded Doubt Chat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask NOVA any doubt. Answers cite exact document names, sections, and excerpts from your material.
            </p>
          </GlassCard>

          <GlassCard className="border-amber-500/30">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-4">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. Dynamic Practice Quizzes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate custom diagnostic tests directly from your notes and receive instant score evaluations.
            </p>
          </GlassCard>

          <GlassCard className="border-emerald-500/30">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5. Personalized Revision Plan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tell NOVA your exam date and daily study availability to generate a structured revision schedule.
            </p>
          </GlassCard>

          <GlassCard className="border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn static notes into an interactive AI study session in seconds.
              </p>
            </div>
            <Button variant="primary" size="sm" className="mt-4" onClick={onStartStudying}>
              Start Studying Now
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* Meet NOVA Section */}
      <section id="nova" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <BrainCircuit className="w-4 h-4" /> AI Study Assistant
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Meet NOVA — Your Personal AI Study Buddy
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                NOVA is designed specifically for academic material. Grounded strictly in your uploaded course notes, NOVA explains difficult engineering principles, generates target quizzes, and builds revision schedules.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span><strong>Document Grounded:</strong> Answers cite exact document names and section excerpts.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span><strong>Multi-Level Explanations:</strong> Technical precision or ELI10 analogies.</span>
                </div>
              </div>

              <div className="mt-8">
                <Button variant="primary" size="md" onClick={onStartStudying}>
                  Interact with NOVA Now
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center text-center max-w-sm w-full shadow-2xl">
                <NOVAOrb size="xl" state="RESPONDING" />
                <h3 className="text-xl font-bold text-white mt-6">NOVA AI Core</h3>
                <p className="text-xs text-cyan-400 font-semibold mb-4">"Ready to study your notes?"</p>
                <div className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
                  <p className="text-xs text-slate-300">
                    "Upload your syllabus or notes and I will help you understand, practice, and revise!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Footer CTA */}
      <footer className="py-16 px-6 border-t border-slate-800 text-center bg-slate-950/80">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Study smarter. Understand faster.
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
          Turn your syllabus into a personalized AI learning space in seconds.
        </p>
        <Button variant="primary" size="lg" onClick={onStartStudying}>
          Start Studying with StudySphere AI
        </Button>
      </footer>
    </div>
  );
};
