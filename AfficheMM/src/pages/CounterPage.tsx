import React from 'react';
import { useCounter } from '../context/CounterContext';
import { RotateCcw, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

function CounterPage() {
  const { count, increment, decrement, reset } = useCounter();

  const openDisplay = () => {
    window.open('/display', '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12 p-8">
      <div className="text-[12rem] font-bold text-red-900">{count}</div>
      
      <button
        onClick={openDisplay}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-8"
      >
        Ouvrir l'affichage <ExternalLink size={20} />
      </button>
      
      <div className="flex gap-12">
        <button
          onClick={decrement}
          disabled={count <= 0}
          className="flex items-center gap-4 bg-red-600 text-white px-16 py-8 rounded-2xl text-4xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <ChevronLeft size={48} />
          Retour
        </button>
        <button
          onClick={increment}
          disabled={count >= 2000}
          className="flex items-center gap-4 bg-red-600 text-white px-16 py-8 rounded-2xl text-4xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Suivant
          <ChevronRight size={48} />
        </button>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pour un affichage optimal:</h2>
        <ol className="text-left inline-block">
          <li className="mb-2">1. Cliquez sur "Ouvrir l'affichage"</li>
          <li className="mb-2">2. Déplacez la nouvelle fenêtre vers l'écran TV</li>
          <li className="mb-2">3. Appuyez sur F11 pour passer en plein écran</li>
        </ol>
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mt-8"
      >
        Réinitialiser
        <RotateCcw size={24} />
      </button>
    </div>
  );
}

export default CounterPage;