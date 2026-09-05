import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './lib/storage/db';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { UserProfile, Course, StudyDocument, RevisionTask } from './types';
import { TopBar } from './components/common/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentUploader } from './components/course/DocumentUploader';
import { CourseExplorer } from './components/course/CourseExplorer';
import { AIExplainerView } from './components/explain/AIExplainerView';
import { AskNOVAChat } from './components/chat/AskNOVAChat';
import { QuizGeneratorView } from './components/quiz/QuizGeneratorView';
import { RevisionPlannerView } from './components/revision/RevisionPlannerView';
import { GlassCard } from './components/common/GlassCard';
import { Hyperspeed, HyperspeedOptions } from './components/common/Hyperspeed';
import { Settings, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

const hyperspeedOptions: HyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 526344,
    islandColor: 657930,
    background: 0,
    shoulderLines: 1250072,
    brokenLines: 1250072,
    leftCars: [14177983, 6770850, 12732332],
    rightCars: [242627, 941733, 3294549],
    sticks: 242627
  }
};

export function App() {
  // Global view routing
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);

  // Authenticated user state
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getUser());

  // User-scoped learning data
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses(user?.id));
  const [documents, setDocuments] = useState<StudyDocument[]>(() => StorageService.getDocuments(user?.id));
  const [revisionTasks, setRevisionTasks] = useState<RevisionTask[]>(() => StorageService.getRevisionTasks(user?.id));

  // Synchronize data for a specific user ID
  const syncUserData = useCallback(async (userId?: string) => {
    const targetId = userId || user?.id;
    if (!targetId) {
      setCourses([]);
      setDocuments([]);
      setRevisionTasks([]);
      return;
    }

    // 1. Fetch from Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbDocs } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', targetId)
          .order('created_at', { ascending: false });

        if (dbDocs && dbDocs.length > 0) {
          const mappedDocs: StudyDocument[] = dbDocs.map((d: Record<string, any>) => ({
            id: d.id,
            name: d.name,
            sizeFormatted: `${((d.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: new Date(d.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            status: d.status || 'ready',
            progressPercent: 100,
            unitsDetected: d.units_detected || 0,
            topicsIdentified: d.topics_identified || 0,
            conceptsExtracted: d.concepts_extracted || 0,
            materialType: d.material_type || 'lecture_notes',
            subject: d.subject || '',
            academicConfidence: d.academic_confidence || 1.0,
            verificationStatus: d.verification_status || 'approved',
            contentHash: d.content_hash,
            chunks: []
          }));
          setDocuments(mappedDocs);
          StorageService.saveDocuments(mappedDocs, targetId);
        }

        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*, course_topics(*)')
          .eq('user_id', targetId)
          .order('created_at', { ascending: false });

        if (dbCourses && dbCourses.length > 0) {
          const mappedCourses: Course[] = dbCourses.map((c: Record<string, any>) => {
            const rawTopics = c.course_topics || [];
            // Group topics by unit number
            const unitsMap: Record<number, any> = {};
            rawTopics.forEach((t: Record<string, any>) => {
              const uNum = t.unit_number || 1;
              if (!unitsMap[uNum]) {
                unitsMap[uNum] = {
                  id: `unit-${c.id}-${uNum}`,
                  unitNumber: uNum,
                  title: t.unit_title || `Unit ${uNum}`,
                  description: `Syllabus section ${uNum}`,
                  topics: []
                };
              }
              unitsMap[uNum].topics.push({
                id: t.id,
                unitId: `unit-${c.id}-${uNum}`,
                unitTitle: t.unit_title || `Unit ${uNum}`,
                title: t.title,
                description: t.description,
                status: t.status || 'not_started',
                difficulty: t.difficulty || 'medium',
                confidenceScore: t.confidence_score || 0,
                technicalExplanation: t.technical_explanation,
                eli10Explanation: t.eli10_explanation,
                analogy: t.analogy,
                example: t.example,
                keyPoints: t.key_points || [],
                commonMistakes: t.common_mistakes || [],
                quickCheck: t.quick_check
              });
            });

            return {
              id: c.id,
              title: c.title,
              code: c.code || 'COURSE',
              description: c.description || '',
              uploadedAt: new Date(c.created_at).toISOString().split('T')[0],
              documentsCount: c.documents_count || 1,
              totalTopics: c.total_topics || rawTopics.length,
              masteredTopics: c.mastered_topics || 0,
              progressPercent: c.progress_percent || 0,
              units: Object.values(unitsMap)
            };
          });
          setCourses(mappedCourses);
          StorageService.saveCourses(mappedCourses, targetId);
        }

        const { data: dbTasks } = await supabase
          .from('revision_tasks')
          .select('*')
          .eq('user_id', targetId)
          .order('task_date', { ascending: true });

        if (dbTasks && dbTasks.length > 0) {
          const mappedTasks: RevisionTask[] = dbTasks.map((t: Record<string, any>) => ({
            id: t.id,
            title: t.title,
            topicId: t.topic_id,
            topicTitle: t.topic_title,
            date: t.task_date,
            timeSlot: t.time_slot,
            durationMinutes: t.duration_minutes || 30,
            type: t.task_type || 'review',
            status: t.status || 'pending',
            priority: t.priority || 'medium',
            reason: t.reason
          }));
          setRevisionTasks(mappedTasks);
          StorageService.saveRevisionTasks(mappedTasks, targetId);
        }
      } catch (err) {
        console.error('Error fetching Supabase data, falling back to local user store:', err);
      }
    }

    // 2. Load from local scoped store
    setCourses(StorageService.getCourses(targetId));
    setDocuments(StorageService.getDocuments(targetId));
    setRevisionTasks(StorageService.getRevisionTasks(targetId));
  }, [user?.id]);

  // Supabase Auth session listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const supabaseUser: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Authenticated Student',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(session.user.id)}`
          };
          StorageService.saveUser(supabaseUser);
          setUser(supabaseUser);
          syncUserData(supabaseUser.id);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supabaseUser: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Authenticated Student',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(session.user.id)}`
          };
          StorageService.saveUser(supabaseUser);
          setUser(supabaseUser);
          syncUserData(supabaseUser.id);
        } else {
          setUser(null);
          setCourses([]);
          setDocuments([]);
          setRevisionTasks([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [syncUserData]);

  const handleNavigate = (tab: string, topicId?: string) => {
    if (topicId) setSelectedTopicId(topicId);
    setActiveTab(tab);
  };

  const handleCourseCreated = (newCourse: Course, _newDoc: StudyDocument) => {
    const firstTopic = newCourse.units[0]?.topics[0]?.id;
    setSelectedTopicId(firstTopic);
    syncUserData(user?.id);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#f8fafc] relative overflow-x-clip">
      {/* Hyperspeed Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-75">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Subtle Dark Vignette / Contrast Overlay for UI Readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />

      <div className="flex flex-col min-h-screen relative z-10">
        <TopBar
          user={user}
          activeTab={activeTab}
          onNavigate={(tab) => handleNavigate(tab)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              courses={courses}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'upload' && (
            <DocumentUploader
              documents={documents}
              onCourseCreated={handleCourseCreated}
              onDocumentDeleted={() => syncUserData(user?.id)}
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
              courses={courses}
              onUpdateTasks={(t) => setRevisionTasks(t)}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Settings className="w-8 h-8 text-cyan-400" />
                  Settings & System Status
                </h1>
                <p className="text-sm text-slate-400 mt-1">Manage AI intelligence configuration and account status.</p>
              </div>

              <GlassCard className="border-cyan-500/30 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Intelligence Engine
                </h3>
                <p className="text-xs text-slate-300">
                  Current Engine: <strong>NOVA Grounded Intelligence Engine (Source-Grounded, Anti-Hallucination)</strong>
                </p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Strict source-grounding active. AI will refuse to speculate outside your uploaded notes.</span>
                </div>
              </GlassCard>

              <GlassCard className="border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Active Student Workspace
                </h3>
                <p className="text-xs text-slate-300">
                  Active Student: <strong>{user ? `${user.name} (${user.email})` : 'Google'}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  All uploaded documents, courses, quizzes, and revision schedules are saved to your local student workspace.
                </p>
              </GlassCard>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
