import { test, expect } from "@playwright/test"

test.describe("Dashboard (demo account)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /Try demo/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  test("shows balance cards", async ({ page }) => {
    await expect(page.getByText("Total Balance")).toBeVisible()
    await expect(page.getByText("Income")).toBeVisible()
    await expect(page.getByText("Expenses")).toBeVisible()
  })

  test("shows 6-month trend chart", async ({ page }) => {
    await expect(page.getByText("6-Month Trend")).toBeVisible()
  })

  test("can navigate to transactions", async ({ page }) => {
    await page.getByRole("link", { name: "Transactions" }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/transactions/)
    await expect(page.getByText("Transactions")).toBeVisible()
  })

  test("can navigate to categories", async ({ page }) => {
    await page.getByRole("link", { name: "Categories" }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/categories/)
  })

  test("transactions page has search input", async ({ page }) => {
    await page.goto("/dashboard/transactions")
    await expect(page.getByPlaceholder("Search transactions…")).toBeVisible()
  })

  test("can log out", async ({ page }) => {
    await page.getByRole("button", { name: "Logout" }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
