import { hasConcreteChallenge, isEmotionallyRegulated, identifyChallengeType } from '../exercise-gate'

describe('hasConcreteChallenge', () => {
  it('returns true when user describes a concrete challenge', () => {
    expect(hasConcreteChallenge('I keep failing at staying sober on weekends')).toBe(true)
  })
  it('returns true for problem phrasing', () => {
    expect(hasConcreteChallenge('I have a problem with money')).toBe(true)
  })
  it('returns false for vague statements', () => {
    expect(hasConcreteChallenge('I feel okay today')).toBe(false)
  })
  it('returns false for empty input', () => {
    expect(hasConcreteChallenge('')).toBe(false)
  })
})

describe('isEmotionallyRegulated', () => {
  it('returns false when user is in acute distress', () => {
    expect(isEmotionallyRegulated('I am FALLING APART right now!!!')).toBe(false)
  })
  it('returns false for panic language', () => {
    expect(isEmotionallyRegulated('I feel panic building')).toBe(false)
  })
  it('returns true when user is calm and reflective', () => {
    expect(isEmotionallyRegulated('I think the pattern I noticed makes sense now')).toBe(true)
  })
})

describe('identifyChallengeType', () => {
  it('identifies addiction language', () => {
    expect(identifyChallengeType('I had a relapse last week')).toBe('addiction_recovery')
  })
  it('identifies anxiety language', () => {
    expect(identifyChallengeType('I am so anxious about work')).toBe('anxiety')
  })
  it('identifies depression language', () => {
    expect(identifyChallengeType('I have been feeling empty lately')).toBe('depression')
  })
  it('identifies relationship language', () => {
    expect(identifyChallengeType('my partner and I keep fighting')).toBe('relationships')
  })
  it('falls back to general', () => {
    expect(identifyChallengeType('something else entirely')).toBe('general')
  })
})
