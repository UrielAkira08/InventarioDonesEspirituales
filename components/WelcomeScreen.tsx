import React from 'react';
import { RATING_INSTRUCTIONS, RATING_SCALE_DESCRIPTION, RATING_LABELS } from '../constants';

interface WelcomeScreenProps {
  userName: string;
  onNameChange: (name: string) => void;
  onStartQuest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onNameChange, onStartQuest }) => {
  const canStart = userName.trim() !== '';

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-700 mb-6 text-center">
        Bienvenido al Cuestionario de Dones Espirituales
      </h2>

      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-md">
        <h3 className="text-xl font-semibold text-sky-800 mb-2">Instrucciones Generales:</h3>
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

      <div className="mb-6">
        <label htmlFor="welcomeUserName" className="block text-lg font-medium text-gray-700 mb-2">
          Por favor, ingrese su Nombre Completo:
        </label>
        <input
          type="text"
          id="welcomeUserName"
          value={userName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Escriba su nombre aquí"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-lg"
          required
          aria-required="true"
          aria-describedby="welcomeNameWarning"
        />
        {!canStart && <p id="welcomeNameWarning" className="text-xs text-red-500 mt-1">El nombre es requerido para comenzar.</p>}
      </div>

      <button
        onClick={onStartQuest}
        disabled={!canStart}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out text-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Comenzar el cuestionario"
      >
        <i className="fas fa-play-circle mr-2"></i> Comenzar Cuestionario
      </button>
    </div>
  );
};

export default WelcomeScreen;