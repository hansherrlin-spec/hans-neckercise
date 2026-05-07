import { useState, useRef } from 'react';
import { DAILY_EXERCISES, GYM_DAYS, WEEKLY_SCHEDULE, CORE_RULES, AVOID_LIST } from './data';
import {
  getDailyChecks, toggleDailyCheck,
  getGymChecks, toggleGymCheck,
  getSymptoms, saveSymptoms, getSymptomHistory,
  getWeeklyTracking, saveWeeklyTracking,
  getStreak, exportData, importData,
  getDailyCompletionRate, getDailyHistory, getWeeklyHistory, getToday,
  getMonthData, getGymDayLetterForDate,
} from './storage';
import {
  CheckCircle2, Circle, Flame, Download, Upload, ChevronDown, ChevronUp,
  Dumbbell, StretchHorizontal, AlertTriangle, TrendingDown, Activity, ExternalLink,
  Calendar, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SYMPTOM_SCALES = {
  whistling: {
    label: 'Whistling Sound',
    levels: [
      { value: 1, label: 'Silent', desc: 'Not noticeable' },
      { value: 2, label: 'Faint', desc: 'Only in silence' },
      { value: 3, label: 'Present', desc: 'Noticeable during the day' },
      { value: 4, label: 'Loud', desc: 'Hard to ignore' },
    ],
  },
  pain: {
    label: 'Neck/Shoulder Pain',
    levels: [
      { value: 1, label: 'None', desc: 'Pain-free' },
      { value: 2, label: 'Mild', desc: 'Aware of it, not limiting' },
      { value: 3, label: 'Moderate', desc: 'Affects focus or movement' },
      { value: 4, label: 'Severe', desc: 'Constant, hard to function' },
    ],
  },
  jaw: {
    label: 'Jaw Tension',
    levels: [
      { value: 1, label: 'Relaxed', desc: 'No clenching or tightness' },
      { value: 2, label: 'Mild', desc: 'Occasional tightness' },
      { value: 3, label: 'Tight', desc: 'Frequent clenching' },
      { value: 4, label: 'Locked', desc: 'Constant tension or soreness' },
    ],
  },
  sleep: {
    label: 'Sleep Quality',
    levels: [
      { value: 1, label: 'Great', desc: 'Deep, uninterrupted' },
      { value: 2, label: 'OK', desc: 'Some waking, rested enough' },
      { value: 3, label: 'Poor', desc: 'Restless, woke up tired' },
      { value: 4, label: 'Bad', desc: 'Barely slept' },
    ],
  },
};

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

// --- Symptom Scale Picker (1-4) ---

function SymptomPicker({ symptomKey, value, onChange }) {
  const scale = SYMPTOM_SCALES[symptomKey];
  // For sleep, 1=best. For others, 1=best. Color accordingly.
  const getColor = (level, isSelected) => {
    if (!isSelected) return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700';
    if (symptomKey === 'sleep') {
      const colors = ['bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
        'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
        'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'];
      return colors[level - 1];
    }
    const colors = ['bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
      'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
      'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'];
    return colors[level - 1];
  };

  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{scale.label}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {scale.levels.map(level => {
          const isSelected = value === level.value;
          return (
            <button key={level.value} onClick={() => onChange(level.value)}
              className={`p-2 rounded-lg border text-center transition-all ${getColor(level.value, isSelected)}`}>
              <span className="block text-xs font-bold">{level.label}</span>
              <span className="block text-[10px] opacity-75 leading-tight mt-0.5">{level.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Daily Completion Heatmap ---

function CompletionHeatmap() {
  const history = getDailyHistory(28); // 4 weeks
  const today = getToday();

  const getCellColor = (day) => {
    if (!day.hasData) return 'bg-zinc-100 dark:bg-zinc-800';
    const pct = day.dailyCount / day.dailyTotal;
    if (pct >= 0.9) return 'bg-emerald-500';
    if (pct >= 0.7) return 'bg-emerald-400';
    if (pct >= 0.4) return 'bg-emerald-300 dark:bg-emerald-600';
    if (pct > 0) return 'bg-emerald-200 dark:bg-emerald-700';
    return 'bg-zinc-100 dark:bg-zinc-800';
  };

  // Group by week
  const weeks = [];
  for (let i = 0; i < history.length; i += 7) {
    weeks.push(history.slice(i, i + 7));
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-500" />
        Last 4 Weeks
      </h3>
      <div className="flex gap-1 mb-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-zinc-400">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1 mb-1">
          {week.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className={`w-full aspect-square rounded-sm ${getCellColor(day)} ${day.date === today ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-zinc-800' : ''}`}
                title={`${day.date}: ${day.dailyCount}/${day.dailyTotal} daily${day.gymCount ? `, ${day.gymCount} gym` : ''}`} />
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-[10px] text-zinc-400">Less</span>
        <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-600" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <span className="text-[10px] text-zinc-400">More</span>
      </div>
    </div>
  );
}

// --- Symptom Trend Chart ---

function SymptomTrend() {
  const history = getSymptomHistory(30);
  if (history.length < 2) return null;

  const width = 320;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 25 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const lines = [
    { key: 'whistling', color: '#f59e0b', label: 'Whistling' },
    { key: 'pain', color: '#ef4444', label: 'Pain' },
    { key: 'jaw', color: '#f97316', label: 'Jaw' },
    { key: 'sleep', color: '#3b82f6', label: 'Sleep' },
  ];

  const makePath = (key) => {
    return history.map((d, i) => {
      const x = padding.left + (i / (history.length - 1)) * chartW;
      const y = padding.top + ((d[key] - 1) / 3) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-500" />
        Symptom Trend
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Y axis labels */}
        {[1,2,3,4].map(v => (
          <text key={v} x={padding.left - 5} y={padding.top + ((v-1)/3) * chartH + 3}
            textAnchor="end" className="fill-zinc-400 dark:fill-zinc-500" fontSize="8">{v}</text>
        ))}
        {/* Grid lines */}
        {[1,2,3,4].map(v => (
          <line key={v} x1={padding.left} x2={width - padding.right}
            y1={padding.top + ((v-1)/3) * chartH} y2={padding.top + ((v-1)/3) * chartH}
            stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-700" />
        ))}
        {/* Lines */}
        {lines.map(l => (
          <path key={l.key} d={makePath(l.key)} fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-1">
        {lines.map(l => (
          <div key={l.key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-zinc-500">{l.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">Lower is better (1 = no symptoms)</p>
    </div>
  );
}

// --- Sections ---

function DailyPractice({ date, onUpdate }) {
  const [checks, setChecks] = useState(getDailyChecks(date));
  const completed = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((completed / DAILY_EXERCISES.length) * 100);

  const toggle = (id) => {
    const updated = toggleDailyCheck(id, date);
    setChecks({ ...updated });
    onUpdate?.();
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

function SymptomCheck({ date, onUpdate }) {
  const existing = getSymptoms(date);
  const [values, setValues] = useState(existing || { whistling: null, pain: null, jaw: null, sleep: null });
  const [saved, setSaved] = useState(!!existing);

  const update = (key, val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    // Auto-save when all 4 are set
    if (Object.values(next).every(v => v !== null)) {
      saveSymptoms(next, date);
      setSaved(true);
      onUpdate?.();
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          How are you feeling?
        </h2>
        {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>}
      </div>
      {Object.keys(SYMPTOM_SCALES).map(key => (
        <SymptomPicker key={key} symptomKey={key} value={values[key]} onChange={(v) => update(key, v)} />
      ))}
    </section>
  );
}

function GymWorkout({ dayLetter, date, onUpdate }) {
  const day = GYM_DAYS[dayLetter];
  const [checks, setChecks] = useState(getGymChecks(dayLetter, date));
  const [showStretches, setShowStretches] = useState(false);
  const allItems = [...day.exercises, ...day.stretches];
  const completed = allItems.filter(ex => checks[ex.id]).length;
  const pct = Math.round((completed / allItems.length) * 100);

  const toggle = (id) => {
    const updated = toggleGymCheck(dayLetter, id, date);
    setChecks({ ...updated });
    onUpdate?.();
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

// --- Month Calendar with Day Detail ---

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function MonthCalendar() {
  const now = new Date();
  const todayStr = getToday();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const monthData = getMonthData(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const getCellColor = (day) => {
    if (!day.hasData) return 'bg-zinc-100 dark:bg-zinc-800';
    const pct = day.dailyCount / day.dailyTotal;
    if (pct >= 0.9) return 'bg-emerald-500 text-white';
    if (pct >= 0.7) return 'bg-emerald-400 text-white';
    if (pct >= 0.4) return 'bg-emerald-300 dark:bg-emerald-600';
    if (pct > 0) return 'bg-emerald-200 dark:bg-emerald-700';
    if (day.hasSymptoms) return 'bg-blue-100 dark:bg-blue-900/40';
    return 'bg-zinc-100 dark:bg-zinc-800';
  };

  // Build grid with empty cells for offset
  const emptyCells = (monthData.firstDow + 6) % 7; // Monday-start

  const isFuture = (dateStr) => dateStr > todayStr;

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {MONTH_NAMES[month]} {year}
          </h3>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
            disabled={month === now.getMonth() && year === now.getFullYear()}>
            <ChevronRight className={`w-5 h-5 ${month === now.getMonth() && year === now.getFullYear() ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-600 dark:text-zinc-400'}`} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-zinc-400">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: emptyCells }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {monthData.days.map(day => {
            const isToday = day.date === todayStr;
            const isSelected = day.date === selectedDate;
            const future = isFuture(day.date);
            return (
              <button key={day.date}
                onClick={() => !future && setSelectedDate(isSelected ? null : day.date)}
                disabled={future}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all relative
                  ${future ? 'opacity-30 cursor-default' : 'cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-zinc-800' : ''}
                  ${isToday ? 'ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-zinc-800' : ''}
                  ${getCellColor(day)}`}>
                <span className="font-medium">{day.day}</span>
                {day.hasData && (
                  <span className="text-[8px] opacity-75">{day.dailyCount}/{day.dailyTotal}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-700" />
            <span className="text-[9px] text-zinc-400">Some</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-[9px] text-zinc-400">Most</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-[9px] text-zinc-400">All</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-100 dark:bg-blue-900/40" />
            <span className="text-[9px] text-zinc-400">Symptoms only</span>
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <DayDetail key={`${selectedDate}-${refreshKey}`} date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onUpdate={() => setRefreshKey(k => k + 1)} />
      )}
    </div>
  );
}

function DayDetail({ date, onClose, onUpdate }) {
  const d = new Date(date + 'T12:00:00');
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  const shortDay = DAY_NAMES[d.getDay()];
  const schedule = WEEKLY_SCHEDULE.find(s => s.day === shortDay);
  const gymLetter = schedule?.gym || getGymDayLetterForDate(date);
  const isToday = date === getToday();

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{dayName}</h3>
          <p className="text-xs text-zinc-500">{date}{isToday ? ' (Today)' : ''}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <SymptomCheck date={date} onUpdate={onUpdate} />
      <DailyPractice date={date} onUpdate={onUpdate} />
      {gymLetter && GYM_DAYS[gymLetter] && (
        <GymWorkout dayLetter={gymLetter} date={date} onUpdate={onUpdate} />
      )}
    </div>
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
            { id: 'calendar', label: 'Calendar' },
            { id: 'progress', label: 'Progress' },
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

            <SymptomCheck />
            <DailyPractice />
            {today.gym && <GymWorkout dayLetter={today.gym} />}
            <RulesPanel />
          </>
        )}

        {tab === 'calendar' && <MonthCalendar />}

        {tab === 'progress' && (
          <>
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

            <CompletionHeatmap />
            <SymptomTrend />

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
          </>
        )}

        {tab === 'data' && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Backup & Restore</h2>

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

            <p className="text-xs text-zinc-400 text-center">
              All data is stored locally in your browser. Export regularly as backup.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
