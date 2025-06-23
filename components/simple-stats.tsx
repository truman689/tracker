"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Habit } from "@/lib/types"

interface SimpleStatsProps {
  habit: Habit
}

export function SimpleStats({ habit }: SimpleStatsProps) {
  const todayStr = new Date().toISOString().split("T")[0]

  const stats = {
    totalCompletions: habit.totalCompletions,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
    completionRate:
      Object.keys(habit.history).length > 0
        ? (habit.totalCompletions / Object.keys(habit.history).length) * 100
        : 0,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCompletions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2" />
            <path d="m2.2 2.2 7.9 7.9" />
            <path d="M19 19 22 22" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak} days</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.longestStreak} days</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M22 12a10 10 0 0 0-10-10v10z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
        </CardContent>
      </Card>
    </div>
  )
} 