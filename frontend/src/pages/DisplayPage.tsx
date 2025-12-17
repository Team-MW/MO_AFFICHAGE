import { useEffect, useRef } from 'react';
import { useCounter } from '../context/CounterContext';
import { Timer } from 'lucide-react';
import { BACKEND_URL } from '../config';

function DisplayPage() {
  const { count } = useCounter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 Joue le son à chaque changement de numéro
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch(() =>
          console.warn('⚠️ Lecture du son bloquée (interaction utilisateur requise)')
        );
    }
  }, [count]);

  // ♻️ Keep-alive: ping backend toutes les 10 minutes pour éviter l'endormissement
  useEffect(() => {
    const doPing = () => {
      fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' })
        .then(() => {})
        .catch(() => {});
    };
    // Premier ping dès le montage
    doPing();
    const intervalId = setInterval(doPing, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-50 p-2 sm:p-4 md:p-6 lg:p-8">
      {/* 🎵 Élément audio */}
      <audio ref={audioRef} src="/son.mp3" preload="auto" />

      <div className="relative bg-white p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 rounded-3xl shadow-2xl text-center w-full max-w-[1800px] mx-2 sm:mx-4 border-4 sm:border-8 border-red-800 overflow-hidden">

        {/* --- Carte mobilité --- */}
        <div className="absolute left-2 sm:left-4 md:left-6 top-2 sm:top-4 md:top-6 bg-red-100 border border-red-300 text-red-800 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2.5 md:py-3 rounded-xl font-semibold shadow-sm inline-flex flex-col items-center gap-1 sm:gap-2">
          <img
            src="/iconandicap.jpg"
            alt="Carte mobilité"
            className="h-10 sm:h-14 md:h-20 lg:h-24 xl:h-28 w-auto object-contain"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
          <span className="text-[10px] sm:text-xs md:text-sm lg:text-base">1 / personne</span>
        </div>

        {/* --- Ticket (droite, centré verticalement) --- */}
        <div className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-md border border-red-300">
          <img
            src="/ticket.png"
            alt="Icône ticket"
            className="h-16 sm:h-24 md:h-32 lg:h-40 xl:h-48 w-auto object-contain"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        </div>

        {/* --- Logo principal --- */}
        <div className="flex items-center justify-center mb-4 sm:mb-8 md:mb-12 lg:mb-16">
          <img
            src="/mo.png"
            alt="Marché de Mo'"
            className="h-16 sm:h-24 md:h-32 lg:h-40 xl:h-52 w-auto object-contain drop-shadow-md"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        </div>

        {/* --- Numéro de ticket --- */}
        <div className="flex justify-center items-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="font-black text-red-900 text-[5rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem] xl:text-[24rem] leading-none">
            {count}
          </div>
        </div>

        {/* --- Bandeau bas --- */}
        <div className="mt-4 sm:mt-6 md:mt-10 w-full flex justify-center px-2">
          <div className="bg-red-100 border border-red-300 text-red-800 px-3 sm:px-6 md:px-8 lg:px-10 py-1.5 sm:py-2.5 md:py-3.5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-2xl lg:text-3xl shadow-sm flex flex-wrap items-center gap-2 sm:gap-3 md:gap-5">
            <span className="whitespace-nowrap">Numéro de ticket Boucherie</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-red-700 font-semibold text-sm sm:text-base md:text-xl">
              <Timer size={20} className="hidden sm:inline" />
              <Timer size={16} className="sm:hidden" />
              5 minutes
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DisplayPage;
