import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
  size?: "default" | "sm" | "lg"
}

function Badge({ className, variant = "default", size = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
  
  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-gray-100 text-gray-700 border border-gray-200",
    destructive: "bg-red-50 text-red-700 border border-red-200",
    outline: "bg-transparent text-gray-700 border border-gray-300",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  }
  
  const sizes = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-[11px]",
    lg: "px-3 py-1 text-sm",
  }
  
  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}

export { Badge }