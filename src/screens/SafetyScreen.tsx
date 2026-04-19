import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { t } from '../lib/i18n';

export default function SafetyScreen() {
  const { state, dispatch } = useApp();
  const { language } = state;
  const tr = t[language];

  function dismiss() {
    dispatch({ type: 'DISMISS_CRISIS' });
    dispatch({ type: 'SET_SCREEN', payload: 'home' });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d2e1c 0%, #1a4731 60%, #2d6a4f 100%)' }}
    >
      {/* Calm background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #74C69D, transparent)', transform: 'translate(40%, -40%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #E9A720, transparent)', transform: 'translate(-40%, 40%)' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10">
        {/* Calming icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-8"
          style={{ background: 'rgba(233,167,32,0.15)', border: '2px solid rgba(233,167,32,0.3)' }}
        >
          🤝
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-3xl font-bold text-center mb-4"
          style={{ color: '#fff' }}
        >
          {tr.safetyTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base text-center leading-relaxed mb-10"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          {tr.safetyMessage}
        </motion.p>

        {/* Primary CTA */}
        <motion.a
          href="tel:114"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-5 rounded-2xl text-xl font-black text-center mb-3 block"
          style={{ background: '#E9A720', color: '#0d2e1c', boxShadow: '0 12px 32px rgba(233,167,32,0.4)' }}
        >
          📞 {tr.callNow}
        </motion.a>

        <p className="text-xs text-center mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {tr.hotlineLabel}
        </p>

        {/* Secondary resources */}
        <div className="w-full space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {tr.otherResources}
          </p>
          {[
            { name: tr.rbc, phone: tr.rbcPhone },
            { name: tr.msf, phone: tr.msfPhone },
          ].map((res) => (
            <motion.a
              key={res.phone}
              href={`tel:${res.phone}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl block"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#fff' }}>{res.name}</p>
                <p className="text-xs" style={{ color: '#74C69D' }}>{res.phone}</p>
              </div>
              <span style={{ color: '#74C69D', fontSize: 20 }}>📞</span>
            </motion.a>
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="text-sm py-2 px-6 rounded-xl"
          style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)' }}
        >
          {tr.iAmSafe}
        </button>
      </div>
    </motion.div>
  );
}
