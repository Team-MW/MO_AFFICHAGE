import React from 'react';
import { useCounter } from '../context/CounterContext';

function DisplayPage() {
  const { count } = useCounter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-50">
      <div className="bg-white p-20 rounded-3xl shadow-2xl text-center w-full max-w-7xl mx-4 border-8 border-red-800">
        <h1 className="text-6xl font-bold text-red-800 mb-16">
          Marché de Mo'
        </h1>
        <div className="text-[24rem] leading-none font-black text-red-900 mb-8">
          {count}
        </div>
        <div className="mt-16 text-3xl font-semibold text-red-600">
          Numéro en cours Boucherie
        </div>
      </div>
    </div>
  );
}

export default DisplayPage;