import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
