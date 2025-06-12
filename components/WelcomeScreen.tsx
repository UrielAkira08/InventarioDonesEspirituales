import React from 'react';
import { RATING_INSTRUCTIONS, RATING_SCALE_DESCRIPTION, RATING_LABELS } from '../constants';

interface WelcomeScreenProps {
  onNavigateToQuizIdentification: () => void;
  onNavigateToDevelopmentIdentification: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onNavigateToQuizIdentification, 
  onNavigateToDevelopmentIdentification 
}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-700 mb-6 text-center">
        Bienvenido al Descubrimiento y Desarrollo de Dones Espirituales
      </h2>

      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-md">
        <h3 className="text-xl font-semibold text-sky-800 mb-2">Instrucciones Generales del Cuestionario:</h3>
        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line mb-4">{RATING_INSTRUCTIONS}</p>
        
        <h3 className="text-lg font-semibold text-sky-800 mb-2">Escala de Calificación:</h3>
        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line mb-4">{RATING_SCALE_DESCRIPTION}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs sm:text-sm">
            {RATING_LABELS.map(rl => (
                <div key={rl.value} className="p-3 bg-gray-100 rounded-md shadow-sm" title={rl.description}>
                    <span className="font-bold text-sky-700">{rl.label}:</span> <span className="text-gray-600">{rl.description}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onNavigateToQuizIdentification}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out text-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 flex flex-col items-center justify-center"
          aria-label="Presentar el cuestionario para descubrir mis dones"
        >
          <i className="fas fa-tasks fa-2x mb-2"></i>
          <span>Presentar Cuestionario</span>
          <span className="text-xs font-normal mt-1">(Descubrir mis dones)</span>
        </button>

        <button
          onClick={onNavigateToDevelopmentIdentification}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out text-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex flex-col items-center justify-center"
          aria-label="Usar o desarrollar mis dones espirituales"
        >
          <i className="fas fa-seedling fa-2x mb-2"></i>
          <span>Usar/Desarrollar Dones</span>
           <span className="text-xs font-normal mt-1">(Acceder a mi plan)</span>
        </button>
      </div>
       <p className="text-center text-sm text-gray-600 mt-6">
        Si es tu primera vez, comienza con el cuestionario. Si ya tienes resultados, accede a tu plan de desarrollo.
      </p>
    </div>
  );
};

export default WelcomeScreen;