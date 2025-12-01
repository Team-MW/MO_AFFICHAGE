import { useEffect, useState } from 'react';
import { useCounter } from '../context/CounterContext';
import { RotateCcw, ChevronRight, ChevronLeft, ExternalLink, Hash } from 'lucide-react';

function CounterPage() {
  const { count, increment, decrement, reset, setToValue, undoLastIncrement, isBusy } = useCounter();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isBusy) return;
      if (e.key === 'ArrowRight') increment();
      else if (e.key === 'ArrowLeft') decrement();
      else if (e.key.toLowerCase() === 'r') reset();
      else if (e.key.toLowerCase() === 'u') undoLastIncrement();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [increment, decrement, reset, undoLastIncrement, isBusy]);

  const openDisplay = () => {
    window.open('/display', '_blank');
  };

  const handleSetValue = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 0 && num <= 2000) {
      setToValue(num);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSetValue();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 sm:gap-10 md:gap-12 p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
      
      {/* --- Affichage du compteur --- */}
      <div className="text-[6rem] sm:text-[8rem] md:text-[12rem] font-bold text-red-900 text-center leading-none">
        {count}
      </div>

      {/* --- Bouton pour ouvrir l’affichage --- */}
      <button
        onClick={openDisplay}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        Ouvrir l'affichage <ExternalLink size={20} />
      </button>

      {/* --- Bloc définition manuelle --- */}
      <div className="w-full max-w-lg bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 shadow-md">
        <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
          <Hash size={24} />
          Définir le numéro directement
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: 55"
            min="0"
            max="2000"
            className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 text-2xl sm:text-3xl font-bold text-red-900 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-400 focus:border-red-500 text-center"
            disabled={isBusy}
          />
          <button
            onClick={handleSetValue}
            disabled={isBusy || !inputValue}
            className="w-full sm:w-auto bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-xl sm:text-2xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Appliquer
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mt-3 text-center">
          Entrez un numéro entre 0 et 2000, puis cliquez sur Appliquer
        </p>
      </div>

      {/* --- Boutons navigation --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 w-full max-w-2xl justify-center">
        <button
          onClick={decrement}
          disabled={isBusy || count <= 0}
          className="flex items-center justify-center gap-3 sm:gap-4 bg-red-600 text-white px-10 sm:px-14 md:px-16 py-6 sm:py-8 rounded-2xl text-2xl sm:text-3xl md:text-4xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg w-full sm:w-auto"
        >
          <ChevronLeft size={40} className="sm:size-[48px]" />
          Retour
        </button>

        <button
          onClick={increment}
          disabled={isBusy || count >= 2000}
          className="flex items-center justify-center gap-3 sm:gap-4 bg-red-600 text-white px-10 sm:px-14 md:px-16 py-6 sm:py-8 rounded-2xl text-2xl sm:text-3xl md:text-4xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg w-full sm:w-auto"
        >
          Suivant
          <ChevronRight size={40} className="sm:size-[48px]" />
        </button>
      </div>

      {/* --- Instructions --- */}
      <div className="mt-10 sm:mt-12 text-center px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">
          Pour un affichage optimal :
        </h2>
        <ol className="text-left inline-block text-sm sm:text-base md:text-lg leading-relaxed">
          <li className="mb-1 sm:mb-2">1. Cliquez sur "Ouvrir l'affichage"</li>
          <li className="mb-1 sm:mb-2">2. Déplacez la fenêtre vers l'écran TV</li>
          <li>3. Appuyez sur F11 pour passer en plein écran</li>
        </ol>
      </div>

      {/* --- Annuler / Réinitialiser --- */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 w-full max-w-md">
        <button
          onClick={undoLastIncrement}
          disabled={isBusy || count <= 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-500 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-lg text-sm sm:text-base hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler le dernier +
        </button>
        <button
          onClick={reset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-lg text-sm sm:text-base hover:bg-gray-700 transition-colors"
        >
          Réinitialiser
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}

export default CounterPage;
