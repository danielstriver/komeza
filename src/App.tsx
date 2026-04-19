import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import DesktopLayout from './components/DesktopLayout';
import BottomNav from './components/BottomNav';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import InsightsScreen from './screens/InsightsScreen';
import BriefScreen from './screens/BriefScreen';
import SafetyScreen from './screens/SafetyScreen';

// Directional slide transitions
const SCREEN_ORDER: Record<string, number> = {
  onboarding: -1,
  home: 0,
  chat: 1,
  insights: 2,
  brief: 3,
  safety: 99,
};

function getTransition(current: string, prev: string | null) {
  if (!prev || prev === 'onboarding' || current === 'safety') {
    return {
      initial: { opacity: 0, y: 18, scale: 0.98 },
      animate: { opacity: 1, y: 0,  scale: 1    },
      exit:    { opacity: 0, y: -12, scale: 0.98 },
    };
  }
  const dir = (SCREEN_ORDER[current] ?? 0) > (SCREEN_ORDER[prev] ?? 0) ? 1 : -1;
  return {
    initial: { opacity: 0, x: dir * 28, scale: 0.98 },
    animate: { opacity: 1, x: 0,        scale: 1    },
    exit:    { opacity: 0, x: dir * -20, scale: 0.98 },
  };
}

let prevScreen: string | null = null;

function AppInner() {
  const { state } = useApp();
  const { screen, crisisDetected } = state;

  if (crisisDetected) return <SafetyScreen />;

  const showNav = screen !== 'onboarding';
  const tr = getTransition(screen, prevScreen);
  prevScreen = screen;

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={tr.initial}
          animate={tr.animate}
          exit={tr.exit}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col flex-1"
        >
          {screen === 'onboarding' && <OnboardingScreen />}
          {screen === 'home'       && <HomeScreen />}
          {screen === 'chat'       && <ChatScreen />}
          {screen === 'insights'   && <InsightsScreen />}
          {screen === 'brief'      && <BriefScreen />}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DesktopLayout>
        <AppInner />
      </DesktopLayout>
    </AppProvider>
  );
}
