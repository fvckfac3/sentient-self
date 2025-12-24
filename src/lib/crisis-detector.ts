/**
 * Crisis Detection System for Sentient Self
 * 
 * CRITICAL: This system detects potential mental health crises
 * and triggers immediate safety responses.
 */

export interface CrisisDetectionResult {
  isCrisis: boolean
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  triggers: string[]
  recommendedAction: 'continue' | 'gentle_check' | 'safety_check' | 'crisis_mode'
}

// Crisis trigger patterns - HANDLE WITH EXTREME CARE
const CRITICAL_PATTERNS = [
  // Suicidal ideation
  /\b(want(ing)? to (die|end it|kill myself)|suicid(e|al)|end my life|don'?t want to (live|be here|exist))\b/i,
  /\b(better off (dead|without me)|no reason to (live|go on)|can'?t (go on|take it anymore))\b/i,
  /\b(going to kill myself|planning to (end it|die|kill myself)|have a plan to)\b/i,
  /\b(kill myself|killing myself)\b/i,
  
  // Self-harm
  /\b(cut(ting)? myself|hurt(ing)? myself|self[- ]?harm|burn(ing)? myself)\b/i,
  /\b(want to (hurt|cut|harm) myself)\b/i,
  
  // Imminent danger
  /\b(going to do it (tonight|today|now)|this is (goodbye|the end)|final (message|goodbye))\b/i,
  /\b(have (pills|gun|knife|rope) ready|wrote (a )?(suicide )?note)\b/i,
]

const HIGH_PATTERNS = [
  // Hopelessness
  /\b(no (hope|point|way out)|hopeless|nothing (matters|will help))\b/i,
  /\b(everyone would be better off|no one (cares|would miss me))\b/i,
  /\b(can'?t see a (future|way forward)|trapped|no escape)\b/i,
  /\b(no point (in|to) (going on|living|continuing))\b/i,
  /\b(don'?t see (any|the) point)\b/i,
  
  // Severe distress
  /\b(can'?t (breathe|function|cope)|falling apart|breaking down)\b/i,
  /\b(unbearable|can'?t (stand|handle) (it|this|anymore))\b/i,
]

const MEDIUM_PATTERNS = [
  // Passive ideation
  /\b(wish I (wasn'?t here|didn'?t exist|could disappear))\b/i,
  /\b(don'?t (care|want to) wake up|sleep forever)\b/i,
  
  // Severe emotional distress
  /\b(hate myself|worthless|disgusting|broken beyond repair)\b/i,
  /\b(can'?t (do this|keep going|take (this|it)))\b/i,
]

const LOW_PATTERNS = [
  // General distress that warrants gentle check
  /\b(really (struggling|hurting)|in (a lot of )?pain)\b/i,
  /\b(scared|terrified|panicking)\b/i,
  /\b(alone|isolated|no one understands)\b/i,
]

/**
 * Detect crisis indicators in a message
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const triggers: string[] = []
  let severity: CrisisDetectionResult['severity'] = 'none'
  
  // Check CRITICAL patterns first (highest priority)
  for (const pattern of CRITICAL_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      triggers.push(match[0])
      severity = 'critical'
    }
  }
  
  // Check HIGH patterns
  if (severity !== 'critical') {
    for (const pattern of HIGH_PATTERNS) {
      const match = message.match(pattern)
      if (match) {
        triggers.push(match[0])
        if (severity !== 'high') severity = 'high'
      }
    }
  }
  
  // Check MEDIUM patterns
  if (severity === 'none') {
    for (const pattern of MEDIUM_PATTERNS) {
      const match = message.match(pattern)
      if (match) {
        triggers.push(match[0])
        severity = 'medium'
      }
    }
  }
  
  // Check LOW patterns
  if (severity === 'none') {
    for (const pattern of LOW_PATTERNS) {
      const match = message.match(pattern)
      if (match) {
        triggers.push(match[0])
        severity = 'low'
      }
    }
  }
  
  // Determine recommended action
  let recommendedAction: CrisisDetectionResult['recommendedAction'] = 'continue'
  if (severity === 'critical') {
    recommendedAction = 'crisis_mode'
  } else if (severity === 'high') {
    recommendedAction = 'safety_check'
  } else if (severity === 'medium') {
    recommendedAction = 'safety_check'
  } else if (severity === 'low') {
    recommendedAction = 'gentle_check'
  }
  
  return {
    isCrisis: severity === 'critical' || severity === 'high',
    severity,
    triggers,
    recommendedAction
  }
}

/**
 * Get crisis response message
 */
export function getCrisisResponse(severity: CrisisDetectionResult['severity']): string {
  if (severity === 'critical') {
    return `I'm really concerned about what you've shared. Your safety is the most important thing right now.

**Please reach out for immediate support:**

📞 **988 Suicide & Crisis Lifeline**
Call or text **988** (available 24/7)

🚨 **Emergency Services**
Call **911** if you're in immediate danger

💬 **Crisis Text Line**
Text **HOME** to **741741**

You don't have to face this alone. These services have trained counselors ready to help right now.

I'm here with you, but I want to make sure you have access to the specialized support you deserve. Will you reach out to one of these resources?`
  }
  
  if (severity === 'high') {
    return `I hear that you're going through something really painful right now. What you're feeling is serious, and I want to make sure you're safe.

**Support resources available 24/7:**

📞 **988 Suicide & Crisis Lifeline**: Call or text **988**
💬 **Crisis Text Line**: Text **HOME** to **741741**

These are free, confidential services with people who understand.

Can you tell me more about what's happening? And are you safe right now?`
  }
  
  if (severity === 'medium') {
    return `I can sense you're carrying something heavy right now. I want you to know that what you're feeling matters, and you deserve support.

Before we continue, I want to check in: Are you having any thoughts of hurting yourself?

If you ever need immediate support:
📞 **988** - Suicide & Crisis Lifeline (call or text, 24/7)

I'm here to listen. What would feel most helpful right now?`
  }
  
  // Low severity - gentle check-in
  return `I hear that you're really struggling right now. That takes courage to share.

I want to make sure I understand what you're going through. Can you tell me more about what's been happening?

And just so you know - if things ever feel too overwhelming, the 988 Lifeline is always available (call or text 988, 24/7).`
}
