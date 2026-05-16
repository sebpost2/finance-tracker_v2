import { getUser } from "@/lib/dal"
import { logout } from "@/app/actions/auth"
import NavLinks from "./NavLinks"
import ThemeToggle from "./ThemeToggle"

export default async function Navbar() {
  const user = await getUser()

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-indigo-600 shrink-0">💰 Finance</span>
            {/* Nav links hidden on mobile — BottomNav handles mobile navigation */}
            <div className="hidden md:block">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block px-2 truncate max-w-[120px]">
              {user?.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
