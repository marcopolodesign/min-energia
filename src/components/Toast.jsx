import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

let toastId = 0
const listeners = new Set()

export const toast = {
  success: (message) => { const id = toastId++; listeners.forEach(l => l({ id, type: 'success', message })); return id },
  error:   (message) => { const id = toastId++; listeners.forEach(l => l({ id, type: 'error',   message })); return id },
  info:    (message) => { const id = toastId++; listeners.forEach(l => l({ id, type: 'info',    message })); return id },
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    listeners.add(handleToast)
    return () => listeners.delete(handleToast)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm animate-fade-in border
          ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          ${t.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' : ''}
          ${t.type === 'info'    ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
        `}>
          {t.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0" />}
          {t.type === 'error'   && <XCircleIcon className="h-5 w-5 text-red-600 shrink-0" />}
          {t.type === 'info'    && <InformationCircleIcon className="h-5 w-5 text-blue-600 shrink-0" />}
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-gray-400 hover:text-gray-600 shrink-0">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
