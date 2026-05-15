export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Transaction {
  id: string
  amount: number
  description: string
  type: "INCOME" | "EXPENSE"
  categoryId: string | null
  date: Date
  category?: Category | null
}
