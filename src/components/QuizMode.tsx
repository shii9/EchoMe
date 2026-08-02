import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, BookOpen, Zap, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { quizData, type QuizItem } from '@/data/quizData';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface QuizModeProps {
  onClose: () => void;
  onAchievement?: (achievement: any) => void;
}

export const QuizMode = ({ onClose, onAchievement }: QuizModeProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizItems, setQuizItems] = useState<QuizItem[]>(() =>
    [...quizData].sort(() => Math.random() - 0.5)
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  const [allAnswers, setAllAnswers] = useState<
    { question: QuizItem; selectedAnswer: string }[]
  >([]);

  const currentItem = quizItems[currentQuestion];

  const handleAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);
    setAllAnswers((prev) => [
      ...prev,
      { question: currentItem, selectedAnswer: option },
    ]);

    if (option === currentItem.correct) {
      setScore((prev) => prev + 1);
      toast.success('Correct answer!', {
        duration: 1500,
      });
    } else {
      setIncorrectAnswers((prev) => [...prev, currentQuestion]);
      toast.error('Incorrect answer.', {
        duration: 1500,
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizItems.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      resetAnswerState();
    } else {
      handleQuizComplete();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      // Restore previous answer state
      const prevAnswer = allAnswers.find(
        (a) => a.question.id === quizItems[currentQuestion - 1].id
      );
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selectedAnswer);
        setIsAnswered(true);
      } else {
        resetAnswerState();
      }
    }
  };

  const resetAnswerState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleQuizComplete = () => {
    setIsComplete(true);
    if (score === quizItems.length) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#d946ef', '#0ea5e9'],
      });

      if (onAchievement) {
        onAchievement({
          id: 'quiz-master',
          title: 'Quiz Master',
          description: 'Perfect score on the phishing quiz!',
          icon: '🏆',
        });
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setIsComplete(false);
    resetAnswerState();
    setIncorrectAnswers([]);
    setAllAnswers([]);
    setQuizItems([...quizData].sort(() => Math.random() - 0.5));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-y-auto no-scrollbar"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-4"
      >
        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
              <h2 className="text-2xl font-bold">Phishing Quiz</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1}/{quizItems.length} • Score: {score}
              </div>
              <button
                onClick={onClose}
                className="x-close-btn x-close-btn-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isComplete ? (
            <>
              <Card className="p-6 bg-secondary/30 mb-4 min-h-[250px] max-h-96 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded capitalize">
                    {currentItem.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentItem.title}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {currentItem.content}
                </p>
              </Card>

              <p className="text-lg font-semibold mb-4">
                Is this {currentItem.type} safe, suspicious, or phishing?
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['safe', 'suspicious', 'phishing'] as const).map((option) => (
                  <Button
                    key={option}
                    onClick={() => !isAnswered && handleAnswer(option)}
                    disabled={isAnswered}
                    variant={
                      isAnswered && selectedOption === option
                        ? option === currentItem.correct
                          ? 'default'
                          : 'destructive'
                        : 'outline'
                    }
                    className={`capitalize ${isAnswered && option === currentItem.correct
                      ? 'bg-green-600 hover:bg-green-600 text-white border-green-600'
                      : ''
                      }`}
                  >
                    {isAnswered && option === currentItem.correct && (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {isAnswered &&
                      selectedOption === option &&
                      option !== currentItem.correct && (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                    {option}
                  </Button>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextQuestion} className="flex-1">
                  {currentQuestion < quizItems.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'See Results'
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card
                      className={`p-4 mb-4 ${selectedOption === currentItem.correct
                        ? 'bg-green-500/10 border-green-500'
                        : 'bg-red-500/10 border-red-500'
                        }`}
                    >
                      <p className="font-semibold mb-1">
                        {selectedOption === currentItem.correct
                          ? '✅ Correct!'
                          : '❌ Incorrect'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This is a{' '}
                        <span className="font-semibold capitalize">
                          {currentItem.correct}
                        </span>{' '}
                        {currentItem.type}.
                      </p>
                      {currentItem.explanation && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {currentItem.explanation}
                        </p>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {score === quizItems.length
                    ? '🏆'
                    : score >= quizItems.length * 0.75
                      ? '🌟'
                      : score >= quizItems.length * 0.5
                        ? '👍'
                        : '📚'}
                </div>
                <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                <p className="text-xl mb-4">
                  You scored {score} out of {quizItems.length}
                </p>
                <p className="text-muted-foreground mb-6">
                  {score === quizItems.length
                    ? 'Perfect! You are a phishing detection master! 🎓'
                    : score >= quizItems.length * 0.75
                      ? 'Excellent! You have great phishing detection skills!'
                      : score >= quizItems.length * 0.5
                        ? 'Good job! Keep practicing to improve.'
                        : 'Keep learning! Review the tips to get better.'}
                </p>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <h4 className="text-lg font-semibold text-center mb-4">
                  Question Details
                </h4>
                {quizItems.map((item, index) => {
                  const userAnswer = allAnswers.find(
                    (a) => a.question.id === item.id
                  )?.selectedAnswer;
                  const isCorrect = userAnswer === item.correct;

                  return (
                    <Card
                      key={item.id}
                      className={`p-4 ${isCorrect
                        ? 'bg-green-500/10 border-green-500'
                        : 'bg-red-500/10 border-red-500'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                            }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded capitalize">
                              {item.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.title}
                            </span>
                          </div>

                          <div className="text-sm mb-2 p-2 bg-secondary/30 rounded whitespace-pre-wrap">
                            {item.content}
                          </div>

                          <div className="text-sm space-y-1">
                            <p
                              className={`font-semibold ${isCorrect ? 'text-green-500' : 'text-red-500'
                                }`}
                            >
                              <strong>Your answer:</strong>{' '}
                              {userAnswer || 'Not answered'}
                            </p>
                            <p
                              className={`font-semibold ${isCorrect ? 'text-green-500' : 'text-primary'
                                }`}
                            >
                              <strong>Correct answer:</strong> {item.correct}
                            </p>
                            <p className="text-muted-foreground italic">
                              <strong>Explanation:</strong> {item.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={restartQuiz}
                  variant="outline"
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Close Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};
