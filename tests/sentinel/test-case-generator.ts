/**
 * SENTINEL Test Case Generator
 *
 * Generates random test cases to expand test suite to 100+ cases
 */

import type { TestCase } from './test-cases'
import type { BehavioralMetrics } from '@/features/survey/types'

// Seed for deterministic random generation
let seed = 12345
function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)]
}

/**
 * Generate random legitimate test cases
 */
export function generateLegitimateCase(id: number): TestCase {
  const responsePatterns = [
    { q: 'What did you think of our service?', a: ['Great service, very professional and responsive.', 'It was okay, could be better in some areas.', 'Really impressed with the quality and attention to detail.', 'Good overall experience, would recommend.', 'Satisfied with the outcome, met my expectations.'] },
    { q: 'How would you rate the product?', a: ['4/5 - Very good quality', '5/5 - Excellent', '3/5 - Decent but has room for improvement', '4/5 - Solid product'] },
    { q: 'Would you recommend us?', a: ['Yes, definitely', 'Yes, I would', 'Probably yes', 'Maybe, depends on the use case'] },
    { q: 'Any feedback or suggestions?', a: ['The interface could be more intuitive', 'Everything works well for me', 'Maybe add dark mode?', 'Great product, keep it up!'] },
  ]

  const pattern = randomChoice(responsePatterns)
  const responses: Record<string, any> = {}
  const questions: Record<string, string> = {}

  const numQuestions = randomInt(2, 4)
  for (let i = 0; i < numQuestions; i++) {
    const p = responsePatterns[i % responsePatterns.length]
    questions[`q${i + 1}`] = p.q
    responses[`q${i + 1}`] = randomChoice(p.a)
  }

  const wpm = randomInt(40, 80) // Natural typing speed
  const avgResponseTime = randomInt(5000, 15000)

  return {
    id: `legit_${id.toString().padStart(3, '0')}`,
    category: 'legitimate',
    description: `Legitimate response #${id} - natural human patterns`,
    expectedFraudScore: 0.05 + random() * 0.25, // 0.05-0.30
    expectedRiskLevel: 'low',
    questions,
    responses,
    behavioralMetrics: generateNaturalBehavior(responses, wpm, avgResponseTime),
    metadata: {
      shouldFlag: false,
      fraudIndicators: [],
      legitimateSignals: ['Natural typing patterns', 'Reasonable response times', 'Human-like mouse movement'],
    },
  }
}

/**
 * Generate random AI-generated test cases
 */
export function generateAICase(id: number): TestCase {
  const aiPhrases = [
    'As an AI language model',
    'It\'s important to note that',
    'It\'s worth noting that',
    'In my opinion',
    'From my perspective',
    'It\'s crucial to consider',
    'One must acknowledge',
    'It should be mentioned',
  ]

  const topics = [
    { q: 'What is your opinion on remote work?', topic: 'remote work' },
    { q: 'Describe your thoughts on climate change', topic: 'climate change' },
    { q: 'What do you think about artificial intelligence?', topic: 'artificial intelligence' },
    { q: 'How do you feel about social media?', topic: 'social media' },
    { q: 'What is your view on renewable energy?', topic: 'renewable energy' },
  ]

  const selectedTopic = randomChoice(topics)
  const aiPhrase = randomChoice(aiPhrases)

  const aiResponses = [
    `${aiPhrase}, ${selectedTopic.topic} presents both opportunities and challenges. On one hand, it offers significant benefits including increased efficiency and flexibility. However, it's crucial to consider the potential drawbacks such as reduced collaboration and communication difficulties. Overall, the effectiveness depends on various factors including organizational culture and individual preferences.`,
    `${selectedTopic.topic.charAt(0).toUpperCase() + selectedTopic.topic.slice(1)} represents a complex issue with multiple perspectives. While there are clear advantages to be considered, it's important to acknowledge the challenges that may arise. A balanced approach considering both benefits and limitations would be most prudent. Further research and careful implementation are essential for optimal outcomes.`,
    `Regarding ${selectedTopic.topic}, I believe it's essential to examine the various aspects comprehensively. The primary benefits include improved productivity and cost-effectiveness, though one must also consider potential negative implications. A nuanced understanding of the trade-offs involved is necessary for making informed decisions about implementation and policy.`,
  ]

  const questions = { q1: selectedTopic.q }
  const responses = { q1: randomChoice(aiResponses) }

  const hasTabSwitch = random() > 0.3 // 70% have tab switches
  const hasPaste = random() > 0.2 // 80% paste the content

  return {
    id: `ai_${id.toString().padStart(3, '0')}`,
    category: 'ai_generated',
    description: `AI-generated response #${id} with characteristic LLM patterns`,
    expectedFraudScore: 0.75 + random() * 0.2, // 0.75-0.95
    expectedRiskLevel: random() > 0.5 ? 'critical' : 'high',
    questions,
    responses,
    behavioralMetrics: generateAIBehavior(responses, hasTabSwitch, hasPaste),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'AI-characteristic phrases',
        'Overly formal academic tone',
        'Perfect grammar',
        hasPaste ? 'Paste event detected' : 'No typing events',
        hasTabSwitch ? 'Tab switch during response' : 'Suspiciously fast for text length',
      ],
    },
  }
}

