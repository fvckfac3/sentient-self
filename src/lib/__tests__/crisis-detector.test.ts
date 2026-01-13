import { detectCrisis, getCrisisResponse } from '@/lib/crisis-detector'

describe('Crisis Detector', () => {
    describe('detectCrisis', () => {
        it('should detect critical severity for explicit suicidal ideation', () => {
            const result = detectCrisis('I want to end my life')
            expect(result.isCrisis).toBe(true)
            expect(result.severity).toBe('critical')
            expect(result.recommendedAction).toBe('crisis_mode')
        })

        it('should detect critical severity for self-harm mentions', () => {
            const result = detectCrisis('I want to hurt myself')
            expect(result.isCrisis).toBe(true)
            expect(result.severity).toBe('critical')
        })

        it('should detect high severity for hopelessness', () => {
            const result = detectCrisis('There is no hope for me')
            expect(result.severity).toBe('high')
            expect(result.recommendedAction).toBe('safety_check')
        })

        it('should detect medium severity for passive ideation', () => {
            const result = detectCrisis('I wish I could just disappear')
            expect(result.severity).toBe('medium')
        })

        it('should detect low severity for general distress', () => {
            const result = detectCrisis('I am really struggling right now')
            expect(result.severity).toBe('low')
            expect(result.recommendedAction).toBe('gentle_check')
        })

        it('should return none for normal messages', () => {
            const result = detectCrisis('I had a good day today')
            expect(result.isCrisis).toBe(false)
            expect(result.severity).toBe('none')
            expect(result.recommendedAction).toBe('continue')
        })

        it('should not false positive on recovery language', () => {
            const result = detectCrisis('I used to feel hopeless but now I feel better')
            // Should not trigger on past tense recovery statements
            expect(result.severity).not.toBe('critical')
        })
    })

    describe('getCrisisResponse', () => {
        it('should return crisis resources for critical severity', () => {
            const response = getCrisisResponse('critical')
            expect(response).toContain('988')
            expect(response).toContain('911')
        })

        it('should return softer message for low severity', () => {
            const response = getCrisisResponse('low')
            expect(response).toContain('struggling')
            expect(response).not.toContain('emergency')
        })
    })
})
