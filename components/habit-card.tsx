"use client"

import { useState } from "react"
import { CheckCircle2, Flame, Calendar, TrendingUp, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Habit } from "@/lib/types"

interface HabitCardProps {
  habit: Habit
  onSelect: () => void
  isSelected: boolean
  onDelete: () => void
  onToggle: (date: Date) => void
  currentDate: Date
}

// Helper function to calculate habit stats
function calculateHabitStats(habit: Habit) {
  const today = new Date()
  const currentQuarter = Math.floor(today.getMonth() / 3)
  const year = today.getFullYear()
  const sprintStart = new Date(year, currentQuarter * 3, 1)
  const sprintEnd = new Date(year, (currentQuarter + 1) * 3, 0)
  sprintEnd.setHours(23, 59, 59, 999)

  const totalSprintDays = Math.ceil((sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24))
  const daysFromStart = Math.ceil((today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24))
  const actualTotalDays = Math.min(daysFromStart, totalSprintDays)

  let completed = 0
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const sortedDates = Object.keys(habit.history)
    .filter(date => {
      const d = new Date(date)
      return d >= sprintStart && d <= today
    })
    .sort()

  // Calculate completed and streaks
  for (const date of sortedDates) {
    if (habit.history[date] === 'completed') {
      completed++
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Calculate current streak from today backwards
  const today_str = today.toISOString().split('T')[0]
  if (habit.history[today_str] === 'completed') {
    currentStreak = 1
    for (let i = 1; i < 30; i++) {
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - i)
      const pastDateStr = pastDate.toISOString().split('T')[0]
      if (habit.history[pastDateStr] === 'completed') {
        currentStreak++
      } else {
        break
      }
    }
  }

  const percentage = actualTotalDays > 0 ? Math.round((completed / actualTotalDays) * 100) : 0
  const daysLeft = Math.max(0, totalSprintDays - daysFromStart)

  return {
    completed,
    total: actualTotalDays,
    percentage,
    currentStreak,
    longestStreak,
    daysLeft
  }
}

function isScheduledForDate(habit: Habit, date: Date): boolean {
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

export function HabitCard({ habit, onSelect, isSelected, onDelete, onToggle, currentDate }: HabitCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const stats = calculateHabitStats(habit)
  const isScheduled = isScheduledForDate(habit, currentDate)
  const isCompleted = habit.history[currentDate.toISOString().split("T")[0]] === "completed"
  const isFuture = currentDate > new Date()
  const isToday = currentDate.toDateString() === new Date().toDateString()
  
  // Color mapping for habit colors
  const colorMap: Record<string, { bg: string; text: string; accent: string; hex: string }> = {
    "bg-blue-500": { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-500", hex: "#3b82f6" },
    "bg-green-500": { bg: "bg-green-50", text: "text-green-700", accent: "bg-green-500", hex: "#22c55e" },
    "bg-purple-500": { bg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-500", hex: "#a855f7" },
    "bg-red-500": { bg: "bg-red-50", text: "text-red-700", accent: "bg-red-500", hex: "#ef4444" },
    "bg-orange-500": { bg: "bg-orange-50", text: "text-orange-700", accent: "bg-orange-500", hex: "#f97316" },
    "bg-pink-500": { bg: "bg-pink-50", text: "text-pink-700", accent: "bg-pink-500", hex: "#ec4899" },
    "bg-cyan-500": { bg: "bg-cyan-50", text: "text-cyan-700", accent: "bg-cyan-500", hex: "#06b6d4" },
    "bg-amber-500": { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500", hex: "#f59e0b" }
  }
  
  const colors = colorMap[habit.color] || colorMap["bg-blue-500"]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border-0 bg-white transition-all duration-500",
        "hover:shadow-2xl hover:-translate-y-1 cursor-pointer",
        "shadow-lg hover:shadow-xl",
        isSelected && "ring-2 ring-brand-500 shadow-xl -translate-y-1"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-5 transition-opacity duration-500 group-hover:opacity-10"
        style={{
          background: `linear-gradient(135deg, ${colors.hex}20 0%, ${colors.hex}10 50%, transparent 100%)`
        }}
      />
      
      {/* Main Content */}
      <div className="relative p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Completion Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isScheduled && !isFuture) {
                  onToggle(currentDate)
                }
              }}
              disabled={!isScheduled || isFuture}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 transition-all duration-300",
                "flex items-center justify-center touch-manipulation",
                "hover:scale-105 active:scale-95",
                isScheduled && !isFuture ? (
                  isCompleted
                    ? "bg-green-500 border-green-500 shadow-lg"
                    : "bg-white border-neutral-300 hover:border-neutral-400 hover:shadow-md"
                ) : "bg-white border-neutral-200 opacity-50 cursor-not-allowed"
              )}
            >
              {/* Empty content - the visual is handled by background colors */}
            </button>
            
            {/* Habit Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2 truncate font-space-grotesk">
                {habit.name}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Schedule Badge */}
                {isScheduled ? (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium",
                      colors.bg,
                      colors.text,
                      "border-0"
                    )}
                  >
                    {isToday ? '🎯 Today' : isFuture ? '📅 Scheduled' : '✓ Was Scheduled'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 text-xs border-0">
                    Not Scheduled
                  </Badge>
                )}
                
                {/* Streak Badge */}
                {stats.currentStreak > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs border-0">
                    <Flame className="w-3 h-3 mr-1" />
                    {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "hover:bg-neutral-100 p-2 rounded-xl"
                )}
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onDelete()} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Progress Section */}
        <div className="space-y-4">
          {/* Sprint Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-neutral-600">Sprint Progress</span>
              <span className="text-sm font-bold text-neutral-800">{stats.percentage}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={stats.percentage} 
                className="h-3 bg-neutral-100"
              />
              <div 
                className="absolute top-0 left-0 h-3 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${stats.percentage}%`,
                  backgroundColor: colors.hex,
                  boxShadow: `0 0 10px ${colors.hex}40`
                }}
              />
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 font-space-grotesk">{stats.completed}</div>
              <div className="text-xs text-neutral-500 font-medium">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 font-space-grotesk">{stats.currentStreak}</div>
              <div className="text-xs text-neutral-500 font-medium">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 font-space-grotesk">{stats.daysLeft}</div>
              <div className="text-xs text-neutral-500 font-medium">Days Left</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Border Animation */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.hex}20, transparent)`,
          animation: isHovered ? 'shimmer 2s ease-in-out infinite' : 'none'
        }}
      />
    </div>
  )
}
