
import React from 'react';
import { UserResult, GiftScore } from '../types';

interface ResultsDisplayProps {
  result: UserResult;
  onReset: () => void; // This function should navigate to the Welcome/Home screen
  onNavigateToDevelopmentGuide: () => void; 
}

const GiftCard: React.FC<{ giftScore: GiftScore, rank: number }> = ({ giftScore, rank }) => {
  const { gift, score } = giftScore;
  const colors = [
    "bg-sky-600", "bg-teal-600", "bg-indigo-600", 
    "bg-sky-500", "bg-teal-500", "bg-indigo-500"
  ];
  const rankColor = colors[rank-1] || 'bg-gray-500';

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className={`${rankColor} text-white p-5`}>
        <h3 className="text-2xl font-bold">{rank}. {gift.name}</h3>
        <p className="text-lg">Puntuación: {score}</p>
      </div>
      <div className="p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-2">Descripción:</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{gift.description}</p>
      </div>
    </div>
  );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset, onNavigateToDevelopmentGuide }) => {
  return (
    <div className="space-y-8 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-sky-700 mb-3">
          Resultados del Cuestionario
        </h2>
        <p className="text-xl text-gray-600">
          Hola <span className="font-semibold text-sky-600">{result.name}</span>, estos son tus dones espirituales más destacados:
        </p>
      </div>

      {result.saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md text-center">
          <p className="text-red-700 font-semibold">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Error al Guardar Resultados del Cuestionario:
          </p>
          <p className="text-red-600 text-sm">{result.saveError}</p>
          <p className="text-red-600 text-sm mt-1">Tus resultados del cuestionario se muestran localmente.</p>
        </div>
      )}

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {result.topGifts.map((gs, index) => (
          <GiftCard key={gs.gift.id} giftScore={gs} rank={index + 1} />
        ))}
      </div>
      
      {result.allScores.length > 3 && (
        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
            <h3 className="text-2xl font-semibold text-sky-700 mb-6 text-center">Todos tus Puntajes</h3>
            <ul className="space-y-3">
                {result.allScores.sort((a,b) => b.score - a.score).map(gs => (
                    <li key={gs.gift.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                        <span className="text-gray-800 font-medium">{gs.gift.name}</span>
                        <span className="text-sky-600 font-bold px-3 py-1 bg-sky-100 rounded-full text-sm">{gs.score}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div className="mt-12 text-center space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        <button
          onClick={onReset} // Re-labeled "Realizar de Nuevo" to be more generic "Volver al Inicio"
          className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
        >
          <i className="fas fa-home mr-2"></i> Volver al Inicio
        </button>
        <button //This button's action can be interpreted as "Start Over" or "Take Quiz Again"
          onClick={onReset} 
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        >
          <i className="fas fa-redo-alt mr-2"></i> Realizar Cuestionario de Nuevo
        </button>
        <button
          onClick={onNavigateToDevelopmentGuide}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Crear o ver plan de desarrollo ministerial"
        >
          <i className="fas fa-seedling mr-2"></i> Crear/Ver Plan de Desarrollo
        </button>
      </div>
       <p className="text-center text-xs text-gray-500 mt-4">
        Marque las tres puntuaciones más altas; esto le ayudará a discernir su área de servicio espiritual para Dios y su iglesia.
      </p>
       <p className="text-center text-sm text-gray-600 mt-6">
        El Plan de Desarrollo Ministerial te ayudará a reflexionar sobre cómo puedes usar tus dones en servicio.
      </p>
    </div>
  );
};

export default ResultsDisplay;
