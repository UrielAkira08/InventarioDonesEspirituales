
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppStep, UserAnswers, UserResult, GiftScore, Question, DevelopmentPlanData, initialDevelopmentPlanData } from './types';
import { ALL_QUESTIONS, GIFTS_DEFINITIONS, QUESTIONS_PER_PAGE } from './constants';
import WelcomeScreen from './components/WelcomeScreen'; 
import QuestionnaireForm from './components/QuestionnaireForm'; 
import ResultsDisplay from './components/ResultsDisplay'; 
import SpiritualGiftsDevelopmentGuide from './components/SpiritualGiftsDevelopmentGuide'; 
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore"; 

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Welcome);
  const [userName, setUserName] = useState<string>('');
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [results, setResults] = useState<UserResult | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  // State for Development Guide
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlanData | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState<boolean>(false);
  const [planLoadingError, setPlanLoadingError] = useState<string | null>(null);
  const [isPlanSaving, setIsPlanSaving] = useState<boolean>(false);
  const [planSavingError, setPlanSavingError] = useState<string | null>(null);


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
    if (currentStep !== AppStep.Form) return false;
    return currentQuestions.every(q => answers[q.id] !== undefined);
  }, [currentQuestions, answers, currentStep]);
  
  const canProceedOnCurrentPage = useMemo(() => {
      return areCurrentPageQuestionsAnswered;
  }, [areCurrentPageQuestionsAnswered]);

  const handleStartQuest = useCallback(() => {
    if (userName.trim() === '') {
      alert('Por favor, ingrese su nombre para comenzar.');
      return;
    }
    setSaveError(undefined);
    setCurrentStep(AppStep.Form);
    setCurrentPageIndex(0); 
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

  const saveResultsToFirestore = async (resultToSave: Omit<UserResult, 'id' | 'createdAt'> & { createdAt: any }) => {
    try {
      const docRef = await addDoc(collection(db, "spiritualGiftResults"), {
        ...resultToSave,
        createdAt: serverTimestamp() 
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
      setSaveError("Hubo un problema al guardar tus resultados en la base de datos. Aún puedes verlos localmente.");
      throw e; 
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!allQuestionsAnsweredGlobally) {
      alert('Parece que faltan respuestas en algunas páginas. Por favor, revise.');
      return;
    }
    if (!canProceedOnCurrentPage) {
      alert('Por favor, responda todas las preguntas de esta página para ver sus dones.');
      return;
    }

    setCurrentStep(AppStep.Calculating);
    
    const allScores = calculateScores();
    const sortedScores = [...allScores].sort((a, b) => b.score - a.score);
    const topGifts = sortedScores.slice(0, 3);

    const preliminaryResult: UserResult = {
      name: userName,
      topGifts: topGifts,
      allScores: allScores,
      createdAt: new Date() 
    };
    
    setResults(preliminaryResult); 
    setCurrentStep(AppStep.Saving); 
    setSaveError(undefined);

    try {
      const { id, saveError: localSaveError, ...dataToSave } = preliminaryResult; // Ensure 'id' and 'saveError' are not part of dataToSave
      await saveResultsToFirestore(dataToSave as Omit<UserResult, 'id' | 'createdAt' | 'saveError'> & { createdAt: any });
    } catch (error) {
      // Error handled in saveResultsToFirestore
    } finally {
      setCurrentStep(AppStep.Results); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  }, [allQuestionsAnsweredGlobally, calculateScores, userName, canProceedOnCurrentPage]);

  const handleReset = useCallback(() => {
    setUserName('');
    setAnswers({});
    setResults(null);
    setCurrentPageIndex(0);
    setSaveError(undefined);
    setDevelopmentPlan(null); // Clear development plan
    setPlanLoadingError(null);
    setPlanSavingError(null);
    setCurrentStep(AppStep.Welcome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Development Guide Logic
  const loadDevelopmentPlan = useCallback(async () => {
    if (!results || !results.name) {
      setPlanLoadingError("No se pueden cargar los datos del plan sin resultados del cuestionario.");
      setDevelopmentPlan(initialDevelopmentPlanData); // Set to initial if no results
      return;
    }
    setIsPlanLoading(true);
    setPlanLoadingError(null);
    try {
      const planDocRef = doc(db, "developmentPlans", results.name);
      const planDocSnap = await getDoc(planDocRef);
      const currentTopGiftsText = results.topGifts.map(g => g.gift.name).join(', ');
      if (planDocSnap.exists()) {
        const loadedPlan = planDocSnap.data() as DevelopmentPlanData;
        const completePlan = { 
          ...initialDevelopmentPlanData, 
          ...loadedPlan,
          step1_primaryGifts: loadedPlan.step1_primaryGifts || currentTopGiftsText // Ensure primary gifts are set
        };
        setDevelopmentPlan(completePlan);
      } else {
        setDevelopmentPlan({
          ...initialDevelopmentPlanData,
          step1_primaryGifts: currentTopGiftsText,
        });
      }
    } catch (error) {
      console.error("Error loading development plan:", error);
      setPlanLoadingError("Error al cargar el plan de desarrollo. Intente de nuevo.");
      setDevelopmentPlan({...initialDevelopmentPlanData, step1_primaryGifts: results.topGifts.map(g => g.gift.name).join(', ') });
    } finally {
      setIsPlanLoading(false);
    }
  }, [results]);

  const handleNavigateToDevelopmentGuide = useCallback(() => {
    setCurrentStep(AppStep.DevelopmentGuide);
    if (results && results.name) { // Ensure results exist before trying to load
        loadDevelopmentPlan();
    } else {
        // Handle case where results might not be available yet, or set a default plan
        setDevelopmentPlan(initialDevelopmentPlanData);
        if(!results) {
            setPlanLoadingError("Complete el cuestionario primero para acceder al plan de desarrollo.");
        }
    }
  }, [results, loadDevelopmentPlan]);
  
  useEffect(() => {
    if (currentStep === AppStep.DevelopmentGuide && results && results.name) {
        loadDevelopmentPlan();
    }
  }, [currentStep, results, loadDevelopmentPlan]);


  const handleDevelopmentPlanChange = useCallback((fieldName: keyof DevelopmentPlanData, value: any) => {
    setDevelopmentPlan(prev => {
      const basePlan = prev ?? initialDevelopmentPlanData;
      if (fieldName === 'step2_categories') {
        return {
          ...basePlan,
          step2_categories: {
            ...basePlan.step2_categories,
            ...value 
          }
        };
      }
      return { ...basePlan, [fieldName]: value };
    });
  }, []);

  const saveDevelopmentPlan = useCallback(async () => {
    if (!developmentPlan || !results || !results.name) {
      setPlanSavingError("No hay datos del plan para guardar o falta el nombre de usuario.");
      return;
    }
    setIsPlanSaving(true);
    setPlanSavingError(null);
    try {
      const planDocRef = doc(db, "developmentPlans", results.name);
      await setDoc(planDocRef, { ...developmentPlan, lastUpdated: serverTimestamp() }, { merge: true });
      // alert("Plan de desarrollo guardado exitosamente!"); // Consider a more subtle notification
    } catch (error) {
      console.error("Error saving development plan:", error);
      setPlanSavingError("Error al guardar el plan de desarrollo. Intente de nuevo.");
    } finally {
      setIsPlanSaving(false);
    }
  }, [developmentPlan, results]);

  const handleNavigateToResults = useCallback(() => {
    setCurrentStep(AppStep.Results);
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
            <p className="text-gray-600">Un momento por favor.</p>
          </div>
        )}
        {currentStep === AppStep.Saving && (
          <div className="flex flex-col items-center justify-center h-64 bg-white shadow-xl rounded-lg p-8">
            <i className="fas fa-cloud-upload-alt fa-spin text-5xl text-sky-600 mb-6" aria-hidden="true"></i>
            <p className="text-2xl font-semibold text-sky-700">Guardando tus resultados...</p>
            <p className="text-gray-600">Esto tomará un momento.</p>
          </div>
        )}
        {currentStep === AppStep.Results && results && (
          <ResultsDisplay 
            result={{...results, saveError: saveError}} 
            onReset={handleReset}
            onNavigateToDevelopmentGuide={handleNavigateToDevelopmentGuide}
          />
        )}
         {currentStep === AppStep.DevelopmentGuide && results && developmentPlan && (
          <SpiritualGiftsDevelopmentGuide
            userName={results.name}
            topGifts={results.topGifts}
            planData={developmentPlan}
            onPlanChange={handleDevelopmentPlanChange}
            onSavePlan={saveDevelopmentPlan}
            onReset={handleReset} 
            onNavigateToResults={handleNavigateToResults} 
            isLoading={isPlanLoading}
            isSaving={isPlanSaving}
            loadError={planLoadingError}
            saveError={planSavingError}
          />
        )}
        {currentStep === AppStep.DevelopmentGuide && !results && ( // Show message if trying to access guide without results
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md shadow-lg text-center">
                <strong className="font-bold">Información:</strong>
                <span className="block sm:inline"> Por favor, complete el cuestionario primero para crear o ver su plan de desarrollo.</span>
                <button 
                onClick={handleReset} 
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                Ir al Cuestionario
                </button>
            </div>
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
