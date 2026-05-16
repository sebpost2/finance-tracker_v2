import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getMonthRange } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const month = req.nextUrl.searchParams.get("month") ?? undefined
  const { start, end } = getMonthRange(month)

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId, date: { gte: start, lte: end } },
    include: { category: true },
    orderBy: { date: "desc" },
  })

  const header = "Date,Description,Category,Type,Amount\n"
  const rows = transactions
    .map((t) => {
      const date = new Date(t.date).toISOString().split("T")[0]
      const desc = `"${t.description.replace(/"/g, '""')}"`
      const cat = t.category ? `"${t.category.name}"` : ""
      const amount = t.type === "EXPENSE" ? -t.amount : t.amount
      return `${date},${desc},${cat},${t.type},${amount.toFixed(2)}`
    })
    .join("\n")

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${month ?? "current"}.csv"`,
    },
  })
}
