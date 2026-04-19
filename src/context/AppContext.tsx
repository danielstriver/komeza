import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, SomaticRatings, WellnessEntry } from '../types';
import {
  loadEntries, saveEntry, loadChatHistory, saveChatHistory,
  loadOnboarded, saveOnboarded, loadLanguage, saveLanguage,
} from '../lib/storage';

const initialState: AppState = {
  language: 'en',
  screen: 'onboarding',
  hasOnboarded: false,
  entries: [],
  chatHistory: [],
  currentRatings: {},
  crisisDetected: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      saveLanguage(action.payload);
      return { ...state, language: action.payload };

    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'COMPLETE_ONBOARDING':
      saveOnboarded();
      return { ...state, hasOnboarded: true, screen: 'home' };

    case 'SET_RATING':
      return {
        ...state,
        currentRatings: { ...state.currentRatings, [action.payload.category]: action.payload.value },
      };

    case 'SAVE_ENTRY': {
      const today = new Date().toISOString().split('T')[0];
      const ratings = state.currentRatings as SomaticRatings;
      if (!ratings.energy || !ratings.sleep || !ratings.mood || !ratings.bodyPain) return state;
      const entry: WellnessEntry = {
        id: `entry-${Date.now()}`,
        date: today,
        ratings,
      };
      saveEntry(entry);
      const updated = [entry, ...state.entries.filter((e) => e.date !== today)];
      return { ...state, entries: updated, screen: 'chat' };
    }

    case 'ADD_MESSAGE': {
      const updated = [...state.chatHistory, action.payload];
      saveChatHistory(updated);
      return { ...state, chatHistory: updated };
    }

    case 'CLEAR_CHAT':
      saveChatHistory([]);
      return { ...state, chatHistory: [] };

    case 'TRIGGER_CRISIS':
      return { ...state, crisisDetected: true };

    case 'DISMISS_CRISIS':
      return { ...state, crisisDetected: false };

    case 'LOAD_ENTRIES':
      return { ...state, entries: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const onboarded = loadOnboarded();
    const language = loadLanguage();
    const entries = loadEntries();
    const chatHistory = loadChatHistory();
    return {
      ...initialState,
      language,
      hasOnboarded: onboarded,
      screen: (onboarded ? 'home' : 'onboarding') as AppState['screen'],
      entries,
      chatHistory,
    };
  });

  // Keep entries in sync
  useEffect(() => {
    const entries = loadEntries();
    dispatch({ type: 'LOAD_ENTRIES', payload: entries });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
