"use client"

import { useState, useEffect } from "react"
import { Plus, LogOut, Calendar, TrendingUp, Target, Zap, MoreHorizontal, Trash2, CheckCircle2, Flame, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { HabitCard } from "@/components/habit-card"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Session } from "@supabase/supabase-js"
import { Habit } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type TimePeriod = "grid"

interface SprintProgress {
  completed: number
  total: number
  daysLeft: number
  percentage: number
  currentStreak: number
}

function calculateSprintProgress(habit: Habit): SprintProgress {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startDate = new Date(habit.created_at)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 90)
  
  const totalDays = 90
  const daysElapsed = Math.min(Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), totalDays)
  const daysLeft = Math.max(totalDays - daysElapsed, 0)
  
  let completed = 0
  let total = 0
  let currentStreak = 0
  let streakBroken = false
  
  for (let i = 0; i < daysElapsed; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const isScheduled = isScheduledForHabit(habit, date)
    if (isScheduled) {
      total++
      const dateStr = date.toISOString().split('T')[0]
      const isCompleted = habit.history[dateStr] === 'completed'
      
      if (isCompleted) {
        completed++
        if (!streakBroken) {
          currentStreak++
        }
      } else {
        streakBroken = true
      }
    }
  }
  
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return {
    completed,
    total,
    daysLeft,
    percentage,
    currentStreak
  }
}

function isScheduledForHabit(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay()
  switch (habit.schedule.type) {
    case 'every_day':
      return true
    case 'specific_days':
      return habit.schedule.days.includes(dayOfWeek)
    case 'every_x_days':
      const startDate = new Date(habit.created_at)
      const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff % habit.schedule.interval === 0
    default:
      return false
  }
}

