export default function SettingsLoading() {
  return (
    <div className="space-y-5 max-w-xl animate-pulse">
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      {[0, 1].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
