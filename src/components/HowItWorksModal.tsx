import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'rw';
}

const STEPS = [
  {
    icon: '🌿',
    color: '#1a4731',
    en: { title: 'Daily Check-In', desc: 'Rate your energy, sleep, mood and body comfort in under a minute. No right or wrong answers.' },
    rw: { title: 'Genzura bya Buri Munsi', desc: 'Suzuma imbaraga, itiro, umutima n\'ubuzima bw\'umubiri mu minota mike. Nta gisubizo cyiza cyangwa cyabi.' },
  },
  {
    icon: '💬',
    color: '#E9357A',
    en: { title: 'Chat with Komeza', desc: 'Your AI companion listens warmly in English or Kinyarwanda. Share your day, ask questions, no clinical labels.' },
    rw: { title: 'Ganira na Komeza', desc: 'Inshuti yawe ya AI ikumva mu Cyongereza no mu Kinyarwanda. Sangira umunsi wawe, nta majambo ya muganga.' },
  },
  {
    icon: '📊',
    color: '#FF8C42',
    en: { title: 'Track Your Patterns', desc: 'After a few days, spot trends in your wellness and download a brief to share with a health provider.' },
    rw: { title: 'Kurikirana Imiterere Yawe', desc: 'Nyuma y\'iminsi mike, reba imiterere y\'ubuzima bwawe. Kurura raporo kugirango usangire na muganga wawe.' },
  },
  {
    icon: '🔒',
    color: '#7C5CBF',
    en: { title: 'Your data stays on this device', desc: 'Nothing is sent without your knowledge. Komeza works offline and never shares your information.' },
    rw: { title: 'Amakuru yasigara ku gikoresho cyawe', desc: 'Nta kintu na kimwe cyoherezwa utabizi. Komeza ikora nta interineti kandi ntisangira amakuru yawe.' },
  },
];

export default function HowItWorksModal({ open, onClose, language }: Props) {
  const l = language;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[59]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-[60] rounded-t-[32px] overflow-hidden"
            style={{ maxWidth: 430, background: 'var(--bg-card)', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-4 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-1)' }} />
            </div>

            {/* Header */}
            <div className="px-6 pt-3 pb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
                {l === 'rw' ? 'Uko bikorwa' : 'How it works'}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
                {l === 'rw' ? 'Inzira enye zoroshye mu minota mike' : 'Four steps to a clearer picture of your wellness'}
              </p>
            </div>

            {/* Steps */}
            <div className="px-6 pb-5 space-y-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 items-start"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: step.color + '18', border: `1.5px solid ${step.color}28` }}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                      {l === 'rw' ? step.rw.title : step.en.title}
                    </p>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-2)' }}>
                      {l === 'rw' ? step.rw.desc : step.en.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 pt-1">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-base font-bold transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #1a4731, #2d6a4f)',
                  color: '#fff',
                  boxShadow: '0 6px 24px rgba(26,71,49,0.3)',
                }}
              >
                {l === 'rw' ? 'Ntoze — Tangira →' : "Got it — let's begin →"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
