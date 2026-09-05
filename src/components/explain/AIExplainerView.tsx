import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  RotateCcw,
  Play,
  UploadCloud
} from 'lucide-react';
import { Course } from '../../types';
import { getAIProvider, ExplanationResult } from '../../lib/ai/provider';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AIExplainerViewProps {
  courses: Course[];
  selectedTopicId?: string;
  onNavigate: (tab: string, topicId?: string) => void;
}

export const AIExplainerView: React.FC<AIExplainerViewProps> = ({
  courses,
  selectedTopicId,
  onNavigate
}) => {
  const allTopics = courses.flatMap((c) => c.units.flatMap((u) => u.topics));
  const defaultTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0];

  const [selectedTopicOverride, setSelectedTopicOverride] = useState<string | null>(null);
  const [level, setLevel] = useState<'Quick' | 'Beginner' | 'Intermediate' | 'Advanced' | 'ELI10'>('ELI10');
  const [isEli10Toggle, setIsEli10Toggle] = useState(true);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive active topic cleanly during render without cascading effect renders
  const activeTopicId = selectedTopicOverride && allTopics.some((t) => t.id === selectedTopicOverride)
    ? selectedTopicOverride
    : (selectedTopicId && allTopics.some((t) => t.id === selectedTopicId) ? selectedTopicId : allTopics[0]?.id);

  // Quick check state
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const topicToExplain = allTopics.find((t) => t.id === activeTopicId) || defaultTopic;

  const currentLevel = isEli10Toggle ? 'ELI10' : level;

  const handleFetchExplanation = async () => {
    if (!topicToExplain) return;
    setIsLoading(true);
    setUserChoice(null);
    setShowAnswer(false);
    try {
      const provider = getAIProvider();
      const res = await provider.explainConcept(
        topicToExplain.title,
        currentLevel,
        topicToExplain.technicalExplanation,
        topicToExplain
      );
      setExplanation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    if (!topicToExplain) return;

    const topicTitle = topicToExplain.title;
    const topicTech = topicToExplain.technicalExplanation;
    const currentTopic = topicToExplain;

    const timer = setTimeout(() => {
      if (!isCurrent) return;
      setIsLoading(true);
      setUserChoice(null);
      setShowAnswer(false);

      const provider = getAIProvider();
      provider.explainConcept(
        topicTitle,
        currentLevel,
        topicTech,
        currentTopic
      ).then((res) => {
        if (isCurrent) {
          setExplanation(res);
          setIsLoading(false);
        }
      }).catch((err) => {
        if (isCurrent) {
          console.error(err);
          setIsLoading(false);
        }
      });
    }, 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [topicToExplain, currentLevel]);

  if (!defaultTopic || allTopics.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            AI Concept Explainer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simplified explanations powered by NOVA with ELI10 mode.
          </p>
        </div>

        <GlassCard className="border-cyan-500/40 p-12 text-center bg-slate-950/80">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">No study topics available to explain</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Upload your syllabus or course notes to extract topics and unlock AI concept explanations.
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
            <Sparkles className="w-8 h-8 text-cyan-400" />
            AI Concept Explainer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simplified explanations powered by NOVA. Toggle levels or use ELI10 for intuitive analogies.
          </p>
        </div>

        {/* Topic selector */}
        <select
          value={activeTopicId || defaultTopic.id}
          onChange={(e) => setSelectedTopicOverride(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer max-w-xs truncate"
        >
          {allTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.unitTitle} → {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* SIGNATURE ELI10 TOGGLE BAR */}
      <GlassCard glowOnHover={false} className="border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                "Explain Like I'm 10" Mode
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Intuitive Simplification
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Removes technical jargon and replaces it with everyday relatable analogies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Technical</span>
            <button
              onClick={() => setIsEli10Toggle(!isEli10Toggle)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer flex items-center ${
                isEli10Toggle ? 'bg-cyan-500 justify-end shadow-lg shadow-cyan-500/50' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
            <span className="text-xs font-bold text-cyan-300">ELI10 Analogy</span>
          </div>
        </div>

        {/* Level Selector Buttons */}
        {!isEli10Toggle && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold px-1">Explanation Depth:</span>
            {(['Quick', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  level === lvl
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* EXPLANATION CONTENT DISPLAY */}
      {isLoading ? (
        <GlassCard className="border-cyan-500/30 p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-base font-bold text-white">
              NOVA is crafting a {isEli10Toggle ? 'Explain Like I\'m 10' : level} explanation for "{topicToExplain.title}"...
            </p>
          </div>
        </GlassCard>
      ) : explanation ? (
        <div className="space-y-6">
          {/* Concept Summary & Analogy */}
          <GlassCard className="border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Concept Summary • {isEli10Toggle ? 'ELI10 Mode' : level}
              </span>
              <Badge variant="cyan">{topicToExplain.unitTitle}</Badge>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-3">{topicToExplain.title}</h2>
            <p className="text-base text-slate-200 leading-relaxed font-normal mb-5">
              {explanation.summary}
            </p>

            {/* Why It Matters */}
            {explanation.whyItMatters && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 text-xs text-slate-300">
                <span className="font-extrabold text-cyan-400 block mb-1 uppercase tracking-wider text-[11px]">
                  Why It Matters in {topicToExplain.unitTitle || 'this course'}:
                </span>
                {explanation.whyItMatters}
              </div>
            )}

            {/* Analogy Box */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                Real-World Analogy
              </div>
              <p className="text-xs text-cyan-100 italic leading-relaxed">
                "{explanation.analogy}"
              </p>
            </div>

            {explanation.sourceReference && (
              <div className="mt-3 text-[11px] text-slate-400 italic text-right">
                {explanation.sourceReference}
              </div>
            )}
          </GlassCard>

          {/* Example & Key Takeaways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step by step example */}
            <GlassCard className="border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Practical Example
              </h3>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                {explanation.example}
              </div>
            </GlassCard>

            {/* Key Takeaways */}
            <GlassCard className="border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Key Takeaways
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {explanation.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Common Mistakes */}
          <GlassCard className="border-rose-500/30 bg-gradient-to-r from-slate-900 to-rose-950/20">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Common Pitfalls & Misconceptions to Avoid
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              {explanation.commonMistakes.map((mistake, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20">
                  ⚠️ {mistake}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* QUICK CHECK INTERACTIVE QUIZ WIDGET */}
          <GlassCard className="border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Quick Check: Verify Understanding
              </h3>
              <span className="text-xs font-bold text-amber-400">Instant AI Check</span>
            </div>

            <p className="text-sm font-semibold text-slate-200 mb-4">
              {explanation.quickCheck.question}
            </p>

            <div className="space-y-2 mb-4">
              {explanation.quickCheck.options.map((opt, idx) => {
                const isSelected = userChoice === idx;
                const isCorrect = idx === explanation.quickCheck.correctIndex;
                let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/40';

                if (showAnswer) {
                  if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserChoice(idx);
                      setShowAnswer(true);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <p className="font-bold text-cyan-400 mb-1">
                  {userChoice === explanation.quickCheck.correctIndex ? '🎉 Correct!' : '💡 Explanation:'}
                </p>
                <p>{explanation.quickCheck.explanation}</p>
              </div>
            )}
          </GlassCard>

          {/* Action CTAs */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="secondary"
              size="md"
              icon={<RotateCcw className="w-4 h-4 text-cyan-400" />}
              onClick={handleFetchExplanation}
            >
              Regenerate Explanation
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => onNavigate('quizzes', topicToExplain.id)}
            >
              Take Full Topic Quiz
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
