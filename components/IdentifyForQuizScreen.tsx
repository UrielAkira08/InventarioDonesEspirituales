import React, { useState } from 'react';

interface IdentifyForQuizScreenProps {
  onProceed: (name: string, email: string) => void;
  onBack: () => void;
}

const IdentifyForQuizScreen: React.FC<IdentifyForQuizScreenProps> = ({ onProceed, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    let isValid = true;
    if (name.trim() === '') {
      setNameError('El nombre completo es requerido.');
      isValid = false;
    } else {
      setNameError('');
    }

    if (email.trim() === '') {
      setEmailError('El correo electrónico es requerido.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Por favor, ingrese un correo electrónico válido.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (isValid) {
      onProceed(name.trim(), email.trim());
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
        Identificación para el Cuestionario
      </h2>
      <p className="text-gray-600 text-sm text-center mb-6">
        Por favor, ingrese su nombre completo y correo electrónico para comenzar. Esta información se utilizará para guardar y asociar sus resultados.
      </p>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo:
        </label>
        <input
          type="text"
          id="fullName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Juan Pérez"
          className={`w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
          aria-required="true"
          aria-describedby="nameError"
        />
        {nameError && <p id="nameError" className="text-xs text-red-600 mt-1">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej: juan.perez@ejemplo.com"
          className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
          aria-required="true"
          aria-describedby="emailError"
        />
        {emailError && <p id="emailError" className="text-xs text-red-600 mt-1">{emailError}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150"
          aria-label="Volver a la pantalla de bienvenida"
        >
          <i className="fas fa-arrow-left mr-2"></i> Volver
        </button>
        <button
          onClick={handleSubmit}
          className="w-full sm:flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150"
          aria-label="Continuar al cuestionario"
        >
          <i className="fas fa-play-circle mr-2"></i> Continuar al Cuestionario
        </button>
      </div>
    </div>
  );
};

export default IdentifyForQuizScreen;