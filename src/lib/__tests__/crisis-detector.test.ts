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

        it('should detect critical severity for "end it all"', () => {
            const result = detectCrisis('I just want to end it all')
            expect(result.severity).toBe('critical')
 expect(result.isCrisis).toBe(true)
        })

        it('should detect high severity for "wish I was dead"', () => {
            const result = detectCrisis('Sometimes I wish I was dead')
            expect(result.severity).toBe('high')
            expect(result.recommendedAction).toBe('safety_check')
        })

        it('should detect medium severity for "never wake up"', () => {
            const result = detectCrisis("I just want to sleep and never wake up")
            expect(result.severity).toBe('medium')
        })

        it('should detect medium severity for "want to disappear"', () => {
            const result = detectCrisis('I want to disappear')
            expect(result.severity).toBe('medium')
        })

        it('should detect high severity for perceived burdensomeness', () => {
            const result = detectCrisis("No one would notice if I was gone")
            expect(result.severity).toBe('high')
        })

        it('should detect high severity for "can\u2019t do this anymore" with curly apostrophe', () => {
            const result = detectCrisis('I can\u2019t do this anymore')
            expect(result.severity).toBe('high')
        })

        it('should not false positive on "Kill Bill" mention', () => {
            const result = detectCrisis('We watched Kill Bill last night, it was great')
            expect(result.severity).toBe('none')
        })

        it('should not false positive on grief', () => {
            const result = detectCrisis('My grandmother died last year and I miss her')
            expect(result.severity).toBe('none')
        })

        it('should not false positive on discussion about others', () => {
            const result = detectCrisis('My brother struggled with depression but he is doing better now')
            expect(result.severity).toBe('none')
        })

        it('should not false positive on therapist/patient discussion', () => {
            const result = detectCrisis('My therapist says I am making real progress with these thoughts')
            expect(result.severity).toBe('none')
        })

        it('should handle empty and whitespace-only messages', () => {
            expect(detectCrisis('').severity).toBe('none')
            expect(detectCrisis('   ').severity).toBe('none')
        })

        it('should handle very long messages', () => {
            const long = 'I had a normal day. '.repeat(500) + 'I want to end my life'
            const result = detectCrisis(long)
            expect(result.isCrisis).toBe(true)
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
