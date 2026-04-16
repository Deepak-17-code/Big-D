export const dummyUser = {
  id: 'u1',
  name: 'Ariana Cole',
  email: 'ariana@bigd.app',
  avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  bio: 'Strength athlete focused on progressive overload and clean nutrition.',
  goal: 'Build lean muscle and improve endurance',
  socialLinks: {
    instagram: 'https://instagram.com/ariana_bigd',
    x: 'https://x.com/ariana_bigd',
    youtube: 'https://youtube.com/@ariana_bigd',
    tiktok: '',
    website: 'https://bigd.app',
  },
}

export const dummyWorkouts = [
  {
    id: 'w1',
    title: 'Upper Body Power',
    calories: 420,
    date: '2026-04-13',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 70 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26 },
      { name: 'Seated Row', sets: 4, reps: 12, weight: 55 },
    ],
  },
  {
    id: 'w2',
    title: 'Leg Day',
    calories: 510,
    date: '2026-04-11',
    exercises: [
      { name: 'Back Squat', sets: 5, reps: 5, weight: 95 },
      { name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 90 },
      { name: 'Walking Lunges', sets: 3, reps: 12, weight: 20 },
    ],
  },
  {
    id: 'w3',
    title: 'Conditioning Circuit',
    calories: 330,
    date: '2026-04-09',
    exercises: [
      { name: 'Kettlebell Swings', sets: 4, reps: 20, weight: 24 },
      { name: 'Burpees', sets: 4, reps: 15, weight: 0 },
      { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 0 },
    ],
  },
]

export const dummyCalories = [
  { date: 'Mon', calories: 2120 },
  { date: 'Tue', calories: 1980 },
  { date: 'Wed', calories: 2250 },
  { date: 'Thu', calories: 2160 },
  { date: 'Fri', calories: 2410 },
  { date: 'Sat', calories: 2300 },
  { date: 'Sun', calories: 2050 },
]

export const dummySteps = [
  { day: 'Mon', steps: 7400 },
  { day: 'Tue', steps: 9200 },
  { day: 'Wed', steps: 8600 },
  { day: 'Thu', steps: 10300 },
  { day: 'Fri', steps: 9700 },
  { day: 'Sat', steps: 11400 },
  { day: 'Sun', steps: 8900 },
]

export const dummyFeed = [
  {
    id: 'p1',
    user: {
      name: 'Ariana Cole',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/ariana_bigd',
        x: 'https://x.com/ariana_bigd',
        youtube: 'https://youtube.com/@ariana_bigd',
        tiktok: '',
        website: 'https://bigd.app',
      },
    },
    caption: 'Hit a new PR on squats today. 95kg for 5 reps!',
    mediaUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'image',
    likes: 124,
    createdAt: '2026-04-13T11:20:00.000Z',
  },
  {
    id: 'p2',
    user: {
      name: 'Liam Stone',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/liamstonefit',
        x: '',
        youtube: '',
        tiktok: 'https://tiktok.com/@liamstonefit',
        website: '',
      },
    },
    caption: '5K run done before sunrise. Consistency over motivation.',
    mediaUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'image',
    likes: 88,
    createdAt: '2026-04-12T05:45:00.000Z',
  },
]

