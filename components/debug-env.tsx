"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugEnvProps {
  habits: any[]
}

export function DebugEnv({ habits }: DebugEnvProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Debug Analytics
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Debug Info
          <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>×</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div><strong>Habits Count:</strong> {habits.length}</div>
          <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
          <div><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}</div>
          <div><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}</div>
          
          {habits.length > 0 && (
            <div>
              <strong>Sample Habit:</strong>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(habits[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 