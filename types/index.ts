export interface Category {
  id: string
  name: string
  color: string
  icon: string
  budget?: number | null
}

export interface CategoryWithSpending extends Category {
  spent: number
  received?: number
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
