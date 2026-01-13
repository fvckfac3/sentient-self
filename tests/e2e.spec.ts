import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test('should show login page for unauthenticated users', async ({ page }) => {
        await page.goto('/chat')
        // Should redirect to signin
        await expect(page).toHaveURL(/.*signin/)
    })

    test('should display signin form correctly', async ({ page }) => {
        await page.goto('/auth/signin')
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
        await expect(page.getByLabel(/email/i)).toBeVisible()
        await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/auth/signin')
        await page.getByLabel(/email/i).fill('invalid@test.com')
        await page.getByLabel(/password/i).fill('wrongpassword')
        await page.getByRole('button', { name: /sign in/i }).click()
        // Should show error message
        await expect(page.getByText(/invalid|error/i)).toBeVisible()
    })
})

test.describe('Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        // This would need auth setup - placeholder for now
        // await loginAsTestUser(page)
    })

    test('should display welcome step first', async ({ page }) => {
        // After login, new users should see onboarding
        await page.goto('/onboarding')
        await expect(page.getByText(/welcome/i)).toBeVisible()
    })

    test('should require consent checkbox to proceed', async ({ page }) => {
        await page.goto('/onboarding')
        // Navigate to consent step (step 7)
        // The "I Understand & Agree" button should be disabled until checkbox is checked
        // This is a placeholder - actual test would navigate through steps
    })
})

test.describe('Crisis Detection UI', () => {
    test.beforeEach(async ({ page }) => {
        // Would need auth setup
    })

    test('should show crisis banner when crisis language detected', async ({ page }) => {
        // This test would send a message with crisis language
        // and verify the crisis banner appears
        // Placeholder for actual implementation
    })

    test('should display crisis resources in banner', async ({ page }) => {
        // Verify 988, 911, and text line are visible in crisis state
    })
})

test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should show bottom navigation on mobile', async ({ page }) => {
        await page.goto('/')
        // Check for bottom nav visibility
        const bottomNav = page.locator('.bottom-nav')
        await expect(bottomNav).toBeVisible()
    })

    test('should hide top nav items on mobile', async ({ page }) => {
        await page.goto('/')
        // Desktop nav should be hidden, mobile nav visible
    })
})

test.describe('Progress Page', () => {
    test('should show empty state when no insights', async ({ page }) => {
        await page.goto('/progress')
        // For users with no completed exercises
        await expect(page.getByText(/no insights yet/i)).toBeVisible()
    })
})
