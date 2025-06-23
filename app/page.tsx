"use client"

import { useState, useEffect } from "react"
import { Plus, LogOut, Calendar, TrendingUp, Target, Zap, MoreHorizontal, Trash2, CheckCircle2, Flame, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import Link from 'next/link'
import { Session } from "@supabase/supabase-js"
import { Habit } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TimePeriod = "today" | "week" | "month" | "sprint" | "year"

interface SprintProgress {
  completed: number
  total: number
  daysLeft: number
  percentage: number
  currentStreak: number
}

function calculateSprintProgress(habit: Habit): SprintProgress {
  if (!habit || !habit.created_at) {
    return { completed: 0, total: 90, daysLeft: 90, percentage: 0, currentStreak: 0 };
  }

  const SPRINT_LENGTH = 90;
  const startDate = new Date(habit.created_at);
  const today = new Date();
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + SPRINT_LENGTH);
  
  const effectiveToday = today > endDate ? endDate : today;

  let completedCount = 0;
  let totalOpportunities = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < SPRINT_LENGTH; i++) {
    const loopDate = new Date(startDate);
    loopDate.setDate(startDate.getDate() + i);

    let isOpportunity = false;
    switch (habit.schedule.type) {
      case 'every_day':
        isOpportunity = true;
        break;
      case 'every_x_days':
        if (i % habit.schedule.interval === 0) {
          isOpportunity = true;
        }
        break;
      case 'specific_days':
        if (habit.schedule.days.includes(loopDate.getDay())) {
          isOpportunity = true;
        }
        break;
    }

    if (isOpportunity) {
        totalOpportunities++;
    }
      
    if (loopDate <= effectiveToday) {
        const dateStr = loopDate.toISOString().split('T')[0];
        if (habit.history[dateStr] === 'completed') {
            completedCount++;
        tempStreak++;
        currentStreak = Math.max(currentStreak, tempStreak);
      } else if (isOpportunity) {
        tempStreak = 0;
        }
    }
  }
  
  const dayDiff = Math.max(0, Math.ceil((effectiveToday.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const daysLeft = Math.max(0, SPRINT_LENGTH - dayDiff);
  const percentage = totalOpportunities > 0 ? (completedCount / totalOpportunities) * 100 : 0;

  return {
      completed: completedCount,
      total: totalOpportunities,
      daysLeft: daysLeft,
    percentage: Math.round(percentage),
    currentStreak: currentStreak,
  };
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
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-0 bg-white shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggle(habit.id, selectedDate)}
              disabled={!scheduled || isFuture}
              className={cn(
                "w-12 h-12 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center hover:scale-105",
                scheduled && !isFuture ? (
                  isCompleted
                    ? "border-transparent shadow-lg"
                    : "border-neutral-300 hover:border-neutral-400"
                ) : "border-neutral-200 opacity-50 cursor-not-allowed"
              )}
              style={isCompleted && scheduled ? { 
                backgroundColor: completedColor,
                boxShadow: `0 4px 20px -4px ${completedColor}` 
              } : {}}
            >
              {isCompleted && scheduled && (
                <CheckCircle2 className="w-6 h-6 text-white" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">{habit.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                {scheduled ? (
                  <Badge variant="secondary" className="bg-brand-100 text-brand-700 text-xs">
                    {isToday ? 'Scheduled Today' : isFuture ? 'Scheduled' : 'Was Scheduled'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 text-xs">
                    Not Scheduled
                  </Badge>
                )}
                {stats.currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{stats.currentStreak}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600">Sprint Progress</span>
              <span className="font-semibold text-neutral-800">{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-neutral-800">{stats.completed}</div>
              <div className="text-xs text-neutral-500">Completed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-800">{stats.currentStreak}</div>
              <div className="text-xs text-neutral-500">Streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-800">{stats.daysLeft}</div>
              <div className="text-xs text-neutral-500">Days Left</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Week View Component
const WeekView = ({ habits, selectedDate, onToggle }: { 
  habits: Habit[], 
  selectedDate: Date, 
  onToggle: (habitId: string, date: Date) => void 
}) => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const isScheduledForDate = (habit: Habit, date: Date) => {
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          Week of {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </h2>
        <p className="text-neutral-500">
          {startOfWeek.toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayScheduled = habits.filter(habit => isScheduledForDate(habit, day)).length;
          const dayCompleted = habits.filter(habit => {
            const dayStr = day.toISOString().split('T')[0];
            return habit.history[dayStr] === 'completed';
          }).length;
          
          return (
            <div key={index} className={cn(
              "text-center p-3 rounded-lg",
              isToday ? "bg-brand-50 border-2 border-brand-200" : "bg-white shadow-sm"
            )}>
              <div className="font-semibold text-sm text-neutral-700">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-2xl font-bold text-neutral-800 my-1">
                {day.getDate()}
              </div>
              <div className="text-xs text-neutral-500">
                {dayCompleted}/{dayScheduled}
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-brand-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: dayScheduled > 0 ? `${(dayCompleted / dayScheduled) * 100}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {habits.map(habit => {
          const colorHex = habit.color?.replace('bg-blue-500', '#3b82f6')
            .replace('bg-green-500', '#22c55e')
            .replace('bg-purple-500', '#a855f7')
            .replace('bg-red-500', '#ef4444')
            .replace('bg-orange-500', '#f97316')
            .replace('bg-pink-500', '#ec4899')
            .replace('bg-cyan-500', '#06b6d4')
            .replace('bg-amber-500', '#f59e0b') || '#3b82f6';

          return (
            <Card key={habit.id} className="bg-white shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colorHex }}
                  />
                  <h3 className="font-semibold text-neutral-800">{habit.name}</h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const isCompleted = habit.history[dayStr] === 'completed';
                    const isScheduled = isScheduledForDate(habit, day);
                    const isFuture = day > new Date();
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !isFuture && isScheduled && onToggle(habit.id, day)}
                        disabled={!isScheduled || isFuture}
                        className={cn(
                          "aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
                          isCompleted && isScheduled
                            ? "border-transparent"
                            : isScheduled
                            ? "border-neutral-300 hover:border-neutral-400"
                            : "border-neutral-200 opacity-50 cursor-not-allowed"
                        )}
                        style={isCompleted && isScheduled ? { 
                          backgroundColor: '#22c55e',
                          boxShadow: `0 2px 8px -2px #22c55e` 
                        } : {}}
                      >
                        {isCompleted && isScheduled && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Month View Component
const MonthView = ({ habits, selectedDate, onToggle }: { 
  habits: Habit[], 
  selectedDate: Date, 
  onToggle: (habitId: string, date: Date) => void 
}) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  while (current <= lastDay || current.getDay() !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const isScheduledForDate = (habit: Habit, date: Date) => {
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

  const monthStats = {
    totalScheduled: 0,
    totalCompleted: 0,
    streaks: {} as Record<string, number>
  };

  days.forEach(day => {
    if (day.getMonth() === month) {
      habits.forEach(habit => {
        if (isScheduledForDate(habit, day)) {
          monthStats.totalScheduled++;
          const dayStr = day.toISOString().split('T')[0];
          if (habit.history[dayStr] === 'completed') {
            monthStats.totalCompleted++;
          }
        }
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-800">{monthStats.totalCompleted}</div>
            <div className="text-neutral-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-800">{monthStats.totalScheduled}</div>
            <div className="text-neutral-500">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-800">
              {Math.round(monthStats.totalScheduled > 0 ? (monthStats.totalCompleted / monthStats.totalScheduled) * 100 : 0)}%
            </div>
            <div className="text-neutral-500">Success Rate</div>
          </div>
        </div>
      </div>

      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-neutral-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === month;
              const isToday = day.toDateString() === new Date().toDateString();
              const dayScheduled = habits.filter(habit => isScheduledForDate(habit, day)).length;
              const dayCompleted = habits.filter(habit => {
                const dayStr = day.toISOString().split('T')[0];
                return habit.history[dayStr] === 'completed';
              }).length;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-sm",
                    isCurrentMonth ? "bg-white" : "bg-neutral-50 text-neutral-400",
                    isToday && "bg-brand-50 border-2 border-brand-200"
                  )}
                >
                  <div className={cn(
                    "font-semibold",
                    isCurrentMonth ? "text-neutral-800" : "text-neutral-400"
                  )}>
                    {day.getDate()}
                  </div>
                  {isCurrentMonth && dayScheduled > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(dayScheduled, 3) }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            i < dayCompleted ? "bg-brand-500" : "bg-neutral-300"
                          )}
                        />
                      ))}
                      {dayScheduled > 3 && (
                        <div className="text-xs text-neutral-400">+</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sprint View Component  
const SprintView = ({ habits, onToggle }: { 
  habits: Habit[], 
  onToggle: (habitId: string, date: Date) => void 
}) => {
  const sprintStats = habits.map(habit => calculateSprintProgress(habit));
  const totalCompleted = sprintStats.reduce((sum, stat) => sum + stat.completed, 0);
  const totalOpportunities = sprintStats.reduce((sum, stat) => sum + stat.total, 0);
  const avgProgress = sprintStats.length > 0 ? sprintStats.reduce((sum, stat) => sum + stat.percentage, 0) / sprintStats.length : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">90-Day Sprint Overview</h2>
        <p className="text-neutral-500">Your 3-month journey progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{Math.round(avgProgress)}%</div>
            <div className="text-sm text-neutral-500">Average Progress</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{totalCompleted}</div>
            <div className="text-sm text-neutral-500">Total Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">
              {Math.max(...sprintStats.map(s => s.currentStreak))}
            </div>
            <div className="text-sm text-neutral-500">Best Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">
              {Math.min(...sprintStats.map(s => s.daysLeft))}
            </div>
            <div className="text-sm text-neutral-500">Days Remaining</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {habits.map((habit, index) => {
          const stats = sprintStats[index];
          const colorHex = habit.color?.replace('bg-blue-500', '#3b82f6')
            .replace('bg-green-500', '#22c55e')
            .replace('bg-purple-500', '#a855f7')
            .replace('bg-red-500', '#ef4444')
            .replace('bg-orange-500', '#f97316')
            .replace('bg-pink-500', '#ec4899')
            .replace('bg-cyan-500', '#06b6d4')
            .replace('bg-amber-500', '#f59e0b') || '#3b82f6';

          return (
            <Card key={habit.id} className="bg-white shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colorHex }}
                  />
                  <h3 className="text-lg font-semibold text-neutral-800">{habit.name}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">Sprint Progress</span>
                      <span className="font-semibold text-neutral-800">{stats.percentage}%</span>
                    </div>
                    <Progress value={stats.percentage} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-neutral-800">{stats.completed}</div>
                      <div className="text-xs text-neutral-500">Completed</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-800">{stats.currentStreak}</div>
                      <div className="text-xs text-neutral-500">Current Streak</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-800">{stats.daysLeft}</div>
                      <div className="text-xs text-neutral-500">Days Left</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Year View Component
const YearView = ({ habits, selectedDate }: { 
  habits: Habit[], 
  selectedDate: Date 
}) => {
  const year = selectedDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  
  const yearStats = {
    totalCompleted: 0,
    totalScheduled: 0,
    monthlyData: [] as Array<{ month: string, completed: number, scheduled: number }>
  };

  months.forEach(month => {
    const monthData = { 
      month: month.toLocaleDateString('en-US', { month: 'short' }), 
      completed: 0, 
      scheduled: 0 
    };
    
    const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month.getMonth(), day);
      habits.forEach(habit => {
        const dayOfWeek = date.getDay();
        let isScheduled = false;
        
        switch (habit.schedule.type) {
          case 'every_day':
            isScheduled = true;
            break;
          case 'specific_days':
            isScheduled = habit.schedule.days.includes(dayOfWeek);
            break;
          case 'every_x_days':
            const startDate = new Date(habit.created_at);
            const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            isScheduled = daysDiff >= 0 && daysDiff % habit.schedule.interval === 0;
            break;
        }
        
        if (isScheduled) {
          monthData.scheduled++;
          yearStats.totalScheduled++;
          
          const dateStr = date.toISOString().split('T')[0];
          if (habit.history[dateStr] === 'completed') {
            monthData.completed++;
            yearStats.totalCompleted++;
          }
        }
      });
    }
    
    yearStats.monthlyData.push(monthData);
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">{year} Year Overview</h2>
        <p className="text-neutral-500">Your full year habit journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{yearStats.totalCompleted}</div>
            <div className="text-sm text-neutral-500">Total Completed</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">
              {Math.round(yearStats.totalScheduled > 0 ? (yearStats.totalCompleted / yearStats.totalScheduled) * 100 : 0)}%
            </div>
            <div className="text-sm text-neutral-500">Success Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{habits.length}</div>
            <div className="text-sm text-neutral-500">Active Habits</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Monthly Progress</h3>
          <div className="grid grid-cols-12 gap-2">
            {yearStats.monthlyData.map((month, index) => {
              const percentage = month.scheduled > 0 ? (month.completed / month.scheduled) * 100 : 0;
              return (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-neutral-600 mb-2">{month.month}</div>
                  <div className="bg-neutral-200 rounded-full h-20 w-4 mx-auto relative">
                    <div 
                      className="bg-brand-500 rounded-full w-full absolute bottom-0 transition-all duration-500"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">{Math.round(percentage)}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => {
          const colorHex = habit.color?.replace('bg-blue-500', '#3b82f6')
            .replace('bg-green-500', '#22c55e')
            .replace('bg-purple-500', '#a855f7')
            .replace('bg-red-500', '#ef4444')
            .replace('bg-orange-500', '#f97316')
            .replace('bg-pink-500', '#ec4899')
            .replace('bg-cyan-500', '#06b6d4')
            .replace('bg-amber-500', '#f59e0b') || '#3b82f6';

          const habitYearData = months.map(month => {
            const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();
            let completed = 0;
            let scheduled = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month.getMonth(), day);
              const dayOfWeek = date.getDay();
              let isScheduled = false;
              
              switch (habit.schedule.type) {
                case 'every_day':
                  isScheduled = true;
                  break;
                case 'specific_days':
                  isScheduled = habit.schedule.days.includes(dayOfWeek);
                  break;
                case 'every_x_days':
                  const startDate = new Date(habit.created_at);
                  const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  isScheduled = daysDiff >= 0 && daysDiff % habit.schedule.interval === 0;
                  break;
              }
              
              if (isScheduled) {
                scheduled++;
                const dateStr = date.toISOString().split('T')[0];
                if (habit.history[dateStr] === 'completed') {
                  completed++;
                }
              }
            }
            
            return { completed, scheduled, percentage: scheduled > 0 ? (completed / scheduled) * 100 : 0 };
          });

          return (
            <Card key={habit.id} className="bg-white shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colorHex }}
                  />
                  <h3 className="font-semibold text-neutral-800">{habit.name}</h3>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {habitYearData.map((month, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-full h-8 rounded"
                        style={{ 
                          backgroundColor: `${colorHex}${Math.round(month.percentage * 2.55).toString(16).padStart(2, '0')}` 
                        }}
                        title={`${Math.round(month.percentage)}% completed`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    return () => subscription.unsubscribe();
  }, [])

  useEffect(() => {
    if (session) {
      fetchHabits()
    }
  }, [session])

  const fetchHabits = async () => {
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
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  
  const periods: { key: TimePeriod; label: string; icon: React.ElementType }[] = [
    { key: "today", label: "Today", icon: Calendar },
    { key: "week", label: "Week", icon: Calendar },
    { key: "month", label: "Month", icon: Calendar },
    { key: "sprint", label: "Sprint", icon: Target },
    { key: "year", label: "Year", icon: TrendingUp },
  ]

  const addHabit = async (habitData: Omit<Habit, "id" | "history" | "totalCompletions" | "currentStreak" | "longestStreak" | "created_at" | "user_id">) => {
    if (!session) return;
    
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(selectedDate.getDate() - 1);
    } else {
      newDate.setDate(selectedDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  }

  const goToToday = () => {
    setSelectedDate(new Date());
  }

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  const selectedDateCompletedCount = habits.filter(habit => {
    return habit.history[selectedDateStr] === 'completed';
  }).length;

  const selectedDateScheduledCount = habits.filter(habit => {
    const dayOfWeek = selectedDate.getDay();
    switch (habit.schedule.type) {
      case 'every_day':
        return true;
      case 'specific_days':
        return habit.schedule.days.includes(dayOfWeek);
      case 'every_x_days':
        const startDate = new Date(habit.created_at);
        const daysDiff = Math.floor((selectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % habit.schedule.interval === 0;
      default:
        return false;
    }
  }).length;

  const overallSprintProgress = habits.length > 0 ? 
    (habits.reduce((sum, habit) => sum + calculateSprintProgress(habit).percentage, 0) / habits.length).toFixed(2) : "0.00";

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  const renderContent = () => {
    if (habits.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 bg-gradient-brand rounded-3xl flex items-center justify-center mb-8 animate-bounce-gentle">
            <Target className="h-12 w-12 text-white" />
        </div>
          <h3 className="text-3xl font-bold text-neutral-800 mb-4">Start Your 3-Month Journey</h3>
          <p className="text-neutral-500 mb-8 max-w-md text-lg">Create your first habit and begin building lasting changes designed for ADHD minds.</p>
          <AddHabitDialog onAddHabit={addHabit}>
            <Button className="btn-primary text-lg px-8 py-4">
              <Plus className="mr-2 h-6 w-6" /> Create Your First Habit
            </Button>
          </AddHabitDialog>
      </div>
      )
    }

    switch (selectedPeriod) {
      case "today":
        const sprintStats = habits.map(habit => calculateSprintProgress(habit));
        const totalCompleted = sprintStats.reduce((sum, stat) => sum + stat.completed, 0);
        const totalOpportunities = sprintStats.reduce((sum, stat) => sum + stat.total, 0);
        const avgDaysLeft = sprintStats.length > 0 ? Math.round(sprintStats.reduce((sum, stat) => sum + stat.daysLeft, 0) / sprintStats.length) : 90;

  return (
          <div className="space-y-8">
            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateDate('prev')}
                className="w-10 h-10 rounded-full hover:bg-neutral-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800">{formatDateHeader(selectedDate)}</h2>
                <p className="text-sm text-neutral-500">
                  {selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {!isToday && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToToday}
                    className="mt-2 text-xs text-brand-600 hover:text-brand-700"
                  >
                    Go to Today
                  </Button>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateDate('next')}
                className="w-10 h-10 rounded-full hover:bg-neutral-100"
              >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>

            {/* Sprint Overview */}
            <Card className="bg-gradient-to-r from-brand-50 to-brand-100 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
          <div>
                    <h3 className="text-lg font-semibold text-neutral-800">90-Day Sprint</h3>
                    <p className="text-sm text-neutral-600">Your 3-month journey progress</p>
          </div>
            </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">{overallSprintProgress}%</div>
                    <div className="text-xs text-neutral-500">Overall Progress</div>
            </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">{totalCompleted}</div>
                    <div className="text-xs text-neutral-500">Total Completed</div>
          </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">{selectedDateCompletedCount}</div>
                    <div className="text-xs text-neutral-500">Today's Done</div>
        </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">{avgDaysLeft}</div>
                    <div className="text-xs text-neutral-500">Days Left</div>
    </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">Today's Habits</h2>
                <AddHabitDialog onAddHabit={addHabit}>
                  <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add Habit
                  </Button>
                </AddHabitDialog>
        </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {habits.map((habit) => (
                  <DashboardHabitCard
                    key={habit.id}
                    habit={habit}
                    selectedDate={selectedDate}
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                  />
                ))}
            </div>
      </div>
    </div>
        );
      case "week":
        return <WeekView habits={habits} selectedDate={selectedDate} onToggle={toggleHabit} />;
      case "month":
        return <MonthView habits={habits} selectedDate={selectedDate} onToggle={toggleHabit} />;
      case "sprint":
        return <SprintView habits={habits} onToggle={toggleHabit} />;
      case "year":
        return <YearView habits={habits} selectedDate={selectedDate} />;
      default:
  return (
          <div className="text-center py-20">
            <Zap className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
            <p className="text-lg text-neutral-500">Coming soon...</p>
    </div>
        );
    }
  }

  if (!session) {
  return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#e2e8f0'}}>
        <Card className="bg-white shadow-xl border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-96 h-48 mx-auto mb-6 flex items-center justify-center">
              <img src="/strive.png" alt="Strive" className="h-36 w-auto" />
          </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-neutral-500 mb-6">Sign in to continue your habit journey</p>
          <Link href="/login">
              <Button className="btn-primary w-full">Go to Login</Button>
          </Link>
          </CardContent>
        </Card>
    </div>
  );
}

    return (
    <div className="min-h-screen" style={{backgroundColor: '#e2e8f0'}}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
                                    <div className="flex items-center">
              <img src="/strive.png" alt="Strive" className="h-16 w-auto" />
            </div>
        
            <div className="flex items-center gap-6">
                            <div className="inline-flex bg-neutral-200/70 rounded-lg p-1 shadow-inner">
                {periods.map((period, index) => {
                  const Icon = period.icon;
                    return (
                        <button
                      key={period.key} 
                      onClick={() => setSelectedPeriod(period.key)}
                            className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all duration-200 relative",
                        index === 0 ? 'rounded-l-md' : index === periods.length - 1 ? 'rounded-r-md' : '',
                        selectedPeriod === period.key 
                          ? 'bg-white text-neutral-900 shadow-sm' 
                          : 'text-neutral-600 hover:text-neutral-800 hover:bg-white/50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold">{period.label}</span>
                        </button>
                  );
                })}
            </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-neutral-600">
                    {session.user.email?.[0]?.toUpperCase()}
                  </span>
          </div>
                <span className="text-sm text-neutral-600 hidden sm:block">{session.user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
        </div>
    )
}