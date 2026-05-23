import type { Metadata } from "next"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import ProfileForm from "@/components/ProfileForm"
import PasswordForm from "@/components/PasswordForm"
import { getDict } from "@/lib/i18n-server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict()
  return { title: t.meta.settingsTitle }
}

export default async function SettingsPage() {
  const { userId } = await verifySession()
  const t = await getDict()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>
      <ProfileForm name={user?.name ?? ""} email={user?.email ?? ""} />
      <PasswordForm />
    </div>
  )
}
