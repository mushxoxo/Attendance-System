import * as React from "react"
import { X } from "lucide-react"

// Simple toast implementation without radix-ui
const ToastContext = React.createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
})

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])
  
  const addToast = (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto dismiss
    setTimeout(() => {
      removeToast(id)
    }, 5000)
    
    return id
  }
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

const ToastViewport = () => {
  const { toasts, removeToast } = React.useContext(ToastContext)
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const getToastClasses = (variant) => {
  const baseClasses = "flex items-center justify-between w-full rounded-md border p-4 shadow-lg animate-fade-in-up";
  
  switch (variant) {
    case "destructive":
      return `${baseClasses} bg-red-50 border-red-500 text-red-900`;
    case "success":
      return `${baseClasses} bg-green-50 border-green-500 text-green-900`;
    case "info":
      return `${baseClasses} bg-blue-50 border-blue-500 text-blue-900`;
    case "warning":
      return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-900`;
    default:
      return `${baseClasses} bg-white border-gray-200 text-gray-900`;
  }
};

const Toast = ({ title, description, variant = "default", onClose }) => {
  return (
    <div className={getToastClasses(variant)}>
      <div className="flex-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      <ToastClose onClick={onClose} />
    </div>
  )
}

const ToastTitle = ({ children, className }) => (
  <div className={`text-sm font-semibold ${className || ''}`}>{children}</div>
)

const ToastDescription = ({ children, className }) => (
  <div className={`text-sm opacity-90 ${className || ''}`}>{children}</div>
)

const ToastClose = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={`p-1 rounded-md text-gray-400 hover:text-gray-600 ${className || ''}`}
  >
    <X className="h-4 w-4" />
  </button>
)

const ToastAction = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`inline-flex h-8 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-100 ${className || ''}`}
  >
    {children}
  </button>
)

// Hook to use toast
const useToast = () => {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast
}
