import { QuizQuestion, QuizAttempt, TopicPerformance } from '../../types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StorageService } from '../storage/db';

export const QUIZ_THRESHOLDS = {
  WEAK_MAX: 59,     // < 60% is Weak
  PRACTICE_MIN: 60, // 60% - 79% is Needs Practice
  STRONG_MIN: 80,   // >= 80% is Strong
};

export class QuizService {
  /**
   * Evaluates student quiz attempt and calculates precise topic-level performance
   * identifying Strong (>=80%), Needs Practice (60-79%), and Weak (<60%) topics.
   */
  static evaluateQuizAttempt(
    quizTitle: string,
    courseTitle: string,
    topicId: string,
    topicTitle: string,
    questions: QuizQuestion[],
    userAnswers: Record<number, any>
  ): QuizAttempt {
    let correctCount = 0;

    // Evaluate each question
    const evaluatedQuestions = questions.map((q, idx) => {
      const uAns = userAnswers[idx];
      // Compare answers (numeric index or string value)
      const isCorrect = String(uAns) === String(q.correctAnswer);
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer: uAns,
        isCorrect: isCorrect
      };
    });

    const totalQuestions = questions.length > 0 ? questions.length : 1;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    // Group performance by individual topics
    const topicStats: Record<string, { topicTitle: string; total: number; correct: number }> = {};

    evaluatedQuestions.forEach((q) => {
      const tId = q.topicId || topicId || 'general';
      const tTitle = q.topicTitle || topicTitle || 'General Material';
      if (!topicStats[tId]) {
        topicStats[tId] = { topicTitle: tTitle, total: 0, correct: 0 };
      }
      topicStats[tId].total++;
      if (q.isCorrect) {
        topicStats[tId].correct++;
      }
    });

    const topicPerformances: TopicPerformance[] = Object.entries(topicStats).map(([tId, stat]) => {
      const tScore = Math.round((stat.correct / stat.total) * 100);
      let status: 'strong' | 'needs_practice' | 'weak' = 'needs_practice';
      if (tScore >= QUIZ_THRESHOLDS.STRONG_MIN) {
        status = 'strong';
      } else if (tScore <= QUIZ_THRESHOLDS.WEAK_MAX) {
        status = 'weak';
      }

      return {
        topicId: tId,
        topicTitle: stat.topicTitle,
        totalQuestions: stat.total,
        correctCount: stat.correct,
        scorePercent: tScore,
        status: status
      };
    });

    // Derive explicit weak and strong topic lists
    const weakTopicsDetected = topicPerformances
      .filter((tp) => tp.status === 'weak')
      .map((tp) => tp.topicTitle);

    const strongTopicsDetected = topicPerformances
      .filter((tp) => tp.status === 'strong')
      .map((tp) => tp.topicTitle);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizTitle: quizTitle || `${topicTitle} Practice Quiz`,
      courseTitle: courseTitle || 'Course Practice',
      topicId: topicId,
      topicTitle: topicTitle,
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      scorePercent: scorePercent,
      totalQuestions: questions.length,
      correctCount: correctCount,
      questions: evaluatedQuestions,
      weakTopicsDetected: weakTopicsDetected,
      strongTopicsDetected: strongTopicsDetected,
      topicPerformances: topicPerformances
    };

    // Save to Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client.auth.getUser().then(({ data }) => {
        const userId = data.user?.id;
        if (userId) {
          client.from('quiz_attempts').insert({
            user_id: userId,
            quiz_title: attempt.quizTitle,
            course_title: attempt.courseTitle,
            topic_id: topicId,
            topic_title: topicTitle,
            score_percent: scorePercent,
            total_questions: questions.length,
            correct_count: correctCount,
            questions_json: evaluatedQuestions,
            weak_topics_json: attempt.weakTopicsDetected,
            strong_topics_json: attempt.strongTopicsDetected
          }).then(() => {});
        }
      });
    }

    // Save to StorageService
    StorageService.saveQuizAttempt(attempt);

    return attempt;
  }
}
