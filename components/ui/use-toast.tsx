import { useState } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11)
    const newToast = { id, title, description, variant }
    setToasts((prev) => [...prev, newToast])

    // Simple alert for now
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description}`)
    } else {
      alert(`${title}${description ? '\n' + description : ''}`)
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return { toast, toasts }
}
