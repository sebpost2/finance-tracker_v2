"use client"

import { useToast } from "@/contexts/ToastContext"

const CONFIG = {
  success: { icon: "✅", bg: "bg-green-600" },
  error:   { icon: "❌", bg: "bg-red-600" },
  info:    { icon: "ℹ️",  bg: "bg-indigo-600" },
}

export default function Toaster() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((toast) => {
        const { icon, bg } = CONFIG[toast.type]
        return (
          <div
            key={toast.id}
            className={`${bg} text-white flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-xs pointer-events-auto`}
          >
            <span className="text-base shrink-0">{icon}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/70 hover:text-white text-xl leading-none shrink-0 ml-1"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
