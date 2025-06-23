"use client"

import { Target, Calendar, Flame, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsOverviewProps {
  totalHabits: number
  completedToday: number
  longestStreak: number
  totalCompletions: number
}

export function StatsOverview({ totalHabits, completedToday, longestStreak, totalCompletions }: StatsOverviewProps) {
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  const stats = [
    {
      icon: Target,
      label: "Active Habits",
      value: totalHabits,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Calendar,
      label: "Completed Today",
      value: `${completedToday}/${totalHabits}`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Flame,
      label: "Longest Streak",
      value: `${longestStreak} days`,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Trophy,
      label: "Total Completions",
      value: totalCompletions,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
