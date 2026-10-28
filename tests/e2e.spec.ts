import { test, expect, type Page } from '@playwright/test'

/**
 * End-to-end tests for the core user journey. They need a running app with a
 * migrated, seeded database (see DEPLOYMENT.md). No AI keys are required:
 * without them the chat falls back to a canned reply, which is enough to
 * exercise the flow, and crisis detection runs before any AI call.
 */

const PASSWORD = 'correct-horse-battery'

// Each test gets its own client IP so the per-IP signup limit (5/hour)
// doesn't trip; Vercel overwrites this header in production
function randomIp() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 254) + 1).join('.')
}

test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ 'x-forwarded-for': randomIp() })
})

function uniqueEmail() {
    return `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

async function gotoReady(page: Page, path: string) {
    await page.goto(path)
    // Wait for hydration so React doesn't reset inputs we've typed into
    await page.waitForLoadState('networkidle')
}

async function signUp(page: Page, email: string) {
    await gotoReady(page, '/auth/signup')
    await page.getByPlaceholder('Email address').fill(email)
    await page.getByPlaceholder(/^Password/).fill(PASSWORD)
    await page.getByPlaceholder('Confirm password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL(/\/onboarding/)
}

async function completeOnboarding(page: Page) {
    const next = () => page.getByRole('button', { name: /continue|next/i }).last().click()

    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByText('Addiction Recovery').click()
    await next()
    await page.getByText('Overwhelming stress').click()
    await next()
    await page.getByText('Alcohol', { exact: true }).click()
    await next()
    await page.getByText('Hopeful').click()
    await next()
    await page.getByText('Balanced').click()
    await page.getByText('Sometimes').click()
    await next()

    // Consent step: the agree button stays disabled until the box is ticked
    const agree = page.getByRole('button', { name: /I Understand & Agree/ })
    await expect(agree).toBeDisabled()
    await page.getByRole('button', { name: /I understand and agree to these terms/i }).click()
    await agree.click()

    await page.getByRole('button', { name: /Begin My Journey/ }).click()
    await page.waitForURL(/\/chat/)
}

async function sendChat(page: Page, text: string) {
    const input = page.getByPlaceholder("Share what's on your mind...")
    await input.fill(text)
    await input.press('Enter')
}

test.describe('Public pages', () => {
    test('legal pages and metadata routes load', async ({ page, request }) => {
        await gotoReady(page, '/privacy')
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
        await gotoReady(page, '/terms')
        await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible()

        for (const path of ['/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/icon.svg']) {
            expect((await request.get(path)).ok(), path).toBeTruthy()
        }
    })

    test('signed-out visitors are sent to sign in', async ({ page }) => {
        await page.goto('/chat')
        await expect(page).toHaveURL(/\/auth\/signin/)
    })

    test('signup links to the legal pages and hides the app nav', async ({ page }) => {
        await gotoReady(page, '/auth/signup')
        await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
        await expect(page.locator('.bottom-nav')).toHaveCount(0)
    })

    test('wrong password shows an error', async ({ page }) => {
        await gotoReady(page, '/auth/signin')
        await page.getByPlaceholder(/email/i).fill('nobody@example.com')
        await page.getByPlaceholder(/password/i).fill('wrong-password')
        await page.getByRole('button', { name: /^sign in$/i }).click()
        await expect(page.getByText(/invalid email or password/i).first()).toBeVisible()
    })
})

test.describe('Core journey', () => {
    test('sign up, onboard, chat, journal, export, sign out, delete', async ({ page, request }) => {
        test.setTimeout(120_000)
        const email = uniqueEmail()

        await signUp(page, email)
        // Onboarding has its own consent step, so no disclaimer modal here
        await expect(page.getByText('Important Health Information')).toHaveCount(0)
        await completeOnboarding(page)

        // Chat: the message shows and a reply comes back
        await sendChat(page, 'I have been feeling stressed about work lately.')
        await expect(page.getByText('I have been feeling stressed about work lately.')).toBeVisible()
        await expect(page.getByText('Sorry, I encountered an error')).toHaveCount(0)

        // Conversation survives a reload
        await page.reload()
        await expect(page.getByText('I have been feeling stressed about work lately.')).toBeVisible()

        // Journal
        await gotoReady(page, '/journal')
        const newEntry = page.getByRole('button', { name: /new entry|write|add/i }).first()
        if (await newEntry.count()) await newEntry.click()
        await page.locator('textarea').first().fill('Went for a walk and felt calmer afterwards.')
        await page.getByRole('button', { name: /save/i }).first().click()
        await expect(page.getByText('Went for a walk and felt calmer afterwards.').first()).toBeVisible()

        // Export includes the journal entry
        const exported = await page.request.get('/api/export?format=json')
        expect(exported.ok()).toBeTruthy()
        expect(await exported.text()).toContain('Went for a walk')

        // Sign out clears the locally stored conversation
        await gotoReady(page, '/settings')
        await page.getByRole('button', { name: 'Sign Out' }).click()
        await page.waitForURL(url => !url.pathname.startsWith('/settings'))
        const stored = await page.evaluate(() => localStorage.getItem('conversation-storage'))
        expect(stored ?? '').not.toContain('stressed about work')

        // Sign back in with different email casing
        await gotoReady(page, '/auth/signin')
        await page.getByPlaceholder(/email/i).fill(email.toUpperCase())
        await page.getByPlaceholder(/password/i).fill(PASSWORD)
        await page.getByRole('button', { name: /^sign in$/i }).click()
        await page.waitForURL(/\/chat/)

        // Delete the account
        await gotoReady(page, '/settings/privacy')
        await page.getByRole('button', { name: 'Delete My Account' }).click()
        await page.getByPlaceholder('DELETE').fill('DELETE')
        await page.getByRole('button', { name: /delete/i }).last().click()
        await page.waitForURL(url => url.pathname === '/')

        // The account is really gone
        const signup = await request.post('/api/auth/signup', { data: { email, password: PASSWORD } })
        expect(signup.status()).toBe(201)
    })

    test('crisis language shows crisis resources', async ({ page }) => {
        await signUp(page, uniqueEmail())
        await completeOnboarding(page)
        await sendChat(page, 'I wish I could just disappear')
        await expect(page.getByText(/988/).first()).toBeVisible()
    })
})

test.describe('Access control', () => {
    test("one user can't read another user's conversation", async ({ browser }) => {
        const alice = await browser.newPage({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })
        await signUp(alice, uniqueEmail())
        await completeOnboarding(alice)
        await sendChat(alice, 'Private note from Alice')
        await expect(alice.getByText('Private note from Alice')).toBeVisible()
        const aliceConversationId = await alice.evaluate(() => {
            const stored = JSON.parse(localStorage.getItem('conversation-storage') || '{}')
            return stored?.state?.currentConversation?.id as string
        })
        expect(aliceConversationId).toBeTruthy()

        const bob = await browser.newPage({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })
        await signUp(bob, uniqueEmail())
        await completeOnboarding(bob)
        const res = await bob.request.post('/api/chat', {
            data: { message: 'hello', conversationId: aliceConversationId },
        })
        expect(res.status()).toBe(404)
        const active = await bob.request.get(`/api/exercises/active?conversationId=${aliceConversationId}`)
        expect(active.status()).toBe(404)
    })

    test("free accounts can't select premium models", async ({ page }) => {
        await signUp(page, uniqueEmail())
        const res = await page.request.put('/api/user/preferences', {
            data: { preferredModel: 'claude-opus-5-5' },
        })
        expect(res.status()).toBe(403)
    })
})

test.describe('Layout', () => {
    test('signed-in pages fit the screen without sideways scrolling', async ({ page }) => {
        await signUp(page, uniqueEmail())
        await completeOnboarding(page)
        for (const path of ['/chat', '/journal', '/progress', '/settings', '/settings/privacy', '/settings/ai']) {
            await gotoReady(page, path)
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
            expect(overflow, path).toBeLessThanOrEqual(1)
        }
        // Sign out is reachable at every width
        await gotoReady(page, '/settings')
        await expect(page.getByRole('button', { name: 'Sign Out' })).toBeInViewport()
    })
})
