import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { t } from '../lib/i18n';
import { generateResilienceBrief } from '../lib/pdf';

function avg(vals: number[]): string {
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function ScoreBadge({ value, color }: { value: string; color: string }) {
  const num = parseFloat(value);
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
      style={{ background: color + '15', color }}
    >
      {isNaN(num) ? '—' : value}
    </div>
  );
}

export default function BriefScreen() {
  const { state } = useApp();
  const { language, entries } = state;
  const tr = t[language];
  const [generating, setGenerating] = useState(false);

  const week = entries.slice(0, 7);
  const energies = week.map((e) => e.ratings.energy);
  const sleeps = week.map((e) => e.ratings.sleep);
  const moods = week.map((e) => e.ratings.mood);
  const pains = week.map((e) => e.ratings.bodyPain);
  const painDays = pains.filter((p) => p >= 3).length;

  const stats = [
    { label: tr.avgEnergy,  value: avg(energies), color: '#FF8C42', emoji: '⚡' },
    { label: tr.avgSleep,   value: avg(sleeps),   color: '#7C5CBF', emoji: '🌙' },
    { label: tr.avgMood,    value: avg(moods),    color: '#E9357A', emoji: '☀️' },
    { label: tr.painDays,   value: String(painDays), color: '#3B82F6', emoji: '🫂' },
  ];

  function handleDownload() {
    setGenerating(true);
    setTimeout(() => {
      generateResilienceBrief(entries, language);
      setGenerating(false);
    }, 400);
  }

  const weekStart = week.length
    ? new Date(week[week.length - 1].date + 'T12:00:00').toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })
    : '—';
  const weekEnd = week.length
    ? new Date(week[0].date + 'T12:00:00').toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })
    : '—';

  const hasData = week.length >= 3;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)', paddingBottom: '90px' }}>
      {/* Header */}
      <div
        className="px-6 pt-14 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #0d2e1c, #1a4731)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #E9A720, transparent)', transform: 'translate(30%, -30%)' }} />
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>{tr.briefTitle}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{tr.briefSub}</p>
        {week.length > 0 && (
          <p className="text-xs mt-2" style={{ color: '#74C69D' }}>
            {weekStart} — {weekEnd}
          </p>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {!hasData ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-base mb-2 font-semibold" style={{ color: 'var(--text-1)' }}>
              {language === 'rw' ? 'Nta makuru ahagije' : 'Not enough data yet'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {language === 'rw' ? 'Injira iminsi 3 kugirango ubone raporo yawe.' : 'Check in for at least 3 days to generate your brief.'}
            </p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl p-4 flex items-center gap-4 transition-transform hover:scale-[1.02]"
                  style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
                >
                  <ScoreBadge value={s.value} color={s.color} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{s.label}</p>
                    <p className="text-2xl">{s.emoji}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* What this means */}
            <div className="rounded-3xl p-5" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>
                {language === 'rw' ? 'Ibi bisobanura iki?' : 'What this means'}
              </p>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-1)' }}>
                {parseFloat(avg(energies)) < 3 && (
                  <p>⚡ {language === 'rw' ? 'Imbaraga zari nke cyane. Amahugurwa n\'imiturire birashobora kufasha.' : 'Energy has been consistently below average. Rest and nutrition are worth reviewing.'}</p>
                )}
                {parseFloat(avg(sleeps)) < 3 && (
                  <p>🌙 {language === 'rw' ? 'Itiro ntiryari ryiza. Ongera ugerageze gutuza mbere yo kuryama.' : 'Sleep quality was below optimal. Consider a calming evening routine.'}</p>
                )}
                {parseFloat(avg(moods)) < 2.5 && (
                  <p>☀️ {language === 'rw' ? 'Umutima wagaragaye nke. Raporo iyi irashobora kufasha muganga wawe.' : 'Mood scores were low. This brief may support a conversation with a health provider.'}</p>
                )}
                {painDays >= 3 && (
                  <p>🫂 {language === 'rw' ? `Ububabare bw'umubiri bwaravuzwe iminsi ${painDays}. Bifite akamaro kuvuga na muganga.` : `Body discomfort reported on ${painDays} days. Worth discussing with a clinician.`}</p>
                )}
                {parseFloat(avg(energies)) >= 4 && parseFloat(avg(moods)) >= 4 && (
                  <p>✨ {language === 'rw' ? 'Imyigire myiza muri icyi cyumweru. Komeza!' : 'Strong week overall — you are doing well. Keep it up!'}</p>
                )}
              </div>
            </div>

            {/* Recent log preview */}
            <div className="rounded-3xl p-5" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>
                {language === 'rw' ? 'Ibyanditswe 7 bishize' : 'Last 7 check-ins'}
              </p>
              <div className="space-y-2">
                {week.map((entry) => {
                  const label = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <div key={entry.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl" style={{ background: 'var(--bg-app)' }}>
                      <span style={{ color: 'var(--text-2)', width: 80 }}>{label}</span>
                      <div className="flex gap-3">
                        <span style={{ color: '#FF8C42' }}>⚡{entry.ratings.energy}</span>
                        <span style={{ color: '#7C5CBF' }}>🌙{entry.ratings.sleep}</span>
                        <span style={{ color: '#E9357A' }}>☀️{entry.ratings.mood}</span>
                        <span style={{ color: '#3B82F6' }}>🫂{entry.ratings.bodyPain}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-3 rounded-2xl text-xs text-center" style={{ background: '#FFF9E6', border: '1px solid #E9A72030', color: '#92600A' }}>
              {tr.disclaimer}
            </div>

            {/* Download button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleDownload}
              disabled={generating}
              className="w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #1a4731, #2d6a4f)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(26,71,49,0.3)',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? (
                <><span className="animate-spin">⏳</span> {tr.generating}</>
              ) : (
                <>📄 {tr.downloadPDF}</>
              )}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
