"use client"

import { useState, useTransition } from "react"
import { deleteCategory } from "@/app/actions/categories"
import { useToast } from "@/contexts/ToastContext"
import CategoryForm from "./CategoryForm"
import type { Category } from "@/types"

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  function openEdit(c: Category) {
    setEditing(c)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(undefined)
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this category? Transactions using it will be uncategorized.")) return
    startTransition(async () => {
      await deleteCategory(id)
      showToast("Category deleted", "info")
    })
  }

  return (
    <>
      {showForm && <CategoryForm category={editing} onClose={closeForm} />}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Categories</h2>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">No categories yet</div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 ${isPending ? "opacity-50" : ""}`}>
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: c.color + "20" }}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Edit">✏️</button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
