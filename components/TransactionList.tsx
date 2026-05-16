"use client"

import { useState, useTransition } from "react"
import { deleteTransaction } from "@/app/actions/transactions"
import { useToast } from "@/contexts/ToastContext"
import TransactionForm from "./TransactionForm"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Category, Transaction } from "@/types"

interface Props {
  transactions: Transaction[]
  categories: Category[]
  showAdd?: boolean
}

export default function TransactionList({ transactions, categories, showAdd = true }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  function openEdit(t: Transaction) {
    setEditing(t)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(undefined)
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return
    startTransition(async () => {
      await deleteTransaction(id)
      showToast("Transaction deleted", "info")
    })
  }

  return (
    <>
      {showForm && (
        <TransactionForm categories={categories} transaction={editing} onClose={closeForm} />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transactions</h2>
          {showAdd && (
            <button
              onClick={() => { setEditing(undefined); setShowForm(true) }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No transactions yet
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800 ${isPending ? "opacity-50" : ""}`}>
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.description}</p>
                    {t.category && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ backgroundColor: t.category.color + "20", color: t.category.color }}
                      >
                        {t.category.icon} {t.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(t.date)}</p>
                </div>

                <p className={`text-sm font-semibold flex-shrink-0 ${t.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Edit">✏️</button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
