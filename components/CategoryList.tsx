"use client"

import { useState, useTransition } from "react"
import { deleteCategory } from "@/app/actions/categories"
import CategoryForm from "./CategoryForm"
import type { Category } from "@/types"

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()
  const [isPending, startTransition] = useTransition()

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
    startTransition(() => deleteCategory(id))
  }

  return (
    <>
      {showForm && <CategoryForm category={editing} onClose={closeForm} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Categories</h2>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No categories yet</div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 ${isPending ? "opacity-50" : ""}`}>
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: c.color + "20" }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
