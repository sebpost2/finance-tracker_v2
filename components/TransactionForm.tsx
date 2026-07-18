"use client"

import { useState, useTransition } from "react"
import { createTransaction, updateTransaction } from "@/app/actions/transactions"
import { useToast } from "@/contexts/ToastContext"
import { useLanguage } from "./LanguageProvider"
import type { Category, Transaction } from "@/types"

interface Props {
  categories: Category[]
  transaction?: Transaction
  onClose: () => void
}

export default function TransactionForm({ categories, transaction, onClose }: Props) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? "EXPENSE")
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const { t } = useLanguage()

  function handleSubmit(formData: FormData) {
    formData.set("type", type)
    startTransition(async () => {
      if (transaction) {
        await updateTransaction(transaction.id, formData)
        showToast(t.transactions.updated)
      } else {
        await createTransaction(formData)
        showToast(t.transactions.added)
      }
      onClose()
    })
  }

  function toLocalDateInput(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const defaultDate = toLocalDateInput(transaction ? new Date(transaction.date) : new Date())

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          {transaction ? t.transactions.editTitle : t.transactions.addTitle}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(["EXPENSE", "INCOME"] as const).map((tt) => (
              <button
                key={tt}
                type="button"
                onClick={() => setType(tt)}
                className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  type === tt
                    ? tt === "EXPENSE"
                      ? "border-red-300 bg-red-50 text-red-700 ring-2 ring-red-400"
                      : "border-green-300 bg-green-50 text-green-700 ring-2 ring-green-400"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {tt === "EXPENSE" ? t.transactions.expense : t.transactions.income}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.transactions.amount}
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={transaction?.amount}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={t.transactions.placeholderAmount}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.transactions.description}
            </label>
            <input
              name="description"
              type="text"
              required
              defaultValue={transaction?.description}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={t.transactions.placeholderDescription}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.transactions.category}
            </label>
            <select
              name="categoryId"
              defaultValue={transaction?.categoryId ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">{t.transactions.noCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.transactions.date}
            </label>
            <input
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {t.transactions.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isPending
                ? t.transactions.saving
                : transaction
                  ? t.transactions.update
                  : t.transactions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
