import React, { useState, useCallback, useMemo } from 'react';
import { AppStep, UserAnswers, UserResult, GiftScore, Question } from './types';
import { ALL_QUESTIONS, GIFTS_DEFINITIONS, QUESTIONS_PER_PAGE } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionnaireForm from './components/QuestionnaireForm';
import ResultsDisplay from './components/ResultsDisplay';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Welcome); // Start at Welcome
  const [userName, setUserName] = useState<string>('');
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [results, setResults] = useState<UserResult | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0); 

  const totalPages = useMemo(() => Math.ceil(ALL_QUESTIONS.length / QUESTIONS_PER_PAGE), []);

  const currentQuestions = useMemo((): Question[] => {
    const start = currentPageIndex * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return ALL_QUESTIONS.slice(start, end);
  }, [currentPageIndex]);

  const handleNameChange = useCallback((name: string) => {
    setUserName(name);
  }, []);

  const handleAnswerChange = useCallback((questionId: number, value: number) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  }, []);

  const allQuestionsAnsweredGlobally = useMemo(() => {
    return ALL_QUESTIONS.length === Object.keys(answers).length;
  }, [answers]);

  const areCurrentPageQuestionsAnswered = useMemo(() => {
    if (currentStep !== AppStep.Form) return false; // Only relevant for form step
    return currentQuestions.every(q => answers[q.id] !== undefined);
  }, [currentQuestions, answers, currentStep]);
  
  // This is for enabling Next/Submit buttons within QuestionnaireForm
  const canProceedOnCurrentPage = useMemo(() => {
      return areCurrentPageQuestionsAnswered;
  }, [areCurrentPageQuestionsAnswered]);

  const handleStartQuest = useCallback(() => {
    if (userName.trim() === '') {
      alert('Por favor, ingrese su nombre para comenzar.');
      return;
    }
    setCurrentStep(AppStep.Form);
    setCurrentPageIndex(0); // Ensure questionnaire starts from the first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [userName]);

  const calculateScores = useCallback((): GiftScore[] => {
    return GIFTS_DEFINITIONS.map(giftDef => {
      const score = giftDef.questions.reduce((sum, qId) => {
        return sum + (answers[qId] || 0);
      }, 0);
      return { gift: giftDef, score };
    });
  }, [answers]);

  const handleNextPage = useCallback(() => {
    if (canProceedOnCurrentPage) {
      if (currentPageIndex < totalPages - 1) {
        setCurrentPageIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
       alert('Por favor, responda todas las preguntas de esta página para continuar.');
    }
  }, [canProceedOnCurrentPage, currentPageIndex, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPageIndex]);

  const handleSubmit = useCallback(() => {
    if (!allQuestionsAnsweredGlobally) {
      // This is a fallback, main validation is per-page.
      alert('Parece que faltan respuestas en algunas páginas. Por favor, revise.');
      // Optionally, find the first unanswered page and navigate there.
      // For now, simple alert.
      return;
    }
     if (!canProceedOnCurrentPage) { // Ensures last page is complete
      alert('Por favor, responda todas las preguntas de esta página para ver sus dones.');
      return;
    }

    setCurrentStep(AppStep.Calculating);

    setTimeout(() => {
      const allScores = calculateScores();
      const sortedScores = [...allScores].sort((a, b) => b.score - a.score);
      const topGifts = sortedScores.slice(0, 3);

      setResults({
        name: userName, // userName is already set from WelcomeScreen
        topGifts: topGifts,
        allScores: allScores 
      });
      setCurrentStep(AppStep.Results);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  }, [allQuestionsAnsweredGlobally, calculateScores, userName, canProceedOnCurrentPage]);

  const handleReset = useCallback(() => {
    setUserName('');
    setAnswers({});
    setResults(null);
    setCurrentPageIndex(0);
    setCurrentStep(AppStep.Welcome); // Reset to Welcome screen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 py-6 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-sky-800 text-center tracking-tight">
          <i className="fas fa-bible mr-3 text-sky-600"></i>
          Descubre tus Dones Espirituales
        </h1>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentStep === AppStep.Welcome && (
          <WelcomeScreen 
            userName={userName}
            onNameChange={handleNameChange}
            onStartQuest={handleStartQuest}
          />
        )}
        {currentStep === AppStep.Form && (
          <QuestionnaireForm
            questions={currentQuestions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            // isSubmitting is false because form is hidden during actual calculation step
            isFormDisabled={false} 
            canProceed={canProceedOnCurrentPage}
            currentPageIndex={currentPageIndex}
            totalPages={totalPages}
          />
        )}
        {currentStep === AppStep.Calculating && (
          <div className="flex flex-col items-center justify-center h-64 bg-white shadow-xl rounded-lg p-8">
            <i className="fas fa-cog fa-spin text-5xl text-sky-600 mb-6" aria-hidden="true"></i>
            <p className="text-2xl font-semibold text-sky-700">Calculando tus resultados...</p>
            <p className="text-gray-600">Por favor espera un momento.</p>
          </div>
        )}
        {currentStep === AppStep.Results && results && (
          <ResultsDisplay result={results} onReset={handleReset} />
        )}
      </main>
      <footer className="text-center py-8 mt-12 border-t border-gray-300">
        <p className="text-sm text-gray-500">
          Aplicación de Dones Espirituales &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;