function DashboardHabitCard({ habit, selectedDate, onToggle, onDelete }: {
  habit: Habit;
  selectedDate: Date;
  onToggle: (habitId: string, date: Date) => void;
  onDelete: (habitId: string) => void;
}) {
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const isCompleted = habit.history[selectedDateStr] === 'completed';
  const stats = calculateSprintProgress(habit);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isFuture = selectedDate > today;
  
  const colorHex = habit.color?.replace('bg-blue-500', '#3b82f6')
    .replace('bg-green-500', '#22c55e')
    .replace('bg-purple-500', '#a855f7')
    .replace('bg-red-500', '#ef4444')
    .replace('bg-orange-500', '#f97316')
    .replace('bg-pink-500', '#ec4899')
    .replace('bg-cyan-500', '#06b6d4')
    .replace('bg-amber-500', '#f59e0b') || '#3b82f6';
  
  const completedColor = '#22c55e'; // Green for completed state

  const isScheduledForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    switch (habit.schedule.type) {
      case 'every_day':
        return true;
      case 'specific_days':
        return habit.schedule.days.includes(dayOfWeek);
      case 'every_x_days':
        const startDate = new Date(habit.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % habit.schedule.interval === 0;
      default:
        return false;
    }
  };

  const scheduled = isScheduledForDate(selectedDate);

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-0 bg-card shadow-md hover:shadow-card-hover">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <button
              onClick={() => onToggle(habit.id, selectedDate)}
              disabled={!scheduled || isFuture}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation",
                scheduled && !isFuture ? (
                  isCompleted
                    ? "bg-green-500 border-green-500 shadow-lg"
                    : "bg-background border-border hover:border-ring"
                ) : "bg-background border-border/50 opacity-50 cursor-not-allowed"
              )}
            >
              {/* Empty content - the visual is handled by background colors */}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground truncate pr-2">{habit.name}</h3>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                {scheduled ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {isToday ? 'Scheduled Today' : isFuture ? 'Scheduled' : 'Was Scheduled'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                    Not Scheduled
                  </Badge>
                )}
                {stats.currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-semibold">{stats.currentStreak}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 touch-manipulation">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-error-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Habit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Sprint Progress for Mobile */}
        <div className="block sm:hidden">
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">Sprint Progress</span>
              <span className="text-xs font-bold text-foreground">{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.completed} completed</span>
              <span>{stats.daysLeft} days left</span>
            </div>
          </div>
        </div>

        {/* Sprint Progress for Desktop */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Sprint Progress</span>
              <Badge variant="outline" className="text-xs">{stats.percentage}%</Badge>
            </div>
            <div className="text-xs text-muted-foreground">{stats.completed}/{stats.total} completed</div>
          </div>
          <Progress value={stats.percentage} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.daysLeft} days remaining</span>
            <span>{stats.currentStreak > 0 ? `${stats.currentStreak} day streak` : 'No current streak'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Grid View Component  
const GridView = ({ habits, onToggle, onAddHabit, onDeleteHabit }: { 
  habits: Habit[], 
  onToggle: (habitId: string, date: Date) => void,
  onAddHabit: (habitData: Omit<Habit, "id" | "history" | "totalCompletions" | "currentStreak" | "longestStreak" | "created_at" | "user_id">) => Promise<void>,
  onDeleteHabit: (habitId: string) => Promise<void>
}) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Generate 90 days starting from the earliest habit creation date or today
  const earliestDate = habits.length > 0 
    ? new Date(Math.min(...habits.map(h => new Date(h.created_at).getTime())))
    : today
  
  const startDate = new Date(earliestDate)
  startDate.setHours(0, 0, 0, 0)
  
  const days: Date[] = []
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  const isScheduledForDate = (habit: Habit, date: Date): boolean => {
    const dayOfWeek = date.getDay()
    switch (habit.schedule.type) {
      case 'every_day':
        return true
      case 'specific_days':
        return habit.schedule.days.includes(dayOfWeek)
      case 'every_x_days':
        const habitStartDate = new Date(habit.created_at)
        const daysDiff = Math.floor((date.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff >= 0 && daysDiff % habit.schedule.interval === 0
      default:
        return false
    }
  }

  const getDayStatus = (habit: Habit, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const isScheduled = isScheduledForDate(habit, date)
    const isCompleted = habit.history[dateStr] === 'completed'
    const isPast = date < today && date.toDateString() !== today.toDateString()
    const isToday = date.toDateString() === today.toDateString()
    const isFuture = date > today
    
    if (!isScheduled) return 'not_scheduled'
    if (isCompleted) return 'completed'
    if (isPast) return 'missed'
    if (isToday) return 'available'
    if (isFuture) return 'future'
    return 'available'
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700'
      case 'missed':
        return 'bg-red-600 hover:bg-red-700'
      case 'available':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'future':
        return 'bg-white border border-gray-200 hover:bg-gray-50'
      case 'not_scheduled':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Calculate overall stats
  const overallStats = habits.reduce((acc, habit) => {
    days.forEach(day => {
      const status = getDayStatus(habit, day)
      if (status === 'completed') acc.completed++
      else if (status === 'missed') acc.missed++
    })
    return acc
  }, { completed: 0, missed: 0 })

  const totalOpportunities = overallStats.completed + overallStats.missed
  const successRate = totalOpportunities > 0 ? Math.round((overallStats.completed / totalOpportunities) * 100) : 0

  if (habits.length === 0) {
          return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-space-grotesk">90days.</h1>
          <p className="text-muted-foreground">Build lasting habits with the power of consistency</p>
                </div>

        {/* Empty State */}
        <div className="text-center py-20">
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center shadow-lg">
              <Target className="w-16 h-16 text-primary" />
                </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce" />
      </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 font-space-grotesk">Start Your 90-Day Journey</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create your first habit and watch your progress unfold in a beautiful grid view.</p>
          <AddHabitDialog onAddHabit={onAddHabit}>
            <Button className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-6 w-6" />
              Create Your First Habit
            </Button>
          </AddHabitDialog>
    </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-12 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{overallStats.completed}</div>
          <div className="text-sm text-muted-foreground font-medium">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">{overallStats.missed}</div>
          <div className="text-sm text-muted-foreground font-medium">Missed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">{successRate}%</div>
          <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
        </div>
      </div>

      {/* Add Habit Button */}
      <div className="flex justify-center">
        <AddHabitDialog onAddHabit={onAddHabit}>
          <Button className="btn-primary px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="mr-2 h-5 w-5" />
            Add Habit
          </Button>
        </AddHabitDialog>
          </div>
          
      {/* Main Grid */}
      <div className="bg-card rounded-3xl p-8 shadow-xl border border-border overflow-x-auto mb-12">
        <div className="font-mono min-w-max">
          {/* Week day headers */}
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0"></div>
            <div className="flex">
            {days.map((day, index) => {
                const isStartOfWeek = day.getDay() === 0
                const isFirstDay = index === 0
                const shouldShowHeader = isStartOfWeek || isFirstDay
              
              return (
                  <div key={index} className="w-6 h-6 flex items-center justify-center">
                    {shouldShowHeader && (
                      <span className="text-sm text-foreground font-bold">
                        {weekDays[day.getDay()]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Habits and their grids */}
          {habits.map((habit) => (
            <div key={habit.id} className="flex mb-3 group">
              {/* Habit name with delete option */}
              <div className="w-64 flex-shrink-0 pr-6 flex items-center justify-between">
                <div className="text-base font-semibold text-foreground truncate">
                  {habit.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </Button>
                  </div>
              
              {/* Day squares - touching like GitHub */}
              <div className="flex">
                {days.map((day, dayIndex) => {
                  const status = getDayStatus(habit, day)
                  const canToggle = status === 'available' || status === 'completed' || status === 'missed'
                  
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => canToggle && onToggle(habit.id, day)}
                      disabled={!canToggle}
                          className={cn(
                        "w-6 h-6 transition-all duration-200 flex-shrink-0",
                        getStatusColor(status),
                        canToggle ? "hover:scale-110 cursor-pointer" : "cursor-default"
                      )}
                      title={`${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${habit.name} - ${status}`}
                    />
                  )
                })}
                    </div>
                </div>
          ))}
          </div>
    </div>

      {/* Detailed Stats Section */}
    <div className="space-y-6">
      <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Analytics & Insights</h2>
          <p className="text-sm text-muted-foreground">Detailed breakdown of your habit performance</p>
      </div>

        {/* Overall Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Current Streak */}
          <Tooltip content="Your current streak counts how many days in a row you've completed at least one habit. The longer your streak, the stronger your momentum becomes!">
            <div className="bg-card rounded-lg p-4 border border-border text-center hover:shadow-md transition-shadow cursor-help">
              <div className={`text-2xl font-bold ${(() => {
                // Calculate current streak (consecutive days with at least one completion)
                let streak = 0
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                for (let i = 0; i < 90; i++) {
                  const checkDate = new Date(today)
                  checkDate.setDate(today.getDate() - i)
                  
                  let hasCompletion = false
                  habits.forEach(habit => {
                    const status = getDayStatus(habit, checkDate)
                    if (status === 'completed') hasCompletion = true
                  })
                  
                  if (hasCompletion) {
                    streak++
                  } else {
                    break
                  }
                }
                
                // Check if it's a personal best (simplified - assume current is best for now)
                const isPersonalBest = streak > 7 // Placeholder logic
                return isPersonalBest ? 'text-yellow-500' : 'text-green-700'
              })()}`}>
                {(() => {
                  let streak = 0
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  for (let i = 0; i < 90; i++) {
                    const checkDate = new Date(today)
                    checkDate.setDate(today.getDate() - i)
                    
                    let hasCompletion = false
                    habits.forEach(habit => {
                      const status = getDayStatus(habit, checkDate)
                      if (status === 'completed') hasCompletion = true
                    })
                    
                    if (hasCompletion) {
                      streak++
                    } else {
                      break
                    }
                  }
                  return streak
                })()}
            </div>
              <div className="text-xs text-muted-foreground font-medium">Current Streak</div>
              <div className="text-xs text-muted-foreground/80">Consecutive Days</div>
            </div>
          </Tooltip>

          {/* Total Commits */}
          <Tooltip content="Total commits shows how many habits you've completed out of all possible opportunities during your 90-day journey. Think of each completed habit as a 'commit' to your goals!">
            <div className="bg-muted/50 rounded-lg p-4 border border-border text-center hover:shadow-md transition-shadow cursor-help">
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-600">
                {overallStats.completed}/{(() => {
                  // Calculate total possible commits (assuming average 3 habits per day over 90 days)
                  const totalDays = 90
                  const avgHabitsPerDay = Math.max(habits.length, 3)
                  return totalDays * avgHabitsPerDay
                })()}
            </div>
              <div className="text-xs text-muted-foreground font-medium">Total Commits</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-700 dark:bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((overallStats.completed / (90 * Math.max(habits.length, 3))) * 100, 100)}%` 
                  }}
                ></div>
            </div>
      </div>
          </Tooltip>

          {/* Sprint Progress */}
          <Tooltip content="Sprint progress shows how far you are through your 90-day habit journey. Breaking it into a percentage makes the big goal feel more manageable and shows your momentum!">
            <div className="bg-card rounded-lg p-4 border border-border text-center hover:shadow-md transition-shadow cursor-help">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {(() => {
                  const today = new Date()
                  const startDate = habits.length > 0 ? 
                    new Date(Math.min(...habits.map(h => new Date(h.created_at).getTime()))) : 
                    today
                  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  const sprintProgress = Math.min(Math.round((daysPassed / 90) * 100), 100)
                  return sprintProgress
                })()}%
              </div>
              <div className="text-xs text-muted-foreground font-medium">Sprint Progress</div>
              <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-700 dark:bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(() => {
                      const today = new Date()
                      const startDate = habits.length > 0 ? 
                        new Date(Math.min(...habits.map(h => new Date(h.created_at).getTime()))) : 
                        today
                      const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                      return Math.min((daysPassed / 90) * 100, 100)
                    })()}%` 
                  }}
                ></div>
                </div>
              <div className="text-xs text-muted-foreground/80 mt-1">
                {(() => {
                  const today = new Date()
                  const startDate = habits.length > 0 ? 
                    new Date(Math.min(...habits.map(h => new Date(h.created_at).getTime()))) : 
                    today
                  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  return `${Math.min(daysPassed, 90)}/90 Days`
                })()}
                    </div>
                  </div>
          </Tooltip>

          {/* Weekly Commitment Rate */}
          <Tooltip content="Weekly commitment rate shows what percentage of your habits you completed this week. The colored squares show each day: green = completed habits, red = missed habits, gray = no habits scheduled.">
            <div className="bg-card rounded-lg p-4 border border-border text-center hover:shadow-md transition-shadow cursor-help">
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-600">
                {(() => {
                  const last7Days = days.slice(-7)
                  const weekStats = last7Days.reduce((acc, day) => {
                    habits.forEach(habit => {
                      const status = getDayStatus(habit, day)
                      if (status === 'completed') acc.completed++
                      else if (status === 'missed') acc.missed++
                    })
                    return acc
                  }, { completed: 0, missed: 0 })
                  
                  const total = weekStats.completed + weekStats.missed
                  return total > 0 ? Math.round((weekStats.completed / total) * 100) : 0
                })()}%
                    </div>
              <div className="text-xs text-muted-foreground font-medium">This Week</div>
              <div className="flex justify-center gap-1 mt-2">
                {days.slice(-7).map((day, index) => {
                  let hasCompletion = false
                  let hasMissed = false
                  habits.forEach(habit => {
                    const status = getDayStatus(habit, day)
                    if (status === 'completed') hasCompletion = true
                    else if (status === 'missed') hasMissed = true
                  })
                  
                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-sm ${
                        hasCompletion ? 'bg-green-500 dark:bg-green-400' : hasMissed ? 'bg-red-500 dark:bg-red-400' : 'bg-muted'
                      }`}
                    ></div>
                  )
                })}
                    </div>
                    </div>
          </Tooltip>

          {/* Missed Days Ratio */}
          <Tooltip content="Missed days ratio shows how many habit opportunities you've missed out of your total opportunities. Don't worry - this helps you learn your patterns, not judge yourself!">
            <div className="bg-card rounded-lg p-4 border border-border text-center hover:shadow-md transition-shadow cursor-help">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {(() => {
                  const totalOpportunities = overallStats.completed + overallStats.missed
                  const missedRatio = totalOpportunities > 0 ? 
                    Math.round((overallStats.missed / totalOpportunities) * 100) : 0
                  return `${overallStats.missed}/${Math.floor(totalOpportunities)} (${missedRatio}%)`
                })()}
                  </div>
              <div className="text-xs text-muted-foreground font-medium">Missed Days</div>
              {(() => {
                const totalOpportunities = overallStats.completed + overallStats.missed
                const missedRatio = totalOpportunities > 0 ? 
                  (overallStats.missed / totalOpportunities) * 100 : 0
                
                if (missedRatio > 20) {
                  return (
                    <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-medium">
                      Try a catch-up task?
                </div>
                  )
                }
                return <div className="text-xs text-muted-foreground/80 mt-1">On track!</div>
              })()}
      </div>
          </Tooltip>
    </div>

        {/* Individual Habit Stats */}
        {habits.length > 0 && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Habit Performance</h3>
            <div className="space-y-4">
              {habits.map((habit) => {
                const habitStats = days.reduce((acc, day) => {
                  const status = getDayStatus(habit, day)
                  if (status === 'completed') acc.completed++
                  else if (status === 'missed') acc.missed++
                  else if (status === 'available') acc.available++
                  return acc
                }, { completed: 0, missed: 0, available: 0 })

                const habitTotal = habitStats.completed + habitStats.missed
                const habitSuccessRate = habitTotal > 0 ? Math.round((habitStats.completed / habitTotal) * 100) : 0

                // Calculate current streak
                const currentStreak = (() => {
                  let streak = 0
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  for (let i = 0; i < 90; i++) {
                    const checkDate = new Date(today)
                    checkDate.setDate(today.getDate() - i)
                    const status = getDayStatus(habit, checkDate)
                    
                    if (status === 'completed') {
                      streak++
                    } else if (status === 'missed') {
                      break
                    }
                    // Skip not_scheduled and future days
                  }
                  return streak
                })()

                // Calculate longest streak
                const longestStreak = (() => {
                  let maxStreak = 0
                  let currentStreak = 0
                  
                  days.forEach(day => {
                    const status = getDayStatus(habit, day)
                    if (status === 'completed') {
                      currentStreak++
                      maxStreak = Math.max(maxStreak, currentStreak)
                    } else if (status === 'missed') {
                      currentStreak = 0
                    }
                  })
                  return maxStreak
                })()

  return (
                  <div key={habit.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{habit.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {habit.schedule.type === 'every_day' ? 'Daily' : 
                         habit.schedule.type === 'specific_days' ? `${habit.schedule.days.length} days/week` :
                         `Every ${habit.schedule.interval} days`}
      </div>
            </div>
                    <div className="grid grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{habitStats.completed}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
            </div>
                      <div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{habitStats.missed}</div>
                        <div className="text-xs text-muted-foreground">Missed</div>
            </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">{habitSuccessRate}%</div>
                        <div className="text-xs text-muted-foreground">Success</div>
            </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Best</div>
                  </div>
                </div>
                  </div>
                )
            })}
          </div>
          </div>
        )}

        {/* Weekly Breakdown */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Performance</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, dayIndex) => {
              const dayStats = days.reduce((acc, day) => {
                if (day.getDay() === dayIndex) {
                  habits.forEach(habit => {
                    const status = getDayStatus(habit, day)
                    if (status === 'completed') acc.completed++
                    else if (status === 'missed') acc.missed++
                  })
                }
                return acc
              }, { completed: 0, missed: 0 })

              const dayTotal = dayStats.completed + dayStats.missed
              const daySuccessRate = dayTotal > 0 ? Math.round((dayStats.completed / dayTotal) * 100) : 0

          return (
                <div key={dayIndex} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-foreground">{dayName.slice(0, 3)}</div>
                  <div className="text-lg font-bold text-foreground mt-1">{daySuccessRate}%</div>
                  <div className="text-xs text-muted-foreground">{dayStats.completed}/{dayTotal}</div>
                </div>
              )
            })}
                    </div>
                </div>
      </div>
    </div>
  )
}

// Custom Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg z-50 max-w-xs text-center border border-border">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      // Redirect to login if Supabase is not available
      router.push('/login')
      return
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
      
      // Redirect to login if no session
      if (!session) {
        router.push('/login');
        return;
      }
    }
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [])

  useEffect(() => {
    if (session) {
      fetchHabits()
    }
  }, [session])

  const fetchHabits = async () => {
    if (!supabase) return
    
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching habits:', error)
    } else {
      setHabits(habits || [])
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const addHabit = async (habitData: Omit<Habit, "id" | "history" | "totalCompletions" | "currentStreak" | "longestStreak" | "created_at" | "user_id">) => {
    if (!session || !supabase) return;
    
    const newHabitForDB = {
      ...habitData,
      user_id: session.user.id,
      history: {},
      total_completions: 0,
    };
    
    const { data, error } = await supabase
      .from('habits')
      .insert([newHabitForDB])
      .select()
    
    if (error) {
      console.error('Error adding habit:', error);
      alert('Error adding habit: ' + error.message);
    } else if (data) {
        const newHabits = [...habits, ...data];
        setHabits(newHabits);
    }
  }

  const toggleHabit = async (habitId: string, dateToToggle: Date) => {
    if (!supabase) return
    
    const dateStr = dateToToggle.toISOString().split("T")[0]
    
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newHistory = { ...habit.history };
    const currentStatus = newHistory[dateStr];

    if (currentStatus === 'completed') {
        delete newHistory[dateStr];
    } else {
      newHistory[dateStr] = 'completed';
    }
    
    const newTotalCompletions = Object.values(newHistory).filter(s => s === 'completed').length;
    
    const { error } = await supabase
      .from('habits')
      .update({ 
        history: newHistory,
        total_completions: newTotalCompletions,
       })
      .eq('id', habitId)

    if (error) {
      console.error('Error toggling habit:', error)
    } else {
      fetchHabits(); 
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!supabase) return
    
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
    
    if (error) {
      console.error('Error deleting habit:', error)
    } else {
      const newHabits = habits.filter((habit) => habit.id !== habitId)
      setHabits(newHabits)
    }
  }

    if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <Card className="bg-card shadow-xl border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-96 h-48 mx-auto mb-6 flex items-center justify-center">
              <Wordmark size="xl" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Loading...</h2>
            <p className="text-muted-foreground mb-6">Please wait while we redirect you to login</p>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-background/90 backdrop-blur-md border-b border-border/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wordmark size="md" />
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {session.user.email?.[0]?.toUpperCase()}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{session.user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-6 sm:py-12">
        <GridView habits={habits} onToggle={toggleHabit} onAddHabit={addHabit} onDeleteHabit={deleteHabit} />
      </main>
        </div>
    )
}