import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("Finance Tracker")).toBeVisible()
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••")).toBeVisible()
    await expect(page.getByText("Try demo")).toBeVisible()
  })

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("you@example.com").fill("wrong@example.com")
    await page.getByPlaceholder("••••••••").fill("wrongpassword")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 10000 })
  })

  test("demo login lands on dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /Try demo/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByText("Dashboard")).toBeVisible()
  })

  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByText("Create account")).toBeVisible()
    await expect(page.getByPlaceholder("John Doe")).toBeVisible()
  })
})
