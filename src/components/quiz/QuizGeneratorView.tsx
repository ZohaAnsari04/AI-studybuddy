import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, Trophy, Loader2 } from 'lucide-react';
import { Course, QuizQuestion, QuizAttempt } from '../../types';
import { getAIService } from '../../lib/ai/aiService';
import { QuizService } from '../../lib/services/quizService';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface QuizGeneratorViewProps {
  courses: Course[];
  selectedTopicId?: string;
  onNavigate: (tab: string) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  courses,
  selectedTopicId
}) => {
  const allTopics = courses.flatMap((c) => c.units.flatMap((u) => u.topics));

  const [selectedCourseId] = useState<string>(courses[0]?.id || '');
  const [topicId, setTopicId] = useState<string>(selectedTopicId || allTopics[0]?.id || '');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const currentTopic = allTopics.find((t) => t.id === topicId) || allTopics[0];

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setAttemptResult(null);
    setUserAnswers({});

    try {
      const aiService = getAIService();
      const title = currentTopic?.title || 'Course Principles';
      const questions = await aiService.generateQuiz(title, difficulty, questionCount);
      setActiveQuiz(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (attemptResult) return; // Prevent changing after submission
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const evaluatedAttempt = QuizService.evaluateQuizAttempt(
      `${currentTopic?.title || 'Practice'} Quiz`,
      currentCourse?.title || 'Course Practice',
      topicId,
      currentTopic?.title || 'Practice Topic',
      activeQuiz,
      userAnswers
    );
    setAttemptResult(evaluatedAttempt);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          AI Practice Quiz Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate conceptual practice quizzes from your uploaded course topics with instant server evaluation.
        </p>
      </div>

      {/* QUIZ CONFIGURATION FORM */}
      {!activeQuiz && !isGenerating && (
        <GlassCard className="border-cyan-500/30 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Configure Practice Quiz
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Select Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                {allTopics.length > 0 ? (
                  allTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.difficulty})
                    </option>
                  ))
                ) : (
                  <option value="default">Uploaded Course Principles</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      difficulty === lvl
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">Number of Questions: {questionCount}</label>
            <input
              type="range"
              min={3}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={<Sparkles className="w-5 h-5" />}
            onClick={handleGenerateQuiz}
          >
            Generate Quiz with AI
          </Button>
        </GlassCard>
      )}

      {/* GENERATING SPINNER STATE */}
      {isGenerating && (
        <GlassCard className="border-cyan-500/40 p-10 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Generating Quiz Questions...</h3>
          <p className="text-xs text-slate-400">
            NOVA is reading your topic materials and structuring conceptual practice questions...
          </p>
        </GlassCard>
      )}

      {/* ACTIVE QUIZ PLAYBACK */}
      {activeQuiz && (
        <div className="space-y-6">
          {attemptResult && (
            <GlassCard className={`p-6 border-2 ${attemptResult.scorePercent >= 70 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/50 bg-amber-950/20'} space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className={`w-8 h-8 ${attemptResult.scorePercent >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Quiz Evaluation Completed</h3>
                    <p className="text-xs text-slate-300">
                      Score: {attemptResult.scorePercent}% ({attemptResult.correctCount}/{attemptResult.totalQuestions} Correct)
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveQuiz(null);
                    setAttemptResult(null);
                  }}
                >
                  Take Another Quiz
                </Button>
              </div>
            </GlassCard>
          )}

          {activeQuiz.map((q, qIndex) => {
            const isSelected = (optIdx: number) => userAnswers[qIndex] === optIdx;
            const isSubmitted = Boolean(attemptResult);
            const optionsList = q.options || [];

            return (
              <GlassCard key={q.id} className="border-slate-800 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Question {qIndex + 1}
                  </span>
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
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
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

                {isSubmitted && q.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400 block mb-0.5">Explanation:</strong>
                    {q.explanation}
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
              Submit Quiz & View Results
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
