import { QuizQuestion, QuizAttempt } from '../../types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StorageService } from '../storage/db';

export class QuizService {
  static evaluateQuizAttempt(
    quizTitle: string,
    courseTitle: string,
    topicId: string,
    topicTitle: string,
    questions: QuizQuestion[],
    userAnswers: Record<number, any>
  ): QuizAttempt {
    let correctCount = 0;

    const evaluatedQuestions = questions.map((q, idx) => {
      const uAns = userAnswers[idx];
      const isCorrect = uAns === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer: uAns,
        isCorrect: isCorrect
      };
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

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
      weakTopicsDetected: scorePercent < 70 ? [topicTitle] : [],
      strongTopicsDetected: scorePercent >= 80 ? [topicTitle] : ['General Principles']
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
          });
        }
      });
    }

    // Save to StorageService
    StorageService.saveQuizAttempt(attempt);

    return attempt;
  }
}
