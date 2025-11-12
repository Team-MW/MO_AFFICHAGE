import { useCounter } from '../context/CounterContext';
import { Timer } from 'lucide-react';

function DisplayPage() {
  const { count } = useCounter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-50 p-4 sm:p-6 md:p-8">
      <div className="relative bg-white p-6 sm:p-10 md:p-16 xl:p-20 rounded-3xl shadow-2xl text-center w-full max-w-7xl mx-2 sm:mx-4 border-4 sm:border-8 border-red-800">

        {/* --- Carte mobilité (gauche) --- */}
        <div className="absolute left-3 sm:left-4 md:left-6 top-3 sm:top-4 md:top-6 bg-red-100 border border-red-300 text-red-800 px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-xl font-semibold shadow-sm inline-flex flex-col items-center gap-1 sm:gap-2">
          <img
            src="/iconandicap.jpg"
            alt="Carte mobilité"
            className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-xs sm:text-sm md:text-base">1 / personne</span>
        </div>

        {/* --- Ticket (bas droite) --- */}
        <div className="absolute right-3 sm:right-4 md:right-6 bottom-3 sm:bottom-4 md:bottom-6 bg-white/70 rounded-xl p-2 sm:p-3 shadow-md border border-red-200">
          <img
            src="/ticket.png"
            alt="Icône ticket"
            className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* --- Logo principal --- */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
          <img
            src="/mo.png"
            alt="Marché de Mo'"
            className="h-16 sm:h-24 md:h-32 lg:h-40 xl:h-48 w-auto drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* --- Numéro de ticket --- */}
        <div className="mb-6 sm:mb-8">
          <div className="leading-none font-black text-red-900 text-7xl sm:text-8xl md:text-[14rem] lg:text-[20rem] xl:text-[24rem]">
            {count}
          </div>
        </div>

        {/* --- Bandeau bas --- */}
        <div className="mt-8 sm:mt-12 md:mt-16 w-full flex justify-center px-2">
          <div className="bg-red-100 border border-red-300 text-red-800 px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-bold text-lg sm:text-xl md:text-2xl shadow-sm flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
            <span className="whitespace-nowrap">Numéro de ticket Boucherie</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-red-700 font-semibold text-base sm:text-lg md:text-xl">
              <Timer size={24} className="hidden sm:inline" />
              <Timer size={20} className="sm:hidden" />
              5 minutes
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DisplayPage;
