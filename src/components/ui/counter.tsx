"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface CounterProps {
  count: number
  goal: number
  className?: string
}

export function Counter({ count, goal, className }: CounterProps) {
  const [animatedCount, setAnimatedCount] = useState(count)
  const progressPercentage = Math.min((count / goal) * 100, 100)

  useEffect(() => {
    const duration = 600
    const startTime = Date.now()
    const startCount = animatedCount
    const difference = count - startCount

    if (difference === 0) return

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.round(startCount + difference * easeOut)
      
      setAnimatedCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [count, animatedCount])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-1">
        <div className="text-2xl font-mono font-bold text-black tabular-nums">
          {animatedCount.toLocaleString()}
        </div>
        <div className="text-xs text-black/60 font-mono tracking-widest">
          / {goal.toLocaleString()}
        </div>
      </div>
      
      <div className="w-full max-w-48 mx-auto">
        {/* Structural progress container */}
        <div className="border border-black/10 bg-white relative">
          <div className="h-2 pattern-diagonal-subtle"></div>
          <div className="px-3 py-2">
            {/* Custom geometric progress bar */}
            <div className="h-px bg-black/20 relative overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-200 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="h-px bg-black/5"></div>
        </div>
        <div className="mt-2 text-center text-xs text-black/40 font-mono tabular-nums">
          {progressPercentage.toFixed(0)}% COMPLETADO
        </div>
      </div>
    </div>
  )
}