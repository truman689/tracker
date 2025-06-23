export interface Habit {
  id: string
  name: string
  color: string
  history: { [date: string]: 'completed' | 'missed' }
  created_at: string
  schedule: Schedule
  totalCompletions: number
  currentStreak: number
  longestStreak: number
  user_id: string
}

export type Schedule =
  | { type: 'every_day' }
  | { type: 'specific_days'; days: number[] } // 0-6 for Sun-Sat
  | { type: 'every_x_days'; interval: number }; 