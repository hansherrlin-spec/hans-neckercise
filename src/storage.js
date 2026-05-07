const STORAGE_KEY = 'hans-neckercise';

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getWeekId(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { daily: {}, gym: {}, weekly: {}, symptoms: {}, streak: 0, lastCompleteDate: null };
  } catch {
    return { daily: {}, gym: {}, weekly: {}, symptoms: {}, streak: 0, lastCompleteDate: null };
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Daily checks ---

export function getDailyChecks(date) {
  const data = loadAll();
  const key = date || getToday();
  return data.daily[key] || {};
}

export function toggleDailyCheck(exerciseId) {
  const data = loadAll();
  const today = getToday();
  if (!data.daily[today]) data.daily[today] = {};
  data.daily[today][exerciseId] = !data.daily[today][exerciseId];
  updateStreak(data);
  saveAll(data);
  return data.daily[today];
}

// --- Gym checks ---

export function getGymChecks(dayLetter) {
  const data = loadAll();
  const today = getToday();
  const key = `${today}-${dayLetter}`;
  return data.gym[key] || {};
}

export function toggleGymCheck(dayLetter, exerciseId) {
  const data = loadAll();
  const today = getToday();
  const key = `${today}-${dayLetter}`;
  if (!data.gym[key]) data.gym[key] = {};
  data.gym[key][exerciseId] = !data.gym[key][exerciseId];
  saveAll(data);
  return data.gym[key];
}

// --- Symptom tracking (daily, 1-4 scale) ---

export function getSymptoms(date) {
  const data = loadAll();
  const key = date || getToday();
  return data.symptoms[key] || null;
}

export function saveSymptoms(values, date) {
  const data = loadAll();
  const key = date || getToday();
  data.symptoms[key] = { ...values, date: key };
  saveAll(data);
}

export function getSymptomHistory(days = 30) {
  const data = loadAll();
  const today = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (data.symptoms[key]) {
      result.push({ date: key, ...data.symptoms[key] });
    }
  }
  return result;
}

// --- Weekly tracking (auto-computed from daily data) ---

export function getWeeklyTracking() {
  const data = loadAll();
  const weekId = getWeekId();
  return data.weekly[weekId] || { workouts: 0, dailyPractice: 0 };
}

export function saveWeeklyTracking(tracking) {
  const data = loadAll();
  const weekId = getWeekId();
  data.weekly[weekId] = tracking;
  saveAll(data);
}

// --- Streak ---

function updateStreak(data) {
  const today = getToday();
  const todayChecks = data.daily[today] || {};
  const totalRequired = 8;
  const completed = Object.values(todayChecks).filter(Boolean).length;

  if (completed >= totalRequired) {
    if (!data.lastCompleteDate) {
      data.streak = 1;
    } else {
      const last = new Date(data.lastCompleteDate);
      const now = new Date(today);
      const diffDays = Math.round((now - last) / 86400000);
      if (diffDays === 1) {
        data.streak = (data.streak || 0) + 1;
      } else if (diffDays > 1) {
        data.streak = 1;
      }
    }
    data.lastCompleteDate = today;
  }
}

export function getStreak() {
  const data = loadAll();
  const today = getToday();
  if (!data.lastCompleteDate) return 0;
  const last = new Date(data.lastCompleteDate);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / 86400000);
  if (diffDays > 1) return 0;
  return data.streak || 0;
}

// --- History & completion tracking ---

export function getDailyHistory(days = 30) {
  const data = loadAll();
  const today = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const checks = data.daily[key] || {};
    const dailyCount = Object.values(checks).filter(Boolean).length;

    // Check if gym was done that day
    let gymCount = 0;
    let gymTotal = 0;
    for (const gymKey of Object.keys(data.gym)) {
      if (gymKey.startsWith(key)) {
        const gc = data.gym[gymKey];
        gymCount = Object.values(gc).filter(Boolean).length;
        gymTotal = Object.keys(gc).length || 1;
      }
    }

    result.push({
      date: key,
      dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
      dailyCount,
      dailyTotal: 9,
      gymCount,
      gymTotal,
      hasData: dailyCount > 0 || gymCount > 0,
    });
  }
  return result;
}

export function getDailyCompletionRate(days = 30) {
  const history = getDailyHistory(days);
  const daysWithData = history.filter(d => d.hasData);
  const completed = daysWithData.filter(d => d.dailyCount >= 7).length;
  const total = days;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getWeeklyHistory() {
  const data = loadAll();
  return Object.entries(data.weekly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, vals]) => ({ week, ...vals }));
}

// --- Export / Import ---

export function exportData() {
  const data = loadAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hans-neckercise-backup-${getToday()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveAll(data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}
