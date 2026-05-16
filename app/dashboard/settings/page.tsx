import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import ProfileForm from "@/components/ProfileForm"
import PasswordForm from "@/components/PasswordForm"

export default async function SettingsPage() {
  const { userId } = await verifySession()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <ProfileForm name={user?.name ?? ""} email={user?.email ?? ""} />
      <PasswordForm />
    </div>
  )
}
