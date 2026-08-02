import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface TourStep {
  title: string;
  description: string;
  icon: any;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to EchoMe!',
    description: 'Learn how to protect yourself from phishing attacks with our intelligent analysis tool.',
    icon: Sparkles
  },
  {
    title: 'Quick Analysis',
    description: 'Paste any suspicious email to analyze. Real-time scoring shows threats as you type!',
    icon: Sparkles
  },
  {
    title: 'Advanced Features',
    description: 'Try comparison mode, radar charts, heat maps, and AI assistant for deeper insights.',
    icon: Sparkles
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-1/2 left-3 right-3 -translate-y-1/2 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:left-1/2 sm:right-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2"
          >
            <Card className="border-2 border-primary/20 shadow-glow">
              <CardContent className="p-4 sm:p-6">
                {/* Close Button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 x-close-btn x-close-btn-md"
                  aria-label="Close tour"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-primary flex items-center justify-center"
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-center mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mb-5 sm:mb-6">
                  {step.description}
                </p>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {tourSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        scale: index === currentStep ? 1.2 : 1,
                        opacity: index === currentStep ? 1 : 0.3
                      }}
                      className={`h-2 rounded-full transition-all ${index === currentStep
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground'
                        }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="flex-1 gap-2"
                  >
                    {currentStep < tourSteps.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
