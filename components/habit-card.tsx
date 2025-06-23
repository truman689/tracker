"use client"

import { useState } from "react"
import { X, Flame, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal } from "lucide-react"
import { Habit } from "@/lib/types"

interface HabitCardProps {
  habit: Habit
  onSelect: () => void
  isSelected: boolean
  onDelete: () => void
  onToggle: (date: Date) => void
  currentDate: Date
}

export function HabitCard({ habit, onSelect, isSelected, onDelete, onToggle, currentDate }: HabitCardProps) {
  const [showDelete, setShowDelete] = useState(false)

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return habit.history[dateStr]
  }

  const status = getDayStatus(currentDate)

  // A simple progress calculation: percentage of completions over the last 30 days
  const progress =
    (Object.values(habit.history).filter((s) => s === "completed").length / 30) * 100

  const colorMap: Record<string, string> = {
    "bg-blue-500": "bg-blue-50 hover:bg-blue-100",
    "bg-green-500": "bg-green-50 hover:bg-green-100",
    "bg-purple-500": "bg-purple-50 hover:bg-purple-100",
    "bg-red-500": "bg-red-50 hover:bg-red-100",
    "bg-orange-500": "bg-orange-50 hover:bg-orange-100",
    "bg-pink-500": "bg-pink-50 hover:bg-pink-100",
  }

  // Sprint Progress Calculation
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const year = today.getFullYear();
  const sprintStart = new Date(year, currentQuarter * 3, 1);
  const sprintEnd = new Date(year, (currentQuarter + 1) * 3, 0);
  sprintEnd.setHours(23, 59, 59, 999);

  const totalSprintDays = (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24);
  
  const completedInSprint = Object.values(habit.history).filter(
    (status) => status === 'completed'
  ).length;

  const sprintProgress = totalSprintDays > 0 ? (completedInSprint / totalSprintDays) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-gray-900 shadow-lg"
          : "border-gray-200 hover:border-gray-300",
        showDelete && "border-red-500",
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent onSelect from firing
              onToggle(currentDate)
            }}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center hover:scale-110",
              status === "completed"
                ? `${habit.color} border-transparent`
                : "border-gray-300",
            )}
          >
            {status === "completed" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
          <span className="font-medium text-gray-800">{habit.name}</span>
        </div>
        {showDelete ? (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
          >
            Delete
          </Button>
        ) : (
          <div className={cn("w-2 h-2 rounded-full", habit.color)} />
        )}
      </div>
    </div>
  )
}
