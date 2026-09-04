import React, { useState } from 'react';
import {
  FolderOpen,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Layers,
  UploadCloud
} from 'lucide-react';
import { Course } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

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
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [expandedUnitId, setExpandedUnitId] = useState<string>('');

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
      {/* Header banner */}
      <GlassCard glowOnHover={false} className="border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {currentCourse.code}
              </span>
              <span className="text-xs text-slate-400">• {currentCourse.documentsCount} Documents Parsed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{currentCourse.title}</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              {currentCourse.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<Layers className="w-4 h-4 text-cyan-400" />}
              onClick={() => onNavigate('knowledge')}
            >
              Knowledge Map
            </Button>
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
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Topics list inside unit */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pt-3">
                    Extracted Topics & AI Actions
                  </p>
                  {unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                          <Badge variant={topic.status}>{topic.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs text-slate-400">{topic.description}</p>
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
                          icon={<FileQuestion className="w-3.5 h-3.5 text-amber-400" />}
                          onClick={() => onNavigate('quizzes', topic.id)}
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
