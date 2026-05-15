import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getSession } from "./session"
import { prisma } from "./prisma"

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect("/login")
  return { userId: session.userId }
})

export const getUser = cache(async () => {
  const { userId } = await verifySession()
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })
})
