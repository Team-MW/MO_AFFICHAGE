import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Action {
  type: 'increment' | 'decrement' | 'reset';
  timestamp: string;
}

interface DailyStats {
  date: string;
  increments: number;
  decrements: number;
  resets: number;
}

interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setToValue: (value: number) => void;
  undoLastIncrement: () => void;
  isBusy: boolean;
  errorMessage: string | null;
  clearError: () => void;
  clearStats: () => void;
  exportStats: () => void;
  actions: Action[];
  getStats: () => {
    daily: DailyStats[];
    weekly: { increments: number; decrements: number; resets: number };
    monthly: { increments: number; decrements: number; resets: number };
  };
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function useCounter() {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
}

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [actions, setActions] = useState<Action[]>([]);
  const [counterId, setCounterId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [broadcastChannel, setBroadcastChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);
  const [isBroadcastReady, setIsBroadcastReady] = useState(false);

  const bellSound = new Audio('/bell.mp3');
  const incrementSound = new Audio('/son.mp3');

  // Initialize counter and subscriptions
  useEffect(() => {
    const initializeCounter = async () => {
      try {
        // Get or create counter
        const { data: counters, error: countersError } = await supabase
          .from('counters')
          .select('*')
          .order('id', { ascending: true })
          .limit(1);

        if (countersError) {
          console.error('Error fetching counters:', countersError);
          setErrorMessage('Erreur de chargement du compteur.');
          return;
        }

        let counter;
        if (!counters || counters.length === 0) {
          // Create a new counter if none exists
          const { data: newCounter, error: newCounterError } = await supabase
            .from('counters')
            .insert([{ value: 0 }])
            .select()
            .single();
          
          if (newCounterError) {
            console.error('Error creating counter:', newCounterError);
            setErrorMessage("Erreur lors de la création du compteur.");
            return;
          }
          
          counter = newCounter;
        } else {
          counter = counters[0];
        }

        if (counter) {
          console.log('Counter initialized:', counter.id);
          setCounterId(counter.id);
          setCount(counter.value);

          // Load actions
          const { data: actionsData, error: actionsError } = await supabase
            .from('counter_actions')
            .select('action_type, created_at')
            .eq('counter_id', counter.id)
            .order('created_at', { ascending: true });

          if (actionsError) {
            console.error('Error fetching actions:', actionsError);
            setErrorMessage("Erreur de chargement de l'historique.");
          } else if (actionsData) {
            setActions(actionsData.map(action => ({
              type: action.action_type as 'increment' | 'decrement' | 'reset',
              timestamp: action.created_at
            })));
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error in initialization:', error);
        setErrorMessage("Une erreur est survenue à l'initialisation.");
      }
    };

    initializeCounter();

    return undefined;
  }, []);

  // Set up realtime subscriptions after counter is initialized
  useEffect(() => {
    if (!counterId || !isInitialized) return;

    console.log('Setting up realtime subscriptions for counter:', counterId);

    // Subscribe to counter changes
    const counterSubscription = supabase
      .channel(`counter-changes-${counterId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'counters',
        filter: `id=eq.${counterId}`
      }, (payload) => {
        console.log('Counter updated via realtime:', payload.new.value);
        setCount(payload.new.value);
      })
      .subscribe((status) => {
        console.log('Counter subscription status:', status);
      });

    // Subscribe to action changes
    const actionsSubscription = supabase
      .channel(`action-changes-${counterId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'counter_actions',
        filter: `counter_id=eq.${counterId}`
      }, async (payload) => {
        console.log('New action via realtime:', payload.new);
        setActions(prev => [...prev, {
          type: payload.new.action_type as 'increment' | 'decrement' | 'reset',
          timestamp: payload.new.created_at
        }]);
        // Refresh the counter value immediately on any action to keep all clients in sync
        try {
          const { data, error } = await supabase
            .from('counters')
            .select('value')
            .eq('id', counterId!)
            .single();
          if (!error && typeof data?.value === 'number') {
            setCount(data.value);
          }
        } catch {
          // ignore transient errors
        }
      })
      .subscribe((status) => {
        console.log('Actions subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscriptions');
      counterSubscription.unsubscribe();
      actionsSubscription.unsubscribe();
    };
  }, [counterId, isInitialized]);

  // Lightweight broadcast channel for instant cross-tab sync
  useEffect(() => {
    const channel = supabase
      .channel('counter-broadcast')
      .on('broadcast', { event: 'count-updated' }, (payload) => {
        const p = payload as unknown as { payload?: { value?: number } };
        const value = p.payload?.value;
        console.log('[Display] Broadcast received, new value:', value);
        if (typeof value === 'number') {
          setCount(value);
        }
      })
      .subscribe((status) => {
        console.log('[Broadcast] subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsBroadcastReady(true);
        }
      });

    setBroadcastChannel(channel);

    return () => {
      channel.unsubscribe();
      setBroadcastChannel(null);
    };
  }, []);

  // Cross-tab sync using localStorage for same-device tabs (instant)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'counter-value' && e.newValue) {
        try {
          const newValue = parseInt(e.newValue, 10);
          if (!isNaN(newValue)) {
            console.log('[Display] localStorage sync, new value:', newValue);
            setCount(newValue);
          }
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fallback polling to keep devices in sync if realtime is delayed/missed
  useEffect(() => {
    if (!counterId || !isInitialized) return;
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('counters')
          .select('value')
          .eq('id', counterId)
          .single();
        if (!error && typeof data?.value === 'number') {
          setCount(prev => (prev !== data.value ? data.value : prev));
        }
      } catch {
        // ignore transient network errors
      }
    }, 500);
    return () => clearInterval(interval);
  }, [counterId, isInitialized]);

  // Refresh when tab/window becomes visible again (handles backgrounded tabs or resumed devices)
  useEffect(() => {
    if (!counterId || !isInitialized) return;
    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data, error } = await supabase
            .from('counters')
            .select('value')
            .eq('id', counterId)
            .single();
          if (!error && typeof data?.value === 'number') {
            setCount(data.value);
          }
        } catch {
          // ignore
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [counterId, isInitialized]);

  const updateCounter = async (newCount: number, actionType: 'increment' | 'decrement' | 'reset') => {
    if (!counterId) return;

    try {
      setIsBusy(true);
      // Update counter value
      const { error: updateError } = await supabase
        .from('counters')
        .update({ value: newCount })
        .eq('id', counterId);

      if (updateError) {
        console.error('Error updating counter:', updateError);
        setErrorMessage('Erreur lors de la mise à jour du compteur.');
        return;
      }

      // Record action - don't add to local state here, let realtime handle it
      const { error: actionError } = await supabase
        .from('counter_actions')
        .insert([{
          counter_id: counterId,
          action_type: actionType
        }]);

      if (actionError) {
        console.error('Error recording action:', actionError);
        setErrorMessage("Erreur lors de l'enregistrement de l'action.");
      }
    } catch (error) {
      console.error('Error in updateCounter:', error);
      setErrorMessage('Erreur réseau pendant la mise à jour.');
    } finally {
      setIsBusy(false);
    }
  };

  const increment = async () => {
    if (isBusy || count >= 2000) return;
    const newCount = count + 1;
    setCount(newCount);
    // Sync to localStorage for same-device tabs
    localStorage.setItem('counter-value', String(newCount));
    console.log('[Increment] Broadcasting new value:', newCount);
    await updateCounter(newCount, 'increment');
    // broadcast for instant sync
    if (isBroadcastReady && broadcastChannel) {
      try {
        await broadcastChannel.send({ type: 'broadcast', event: 'count-updated', payload: { value: newCount } });
        console.log('[Increment] Broadcast sent successfully');
      } catch (err) {
        console.log('broadcast error (increment):', err);
      }
    }
    try {
      incrementSound.currentTime = 0;
      await incrementSound.play();
    } catch (err) {
      console.log('Erreur audio son.mp3, fallback bell:', err);
      bellSound.currentTime = 0;
      bellSound.play().catch(e => console.log('Erreur audio fallback:', e));
    }
  };

  const decrement = async () => {
    if (isBusy || count <= 0) return;
    const newCount = count - 1;
    setCount(newCount);
    localStorage.setItem('counter-value', String(newCount));
    await updateCounter(newCount, 'decrement');
    if (isBroadcastReady && broadcastChannel) {
      try {
        await broadcastChannel.send({ type: 'broadcast', event: 'count-updated', payload: { value: newCount } });
      } catch (err) {
        console.log('broadcast error (decrement):', err);
      }
    }
    bellSound.currentTime = 0;
    bellSound.play().catch(err => console.log('Erreur audio:', err));
  };

  const reset = async () => {
    if (isBusy) return;
    setCount(0);
    localStorage.setItem('counter-value', '0');
    await updateCounter(0, 'reset');
    if (isBroadcastReady && broadcastChannel) {
      try {
        await broadcastChannel.send({ type: 'broadcast', event: 'count-updated', payload: { value: 0 } });
      } catch (err) {
        console.log('broadcast error (reset):', err);
      }
    }
  };

  const setToValue = async (value: number) => {
    if (isBusy || value < 0 || value > 2000) return;
    const newCount = Math.floor(value);
    setCount(newCount);
    localStorage.setItem('counter-value', String(newCount));
    console.log('[SetToValue] Setting counter to:', newCount);
    await updateCounter(newCount, 'reset');
    if (isBroadcastReady && broadcastChannel) {
      try {
        await broadcastChannel.send({ type: 'broadcast', event: 'count-updated', payload: { value: newCount } });
        console.log('[SetToValue] Broadcast sent successfully');
      } catch (err) {
        console.log('broadcast error (setToValue):', err);
      }
    }
  };

  const undoLastIncrement = async () => {
    if (!counterId || isBusy) return;
    const lastIncrement = [...actions].reverse().find(a => a.type === 'increment');
    if (!lastIncrement || count <= 0) return;

    try {
      setIsBusy(true);
      const { data: lastActionRow, error: selectError } = await supabase
        .from('counter_actions')
        .select('id, created_at')
        .eq('counter_id', counterId)
        .eq('action_type', 'increment')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (selectError) {
        console.error('Error selecting last increment action:', selectError);
        setErrorMessage("Impossible de trouver la dernière action +.");
        return;
      }

      const newCount = count - 1;
      setCount(newCount);

      const { error: updateError } = await supabase
        .from('counters')
        .update({ value: newCount })
        .eq('id', counterId);

      if (updateError) {
        console.error('Error updating counter during undo:', updateError);
        setErrorMessage('Erreur lors de la mise à jour pendant annulation.');
        return;
      }

      if (lastActionRow?.id) {
        const { error: deleteError } = await supabase
          .from('counter_actions')
          .delete()
          .eq('id', lastActionRow.id);

        if (deleteError) {
          console.error('Error deleting last increment action:', deleteError);
          setErrorMessage("Erreur lors de la suppression de l'action +.");
        } else {
          setActions(prev => {
            let removed = false;
            const copy = [...prev];
            for (let i = copy.length - 1; i >= 0; i--) {
              if (!removed && copy[i].type === 'increment') {
                copy.splice(i, 1);
                removed = true;
                break;
              }
            }
            return copy;
          });
        }
      }
    } catch (error) {
      console.error('Error in undoLastIncrement:', error);
      setErrorMessage("Erreur réseau pendant l'annulation du dernier +.");
    } finally {
      setIsBusy(false);
    }
  };

  const clearStats = async () => {
    if (!counterId) return;

    try {
      const { error } = await supabase
        .from('counter_actions')
        .delete()
        .eq('counter_id', counterId);

      if (error) {
        console.error('Error clearing stats:', error);
        setErrorMessage("Erreur pendant l'effacement de l'historique.");
      } else {
        setActions([]);
      }
    } catch (error) {
      console.error('Error in clearStats:', error);
      setErrorMessage('Erreur réseau pendant la suppression.');
    }
  };

  const exportStats = () => {
    const stats = getStats();
    const now = new Date().toISOString().split('T')[0];
    
    const csvContent = [
      'Type de statistiques,Période,Suivant,Retour,Réinitialisations',
      `Mensuel,${now},${stats.monthly.increments},${stats.monthly.decrements},${stats.monthly.resets}`,
      `Hebdomadaire,${now},${stats.weekly.increments},${stats.weekly.decrements},${stats.weekly.resets}`,
      '',
      'Date,Suivant,Retour,Réinitialisations',
      ...stats.daily.map(day => 
        `${day.date},${day.increments},${day.decrements},${day.resets}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistiques_${now}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyStats = actions.reduce((acc: { [key: string]: DailyStats }, action) => {
      const date = action.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, increments: 0, decrements: 0, resets: 0 };
      }
      acc[date][`${action.type}s`]++;
      return acc;
    }, {});

    const weekly = {
      increments: 0,
      decrements: 0,
      resets: 0
    };
    const monthly = {
      increments: 0,
      decrements: 0,
      resets: 0
    };

    actions.forEach(action => {
      const actionDate = new Date(action.timestamp);
      if (actionDate >= startOfWeek) {
        weekly[`${action.type}s`]++;
      }
      if (actionDate >= startOfMonth) {
        monthly[`${action.type}s`]++;
      }
    });

    return {
      daily: Object.values(dailyStats).sort((a, b) => b.date.localeCompare(a.date)),
      weekly,
      monthly
    };
  };

  const clearError = () => setErrorMessage(null);

  return (
    <CounterContext.Provider value={{ 
      count, 
      increment, 
      decrement, 
      reset,
      setToValue, 
      undoLastIncrement,
      isBusy,
      errorMessage,
      clearError,
      clearStats, 
      exportStats,
      actions, 
      getStats 
    }}>
      {children}
    </CounterContext.Provider>
  );
}