/**
 * Generate random bot test cases
 */
export function generateBotCase(id: number): TestCase {
  const botTypes = ['selenium', 'puppeteer', 'autofill', 'headless']
  const botType = randomChoice(botTypes)

  const questions = {
    q1: 'Name',
    q2: 'Email',
    q3: 'Feedback',
  }

  const responses = {
    q1: randomChoice(['Test User', 'John Doe', 'Bot Test', 'Automated User']),
    q2: randomChoice(['test@example.com', 'bot@test.com', 'auto@domain.com']),
    q3: randomChoice(['Automated feedback', 'Test response', 'Bot-generated content']),
  }

  const webDriver = botType === 'selenium' || botType === 'headless'
  const automation = random() > 0.3
  const hasMouseMovement = botType === 'puppeteer' && random() > 0.5

  return {
    id: `bot_${id.toString().padStart(3, '0')}`,
    category: 'bot',
    description: `Bot #${id} - ${botType} automation`,
    expectedFraudScore: 0.85 + random() * 0.1, // 0.85-0.95
    expectedRiskLevel: 'critical',
    questions,
    responses,
    behavioralMetrics: generateBotBehavior(webDriver, automation, hasMouseMovement),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        webDriver ? 'WebDriver detected' : 'Automation signatures',
        'Impossibly fast response times',
        'No natural mouse movements',
        'Perfect typing intervals',
      ],
    },
  }
}

/**
 * Generate random plagiarism test cases
 */
export function generatePlagiarismCase(id: number): TestCase {
  const plagiarismTypes = ['wikipedia', 'duplicate_answers', 'web_copy', 'previous_submission']
  const type = randomChoice(plagiarismTypes)

  const wikipediaTexts = [
    'Artificial intelligence is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents.',
    'Climate change includes both global warming driven by human-induced emissions of greenhouse gases and the resulting large-scale shifts in weather patterns.',
    'Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.',
  ]

  let questions: Record<string, string>
  let responses: Record<string, any>

  if (type === 'duplicate_answers') {
    const duplicateText = 'Great product, very satisfied with the quality and service.'
    questions = {
      q1: 'What did you like?',
      q2: 'Any suggestions?',
      q3: 'Additional feedback?',
    }
    responses = {
      q1: duplicateText,
      q2: duplicateText,
      q3: duplicateText,
    }
  } else {
    questions = { q1: 'Explain the topic in detail' }
    responses = { q1: randomChoice(wikipediaTexts) }
  }

  return {
    id: `plag_${id.toString().padStart(3, '0')}`,
    category: 'plagiarism',
    description: `Plagiarism #${id} - ${type}`,
    expectedFraudScore: 0.65 + random() * 0.2, // 0.65-0.85
    expectedRiskLevel: 'high',
    questions,
    responses,
    behavioralMetrics: generatePlagiarismBehavior(type === 'duplicate_answers'),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        type === 'duplicate_answers' ? '100% identical answers' : 'Wikipedia-style text',
        'Paste events',
        'No typing detected',
        'Tab switch to search',
      ],
    },
  }
}

/**
 * Generate random low-effort test cases
 */
