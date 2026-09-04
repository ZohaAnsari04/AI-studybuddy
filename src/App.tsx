import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage/db';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { UserProfile, Course, StudyDocument, RevisionTask } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentUploader } from './components/course/DocumentUploader';
import { CourseExplorer } from './components/course/CourseExplorer';
import { AIExplainerView } from './components/explain/AIExplainerView';
import { AskNOVAChat } from './components/chat/AskNOVAChat';
import { QuizGeneratorView } from './components/quiz/QuizGeneratorView';
import { RevisionPlannerView } from './components/revision/RevisionPlannerView';
import { AuthModal } from './components/auth/AuthModal';
import { GlassCard } from './components/common/GlassCard';
import { Button } from './components/common/Button';
import { Settings, ShieldCheck, Sparkles } from 'lucide-react';

export function App() {
  // Global view routing
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);

  // Mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => StorageService.isDemoMode());

  // User & course state
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [documents, setDocuments] = useState<StudyDocument[]>(() => StorageService.getDocuments());
  const [revisionTasks, setRevisionTasks] = useState<RevisionTask[]>(() => StorageService.getRevisionTasks());

  // Sync state from storage / Supabase
  const refreshStorageData = () => {
    setIsDemoMode(StorageService.isDemoMode());
    setUser(StorageService.getUser());
    setCourses(StorageService.getCourses());
    setDocuments(StorageService.getDocuments());
    setRevisionTasks(StorageService.getRevisionTasks());
  };

  // Supabase Auth session listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const supabaseUser: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Authenticated User',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`
          };
          StorageService.saveUser(supabaseUser);
          setUser(supabaseUser);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supabaseUser: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Authenticated User',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`
          };
          StorageService.saveUser(supabaseUser);
          setUser(supabaseUser);
          refreshStorageData();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // UI state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNavigate = (tab: string, topicId?: string) => {
    if (topicId) setSelectedTopicId(topicId);
    setActiveTab(tab);
    if (viewMode === 'landing') setViewMode('app');
  };

  const handleLaunchDemoMode = () => {
    StorageService.activateDemoMode();
    refreshStorageData();
    setViewMode('app');
    setActiveTab('dashboard');
  };

  const handleExitDemoMode = () => {
    StorageService.activateRealMode();
    refreshStorageData();
    setViewMode('app');
    setActiveTab('dashboard');
  };

  const handleCourseCreated = (newCourse: Course, newDoc: StudyDocument) => {
    refreshStorageData();
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#f8fafc]">
      {viewMode === 'landing' ? (
        <LandingPage
          onStartStudying={() => handleNavigate('dashboard')}
          onNavigateUpload={() => handleNavigate('upload')}
          onNavigateLogin={() => setIsAuthOpen(true)}
        />
      ) : (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onNavigate={(tab) => handleNavigate(tab)}
            isDemoMode={isDemoMode}
            onExitDemoMode={handleExitDemoMode}
            onLaunchDemoMode={handleLaunchDemoMode}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar
              user={user}
              onNavigate={(tab) => handleNavigate(tab)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            />

            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {activeTab === 'dashboard' && (
                <DashboardView
                  user={user}
                  courses={courses}
                  isDemoMode={isDemoMode}
                  onNavigate={handleNavigate}
                  onLaunchDemo={handleLaunchDemoMode}
                />
              )}

              {activeTab === 'upload' && (
                <DocumentUploader
                  documents={documents}
                  onCourseCreated={handleCourseCreated}
                  onDocumentDeleted={() => refreshStorageData()}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'course' && (
                <CourseExplorer
                  courses={courses}
                  onSelectTopic={(id) => setSelectedTopicId(id)}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'explain' && (
                <AIExplainerView
                  courses={courses}
                  selectedTopicId={selectedTopicId}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'chat' && (
                <AskNOVAChat documents={documents} onNavigate={handleNavigate} />
              )}

              {activeTab === 'quizzes' && (
                <QuizGeneratorView
                  courses={courses}
                  selectedTopicId={selectedTopicId}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'revision' && (
                <RevisionPlannerView
                  tasks={revisionTasks}
                  onUpdateTasks={(t) => setRevisionTasks(t)}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                      <Settings className="w-8 h-8 text-cyan-400" />
                      Settings & Preferences
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage AI provider status and active workspace mode.</p>
                  </div>

                  <GlassCard className="border-cyan-500/30 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      AI Provider Configuration
                    </h3>
                    <p className="text-xs text-slate-300">
                      Current Provider: <strong>IBM Bob Integration Adapter (Local Intelligence Engine)</strong>
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Provider service abstraction connected. Secure client environment.</span>
                    </div>
                  </GlassCard>

                  <GlassCard className="border-amber-500/30 space-y-4">
                    <h3 className="text-base font-bold text-white">Workspace Mode</h3>
                    <p className="text-xs text-slate-300">
                      Currently using: <strong>{isDemoMode ? 'Demo Workspace (Sample Dataset)' : 'Personal Workspace (User Material)'}</strong>
                    </p>

                    <div className="flex gap-3 pt-2">
                      {isDemoMode ? (
                        <Button variant="primary" size="sm" onClick={handleExitDemoMode}>
                          Switch to Personal Workspace
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={handleLaunchDemoMode}>
                          Explore Demo Workspace
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Auth / Demo Mode Launcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onDemoLogin={handleLaunchDemoMode}
      />
    </div>
  );
}

export default App;
