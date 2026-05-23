"use client"

import { useState, useTransition, useOptimistic } from "react"
import { deleteTransaction } from "@/app/actions/transactions"
import { useToast } from "@/contexts/ToastContext"
import { useLanguage } from "./LanguageProvider"
import TransactionForm from "./TransactionForm"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Category, Transaction } from "@/types"
import Link from "next/link"

interface Props {
  transactions: Transaction[]
  categories: Category[]
  showAdd?: boolean
}

export default function TransactionList({ transactions, categories, showAdd = true }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [, startTransition] = useTransition()
  const { showToast } = useToast()
  const { t } = useLanguage()

  const [optimistic, removeOptimistic] = useOptimistic(
    transactions,
    (current, removedId: string) => current.filter((t) => t.id !== removedId)
  )

  function openEdit(t: Transaction) {
    setEditing(t)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(undefined)
  }

  function handleDelete(id: string) {
    if (!confirm(t.transactions.confirmDelete)) return
    startTransition(async () => {
      removeOptimistic(id)
      await deleteTransaction(id)
      showToast(t.transactions.deleted, "info")
    })
  }

  return (
    <>
      {showForm && (
        <TransactionForm categories={categories} transaction={editing} onClose={closeForm} />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t.transactions.title}
          </h2>
          {showAdd && (
            <button
              onClick={() => { setEditing(undefined); setShowForm(true) }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t.transactions.add}
            </button>
          )}
        </div>

        {optimistic.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <span className="text-5xl">💳</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {t.transactions.emptyTitle}
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              {showAdd ? t.transactions.emptyStart : t.transactions.emptyMonth}
            </p>
            {showAdd ? (
              <button
                onClick={() => { setEditing(undefined); setShowForm(true) }}
                className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {t.transactions.addLong}
              </button>
            ) : (
              <Link
                href="/dashboard/transactions"
                className="mt-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t.transactions.goTo}
              </Link>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {optimistic.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                    {tx.category && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ backgroundColor: tx.category.color + "20", color: tx.category.color }}
                      >
                        {tx.category.icon} {tx.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(tx.date)}</p>
                </div>

                <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(tx)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label={t.transactions.editAria}>✏️</button>
                  <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label={t.transactions.deleteAria}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
