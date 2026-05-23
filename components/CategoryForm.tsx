"use client"

import { useTransition } from "react"
import { createCategory, updateCategory } from "@/app/actions/categories"
import { useToast } from "@/contexts/ToastContext"
import { useLanguage } from "./LanguageProvider"
import type { Category } from "@/types"

const ICONS = ["💰", "🍔", "🚗", "🎮", "💊", "🛍️", "💼", "🏠", "✈️", "📚", "⚽", "🎵", "💻", "🐶", "☕"]
const COLORS = [
  "#6366f1", "#f97316", "#3b82f6", "#8b5cf6", "#22c55e",
  "#ec4899", "#14b8a6", "#eab308", "#ef4444", "#06b6d4",
  "#84cc16", "#f43f5e", "#a855f7", "#64748b", "#fb923c",
]

interface Props {
  category?: Category
  onClose: () => void
}

export default function CategoryForm({ category, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const { t } = useLanguage()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (category) {
        await updateCategory(category.id, formData)
        showToast(t.categories.updated)
      } else {
        await createCategory(formData)
        showToast(t.categories.added)
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          {category ? t.categories.editTitle : t.categories.addTitle}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.categories.name}
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={category?.name}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={t.categories.namePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.categories.monthlyBudget}{" "}
              <span className="text-gray-400 font-normal">{t.categories.optional}</span>
            </label>
            <input
              name="budget"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={category?.budget ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={t.categories.budgetPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.categories.icon}
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <label key={icon} className="cursor-pointer">
                  <input type="radio" name="icon" value={icon} defaultChecked={category?.icon === icon || (!category && icon === "💰")} className="sr-only peer" />
                  <span className="text-xl w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {icon}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.categories.color}
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input type="radio" name="color" value={color} defaultChecked={category?.color === color || (!category && color === "#6366f1")} className="sr-only peer" />
                  <span className="w-7 h-7 rounded-full block border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white peer-checked:scale-110 hover:scale-105 transition-transform" style={{ backgroundColor: color }} />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isPending} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
              {t.categories.cancel}
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {isPending
                ? t.categories.saving
                : category
                  ? t.categories.update
                  : t.categories.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
