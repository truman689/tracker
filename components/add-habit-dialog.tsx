"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Habit, Schedule } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type NewHabit = Omit<Habit, "id" | "history" | "totalCompletions" | "currentStreak" | "longestStreak" | "created_at" | "user_id">

interface AddHabitDialogProps {
  onAddHabit: (habit: NewHabit) => Promise<void>
  children: React.ReactNode
}

type ScheduleType = 'every_day' | 'specific_days' | 'every_x_days';
const WEEK_DAYS = [
  { short: 'S', full: 'Sunday', index: 0 },
  { short: 'M', full: 'Monday', index: 1 },
  { short: 'T', full: 'Tuesday', index: 2 },
  { short: 'W', full: 'Wednesday', index: 3 },
  { short: 'T', full: 'Thursday', index: 4 },
  { short: 'F', full: 'Friday', index: 5 },
  { short: 'S', full: 'Saturday', index: 6 },
];

export function AddHabitDialog({ onAddHabit, children }: AddHabitDialogProps) {
  const [name, setName] = useState("")
  const [scheduleType, setScheduleType] = useState<ScheduleType>('every_day');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [interval, setInterval] = useState(2);
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDayToggle = (dayIndex: number) => {
    setDaysOfWeek(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };
  
  const resetForm = () => {
    setName("");
    setScheduleType('every_day');
    setDaysOfWeek([]);
    setInterval(2);
    setIsSubmitting(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true);

    let schedule: Schedule;
    switch (scheduleType) {
        case 'every_day':
            schedule = { type: 'every_day' };
            break;
        case 'specific_days':
            if (daysOfWeek.length === 0) {
                alert("Please select at least one day.");
                setIsSubmitting(false);
                return;
            }
            schedule = { type: 'specific_days', days: daysOfWeek.sort() };
            break;
        case 'every_x_days':
            if (interval < 1) {
                alert("Interval must be at least 1 day.");
                setIsSubmitting(false);
                return;
            }
            if (interval === 1) {
              schedule = { type: 'every_day' };
              break;
            }
            schedule = { type: 'every_x_days', interval };
            break;
    }

    try {
    await onAddHabit({
      name: name.trim(),
      color: "bg-neutral-500", // Default neutral color
      schedule,
    })
    resetForm();
    setOpen(false)
    } catch (error) {
      console.error('Error creating habit:', error);
      setIsSubmitting(false);
    }
  }

  const getFrequencyDescription = () => {
    switch (scheduleType) {
      case 'every_day':
        return 'Every day';
      case 'specific_days':
        if (daysOfWeek.length === 0) return 'Select days';
        if (daysOfWeek.length === 7) return 'Every day';
        return `${daysOfWeek.length} days per week`;
      case 'every_x_days':
        return `Every ${interval} days`;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-2 sm:p-1">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-neutral-500 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-1">Create New Habit</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Start your 3-month journey today</p>
          </div>

          <div className="space-y-4">
          <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                What habit do you want to build?
              </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                className="text-center font-medium border-2 border-neutral-200 rounded-xl px-4 py-4 h-14 text-base focus:border-brand-400 focus:ring-brand-400 transition-colors touch-manipulation"
              autoFocus
              required
            />
          </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                How often do you want to do this?
              </label>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('every_day')}
                    className={cn(
                      "flex items-center justify-between p-4 sm:p-3 rounded-xl border-2 transition-all duration-200 touch-manipulation min-h-[60px]",
                      scheduleType === 'every_day'
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-base sm:text-sm">Every Day</div>
                      <div className="text-sm sm:text-xs opacity-70">Build a daily routine</div>
                    </div>
                    {scheduleType === 'every_day' && (
                      <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('specific_days')}
                    className={cn(
                      "flex items-center justify-between p-4 sm:p-3 rounded-xl border-2 transition-all duration-200 touch-manipulation min-h-[60px]",
                      scheduleType === 'specific_days'
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-base sm:text-sm">Specific Days</div>
                      <div className="text-sm sm:text-xs opacity-70">Choose which days of the week</div>
                    </div>
                    {scheduleType === 'specific_days' && (
                      <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('every_x_days')}
                    className={cn(
                      "flex items-center justify-between p-4 sm:p-3 rounded-xl border-2 transition-all duration-200 touch-manipulation min-h-[60px]",
                      scheduleType === 'every_x_days'
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-base sm:text-sm">Every X Days</div>
                      <div className="text-sm sm:text-xs opacity-70">Set a custom interval</div>
                    </div>
                    {scheduleType === 'every_x_days' && (
                      <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
            </div>

            {scheduleType === 'specific_days' && (
                  <Card className="border border-neutral-200">
                    <CardContent className="p-4 sm:p-3">
                      <div className="grid grid-cols-7 gap-2 sm:gap-1">
                        {WEEK_DAYS.map((day) => (
                          <button
                            key={day.index}
                    type="button"
                            onClick={() => handleDayToggle(day.index)}
                            className={cn(
                              "aspect-square rounded-lg text-sm sm:text-xs font-semibold transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] sm:min-h-[36px]",
                              daysOfWeek.includes(day.index)
                                ? "bg-brand-500 text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            )}
                            title={day.full}
                  >
                            {day.short}
                          </button>
                ))}
              </div>
                    </CardContent>
                  </Card>
            )}

            {scheduleType === 'every_x_days' && (
                  <Card className="border border-neutral-200">
                    <CardContent className="p-4 sm:p-3">
                      <div className="flex items-center justify-center gap-4 sm:gap-3">
                        <span className="text-base sm:text-sm text-neutral-600 font-medium">Every</span>
                    <Input 
                        type="number" 
                        value={interval}
                          onChange={e => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-20 sm:w-16 text-center font-semibold border rounded-lg h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                        min="1"
                    />
                        <span className="text-base sm:text-sm text-neutral-600 font-medium">days</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="mt-3 p-2 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Frequency:</span>
                  <Badge variant="secondary" className="bg-brand-100 text-brand-700 font-medium text-xs">
                    {getFrequencyDescription()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 sm:pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 sm:py-2 font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl text-base sm:text-sm touch-manipulation h-12 sm:h-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 py-3 sm:py-2 font-semibold rounded-xl transition-all duration-200 text-base sm:text-sm bg-brand-500 hover:bg-brand-600 text-white touch-manipulation h-12 sm:h-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