export function generateLowEffortCase(id: number): TestCase {
  const lowEffortTypes = ['straight_lining', 'gibberish', 'single_word', 'rushed', 'minimal']
  const type = randomChoice(lowEffortTypes)

  let questions: Record<string, string>
  let responses: Record<string, any>

  if (type === 'straight_lining') {
    const rating = randomChoice(['1', '2', '3', '4', '5'])
    questions = {
      q1: 'Rate quality (1-5)',
      q2: 'Rate service (1-5)',
      q3: 'Rate value (1-5)',
      q4: 'Rate delivery (1-5)',
    }
    responses = { q1: rating, q2: rating, q3: rating, q4: rating }
  } else if (type === 'gibberish') {
    questions = {
      q1: 'Please describe your experience',
      q2: 'Any suggestions?',
    }
    responses = {
      q1: randomChoice(['asdfasdf jkljkl', 'qwerqwer zxcvzxcv', 'aaaa bbbb cccc', 'test test test']),
      q2: randomChoice(['idk', 'nothing', 'nah', 'no']),
    }
  } else if (type === 'single_word') {
    questions = {
      q1: 'Describe your experience in detail',
      q2: 'What could be improved?',
    }
    responses = {
      q1: randomChoice(['Good', 'Bad', 'Okay', 'Fine', 'Great']),
      q2: randomChoice(['Nothing', 'Everything', 'Idk', 'No']),
    }
  } else {
    // rushed/minimal
    questions = {
      q1: 'Rate your satisfaction',
      q2: 'Comments',
    }
    responses = {
      q1: randomChoice(['5', '1', '3']),
      q2: randomChoice(['ok', 'good', 'fine', 'bad']),
    }
  }

  return {
    id: `low_${id.toString().padStart(3, '0')}`,
    category: 'low_effort',
    description: `Low-effort #${id} - ${type}`,
    expectedFraudScore: 0.55 + random() * 0.3, // 0.55-0.85
    expectedRiskLevel: random() > 0.5 ? 'high' : 'medium',
    questions,
    responses,
    behavioralMetrics: generateLowEffortBehavior(type),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        type === 'straight_lining' ? 'All same rating' : 'Low quality response',
        'Extremely fast completion',
        type === 'gibberish' ? 'Keyboard mashing' : 'Minimal engagement',
      ],
    },
  }
}

/**
 * Generate random fraud ring test cases
 */
export function generateFraudRingCase(id: number, groupId: string): TestCase {
  const questions = {
    q1: 'What is your opinion?',
    q2: 'How satisfied are you?',
  }

  const templates = [
    { q1: 'The service was {adj} and I would {adverb} recommend it.', q2: 'Very satisfied with the {noun}.' },
    { q1: 'I found the product {adj} for my needs.', q2: '{adverb} satisfied overall.' },
  ]

  const template = randomChoice(templates)
  const adjectives = ['excellent', 'outstanding', 'great', 'superb', 'wonderful']
  const adverbs = ['highly', 'definitely', 'certainly', 'absolutely']
  const nouns = ['experience', 'service', 'quality', 'results', 'outcome']

  const responses = {
    q1: template.q1
      .replace('{adj}', randomChoice(adjectives))
      .replace('{adverb}', randomChoice(adverbs)),
    q2: template.q2
      .replace('{adverb}', randomChoice(adverbs))
      .replace('{noun}', randomChoice(nouns)),
  }

  return {
    id: `ring_${id.toString().padStart(3, '0')}`,
    category: 'fraud_ring',
    description: `Fraud ring #${id} - group ${groupId}`,
    expectedFraudScore: 0.80 + random() * 0.15, // 0.80-0.95
    expectedRiskLevel: 'critical',
    questions,
    responses,
    behavioralMetrics: generateFraudRingBehavior(groupId),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Part of coordinated fraud ring',
        'Shared device fingerprint',
        'Similar answer patterns',
        'Coordinated timing',
      ],
    },
  }
}

/**
 * Generate random mixed fraud cases
 */
