import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { t } from '../lib/i18n';
import type { Screen } from '../types';

const NAV_ITEMS: {
  screen: Screen;
  emoji: string;
  activeEmoji: string;
  key: keyof typeof t.en;
}[] = [
  { screen: 'home',     emoji: '✅', activeEmoji: '✅', key: 'home'   },
  { screen: 'chat',     emoji: '💬', activeEmoji: '💬', key: 'chat'   },
  { screen: 'insights', emoji: '📊', activeEmoji: '📊', key: 'trends' },
  { screen: 'brief',    emoji: '📄', activeEmoji: '📄', key: 'report' },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();
  const { screen, language } = state;
  const tr = t[language];

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-end pb-safe"
      style={{ maxWidth: 430, zIndex: 50 }}
    >
      <div
        className="w-full flex items-center justify-around px-2 pt-2 pb-5"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -2px 30px rgba(0,0,0,0.08)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = screen === item.screen;
          return (
            <motion.button
              key={item.screen}
              onClick={() => dispatch({ type: 'SET_SCREEN', payload: item.screen })}
              className="flex flex-col items-center gap-1 flex-1 py-1 relative"
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Active pill background */}
              {active && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-x-2 top-0 bottom-0 rounded-2xl"
                  style={{ background: 'rgba(26,71,49,0.09)' }}
                  transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                />
              )}

              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full"
                  style={{ background: '#1a4731' }}
                  transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                />
              )}

              {/* Icon */}
              <motion.span
                className="relative z-10 text-[22px] leading-none mt-1.5"
                animate={active ? { y: [-2, 0] } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                {active ? item.activeEmoji : item.emoji}
              </motion.span>

              {/* Label */}
              <span
                className="relative z-10 text-[10px] font-semibold transition-colors leading-none"
                style={{ color: active ? '#1a4731' : '#A0AEC0' }}
              >
                {tr[item.key]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
