import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronUp,
  UploadCloud
} from 'lucide-react';
import { Course } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface CourseExplorerProps {
  courses: Course[];
  onSelectTopic: (topicId: string) => void;
  onNavigate: (tab: string, topicId?: string) => void;
}

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  courses,
  onSelectTopic,
  onNavigate
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<string>('');

  const activeCourseId = selectedCourseId && courses.some((c) => c.id === selectedCourseId)
    ? selectedCourseId
    : (courses[0]?.id || '');

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  if (!currentCourse || courses.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Course Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse extracted syllabus units, study topics, and AI learning actions.
          </p>
        </div>

        <GlassCard className="border-cyan-500/40 p-12 text-center bg-slate-950/80">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <BookOpen className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">No courses in your study space</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Upload your syllabus or lecture notes in "My Study Material" to dynamically generate your first AI course.
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

  const toggleUnit = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? '' : unitId);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Course selector if multiple courses exist */}
      {courses.length > 1 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs font-bold text-slate-400">Select Active Course:</span>
          <select
            value={currentCourse.id}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.units.length} Units)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Header banner */}
      <GlassCard glowOnHover={false} className="border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {currentCourse.code}
              </span>
              <span className="text-xs text-slate-400">• {currentCourse.documentsCount} Document(s) Parsed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{currentCourse.title}</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              {currentCourse.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => onNavigate('explain')}
            >
              Explain Topic
            </Button>
          </div>
        </div>

        {/* Progress summary bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Course Units</span>
            <span className="text-lg font-bold text-white">{currentCourse.units.length} Units</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Topics</span>
            <span className="text-lg font-bold text-white">{currentCourse.totalTopics} Topics</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Mastered Topics</span>
            <span className="text-lg font-bold text-emerald-400">{currentCourse.masteredTopics} Mastered</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Overall Mastery</span>
            <span className="text-lg font-bold text-cyan-400">{currentCourse.progressPercent}%</span>
          </div>
        </div>
      </GlassCard>

      {/* UNITS AND TOPICS ACCORDION */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Syllabus Units & Extracted Topics
        </h2>

        {currentCourse.units.map((unit) => {
          const isExpanded = expandedUnitId === unit.id || currentCourse.units.length === 1;
          return (
            <GlassCard key={unit.id} glowOnHover={false} className="border-slate-800 p-0 overflow-hidden">
              {/* Unit header */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-extrabold text-sm">
                    U{unit.unitNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{unit.title}</h3>
                    <p className="text-xs text-slate-400">{unit.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">
                    {unit.topics.length} Topics
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <div className="w-5 h-5 text-slate-500 text-center font-bold">↓</div>
                  )}
                </div>
              </div>

              {/* Topics list */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/50 divide-y divide-slate-900">
                  {unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{topic.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                            topic.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : topic.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{topic.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                          onClick={() => {
                            onSelectTopic(topic.id);
                            onNavigate('explain', topic.id);
                          }}
                        >
                          Explain
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSelectTopic(topic.id);
                            onNavigate('quizzes', topic.id);
                          }}
                        >
                          Quiz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default CourseExplorer;