export function generateMixedCase(id: number): TestCase {
  const combinations = ['ai_bot', 'ai_loweffort', 'bot_plagiarism', 'loweffort_vpn']
  const combo = randomChoice(combinations)

  const questions = { q1: 'What do you think about this topic?' }
  let responses: Record<string, any>
  let expectedScore = 0.85 + random() * 0.1

  if (combo === 'ai_bot') {
    responses = {
      q1: 'It\'s important to note that this represents a complex issue with multiple perspectives. While there are advantages to consider, one must also acknowledge potential challenges.',
    }
  } else if (combo === 'ai_loweffort') {
    responses = { q1: 'good' }
    expectedScore = 0.65 + random() * 0.2
  } else {
    responses = { q1: 'Test response for evaluation' }
  }

  return {
    id: `mixed_${id.toString().padStart(3, '0')}`,
    category: 'mixed',
    description: `Mixed fraud #${id} - ${combo}`,
    expectedFraudScore: expectedScore,
    expectedRiskLevel: random() > 0.5 ? 'critical' : 'high',
    questions,
    responses,
    behavioralMetrics: generateMixedBehavior(combo),
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Multiple fraud types combined',
        combo.includes('ai') ? 'AI-generated text' : '',
        combo.includes('bot') ? 'Bot automation' : '',
        combo.includes('loweffort') ? 'Minimal engagement' : '',
      ].filter(Boolean),
    },
  }
}

// Helper functions to generate behavioral metrics

function generateNaturalBehavior(responses: Record<string, any>, wpm: number, avgTime: number): BehavioralMetrics {
  return {
    mouseMovements: generateNaturalMouse(randomInt(20, 60)),
    keystrokeDynamics: generateNaturalTyping(Object.values(responses).join(' '), wpm),
    scrollPattern: [
      { timestamp: randomInt(500, 2000), scrollY: 0, direction: 'down' },
      { timestamp: randomInt(3000, 8000), scrollY: randomInt(100, 300), direction: 'down' },
    ],
    responseTime: Object.keys(responses).map(() => avgTime + randomInt(-3000, 3000)),
    focusEvents: [{ type: 'focus', timestamp: 0 }],
    deviceFingerprint: {
      userAgent: randomChoice([
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      ]),
      platform: randomChoice(['MacIntel', 'Win32', 'iPhone']),
      webDriver: false,
      automation: false,
      plugins: ['Chrome PDF Plugin', 'PDF Viewer'],
      touchSupport: random() > 0.7,
    },
    hoverEvents: [],
    copyPasteEvents: [],
    devToolsDetected: [],
    timeToFirstInteraction: Object.keys(responses).reduce((acc, key, i) => ({ ...acc, [key]: randomInt(800, 2000) }), {}),
    backspaceCount: randomInt(3, 12),
    correctionCount: randomInt(1, 5),
  }
}

function generateAIBehavior(responses: Record<string, any>, tabSwitch: boolean, paste: boolean): BehavioralMetrics {
  const textLength = Object.values(responses).join('').length
  return {
    mouseMovements: paste ? [] : generateNaturalMouse(randomInt(5, 15)),
    keystrokeDynamics: paste ? [] : generateNaturalTyping('partial text', 50),
    scrollPattern: [],
    responseTime: [randomInt(1000, 3000)],
    focusEvents: tabSwitch ? [
      { type: 'focus', timestamp: 0 },
      { type: 'blur', timestamp: randomInt(300, 800) },
      { type: 'focus', timestamp: randomInt(1500, 2500) },
    ] : [{ type: 'focus', timestamp: 0 }],
    deviceFingerprint: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      platform: 'MacIntel',
      webDriver: false,
      automation: false,
      plugins: ['Chrome PDF Plugin'],
      touchSupport: false,
    },
    hoverEvents: [],
    copyPasteEvents: paste ? [
      { type: 'paste', timestamp: randomInt(1800, 2800), questionId: 'q1', textLength }
    ] : [],
    devToolsDetected: [],
    timeToFirstInteraction: { q1: randomInt(1500, 2500) },
    backspaceCount: paste ? 0 : randomInt(5, 15),
    correctionCount: 0,
  }
}

