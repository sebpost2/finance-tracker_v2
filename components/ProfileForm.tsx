"use client"

import { useActionState, useEffect } from "react"
import { updateProfile } from "@/app/actions/settings"
import { useToast } from "@/contexts/ToastContext"

export default function ProfileForm({ name, email }: { name?: string; email?: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)
  const { showToast } = useToast()

  useEffect(() => {
    if (state?.success) showToast("Profile updated")
  }, [state?.success])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Profile</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Update your display name</p>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={name}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  )
}
