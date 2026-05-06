function ytSearch(q) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' exercise form')}`;
}

export const DAILY_EXERCISES = [
  { id: 'chin-tucks', name: 'Chin Tucks', dose: '10 reps, 2-3x/day', notes: 'Pull chin straight back, double-chin style. Strengthens deep neck flexors. Most important single exercise.', video: ytSearch('chin tuck exercise') },
  { id: 'pec-stretch', name: 'Doorway Pec Stretch', dose: '1 min each side', notes: 'Arm on doorframe, step forward, feel chest open', video: ytSearch('doorway pec stretch') },
  { id: 'tennis-ball', name: 'Suboccipital Tennis Ball Release', dose: '2-3 min', notes: 'Two tennis balls in a sock, lie on back, balls at base of skull', video: ytSearch('suboccipital release tennis ball') },
  { id: 'wall-angels', name: 'Wall Angels', dose: '10 slow reps', notes: 'Back against wall, arms in goalpost position, slide up and down', video: ytSearch('wall angels exercise') },
  { id: 'upper-trap', name: 'Upper Trap Stretch', dose: '30 sec each side', notes: 'Ear to shoulder, gentle', video: ytSearch('upper trapezius stretch') },
  { id: 'levator', name: 'Levator Scapulae Stretch', dose: '30 sec each side', notes: 'Look toward armpit, gentle pull on back of head', video: ytSearch('levator scapulae stretch') },
  { id: 'cat-cow', name: 'Cat-Cow', dose: '10 slow reps', notes: 'Spinal mobility', video: ytSearch('cat cow stretch') },
  { id: 'jaw-check', name: 'Jaw Awareness Check', dose: 'Throughout day', notes: 'Tongue on roof of mouth, teeth apart, lips closed', video: ytSearch('jaw relaxation posture tongue position') },
  { id: 'heat', name: 'Heat on Neck/Jaw (Evening)', dose: '10-15 min', notes: 'Optional but helpful for releasing tension', video: null },
];

export const GYM_DAYS = {
  A: {
    title: 'Day A - Lower Body + Pulling (Posture Day)',
    cardio: 'Bike or elliptical, 15-20 min. 5 min easy warmup, then alternate 1 min moderate / 1 min easy. Avoid rowing machine.',
    exercises: [
      { id: 'a-goblet-squat', name: 'Goblet Squats', sets: '3 x 10', cue: 'Chest up, knees track over toes', video: ytSearch('goblet squat form') },
      { id: 'a-rdl', name: 'Romanian Deadlifts', sets: '3 x 8', cue: 'Hinge at hips, soft knees, neutral spine', video: ytSearch('romanian deadlift dumbbell') },
      { id: 'a-cable-row', name: 'Seated Cable Row', sets: '3 x 12', cue: 'Pull shoulder blades down BEFORE pulling with arms', video: ytSearch('seated cable row form') },
      { id: 'a-face-pull', name: 'Face Pulls', sets: '3 x 15', cue: 'Pull rope to forehead, elbows high, external rotation', video: ytSearch('face pull cable exercise') },
      { id: 'a-dead-bug', name: 'Dead Bug', sets: '3 x 10/side', cue: 'Lower back pressed to floor, slow controlled', video: ytSearch('dead bug exercise') },
    ],
    stretches: [
      { id: 'a-s-pec', name: 'Doorway Pec Stretch', dose: '30 sec each side', video: ytSearch('doorway pec stretch') },
      { id: 'a-s-trap', name: 'Upper Trap Stretch', dose: '30 sec each side', video: ytSearch('upper trapezius stretch') },
      { id: 'a-s-levator', name: 'Levator Scapulae Stretch', dose: '30 sec each side', video: ytSearch('levator scapulae stretch') },
      { id: 'a-s-thread', name: 'Thread the Needle', dose: '5 reps each side', video: ytSearch('thread the needle stretch') },
      { id: 'a-s-child', name: "Child's Pose (arms to each side)", dose: '30 sec each side', video: ytSearch('child pose lateral stretch') },
      { id: 'a-s-catcow', name: 'Cat-Cow', dose: '10 slow reps', video: ytSearch('cat cow stretch') },
      { id: 'a-s-tennis', name: 'Suboccipital Tennis Ball Release', dose: '2-3 min', video: ytSearch('suboccipital release tennis ball') },
    ],
  },
  B: {
    title: 'Day B - Lower Body + Horizontal Push/Pull',
    cardio: 'Bike or elliptical, 15-20 min. 5 min easy warmup, then alternate 1 min moderate / 1 min easy. Avoid rowing machine.',
    exercises: [
      { id: 'b-lunge', name: 'Walking Lunges', sets: '3 x 10/leg', cue: 'Long step, knee tracks forward', video: ytSearch('walking lunges form') },
      { id: 'b-hip-thrust', name: 'Hip Thrusts / Glute Bridges', sets: '3 x 12', cue: 'Squeeze glutes hard at top, ribs down', video: ytSearch('hip thrust glute bridge') },
      { id: 'b-row', name: 'Chest-Supported Row / Inverted Row', sets: '3 x 10', cue: 'Pull to lower chest, squeeze shoulder blades', video: ytSearch('chest supported row') },
      { id: 'b-pushup', name: 'Push-ups (or incline)', sets: '3 x 8-12', cue: 'Shoulder blades retracted, body straight', video: ytSearch('push up proper form') },
      { id: 'b-face-pull', name: 'Face Pulls', sets: '3 x 15', cue: 'Every gym day', video: ytSearch('face pull cable exercise') },
      { id: 'b-bird-dog', name: 'Bird Dog', sets: '3 x 8/side', cue: 'Slow, no hip rotation', video: ytSearch('bird dog exercise') },
    ],
    stretches: [
      { id: 'b-s-pec', name: 'Doorway Pec Stretch', dose: '30 sec each side', video: ytSearch('doorway pec stretch') },
      { id: 'b-s-trap', name: 'Upper Trap Stretch', dose: '30 sec each side', video: ytSearch('upper trapezius stretch') },
      { id: 'b-s-levator', name: 'Levator Scapulae Stretch', dose: '30 sec each side', video: ytSearch('levator scapulae stretch') },
      { id: 'b-s-thread', name: 'Thread the Needle', dose: '5 reps each side', video: ytSearch('thread the needle stretch') },
      { id: 'b-s-child', name: "Child's Pose (arms to each side)", dose: '30 sec each side', video: ytSearch('child pose lateral stretch') },
      { id: 'b-s-catcow', name: 'Cat-Cow', dose: '10 slow reps', video: ytSearch('cat cow stretch') },
      { id: 'b-s-tennis', name: 'Suboccipital Tennis Ball Release', dose: '2-3 min', video: ytSearch('suboccipital release tennis ball') },
    ],
  },
  C: {
    title: 'Day C - Full Body + Mobility Focus',
    cardio: 'Bike or elliptical, 15-20 min. 5 min easy warmup, then alternate 1 min moderate / 1 min easy. Avoid rowing machine.',
    exercises: [
      { id: 'c-goblet-squat', name: 'Goblet Squats', sets: '3 x 10', cue: 'Chest up', video: ytSearch('goblet squat form') },
      { id: 'c-sl-rdl', name: 'Single-Leg Romanian Deadlifts', sets: '3 x 8/leg', cue: 'Balance challenge, slow', video: ytSearch('single leg romanian deadlift') },
      { id: 'c-lat-pull', name: 'Lat Pulldown (wide grip, to chest)', sets: '3 x 10', cue: "Don't shrug - shoulders down first", video: ytSearch('lat pulldown wide grip form') },
      { id: 'c-band-pull', name: 'Band Pull-Aparts', sets: '3 x 20', cue: 'Squeeze shoulder blades together', video: ytSearch('band pull apart') },
      { id: 'c-face-pull', name: 'Face Pulls', sets: '3 x 15', cue: 'Every gym day', video: ytSearch('face pull cable exercise') },
      { id: 'c-pallof', name: 'Pallof Press', sets: '3 x 10/side', cue: 'Anti-rotation core work', video: ytSearch('pallof press exercise') },
    ],
    stretches: [
      { id: 'c-s-pec', name: 'Doorway Pec Stretch', dose: '30 sec each side', video: ytSearch('doorway pec stretch') },
      { id: 'c-s-trap', name: 'Upper Trap Stretch', dose: '30 sec each side', video: ytSearch('upper trapezius stretch') },
      { id: 'c-s-levator', name: 'Levator Scapulae Stretch', dose: '30 sec each side', video: ytSearch('levator scapulae stretch') },
      { id: 'c-s-thread', name: 'Thread the Needle', dose: '5 reps each side', video: ytSearch('thread the needle stretch') },
      { id: 'c-s-child', name: "Child's Pose (arms to each side)", dose: '30 sec each side', video: ytSearch('child pose lateral stretch') },
      { id: 'c-s-catcow', name: 'Cat-Cow', dose: '10 slow reps', video: ytSearch('cat cow stretch') },
      { id: 'c-s-tennis', name: 'Suboccipital Tennis Ball Release', dose: '2-3 min', video: ytSearch('suboccipital release tennis ball') },
    ],
  },
};

export const WEEKLY_SCHEDULE = [
  { day: 'Mon', daily: true, gym: 'A' },
  { day: 'Tue', daily: true, gym: null },
  { day: 'Wed', daily: true, gym: 'B' },
  { day: 'Thu', daily: true, gym: null },
  { day: 'Fri', daily: true, gym: 'C' },
  { day: 'Sat', daily: true, gym: null },
  { day: 'Sun', daily: true, gym: null, note: 'Longer stretch session' },
];

export const CORE_RULES = [
  'On every pulling exercise: shoulders DOWN before you pull with arms. Shrugging into rows and pulldowns reinforces the exact pattern causing pain.',
  "Don't chase soreness. Goal is consistency and quality, not destruction.",
  'Track the whistling sound weekly. If daily work is helping, it should slowly reduce.',
];

export const AVOID_LIST = [
  'Overhead pressing (shoulder press, military press, Arnold press)',
  'Shrugs',
  'Upright rows',
  'Heavy deadlifts from the floor (until posture work catches up)',
  'Rowing machine for cardio',
  'Heavy bench press with retracted shoulders held aggressively',
];