function generateBotBehavior(webDriver: boolean, automation: boolean, hasMouseMovement: boolean): BehavioralMetrics {
  return {
    mouseMovements: hasMouseMovement ? [
      { x: 0, y: 0, timestamp: 100 },
      { x: 100, y: 100, timestamp: 200 },
      { x: 200, y: 200, timestamp: 300 },
    ] : [],
    keystrokeDynamics: [
      { key: 'T', timestamp: 1000, duration: 10 },
      { key: 'e', timestamp: 1050, duration: 10 },
      { key: 's', timestamp: 1100, duration: 10 },
      { key: 't', timestamp: 1150, duration: 10 },
    ],
    scrollPattern: [],
    responseTime: [randomInt(20, 100), randomInt(20, 100), randomInt(20, 100)],
    focusEvents: [{ type: 'focus', timestamp: 0 }],
    deviceFingerprint: {
      userAgent: webDriver ? 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: webDriver ? 'Linux x86_64' : 'Win32',
      webDriver,
      automation,
      plugins: [],
      touchSupport: false,
      canvasFingerprint: 'AAAAAAAAAA',
      webglFingerprint: 'BBBBBBBBBB',
    },
    hoverEvents: [],
    copyPasteEvents: [],
    devToolsDetected: [],
    timeToFirstInteraction: { q1: 0, q2: 0, q3: 0 },
    backspaceCount: 0,
    correctionCount: 0,
  }
}

function generatePlagiarismBehavior(isDuplicate: boolean): BehavioralMetrics {
  return {
    mouseMovements: generateNaturalMouse(randomInt(5, 15)),
    keystrokeDynamics: [],
    scrollPattern: [],
    responseTime: isDuplicate ? [randomInt(5000, 8000), randomInt(500, 1500), randomInt(500, 1500)] : [randomInt(2000, 3000)],
    focusEvents: [
      { type: 'focus', timestamp: 0 },
      { type: 'blur', timestamp: randomInt(300, 800) },
      { type: 'focus', timestamp: randomInt(2000, 2800) },
    ],
    deviceFingerprint: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      webDriver: false,
      automation: false,
      plugins: ['PDF Viewer'],
      touchSupport: false,
    },
    hoverEvents: [],
    copyPasteEvents: isDuplicate ? [
      { type: 'copy', timestamp: randomInt(7000, 7500), questionId: 'q1', textLength: 56, contentHash: 'abc123' },
      { type: 'paste', timestamp: randomInt(8000, 8500), questionId: 'q2', textLength: 56, contentHash: 'abc123' },
      { type: 'paste', timestamp: randomInt(9000, 9500), questionId: 'q3', textLength: 56, contentHash: 'abc123' },
    ] : [
      { type: 'paste', timestamp: randomInt(2400, 2800), questionId: 'q1', textLength: 200 },
    ],
    devToolsDetected: [],
    timeToFirstInteraction: { q1: randomInt(2000, 2500) },
    backspaceCount: 0,
    correctionCount: 0,
  }
}

function generateLowEffortBehavior(type: string): BehavioralMetrics {
  const isRating = type === 'straight_lining'

  return {
    mouseMovements: isRating ? [
      { x: 200, y: 150, timestamp: 500 },
      { x: 200, y: 250, timestamp: 600 },
      { x: 200, y: 350, timestamp: 700 },
      { x: 200, y: 450, timestamp: 800 },
    ] : generateNaturalMouse(randomInt(5, 10)),
    keystrokeDynamics: type === 'gibberish' ? [
      { key: 'a', timestamp: 1000, duration: 80 },
      { key: 's', timestamp: 1100, duration: 80 },
      { key: 'd', timestamp: 1200, duration: 80 },
      { key: 'f', timestamp: 1300, duration: 80 },
    ] : generateNaturalTyping('short', 40),
    scrollPattern: [],
    responseTime: isRating ? [500, 500, 500, 500] : [randomInt(1000, 3000), randomInt(500, 1500)],
    focusEvents: [{ type: 'focus', timestamp: 0 }],
    deviceFingerprint: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      webDriver: false,
      automation: false,
      plugins: ['PDF Viewer'],
      touchSupport: false,
    },
    hoverEvents: [],
    copyPasteEvents: [],
    devToolsDetected: [],
    timeToFirstInteraction: isRating ? { q1: 400, q2: 400, q3: 400, q4: 400 } : { q1: randomInt(800, 1500) },
    backspaceCount: 0,
    correctionCount: 0,
  }
}

