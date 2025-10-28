import * as React from "react"

const getButtonClasses = (variant, size, className) => {
  // Base classes
  let classes = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ";
  
  // Variant classes
  switch (variant) {
    case "destructive":
      classes += "bg-red-600 text-white shadow-sm hover:bg-red-700 ";
      break;
    case "outline":
      classes += "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 ";
      break;
    case "secondary":
      classes += "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 ";
      break;
    case "ghost":
      classes += "hover:bg-gray-100 ";
      break;
    case "link":
      classes += "text-blue-600 underline-offset-4 hover:underline ";
      break;
    case "gradient":
      classes += "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:opacity-90 ";
      break;
    default: // default variant
      classes += "bg-blue-600 text-white shadow hover:bg-blue-700 ";
      break;
  }
  
  // Size classes
  switch (size) {
    case "sm":
      classes += "h-8 px-3 py-1 text-xs ";
      break;
    case "lg":
      classes += "h-10 px-8 py-2 text-base ";
      break;
    case "xl":
      classes += "h-12 px-10 py-3 text-lg ";
      break;
    case "icon":
      classes += "h-9 w-9 p-0 ";
      break;
    default: // default size
      classes += "h-9 px-4 py-2 ";
      break;
  }
  
  // Add custom classes
  if (className) {
    classes += className;
  }
  
  return classes;
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  ...props 
}, ref) => {
  return (
    <button
      className={getButtonClasses(variant, size, className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
