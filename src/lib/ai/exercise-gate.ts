export function hasConcreteChallenge(message: string): boolean {
  const challengePatterns = [
    /\b(struggling with|having trouble|can't seem to|keep failing|problem with)\b/i,
    /\b(anxious about|worried about|stressed about|overwhelmed by)\b/i,
    /\b(craving|urge to|tempted to|wanting to)\b/i,
    /\b(angry at|frustrated with|disappointed in)\b/i,
    /\b(relationship|work|family|money|health) (problem|issue|challenge)\b/i
  ]

  return challengePatterns.some(pattern => pattern.test(message))
}

export function isEmotionallyRegulated(message: string): boolean {
  const dysregulationPatterns = [
    /\b(can't think|mind racing|losing it|falling apart)\b/i,
    /\b(panic|terror|rage|fury)\b/i,
    /[!]{3,}|[?]{3,}/,
    /[A-Z]{5,}/
  ]

  return !dysregulationPatterns.some(pattern => pattern.test(message))
}

export function identifyChallengeType(message: string): string {
  if (/\b(craving|urge|tempted|relapse|substance|drink|drug)\b/i.test(message)) {
    return 'addiction_recovery'
  }
  if (/\b(anxious|anxiety|worried|panic|fear)\b/i.test(message)) {
    return 'anxiety'
  }
  if (/\b(angry|rage|frustrated|mad)\b/i.test(message)) {
    return 'anger'
  }
  if (/\b(sad|depressed|hopeless|empty)\b/i.test(message)) {
    return 'depression'
  }
  if (/\b(relationship|partner|family|friend)\b/i.test(message)) {
    return 'relationships'
  }
  return 'general'
}
