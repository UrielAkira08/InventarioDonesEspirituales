
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppStep, UserAnswers, UserResult, GiftScore, Question, DevelopmentPlanData, initialDevelopmentPlanData } from './types';
import { ALL_QUESTIONS, GIFTS_DEFINITIONS, QUESTIONS_PER_PAGE } from './constants';
import WelcomeScreen from './components/WelcomeScreen'; 
import IdentifyForQuizScreen from './components/IdentifyForQuizScreen';
import IdentifyForDevelopmentScreen from './components/IdentifyForDevelopmentScreen';
import QuestionnaireForm from './components/QuestionnaireForm'; 
import ResultsDisplay from './components/ResultsDisplay'; 
import SpiritualGiftsDevelopmentGuide from './components/SpiritualGiftsDevelopmentGuide'; 
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"; 

// Helper function to sanitize user-provided IDs for use as Firestore document IDs
const sanitizeFirestoreId = (id: string): string => {
  if (!id) return `default_id_${Date.now()}`; 

  // Replace problematic characters for Firestore IDs. Emails are common, so @ and . are handled.
  // Replacing . with _ might be too aggressive if email itself is fine as ID.
  // Firestore allows emails as doc IDs. Let's be less aggressive.
  // Common problematic chars for path segments: /, #, $, [, ]
  // Also, an ID cannot be "." or "..".
  let sanitizedId = id.replace(/[\/\#\$\[\]]/g, '_'); 
  
  if (sanitizedId.trim() === '') {
    sanitizedId = `empty_id_${Date.now()}`;
  }
  
  if (sanitizedId === '.' || sanitizedId === '..') {
    sanitizedId = `id_${sanitizedId.replace(/\./g, '_')}`;
  }

  // Max length 1,500 bytes. Truncate (char length approximation).
  if (sanitizedId.length > 500) {
    sanitizedId = sanitizedId.substring(0, 500);
  }
  
  return sanitizedId;
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Welcome);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [results, setResults] = useState<UserResult | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlanData | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState<boolean>(false);
  const [planLoadingError, setPlanLoadingError] = useState<string | null>(null);
  const [isPlanSaving, setIsPlanSaving] = useState<boolean>(false);
  const [planSavingError, setPlanSavingError] = useState<string | null>(null);
  const [generalLoadingError, setGeneralLoadingError] = useState<string | null>(null);


  const totalPages = useMemo(() => Math.ceil(ALL_QUESTIONS.length / QUESTIONS_PER_PAGE), []);

  const currentQuestions = useMemo((): Question[] => {
    const start = currentPageIndex * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return ALL_QUESTIONS.slice(start, end);
  }, [currentPageIndex]);

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

  const handleNavigateToQuizIdentification = useCallback(() => {
    setCurrentStep(AppStep.IdentifyForQuiz);
    setGeneralLoadingError(null);
  }, []);

  const handleNavigateToDevelopmentIdentification = useCallback(() => {
    setCurrentStep(AppStep.IdentifyForDevelopment);
    setGeneralLoadingError(null);
    setPlanLoadingError(null); // Clear previous errors
  }, []);
  
  const handleBackToWelcome = useCallback(() => {
    setCurrentStep(AppStep.Welcome);
    // Optionally reset name/email here if needed, or keep them for convenience
  }, []);

  const handleProceedToQuiz = useCallback((name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setSaveError(undefined);
    setAnswers({}); // Reset answers for a new quiz
    setResults(null);
    setCurrentPageIndex(0); 
    setCurrentStep(AppStep.Form);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        ...resultToSave, // Should include name and userEmail
        createdAt: serverTimestamp() 
      });
      console.log("Result document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding result document: ", e);
      setSaveError("Hubo un problema al guardar tus resultados del cuestionario en la base de datos. Aún puedes verlos localmente.");
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
      userEmail: userEmail, // Include email
      topGifts: topGifts,
      allScores: allScores,
      createdAt: new Date() 
    };
    
    setResults(preliminaryResult); 
    setCurrentStep(AppStep.Saving); 
    setSaveError(undefined);

    try {
      // 'id' and 'saveError' are not part of the data to save to Firestore initially
      const { id, saveError: localSaveError, ...dataToSave } = preliminaryResult; 
      await saveResultsToFirestore(dataToSave as Omit<UserResult, 'id' | 'createdAt' | 'saveError'> & { createdAt: any });
    } catch (error) {
      // Error handled in saveResultsToFirestore
    } finally {
      setCurrentStep(AppStep.Results); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  }, [allQuestionsAnsweredGlobally, calculateScores, userName, userEmail, canProceedOnCurrentPage]);

  const handleReset = useCallback(() => {
    setUserName('');
    setUserEmail('');
    setAnswers({});
    setResults(null);
    setCurrentPageIndex(0);
    setSaveError(undefined);
    setDevelopmentPlan(null); 
    setPlanLoadingError(null);
    setPlanSavingError(null);
    setGeneralLoadingError(null);
    setCurrentStep(AppStep.Welcome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadDevelopmentPlanByEmail = useCallback(async (emailForPlan: string) => {
    setIsPlanLoading(true);
    setPlanLoadingError(null);
    setUserEmail(emailForPlan); // Ensure userEmail state is set

    // Step 1: Load latest spiritual gift results for this email
    try {
      const resultsQuery = query(
        collection(db, "spiritualGiftResults"),
        where("userEmail", "==", emailForPlan),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(resultsQuery);

      let loadedUserResult: UserResult | null = null;
      if (!querySnapshot.empty) {
        const resultDoc = querySnapshot.docs[0];
        const resultData = resultDoc.data();
        loadedUserResult = {
            id: resultDoc.id,
            name: resultData.name,
            userEmail: resultData.userEmail,
            topGifts: resultData.topGifts,
            allScores: resultData.allScores,
            createdAt: (resultData.createdAt as Timestamp)?.toDate ? (resultData.createdAt as Timestamp).toDate() : new Date(),
        };
        setResults(loadedUserResult);
        setUserName(loadedUserResult.name); // Update userName state from loaded result
      } else {
        setPlanLoadingError("No se encontraron resultados del cuestionario para este correo. Por favor, complete el cuestionario primero.");
        setIsPlanLoading(false);
        setDevelopmentPlan(null); // Ensure no old plan is shown
        return;
      }

      // Step 2: Load development plan using the email
      const planDocId = sanitizeFirestoreId(emailForPlan);
      const planDocRef = doc(db, "developmentPlans", planDocId);
      const planDocSnap = await getDoc(planDocRef);

      const currentTopGiftsText = (loadedUserResult?.topGifts && Array.isArray(loadedUserResult.topGifts))
        ? loadedUserResult.topGifts.map(g => g?.gift?.name || 'Don Desconocido').join(', ')
        : 'Dones principales no disponibles';

      if (planDocSnap.exists()) {
        const loadedPlan = planDocSnap.data() as DevelopmentPlanData;
        const completePlan = { 
          ...initialDevelopmentPlanData, 
          ...loadedPlan,
          step1_primaryGifts: loadedPlan.step1_primaryGifts || currentTopGiftsText
        };
        setDevelopmentPlan(completePlan);
      } else {
        // No existing plan, set up an initial one based on loaded results
        setDevelopmentPlan({
          ...initialDevelopmentPlanData,
          step1_primaryGifts: currentTopGiftsText,
        });
      }
      setCurrentStep(AppStep.DevelopmentGuide);

    } catch (error) {
      console.error(`Error loading data for email: '${emailForPlan}'. Firestore error:`, error);
      setPlanLoadingError("Error al cargar los datos. Intente de nuevo.");
      setDevelopmentPlan(null); 
    } finally {
      setIsPlanLoading(false);
    }
  }, []);
  
  // This is called from Results screen, or if already in dev guide and results/email are known
  const loadOrCreateDevelopmentPlan = useCallback(async () => {
    if (!userEmail) {
      setPlanLoadingError("Correo electrónico del usuario no disponible. No se puede cargar el plan.");
      setDevelopmentPlan(initialDevelopmentPlanData);
      setCurrentStep(AppStep.IdentifyForDevelopment); // Guide user to provide email
      return;
    }
    if (!results || !results.name) { // Ensure results (and thus name) are loaded
        // This case should ideally be handled by loadDevelopmentPlanByEmail if coming directly
      setPlanLoadingError("Resultados del cuestionario no disponibles. No se puede cargar/crear el plan.");
      setDevelopmentPlan(initialDevelopmentPlanData);
      return;
    }

    setIsPlanLoading(true);
    setPlanLoadingError(null);
    const planDocId = sanitizeFirestoreId(userEmail); // Use email for plan ID

    try {
      const planDocRef = doc(db, "developmentPlans", planDocId);
      const planDocSnap = await getDoc(planDocRef);
      const currentTopGiftsText = (results.topGifts && Array.isArray(results.topGifts))
        ? results.topGifts.map(g => g?.gift?.name || 'Don Desconocido').join(', ')
        : 'Dones principales no disponibles';

      if (planDocSnap.exists()) {
        const loadedPlan = planDocSnap.data() as DevelopmentPlanData;
        const completePlan = { 
          ...initialDevelopmentPlanData, 
          ...loadedPlan,
          step1_primaryGifts: loadedPlan.step1_primaryGifts || currentTopGiftsText
        };
        setDevelopmentPlan(completePlan);
      } else {
        // Create initial plan data if none exists
        setDevelopmentPlan({
          ...initialDevelopmentPlanData,
          step1_primaryGifts: currentTopGiftsText,
        });
      }
    } catch (error) {
      console.error(`Error loading development plan for email: '${userEmail}', sanitized ID: '${planDocId}'. Firestore error:`, error);
      setPlanLoadingError("Error al cargar el plan de desarrollo. Intente de nuevo.");
      const fallbackTopGiftsText = (results?.topGifts && Array.isArray(results.topGifts))
        ? results.topGifts.map(g => g?.gift?.name || 'Don Desconocido').join(', ')
        : 'Dones principales no disponibles';
      setDevelopmentPlan({
        ...initialDevelopmentPlanData,
        step1_primaryGifts: fallbackTopGiftsText,
      });
    } finally {
      setIsPlanLoading(false);
    }
  }, [results, userEmail]);


  const handleNavigateToDevelopmentGuide = useCallback(() => {
    if (!userEmail || !results) {
        // This should not happen if called from results page, but as a safeguard
        setCurrentStep(AppStep.IdentifyForDevelopment); 
        setGeneralLoadingError("Por favor, ingrese su correo para cargar su plan.");
        return;
    }
    setCurrentStep(AppStep.DevelopmentGuide);
    loadOrCreateDevelopmentPlan();
  }, [userEmail, results, loadOrCreateDevelopmentPlan]);
  
  // If navigating directly to Dev Guide and data is already set up (e.g. after identify)
   useEffect(() => {
    if (currentStep === AppStep.DevelopmentGuide && userEmail && results && !developmentPlan && !isPlanLoading) {
        loadOrCreateDevelopmentPlan();
    }
  }, [currentStep, userEmail, results, developmentPlan, isPlanLoading, loadOrCreateDevelopmentPlan]);


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
    if (!developmentPlan || !userEmail) {
      setPlanSavingError("No hay datos del plan para guardar o falta el correo electrónico del usuario.");
      return;
    }
    setIsPlanSaving(true);
    setPlanSavingError(null);
    const planDocId = sanitizeFirestoreId(userEmail); // Use email for plan ID
    try {
      const planDocRef = doc(db, "developmentPlans", planDocId);
      await setDoc(planDocRef, { ...developmentPlan, userEmail: userEmail, userName: userName, lastUpdated: serverTimestamp() }, { merge: true });
      // Optionally show a success message
    } catch (error) {
      console.error(`Error saving development plan for email: '${userEmail}', sanitized ID: '${planDocId}'. Firestore error:`, error);
      setPlanSavingError("Error al guardar el plan de desarrollo. Intente de nuevo.");
    } finally {
      setIsPlanSaving(false);
    }
  }, [developmentPlan, userEmail, userName]);

  const handleNavigateToResults = useCallback(() => {
    if (results) { // Ensure results exist before navigating
        setCurrentStep(AppStep.Results);
    } else {
        // If no results, perhaps user came via "Develop Gifts" and bailed, or reset.
        // Go to a safe place, like Welcome or IdentifyForQuiz
        setCurrentStep(AppStep.IdentifyForQuiz); 
        setGeneralLoadingError("No hay resultados para mostrar. Por favor, complete el cuestionario.");
    }
  }, [results]);


  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 py-6 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-sky-800 text-center tracking-tight">
          <i className="fas fa-bible mr-3 text-sky-600"></i>
          Descubre tus Dones Espirituales
        </h1>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {generalLoadingError && (
             <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md text-center">
                <p className="text-yellow-700 font-semibold">
                    <i className="fas fa-info-circle mr-2"></i>
                    {generalLoadingError}
                </p>
             </div>
        )}

        {currentStep === AppStep.Welcome && (
          <WelcomeScreen 
            onNavigateToQuizIdentification={handleNavigateToQuizIdentification}
            onNavigateToDevelopmentIdentification={handleNavigateToDevelopmentIdentification}
          />
        )}
        {currentStep === AppStep.IdentifyForQuiz && (
          <IdentifyForQuizScreen 
            onProceed={handleProceedToQuiz}
            onBack={handleBackToWelcome}
          />
        )}
        {currentStep === AppStep.IdentifyForDevelopment && (
          <IdentifyForDevelopmentScreen
            onLoadPlan={loadDevelopmentPlanByEmail}
            onBack={handleBackToWelcome}
            isLoading={isPlanLoading}
            error={planLoadingError}
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
          </div>
        )}
        {currentStep === AppStep.Saving && (
          <div className="flex flex-col items-center justify-center h-64 bg-white shadow-xl rounded-lg p-8">
            <i className="fas fa-cloud-upload-alt fa-spin text-5xl text-sky-600 mb-6" aria-hidden="true"></i>
            <p className="text-2xl font-semibold text-sky-700">Guardando tus resultados...</p>
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
            userName={results.name} // This name comes from loaded results
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
        {/* Fallback for Dev Guide if results/plan somehow not loaded but step is DevGuide */}
        {currentStep === AppStep.DevelopmentGuide && (!results || !developmentPlan) && !isPlanLoading && ( 
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md shadow-lg text-center">
                <strong className="font-bold">Información:</strong>
                <span className="block sm:inline"> {planLoadingError || "No se pudo cargar el plan de desarrollo. Por favor, intente acceder nuevamente o complete el cuestionario."}</span>
                <button 
                onClick={handleReset} 
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                Ir al Inicio
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