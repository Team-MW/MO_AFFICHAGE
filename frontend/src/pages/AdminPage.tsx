import React, { useState } from 'react';
import { useCounter } from '../context/CounterContext';
import { Trash2, Download } from 'lucide-react';

function AdminPage() {
  const { getStats, clearStats, exportStats } = useCounter();
  const stats = getStats();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClearStats = () => {
    setShowConfirmation(true);
  };

  const confirmClearStats = () => {
    clearStats();
    setShowConfirmation(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-red-800">Administration</h1>
        <div className="flex gap-4">
          <button
            onClick={exportStats}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={24} />
            Exporter CSV
          </button>
          <button
            onClick={handleClearStats}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={24} />
            Effacer l'historique
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Confirmation</h2>
            <p className="mb-6">Êtes-vous sûr de vouloir effacer tout l'historique des statistiques ? Cette action est irréversible.</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmClearStats}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Statistiques du mois</h2>
          <div className="space-y-2">
            <p>Suivant : <span className="font-bold">{stats.monthly.increments}</span></p>
            <p>Retour : <span className="font-bold">{stats.monthly.decrements}</span></p>
            <p>Réinitialisations : <span className="font-bold">{stats.monthly.resets}</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Statistiques de la semaine</h2>
          <div className="space-y-2">
            <p>Suivant : <span className="font-bold">{stats.weekly.increments}</span></p>
            <p>Retour : <span className="font-bold">{stats.weekly.decrements}</span></p>
            <p>Réinitialisations : <span className="font-bold">{stats.weekly.resets}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Historique détaillé</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Suivant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Retour</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Réinitialisations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.daily.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(day.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">{day.increments}</td>
                  <td className="px-6 py-4">{day.decrements}</td>
                  <td className="px-6 py-4">{day.resets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;