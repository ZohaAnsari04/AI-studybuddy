import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  Calendar,
  UploadCloud,
  RotateCcw
} from 'lucide-react';
import { Course, QuizQuestion, QuizAttempt, QuizConfig } from '../../types';
import { getAIService } from '../../lib/ai/aiService';
import { QuizService } from '../../lib/services/quizService';
import { StorageService } from '../../lib/storage/db';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface QuizGeneratorViewProps {
  courses: Course[];
  selectedTopicId?: string;
  onNavigate: (tab: string, topicId?: string) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  courses,
  selectedTopicId,
  onNavigate
}) => {
  const allTopics = courses.flatMap((c) => c.units.flatMap((u) => u.topics));
  const hasContent = courses.length > 0 && allTopics.length > 0;

  // Configuration options matching requirements
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'short_answer' | 'mixed'>('multiple_choice');
  const [userTopicScope, setUserTopicScope] = useState<string | null>(null);
  const topicScope = userTopicScope !== null && (userTopicScope === 'entire_material' || allTopics.some((t) => t.id === userTopicScope))
    ? userTopicScope
    : (selectedTopicId && allTopics.some((t) => t.id === selectedTopicId) ? selectedTopicId : 'entire_material');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  const selectedTopic = allTopics.find((t) => t.id === topicScope);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setAttemptResult(null);
    setUserAnswers({});

    try {
      const aiService = getAIService();
      const approvedDocs = StorageService.getApprovedDocuments();

      const config: QuizConfig = {
        questionCount,
        difficulty,
        questionType,
        topicScope
      };

      const questions = await aiService.generateQuiz(
        config,
        difficulty,
        questionCount,
        approvedDocs,
        allTopics
      );

      setActiveQuiz(questions);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const courseTitle = courses[0]?.title || 'Course Material';
    const topicTitle = selectedTopic?.title || 'Entire Course Material';

    const evaluatedAttempt = QuizService.evaluateQuizAttempt(
      `${topicTitle} Quiz`,
      courseTitle,
      topicScope,
      topicTitle,
      activeQuiz,
      userAnswers
    );
    setAttemptResult(evaluatedAttempt);
  };

  if (!hasContent) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-cyan-400" />
            AI Practice Quiz Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Practice quizzes are generated strictly on-demand from your approved uploaded study material.
          </p>
        </div>

        <GlassCard className="border-cyan-500/40 p-12 text-center bg-slate-950/80">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <HelpCircle className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">No study material uploaded yet</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Upload your syllabus or lecture notes to generate source-grounded practice tests with automatic weak topic diagnostics.
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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          AI Practice Quiz Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quizzes are generated strictly on request from your uploaded material. No outside knowledge is tested.
        </p>
      </div>

      {/* QUIZ CONFIGURATION FORM */}
      {!activeQuiz && !isGenerating && (
        <GlassCard className="border-cyan-500/30 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Configure Practice Quiz
            </h3>
            <span className="text-xs text-slate-400">Strictly Source-Grounded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Scope */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Study Material Scope
              </label>
              <select
                value={topicScope}
                onChange={(e) => setUserTopicScope(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="entire_material">Entire Course Material (All Topics)</option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      difficulty === lvl
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Question Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'multiple_choice', label: 'MCQ' },
                  { key: 'short_answer', label: 'Short' },
                  { key: 'mixed', label: 'Mixed' }
                ].map((qt) => (
                  <button
                    key={qt.key}
                    type="button"
                    onClick={() => setQuestionType(qt.key as any)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      questionType === qt.key
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={handleGenerateQuiz}
            >
              Generate Quiz with AI ({questionCount} Questions)
            </Button>
          </div>
        </GlassCard>
      )}

      {/* GENERATING SPINNER */}
      {isGenerating && (
        <GlassCard className="border-cyan-500/40 p-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Generating Quiz Questions...</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            NOVA is reading your uploaded study notes, extracting concept problems, and verifying supported answers...
          </p>
        </GlassCard>
      )}

      {/* ACTIVE QUIZ VIEW */}
      {activeQuiz && (
        <div className="space-y-6">
          {/* COMPREHENSIVE PERFORMANCE RESULTS SUMMARY */}
          {attemptResult && (
            <GlassCard className="p-8 border-2 border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Performance Evaluated
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">
                      Score: {attemptResult.correctCount} / {attemptResult.totalQuestions} ({attemptResult.scorePercent}%)
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Correct: <strong className="text-emerald-400">{attemptResult.correctCount}</strong> • Incorrect: <strong className="text-rose-400">{attemptResult.totalQuestions - attemptResult.correctCount}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setActiveQuiz(null);
                      setAttemptResult(null);
                    }}
                  >
                    Take Another Quiz
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => onNavigate('revision')}
                  >
                    Adapt Revision Plan
                  </Button>
                </div>
              </div>

              {/* TOPIC LEVEL PERFORMANCE BREAKDOWN */}
              {attemptResult.topicPerformances && attemptResult.topicPerformances.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Topic Performance Breakdown
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {attemptResult.topicPerformances.map((tp) => (
                      <div
                        key={tp.topicId}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{tp.topicTitle}</span>
                          <div className="w-36 sm:w-56 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tp.status === 'strong'
                                  ? 'bg-emerald-400'
                                  : tp.status === 'weak'
                                  ? 'bg-rose-400'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${tp.scorePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs font-extrabold text-white">
                            {tp.scorePercent}% ({tp.correctCount}/{tp.totalQuestions})
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              tp.status === 'strong'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : tp.status === 'weak'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {tp.status === 'strong' ? 'Strong' : tp.status === 'weak' ? 'Weak' : 'Needs Practice'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STRONG VS WEAK TOPICS SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Strong Topics (≥ 80%)
                  </span>
                  {attemptResult.strongTopicsDetected.length > 0 ? (
                    <ul className="text-xs text-emerald-200/90 space-y-1">
                      {attemptResult.strongTopicsDetected.map((st, i) => (
                        <li key={i}>✓ {st}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">Keep practicing to achieve strong mastery.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Needs Revision (&lt; 60%)
                  </span>
                  {attemptResult.weakTopicsDetected.length > 0 ? (
                    <ul className="text-xs text-rose-200/90 space-y-1">
                      {attemptResult.weakTopicsDetected.map((wt, i) => (
                        <li key={i}>⚠ {wt}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-400 font-semibold">No critical weak topics detected in this quiz!</p>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* QUESTIONS LIST */}
          {activeQuiz.map((q, qIndex) => {
            const isSelected = (optIdx: number) => userAnswers[qIndex] === optIdx;
            const isSubmitted = Boolean(attemptResult);
            const optionsList = q.options || [];

            return (
              <GlassCard key={q.id} className="border-slate-800 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Question {qIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400">{q.topicTitle}</span>
                  </div>
                  {isSubmitted && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded ${
                        userAnswers[qIndex] === q.correctAnswer
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {userAnswers[qIndex] === q.correctAnswer ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white">{q.text}</h4>

                <div className="space-y-2">
                  {optionsList.map((opt, optIdx) => {
                    const selected = isSelected(optIdx);
                    const isCorrectOpt = isSubmitted && optIdx === q.correctAnswer;
                    const isWrongSelected = isSubmitted && selected && optIdx !== q.correctAnswer;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(qIndex, optIdx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isCorrectOpt
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : isWrongSelected
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : selected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isWrongSelected && <XCircle className="w-4 h-4 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div>
                      <strong className="text-cyan-400">Explanation: </strong>
                      {q.explanation}
                    </div>
                    {q.sourceReference && (
                      <div className="text-[11px] text-slate-500 pt-1 italic">
                        Source Reference: {q.sourceReference}
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}

          {!attemptResult && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={Object.keys(userAnswers).length < activeQuiz.length}
              onClick={handleSubmitQuiz}
            >
              Submit Quiz & Evaluate Performance
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
