
import React from 'react';
import { DevelopmentPlanData, GiftScore } from '../types';

interface SpiritualGiftsDevelopmentGuideProps {
  userName: string;
  topGifts: GiftScore[];
  planData: DevelopmentPlanData;
  onPlanChange: (fieldName: keyof DevelopmentPlanData, value: any) => void;
  onSavePlan: () => void;
  onReset: () => void; // Navigates to Welcome/Home
  onNavigateToResults: () => void;
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  saveError: string | null;
}

interface FormTextareaProps {
  id: keyof DevelopmentPlanData;
  label: string;
  value: string;
  onChange: (id: keyof DevelopmentPlanData, value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ id, label, value, onChange, placeholder, rows = 4, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={id}
      name={id}
      rows={rows}
      className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
      placeholder={placeholder || `Escriba sus pensamientos para ${label.toLowerCase()} aquí...`}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      disabled={disabled}
      aria-label={label}
    />
  </div>
);

interface StepSectionProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
}
const StepSection: React.FC<StepSectionProps> = ({ stepNumber, title, children }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
    <h3 className="text-xl font-semibold text-sky-700">
      PASO {stepNumber}: {title}
    </h3>
    {children}
  </div>
);


const SpiritualGiftsDevelopmentGuide: React.FC<SpiritualGiftsDevelopmentGuideProps> = ({
  userName,
  topGifts,
  planData,
  onPlanChange,
  onSavePlan,
  onReset,
  onNavigateToResults,
  isLoading,
  isSaving,
  loadError,
  saveError,
}) => {
  const handleCategoryChange = (category: keyof DevelopmentPlanData['step2_categories']) => {
    onPlanChange('step2_categories', { [category]: !planData.step2_categories[category] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white shadow-xl rounded-lg p-8">
        <i className="fas fa-spinner fa-spin text-5xl text-sky-600 mb-6" aria-hidden="true"></i>
        <p className="text-2xl font-semibold text-sky-700">Cargando Plan de Desarrollo...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md shadow-lg text-center">
        <strong className="font-bold">Error al Cargar:</strong>
        <span className="block sm:inline mb-3"> {loadError}</span>
        <div className="mt-4 space-x-2 flex flex-col sm:flex-row sm:justify-center gap-2">
            <button 
            onClick={onReset} 
            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
            <i className="fas fa-home mr-2"></i> Volver al Inicio
            </button>
            <button 
            onClick={onNavigateToResults} 
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
            <i className="fas fa-arrow-left mr-2"></i> Volver a Resultados
            </button>
        </div>
      </div>
    );
  }
  
  const topGiftsText = topGifts.map(g => g.gift.name).join(', ');

  return (
    <div className="space-y-8 py-8">
      <div className="text-center mb-4"> {/* Adjusted mb for new button */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-800 mb-2">
          Plan de Desarrollo Ministerial
        </h2>
        <p className="text-lg text-gray-700">
          Para: <span className="font-semibold text-sky-600">{userName}</span>
        </p>
        <p className="text-md text-gray-600">
          Tus dones principales identificados: <span className="font-medium text-teal-600">{topGiftsText}</span>
        </p>
      </div>
      
      <div className="text-center mb-8"> {/* Container for the new button */}
        <button
          onClick={onNavigateToResults}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          aria-label="Ver resultados detallados del cuestionario"
        >
          <i className="fas fa-poll-h mr-2"></i>
          Ver Resultados Detallados
        </button>
      </div>


      {saveError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
          <i className="fas fa-exclamation-circle mr-2"></i>Error al guardar el plan: {saveError}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Paso 1 */}
        <StepSection stepNumber={1} title="Identifique sus Dones Espirituales">
          <FormTextarea id="step1_primaryGifts" label="Mis dones primarios son (autocompletado):" value={planData.step1_primaryGifts || topGiftsText} onChange={onPlanChange} disabled={true} />
          <FormTextarea id="step1_secondaryGifts" label="Mis dones secundarios son:" value={planData.step1_secondaryGifts} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 2 */}
        <StepSection stepNumber={2} title="Clasifique en categorías sus dones">
          <p className="text-sm text-gray-600 mb-2">Marque las categorías que considera se ajustan a sus dones (basado en la pág. 26-27 del PDF de referencia):</p>
          <div className="space-y-2">
            {(['numericos', 'madurez', 'organicos'] as Array<keyof DevelopmentPlanData['step2_categories']>).map(cat => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={planData.step2_categories[cat]}
                  onChange={() => handleCategoryChange(cat)}
                  className="form-checkbox h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="text-gray-700 capitalize">{cat}</span>
              </label>
            ))}
          </div>
        </StepSection>

        {/* Paso 3 */}
        <StepSection stepNumber={3} title="Defina sus funciones">
          <FormTextarea id="step3_functionsInChurch" label="¿En qué funciones, cargos o posiciones sus dones se ajustan en la estructura tradicional de la Iglesia?" value={planData.step3_functionsInChurch} onChange={onPlanChange} />
          <FormTextarea id="step3_newMinistriesToStart" label="¿Qué ministerios que ahora no existen en la estructura tradicional de la iglesia podría necesitar iniciar?" value={planData.step3_newMinistriesToStart} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 4 */}
        <StepSection stepNumber={4} title="Liste los Ministerios que usted ha elegido">
         <FormTextarea id="step4_chosenMinistries" label="Ministerios elegidos (consulte la 'Distribución de Dones Espirituales' págs. 21-24 del PDF):" value={planData.step4_chosenMinistries} onChange={onPlanChange} rows={6} />
        </StepSection>
        
        {/* Paso 5 */}
        <StepSection stepNumber={5} title="Identifique las barreras">
          <FormTextarea id="step5_potentialBarriers" label="Liste las barreras que usted cree que pueden surgir al establecer sus ministerios:" value={planData.step5_potentialBarriers} onChange={onPlanChange} />
          <FormTextarea id="step5_ministryImpactOnChurch" label="¿Cómo estos ministerios afectan al resto del programa de su iglesia? (factores positivos y negativos):" value={planData.step5_ministryImpactOnChurch} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 6 */}
        <StepSection stepNumber={6} title="Teoría y Estudio">
          <FormTextarea id="step6_studyAndLearningPlan" label="¿Qué necesita estudiar y aprender para que practique de manera exitosa su ministerio? (libros, seminarios, etc.):" value={planData.step6_studyAndLearningPlan} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 7 */}
        <StepSection stepNumber={7} title="Recursos">
          <FormTextarea id="step7_currentResources" label="Recursos que usted ya tiene (materiales, lugares, finanzas, etc.):" value={planData.step7_currentResources} onChange={onPlanChange} />
          <FormTextarea id="step7_neededResources" label="Recursos que necesita encontrar u obtener:" value={planData.step7_neededResources} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 8 */}
        <StepSection stepNumber={8} title="Sus ayudantes">
          <FormTextarea id="step8_helperSkillsNeeded" label="¿Qué habilidades de las personas va a necesitar para llevar a cabo este ministerio?" value={planData.step8_helperSkillsNeeded} onChange={onPlanChange} />
          <FormTextarea id="step8_helperTrainingPlan" label="¿Qué tipo de capacitación necesitan las personas que trabajarán con usted? (cómo y dónde obtenerla):" value={planData.step8_helperTrainingPlan} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 9 */}
        <StepSection stepNumber={9} title="Grupos de Apoyo">
          <FormTextarea id="step9_supportGroupTemperament" label="Temperamento de apoyo (personas que contrarresten su temperamento):" value={planData.step9_supportGroupTemperament} onChange={onPlanChange} />
          <FormTextarea id="step9_supportGroupResources" label="Recursos de apoyo (personas para estudiar/investigar, apoyo financiero, etc.):" value={planData.step9_supportGroupResources} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 10 */}
        <StepSection stepNumber={10} title="Base de Operaciones">
          <FormTextarea id="step10_baseOfOperations" label="¿Dónde será su base de operaciones? (hogar, iglesia, etc.):" value={planData.step10_baseOfOperations} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 11 */}
        <StepSection stepNumber={11} title="Plan de Acción">
          <FormTextarea id="step11_actionPlanDetails" label="¿Cuándo comenzará su ministerio? ¿Con quién necesita hablar? ¿Qué autorizaciones necesita?" value={planData.step11_actionPlanDetails} onChange={onPlanChange} />
        </StepSection>

        {/* Paso 12 */}
        <StepSection stepNumber={12} title="Elabore una línea de tiempo para su Ministerio">
          <FormTextarea id="step12_timeline_3months" label="Logros esperados en Tres meses:" value={planData.step12_timeline_3months} onChange={onPlanChange} />
          <FormTextarea id="step12_timeline_1year" label="Logros esperados en Un año:" value={planData.step12_timeline_1year} onChange={onPlanChange} />
          <FormTextarea id="step12_timeline_longTerm" label="Logros esperados A largo plazo:" value={planData.step12_timeline_longTerm} onChange={onPlanChange} />
        </StepSection>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onSavePlan}
          disabled={isSaving}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300"
          aria-label="Guardar Plan de Desarrollo"
        >
          {isSaving ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Guardando...</>
          ) : (
            <><i className="fas fa-save mr-2"></i>Guardar Plan</>
          )}
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={onNavigateToResults}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Volver a Resultados"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver a Resultados
          </button>
          <button
            onClick={onReset}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Volver al Inicio / Reiniciar Cuestionario"
          >
            <i className="fas fa-home mr-2"></i> Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiritualGiftsDevelopmentGuide;
