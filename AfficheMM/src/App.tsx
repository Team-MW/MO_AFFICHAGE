import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Beef, BarChart3 } from 'lucide-react';
import CounterPage from './pages/CounterPage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import { CounterProvider } from './context/CounterContext';

function App() {
  return (
    <CounterProvider>
      <Router>
        <div className="min-h-screen bg-red-50">
          <nav className="bg-red-800 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beef size={32} />
                <span className="text-2xl font-bold">Marché de MO</span>
                <span className="text-sm text-red-200">by Microdidac</span>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  Compteur
                </Link>
                <Link
                  to="/display"
                  className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  Affichage
                </Link>
                <Link
                  to="/admin"
                  className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <BarChart3 size={20} />
                  Admin
                </Link>
              </div>
            </div>
          </nav>

          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<CounterPage />} />
              <Route path="/display" element={<DisplayPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CounterProvider>
  );
}

export default App;