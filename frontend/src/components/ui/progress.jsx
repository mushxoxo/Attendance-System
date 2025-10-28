import * as React from "react"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-blue-100 ${className || ''}`}
      {...props}
    >
      <div
        className="h-full bg-blue-600 transition-all duration-300"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