function generateFraudRingBehavior(groupId: string): BehavioralMetrics {
  return {
    mouseMovements: generateNaturalMouse(randomInt(15, 25)),
    keystrokeDynamics: generateNaturalTyping('sample text', randomInt(50, 60)),
    scrollPattern: [{ timestamp: randomInt(1500, 2500), scrollY: 100, direction: 'down' }],
    responseTime: [randomInt(7000, 9000), randomInt(4500, 5500)],
    focusEvents: [{ type: 'focus', timestamp: 0 }],
    deviceFingerprint: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      webDriver: false,
      automation: false,
      plugins: ['PDF Viewer', 'Chrome PDF Plugin'],
      touchSupport: false,
      canvasFingerprint: `SHARED_DEVICE_${groupId}`,
      webglFingerprint: `SHARED_WEBGL_${groupId}`,
    },
    hoverEvents: [],
    copyPasteEvents: [],
    devToolsDetected: [],
    timeToFirstInteraction: { q1: randomInt(1200, 1600), q2: randomInt(1000, 1400) },
    backspaceCount: randomInt(3, 6),
    correctionCount: randomInt(1, 3),
  }
}

function generateMixedBehavior(combo: string): BehavioralMetrics {
  if (combo === 'ai_bot') {
    return {
      mouseMovements: [],
      keystrokeDynamics: [],
      scrollPattern: [],
      responseTime: [randomInt(300, 700)],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome',
        platform: 'Linux x86_64',
        webDriver: true,
        automation: true,
        plugins: [],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 0 },
      backspaceCount: 0,
      correctionCount: 0,
    }
  }

  return generateLowEffortBehavior('rushed')
}

function generateNaturalMouse(count: number) {
  const movements: any[] = []
  let x = 0
  let y = 0

  for (let i = 0; i < count; i++) {
    const dx = random() * 100 - 50
    const dy = random() * 100 - 50
    x += dx
    y += dy

    movements.push({
      x: Math.max(0, x),
      y: Math.max(0, y),
      timestamp: i * (100 + random() * 200),
    })
  }

  return movements
}

function generateNaturalTyping(text: string, wpm: number) {
  const keystrokeDynamics: any[] = []
  const msPerChar = (60000 / wpm) / 5
  let timestamp = 0

  for (const char of text) {
    const variance = random() * msPerChar * 0.5
    timestamp += msPerChar + variance

    keystrokeDynamics.push({
      key: char,
      timestamp: Math.round(timestamp),
      duration: 50 + random() * 100,
    })
  }

  return keystrokeDynamics
}

/**
 * Generate complete test suite with 100+ cases
 */
export function generateFullTestSuite(total: number = 110): TestCase[] {
  const cases: TestCase[] = []

  // Distribution:
  // 20% legitimate (22 cases)
  // 25% AI-generated (27 cases)
  // 20% Bot (22 cases)
  // 10% Plagiarism (11 cases)
  // 15% Low-effort (16 cases)
  // 5% Fraud ring (6 cases, 2 groups of 3)
  // 5% Mixed (6 cases)

  const distribution = {
    legitimate: Math.floor(total * 0.20),
    ai: Math.floor(total * 0.25),
    bot: Math.floor(total * 0.20),
    plagiarism: Math.floor(total * 0.10),
    lowEffort: Math.floor(total * 0.15),
    fraudRing: 6, // Fixed number for fraud rings (2 groups of 3)
    mixed: Math.floor(total * 0.05),
  }

  // Generate cases
  for (let i = 1; i <= distribution.legitimate; i++) {
    cases.push(generateLegitimateCase(i))
  }

  for (let i = 1; i <= distribution.ai; i++) {
    cases.push(generateAICase(i))
  }

  for (let i = 1; i <= distribution.bot; i++) {
    cases.push(generateBotCase(i))
  }

  for (let i = 1; i <= distribution.plagiarism; i++) {
    cases.push(generatePlagiarismCase(i))
  }

  for (let i = 1; i <= distribution.lowEffort; i++) {
    cases.push(generateLowEffortCase(i))
  }

  // Fraud rings (2 groups of 3)
  for (let i = 1; i <= 3; i++) {
    cases.push(generateFraudRingCase(i, 'GROUP_A'))
  }
  for (let i = 4; i <= 6; i++) {
    cases.push(generateFraudRingCase(i, 'GROUP_B'))
  }

  for (let i = 1; i <= distribution.mixed; i++) {
    cases.push(generateMixedCase(i))
  }

  return cases
}
