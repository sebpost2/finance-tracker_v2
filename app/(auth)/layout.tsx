export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
