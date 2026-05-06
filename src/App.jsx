import { useState, useRef } from 'react';
import { DAILY_EXERCISES, GYM_DAYS, WEEKLY_SCHEDULE, CORE_RULES, AVOID_LIST } from './data';
import {
  getDailyChecks, toggleDailyCheck,
  getGymChecks, toggleGymCheck,
  getWeeklyTracking, saveWeeklyTracking,
  getStreak, exportData, importData,
  getDailyCompletionRate, getWeeklyHistory,
} from './storage';
import {
  CheckCircle2, Circle, Flame, Download, Upload, ChevronDown, ChevronUp,
  Dumbbell, StretchHorizontal, AlertTriangle, TrendingDown, Activity, ExternalLink,
} from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTodaySchedule() {
  const dayName = DAY_NAMES[new Date().getDay()];
  return WEEKLY_SCHEDULE.find(s => s.day === dayName) || WEEKLY_SCHEDULE[0];
}

function CheckItem({ checked, label, sub, onToggle, video }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
      checked
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
    }`}>
      <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
        {checked
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
        }
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="text-left flex-1">
            <span className={`font-medium text-sm ${checked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
              {label}
            </span>
          </button>
          {video && (
            <a href={video} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="Watch exercise video">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressRing({ pct, size = 48, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
        className="text-zinc-200 dark:text-zinc-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="text-emerald-500 transition-all duration-500" />
    </svg>
  );
}

function DailyPractice() {
  const [checks, setChecks] = useState(getDailyChecks());
  const completed = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((completed / DAILY_EXERCISES.length) * 100);

  const toggle = (id) => {
    const updated = toggleDailyCheck(id);
    setChecks({ ...updated });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <StretchHorizontal className="w-5 h-5 text-blue-500" />
          Daily Practice
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">{completed}/{DAILY_EXERCISES.length}</span>
          <ProgressRing pct={pct} size={32} stroke={3} />
        </div>
      </div>
      <div className="space-y-2">
        {DAILY_EXERCISES.map(ex => (
          <CheckItem
            key={ex.id}
            checked={checks[ex.id]}
            label={`${ex.name} - ${ex.dose}`}
            sub={ex.notes}
            onToggle={() => toggle(ex.id)}
            video={ex.video}
          />
        ))}
      </div>
    </section>
  );
}

function GymWorkout({ dayLetter }) {
  const day = GYM_DAYS[dayLetter];
  const [checks, setChecks] = useState(getGymChecks(dayLetter));
  const [showStretches, setShowStretches] = useState(false);
  const allItems = [...day.exercises, ...day.stretches];
  const completed = allItems.filter(ex => checks[ex.id]).length;
  const pct = Math.round((completed / allItems.length) * 100);

  const toggle = (id) => {
    const updated = toggleGymCheck(dayLetter, id);
    setChecks({ ...updated });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-violet-500" />
          {day.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">{completed}/{allItems.length}</span>
          <ProgressRing pct={pct} size={32} stroke={3} />
        </div>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
        {day.cardio}
      </p>

      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2">Strength</h3>
      <div className="space-y-2 mb-4">
        {day.exercises.map(ex => (
          <CheckItem
            key={ex.id}
            checked={checks[ex.id]}
            label={`${ex.name} - ${ex.sets}`}
            sub={ex.cue}
            onToggle={() => toggle(ex.id)}
            video={ex.video}
          />
        ))}
      </div>

      <button
        onClick={() => setShowStretches(!showStretches)}
        className="flex items-center gap-1 text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 hover:text-zinc-800 dark:hover:text-zinc-100"
      >
        Post-Workout Stretches
        {showStretches ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showStretches && (
        <div className="space-y-2">
          {day.stretches.map(ex => (
            <CheckItem
              key={ex.id}
              checked={checks[ex.id]}
              label={`${ex.name} - ${ex.dose}`}
              onToggle={() => toggle(ex.id)}
              video={ex.video}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyTracker() {
  const [tracking, setTracking] = useState(getWeeklyTracking());
  const [expanded, setExpanded] = useState(false);
  const history = getWeeklyHistory();

  const update = (field, value) => {
    const updated = { ...tracking, [field]: Number(value) };
    setTracking(updated);
    saveWeeklyTracking(updated);
  };

  const fields = [
    { key: 'whistling', label: 'Whistling Sound', color: 'text-amber-600' },
    { key: 'pain', label: 'Neck/Shoulder Pain', color: 'text-red-600' },
    { key: 'jaw', label: 'Jaw Tension', color: 'text-orange-600' },
    { key: 'sleep', label: 'Sleep Quality', color: 'text-blue-600' },
  ];

  return (
    <section>
      <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-amber-500" />
        Weekly Tracking
      </h2>

      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {f.label}
              </label>
              <span className={`text-sm font-bold ${f.color}`}>{tracking[f.key]}/10</span>
            </div>
            <input
              type="range" min="1" max="10" value={tracking[f.key]}
              onChange={e => update(f.key, e.target.value)}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Workouts (X/3)</label>
            <input type="number" min="0" max="3" value={tracking.workouts}
              onChange={e => update('workouts', e.target.value)}
              className="mt-1 w-full p-2 text-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Practice (X/7)</label>
            <input type="number" min="0" max="7" value={tracking.dailyPractice}
              onChange={e => update('dailyPractice', e.target.value)}
              className="mt-1 w-full p-2 text-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <>
          <button onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            History ({history.length} weeks)
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs text-zinc-600 dark:text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-1 text-left">Week</th>
                    <th className="py-1">Whistling</th>
                    <th className="py-1">Pain</th>
                    <th className="py-1">Jaw</th>
                    <th className="py-1">Sleep</th>
                    <th className="py-1">Gym</th>
                    <th className="py-1">Daily</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice().reverse().map(w => (
                    <tr key={w.week} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-1 text-left font-medium">{w.week}</td>
                      <td className="py-1 text-center">{w.whistling}</td>
                      <td className="py-1 text-center">{w.pain}</td>
                      <td className="py-1 text-center">{w.jaw}</td>
                      <td className="py-1 text-center">{w.sleep}</td>
                      <td className="py-1 text-center">{w.workouts}/3</td>
                      <td className="py-1 text-center">{w.dailyPractice}/7</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function RulesPanel() {
  const [show, setShow] = useState(false);
  return (
    <section>
      <button onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Core Rules & Avoid List
        {show ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {show && (
        <div className="mt-3 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Three Core Rules</h3>
            <div className="space-y-2">
              {CORE_RULES.map((rule, i) => (
                <div key={i} className="text-sm text-zinc-600 dark:text-zinc-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-700 dark:text-amber-400">{i+1}.</span> {rule}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-red-500" /> Avoid (For Now)
            </h3>
            <div className="space-y-1">
              {AVOID_LIST.map((item, i) => (
                <div key={i} className="text-sm text-zinc-600 dark:text-zinc-400 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const today = getTodaySchedule();
  const streak = getStreak();
  const dailyRate = getDailyCompletionRate();
  const fileRef = useRef(null);
  const [tab, setTab] = useState('today');
  const [importMsg, setImportMsg] = useState('');

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importData(file);
      setImportMsg('Data restored successfully!');
      setTimeout(() => { setImportMsg(''); window.location.reload(); }, 1500);
    } catch {
      setImportMsg('Invalid backup file.');
      setTimeout(() => setImportMsg(''), 3000);
    }
  };

  const dayName = DAY_NAMES[new Date().getDay()];
  const fullDate = new Date().toLocaleDateString('en-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Hans Neckercise</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{fullDate}</p>
            </div>
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: 'today', label: 'Today' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'data', label: 'Data' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6 pb-20">
        {tab === 'today' && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Today:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Daily Practice{today.gym ? ` + Gym Day ${today.gym}` : ''}
                </span>
                {today.note && <span className="text-zinc-500 text-xs">({today.note})</span>}
              </div>
            </div>

            <DailyPractice />
            {today.gym && <GymWorkout dayLetter={today.gym} />}
            <RulesPanel />
          </>
        )}

        {tab === 'weekly' && <WeeklyTracker />}

        {tab === 'data' && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Stats & Backup</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
                <p className="text-2xl font-bold text-emerald-600">{dailyRate.pct}%</p>
                <p className="text-xs text-zinc-500">Daily (30d)</p>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
                <p className="text-2xl font-bold text-violet-600">{streak}</p>
                <p className="text-xs text-zinc-500">Day Streak</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={exportData}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors">
                <Download className="w-4 h-4" /> Export Backup (JSON)
              </button>

              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                <Upload className="w-4 h-4" /> Import Backup
              </button>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

              {importMsg && (
                <p className={`text-sm text-center ${importMsg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {importMsg}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 p-3 border-b border-zinc-200 dark:border-zinc-700">
                Weekly Schedule
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {WEEKLY_SCHEDULE.map(s => (
                  <div key={s.day} className={`flex items-center justify-between px-3 py-2 text-sm ${
                    s.day === dayName ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
                  }`}>
                    <span className={`font-medium ${s.day === dayName ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {s.day}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                      Daily{s.gym ? ` + Gym ${s.gym}` : ''}{s.note ? ` (${s.note})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