export const exerciseLibrary = [
  { name: 'Bench Press', group: 'Chest', defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
  {
    name: 'Incline Dumbbell Press',
    group: 'Chest',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 24,
  },
  { name: 'Cable Fly', group: 'Chest', defaultSets: 3, defaultReps: 12, defaultWeight: 18 },
  { name: 'Overhead Press', group: 'Shoulders', defaultSets: 4, defaultReps: 8, defaultWeight: 40 },
  { name: 'Lateral Raise', group: 'Shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 10 },
  { name: 'Pull Up', group: 'Back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { name: 'Barbell Row', group: 'Back', defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
  { name: 'Lat Pulldown', group: 'Back', defaultSets: 4, defaultReps: 12, defaultWeight: 45 },
  { name: 'Back Squat', group: 'Legs', defaultSets: 5, defaultReps: 5, defaultWeight: 80 },
  { name: 'Romanian Deadlift', group: 'Legs', defaultSets: 4, defaultReps: 8, defaultWeight: 75 },
  { name: 'Leg Press', group: 'Legs', defaultSets: 4, defaultReps: 12, defaultWeight: 120 },
  { name: 'Walking Lunges', group: 'Legs', defaultSets: 3, defaultReps: 12, defaultWeight: 16 },
  { name: 'Barbell Curl', group: 'Arms', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { name: 'Triceps Pushdown', group: 'Arms', defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { name: 'Plank', group: 'Core', defaultSets: 3, defaultReps: 60, defaultWeight: 0 },
  { name: 'Hanging Leg Raise', group: 'Core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
]

export const workoutTemplates = [
  {
    name: 'Push Day',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raise', 'Triceps Pushdown'],
  },
  {
    name: 'Pull Day',
    exercises: ['Pull Up', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl', 'Hanging Leg Raise'],
  },
  {
    name: 'Leg Day',
    exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunges', 'Plank'],
  },
]

export const defaultFavoriteExercises = ['Bench Press', 'Back Squat', 'Pull Up']

export const exerciseTutorials = {
  'Bench Press': {
    embedUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    cues: ['Set shoulder blades before unrack.', 'Lower to mid chest with control.', 'Drive feet and press straight up.'],
  },
  'Incline Dumbbell Press': {
    embedUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
    cues: ['Keep bench at 30 to 45 degrees.', 'Do not flare elbows too hard.', 'Squeeze chest at the top.'],
  },
  'Cable Fly': {
    embedUrl: 'https://www.youtube.com/embed/eozdVDA78K0',
    cues: ['Keep a soft bend in elbows.', 'Arc arms as if hugging a barrel.', 'Control stretch and squeeze at center.'],
  },
  'Overhead Press': {
    embedUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
    cues: ['Brace core before each rep.', 'Move head through at lockout.', 'Keep bar close to face path.'],
  },
  'Lateral Raise': {
    embedUrl: 'https://www.youtube.com/embed/kDqklk1ZESo',
    cues: ['Lead with elbows not hands.', 'Raise only to shoulder height.', 'Control lowering to avoid swinging.'],
  },
  'Pull Up': {
    embedUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    cues: ['Start from full hang.', 'Drive elbows down and back.', 'Avoid swinging and kipping.'],
  },
  'Barbell Row': {
    embedUrl: 'https://www.youtube.com/embed/vT2GjY_Umpw',
    cues: ['Hinge and keep torso stable.', 'Pull bar toward lower ribs.', 'Control negative each rep.'],
  },
  'Lat Pulldown': {
    embedUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
    cues: ['Lean back slightly.', 'Pull to upper chest.', 'Do not yank with momentum.'],
  },
  'Back Squat': {
    embedUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
    cues: ['Brace before descent.', 'Track knees over toes.', 'Drive up through mid foot.'],
  },
  'Romanian Deadlift': {
    embedUrl: 'https://www.youtube.com/embed/2SHsk9AzdjA',
    cues: ['Push hips back, soft knees.', 'Keep bar close to legs.', 'Stop when hamstrings fully loaded.'],
  },
  'Leg Press': {
    embedUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
    cues: ['Feet shoulder width.', 'Lower with controlled tempo.', 'Do not lock knees aggressively.'],
  },
  'Walking Lunges': {
    embedUrl: 'https://www.youtube.com/embed/L8fvypPrzzs',
    cues: ['Keep torso tall.', 'Front heel planted.', 'Long enough step for knee comfort.'],
  },
  'Barbell Curl': {
    embedUrl: 'https://www.youtube.com/embed/kwG2ipFRgfo',
    cues: ['Elbows stay near torso.', 'Avoid hip swing.', 'Squeeze biceps on top.'],
  },
  'Triceps Pushdown': {
    embedUrl: 'https://www.youtube.com/embed/2-LAMcpzODU',
    cues: ['Pin elbows to sides.', 'Full extension without shoulder roll.', 'Control return phase.'],
  },
  Plank: {
    embedUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
    cues: ['Neutral spine and pelvis.', 'Brace abs and glutes.', 'Breathe through the hold.'],
  },
  'Hanging Leg Raise': {
    embedUrl: 'https://www.youtube.com/embed/l4kQd9eWclE',
    cues: ['Avoid big body swing.', 'Lift with core not momentum.', 'Lower slowly with control.'],
  },
}
