export default function YearlyLoading() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-96" />
    </div>
  )
}
