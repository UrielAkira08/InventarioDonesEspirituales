import React, { useState } from 'react';

interface IdentifyForDevelopmentScreenProps {
  onLoadPlan: (email: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const IdentifyForDevelopmentScreen: React.FC<IdentifyForDevelopmentScreenProps> = ({ onLoadPlan, onBack, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (email.trim() === '') {
      setEmailError('El correo electrónico es requerido.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Por favor, ingrese un correo electrónico válido.');
      return;
    }
    setEmailError('');
    await onLoadPlan(email.trim());
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
        Acceder a Plan de Desarrollo
      </h2>
      <p className="text-gray-600 text-sm text-center mb-6">
        Ingrese el correo electrónico que utilizó al completar el cuestionario para cargar sus resultados y plan de desarrollo.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md shadow-sm text-sm" role="alert">
            <strong className="font-bold">Error:</strong> {error}
        </div>
      )}

      <div>
        <label htmlFor="emailDev" className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico:
        </label>
        <input
          type="email"
          id="emailDev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej: juan.perez@ejemplo.com"
          className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
          aria-required="true"
          aria-describedby="emailDevError"
          disabled={isLoading}
        />
        {emailError && <p id="emailDevError" className="text-xs text-red-600 mt-1">{emailError}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 disabled:bg-gray-300"
          aria-label="Volver a la pantalla de bienvenida"
        >
          <i className="fas fa-arrow-left mr-2"></i> Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 disabled:bg-green-300"
          aria-label="Cargar mi plan y resultados"
        >
          {isLoading ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Cargando...</>
          ) : (
            <><i className="fas fa-folder-open mr-2"></i>Cargar Plan y Resultados</>
          )}
        </button>
      </div>
    </div>
  );
};

export default IdentifyForDevelopmentScreen;