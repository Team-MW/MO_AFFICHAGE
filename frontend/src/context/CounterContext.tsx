import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../config';

// 🔗 URL du backend hébergé (Render)

// 🔗 Connexion au backend
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'], // compatibilité Render
});

// ✅ Types pour TypeScript
interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setToValue: (value: number) => void;
  undoLastIncrement: () => void;
  isBusy: boolean;
}

// 📦 Création du contexte
const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState<number>(0);
  const [isBusy, setIsBusy] = useState(false);
  const previousValue = useRef<number>(0);

  // 🔄 Récupération initiale + écoute en temps réel
  useEffect(() => {
    // Quand on reçoit une mise à jour depuis le serveur
    socket.on('countUpdated', (newCount: number) => {
      setCount(newCount);
      setIsBusy(false);
    });

    // ✅ Récupération initiale du compteur depuis le backend
    fetch(`${BACKEND_URL}/count`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === 'number') {
          setCount(data.count);
        }
      })
      .catch((err) => console.error('Erreur fetch count:', err));

    // Nettoyage du listener à la déconnexion
    return () => {
      socket.off('countUpdated');
    };
  }, []);

  // 🔢 Fonctions d’action
  const increment = () => {
    if (isBusy) return;
    previousValue.current = count;
    setIsBusy(true);
    socket.emit('increment');
  };

  const decrement = () => {
    if (isBusy || count <= 0) return;
    previousValue.current = count;
    setIsBusy(true);
    socket.emit('decrement');
  };

  const reset = () => {
    if (isBusy) return;
    previousValue.current = count;
    setIsBusy(true);
    socket.emit('reset');
  };

  const setToValue = (value: number) => {
    if (isBusy) return;
    previousValue.current = count;
    setIsBusy(true);
    socket.emit('setValue', value);
  };

  const undoLastIncrement = () => {
    // Permet d'annuler la dernière incrémentation
    setToValue(previousValue.current);
  };

  // 📦 Fournir les valeurs et fonctions à toute l’app
  return (
    <CounterContext.Provider
      value={{
        count,
        increment,
        decrement,
        reset,
        setToValue,
        undoLastIncrement,
        isBusy,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
};

// 🪄 Hook pour utiliser le contexte facilement
export const useCounter = (): CounterContextType => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter doit être utilisé à l’intérieur de CounterProvider');
  }
  return context;
};
