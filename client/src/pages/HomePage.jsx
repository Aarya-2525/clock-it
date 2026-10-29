import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { OrbitClock } from '../components/OrbitClock/OrbitClock';
import { useAuth } from '../hooks/useAuth';
import { minutesOfDay, useNow } from '../hooks/useNow';
import './HomePage.css';

const SAMPLE_DAY = [
  { id: 's1', start: 0, end: 420, label: 'Sleep', category: 'sleep', color: 'purple' },
  { id: 's2', start: 450, end: 495, label: 'Breakfast', category: 'eat', color: 'yellow' },
  { id: 's3', start: 540, end: 750, label: 'Deep work', category: 'work', color: 'sky' },
  { id: 's4', start: 600, end: 660, label: 'Standup', category: 'work', color: 'red' },
  { id: 's5', start: 750, end: 810, label: 'Lunch', category: 'eat', color: 'yellow' },
  { id: 's6', start: 810, end: 1020, label: 'Design review', category: 'work', color: 'blue' },
  { id: 's7', start: 1065, end: 1140, label: 'Gym', category: 'other', color: 'green' },
  { id: 's8', start: 1170, end: 1230, label: 'Dinner', category: 'eat', color: 'orange' },
  { id: 's9', start: 1260, end: 1350, label: 'Party', category: 'play', color: 'pink' },
  { id: 's10', start: 1380, end: 1440, label: 'Sleep', category: 'sleep', color: 'purple' },
];

const FEATURES = [
  {
    title: 'One ring, all 24 hours',
    body: 'Midnight sits at the top and noon at the bottom, so you see your whole day at a glance, not just office hours.',
  },
  {
    title: 'Overlaps get their own orbit',
    body: 'Two things at once? The second one floats out to the next ring, so every label stays readable.',
  },
  {
    title: 'Week, month and year',
    body: 'Zoom out to a grid of tiny clocks and spot the late nights, the gym streaks and the empty weekends.',
  },
];

const STEPS = [
  { title: 'Drag around the clock', body: 'Pick a range with your finger or mouse, or type exact times.' },
  { title: 'Name it and pick a colour', body: 'Use a preset like Work or Sleep, or write your own label.' },
  { title: 'Tick to save', body: 'Nothing is saved until you press ✓. Your days sync to your account.' },
];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export function HomePage() {
  const { user } = useAuth();
  const now = useNow();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <motion.p className="hero-kicker" {...rise(0)}>
            A calendar made of clocks
          </motion.p>
          <motion.h1 {...rise(0.05)}>Plan your whole day on one round clock.</motion.h1>
          <motion.p className="hero-lede" {...rise(0.1)}>
            clock it turns every day into a 24-hour dial. Drag to block time, give it a name and a colour, and see
            how your weeks really add up.
          </motion.p>
          <motion.div className="hero-cta" {...rise(0.15)}>
            {user ? (
              <Link to="/calendar" className="cta cta--solid">
                Open my calendar
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta cta--solid">
                  Create a free account
                </Link>
                <Link to="/login" className="cta cta--outline">
                  Log in
                </Link>
              </>
            )}
          </motion.div>
        </div>

        <motion.div
          className="hero-clock"
          initial={{ opacity: 0, scale: 0.94, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <OrbitClock blocks={SAMPLE_DAY} now={minutesOfDay(now)} readOnly />
        </motion.div>
      </section>

      <section className="features" aria-labelledby="features-title">
        <h2 id="features-title">Why a clock?</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <h2 id="steps-title">Block a day in three moves</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
