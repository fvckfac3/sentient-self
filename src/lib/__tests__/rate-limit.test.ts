/**
 * @jest-environment node
 */
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit (in-memory)', () => {
    it('allows up to the limit, then blocks', async () => {
        const key = `test:${Math.random()}`
        const results = []
        for (let i = 0; i < 4; i++) {
            results.push(await rateLimit({ key, limit: 3, windowMs: 60_000 }))
        }
        expect(results.map(r => r.success)).toEqual([true, true, true, false])
        expect(results[2].remaining).toBe(0)
    })

    it('starts a new window once the old one expires', async () => {
        const key = `test:${Math.random()}`
        const now = Date.now()
        const spy = jest.spyOn(Date, 'now').mockReturnValue(now)
        await rateLimit({ key, limit: 1, windowMs: 1000 })
        expect((await rateLimit({ key, limit: 1, windowMs: 1000 })).success).toBe(false)
        spy.mockReturnValue(now + 1001)
        expect((await rateLimit({ key, limit: 1, windowMs: 1000 })).success).toBe(true)
        spy.mockRestore()
    })

    it('keeps separate counts per key', async () => {
        const a = await rateLimit({ key: `a:${Math.random()}`, limit: 1, windowMs: 60_000 })
        const b = await rateLimit({ key: `b:${Math.random()}`, limit: 1, windowMs: 60_000 })
        expect(a.success && b.success).toBe(true)
    })
})
