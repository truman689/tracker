import { cn } from "@/lib/utils"

interface WordmarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Wordmark({ className, size = 'md' }: WordmarkProps) {
  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl', 
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl'
  }

  return (
    <div className={cn(
      "select-none font-space-grotesk",
      sizeClasses[size],
      className
    )}>
      <span className="text-neutral-800 font-bold tracking-tight" 
            style={{ 
              fontVariationSettings: '"wght" 700'
            }}>
        90days.
      </span>
    </div>
  )
} 