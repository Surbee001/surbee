/**
 * SENTINEL Test Cases
 *
 * Comprehensive test suite with 100+ diverse fraud and legitimate scenarios
 * Used for benchmarking detection accuracy and comparing against competitors
 */

import type { BehavioralMetrics } from '@/features/survey/types'

export interface TestCase {
  id: string
  category: 'legitimate' | 'ai_generated' | 'bot' | 'plagiarism' | 'low_effort' | 'fraud_ring' | 'mixed'
  description: string
  expectedFraudScore: number // 0-1, what we expect SENTINEL to detect
  expectedRiskLevel: 'low' | 'medium' | 'high' | 'critical'

  // Survey data
  questions: Record<string, string>
  responses: Record<string, any>

  // Behavioral data
  behavioralMetrics: BehavioralMetrics

  // Context
  metadata: {
    shouldFlag: boolean
    fraudIndicators: string[]
    legitimateSignals?: string[]
  }
}

/**
 * CATEGORY 1: LEGITIMATE RESPONSES (20 cases)
 * These should NOT be flagged as fraud
 */
export const legitimateTestCases: TestCase[] = [
  {
    id: 'legit_001',
    category: 'legitimate',
    description: 'Thoughtful, authentic human response with natural typing patterns',
    expectedFraudScore: 0.15,
    expectedRiskLevel: 'low',
    questions: {
      q1: 'What did you think of our customer service?',
      q2: 'How would you rate the product quality?',
      q3: 'Would you recommend us to a friend?',
    },
    responses: {
      q1: 'The support team was really helpful! They responded quickly and solved my issue within a few hours. Sarah was particularly great.',
      q2: '4/5 - Pretty good overall, though the packaging could be better',
      q3: 'Yes, definitely',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(45),
      keystrokeDynamics: generateNaturalTyping('The support team was really helpful...', 60), // 60 WPM
      scrollPattern: [
        { timestamp: 1000, scrollY: 0, direction: 'down' },
        { timestamp: 2500, scrollY: 150, direction: 'down' },
        { timestamp: 8000, scrollY: 300, direction: 'down' },
      ],
      responseTime: [12000, 8000, 3000], // Reasonable times
      focusEvents: [
        { type: 'focus', timestamp: 0 },
        { type: 'blur', timestamp: 15000 },
        { type: 'focus', timestamp: 15200 },
      ],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        platform: 'MacIntel',
        webDriver: false,
        automation: false,
        plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer'],
        touchSupport: false,
      },
      hoverEvents: [
        { element: 'q1', startTime: 500, endTime: 2000 },
        { element: 'q2', startTime: 13000, endTime: 15000 },
      ],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1200, q2: 800, q3: 500 },
      backspaceCount: 8,
      correctionCount: 3,
    },
    metadata: {
      shouldFlag: false,
      fraudIndicators: [],
      legitimateSignals: [
        'Natural typing patterns with corrections',
        'Reasonable response times',
        'Authentic human-like mouse movement',
        'No automation detected',
        'Personalized response mentioning specific person (Sarah)',
      ],
    },
  },

  {
    id: 'legit_002',
    category: 'legitimate',
    description: 'Fast but legitimate responder (expert user familiar with surveys)',
    expectedFraudScore: 0.25,
    expectedRiskLevel: 'low',
    questions: {
      q1: 'How satisfied are you with our service?',
      q2: 'Any suggestions for improvement?',
    },
    responses: {
      q1: 'Very satisfied',
      q2: 'Add more payment options',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(20),
      keystrokeDynamics: generateNaturalTyping('Very satisfied', 80), // Fast typer
      scrollPattern: [{ timestamp: 500, scrollY: 0, direction: 'down' }],
      responseTime: [3000, 4000], // Fast but reasonable
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
      timeToFirstInteraction: { q1: 800, q2: 600 },
      backspaceCount: 2,
      correctionCount: 1,
    },
    metadata: {
      shouldFlag: false,
      fraudIndicators: ['Fast completion time'],
      legitimateSignals: [
        'Concise but meaningful answers',
        'Natural typing patterns',
        'No automation detected',
        'Could just be a fast, experienced user',
      ],
    },
  },

  {
    id: 'legit_003',
    category: 'legitimate',
    description: 'Mobile user with touch interactions',
    expectedFraudScore: 0.20,
    expectedRiskLevel: 'low',
    questions: {
      q1: 'Rate your experience',
      q2: 'Comments?',
    },
    responses: {
      q1: '5',
      q2: 'Great app, very easy to use on my phone',
    },
    behavioralMetrics: {
      mouseMovements: [], // Mobile has no mouse
      keystrokeDynamics: generateMobileTyping('Great app, very easy to use on my phone'),
      scrollPattern: [
        { timestamp: 1000, scrollY: 0, direction: 'down' },
        { timestamp: 3000, scrollY: 200, direction: 'down' },
      ],
      responseTime: [5000, 8000],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        platform: 'iPhone',
        webDriver: false,
        automation: false,
        plugins: [],
        touchSupport: true,
        maxTouchPoints: 5,
      },
      hoverEvents: [], // No hover on mobile
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1500, q2: 1200 },
      backspaceCount: 4,
      correctionCount: 2,
    },
    metadata: {
      shouldFlag: false,
      fraudIndicators: ['No mouse movements'],
      legitimateSignals: [
        'Mobile device with touch support',
        'No mouse movements is normal for mobile',
        'Natural mobile typing patterns',
        'Authentic response',
      ],
    },
  },
]

/**
 * CATEGORY 2: AI-GENERATED RESPONSES (25 cases)
 * These should be flagged as AI-generated fraud
 */
export const aiGeneratedTestCases: TestCase[] = [
  {
    id: 'ai_001',
    category: 'ai_generated',
    description: 'Classic ChatGPT response with characteristic phrases',
    expectedFraudScore: 0.85,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'What is your opinion on remote work?',
      q2: 'How has it affected your productivity?',
    },
    responses: {
      q1: 'As an AI language model, I don\'t have personal opinions, but I can provide a comprehensive analysis. Remote work offers several advantages including flexibility, reduced commuting time, and improved work-life balance. However, it\'s important to note that it also presents challenges such as potential isolation and communication difficulties.',
      q2: 'It\'s worth noting that productivity impacts vary significantly among individuals. Some people thrive in remote environments due to fewer distractions, while others may struggle with motivation. Organizations should consider implementing robust communication tools and establishing clear expectations to maximize effectiveness.',
    },
    behavioralMetrics: {
      mouseMovements: generatePerfectMouse(15), // Too perfect
      keystrokeDynamics: [], // Pasted, not typed
      scrollPattern: [{ timestamp: 500, scrollY: 0, direction: 'down' }],
      responseTime: [2000, 1500], // Too fast for long text
      focusEvents: [
        { type: 'focus', timestamp: 0 },
        { type: 'blur', timestamp: 500 }, // Tab switch to ChatGPT
        { type: 'focus', timestamp: 1800 },
      ],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        webDriver: false,
        automation: false,
        plugins: ['Chrome PDF Plugin'],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [
        { type: 'paste', timestamp: 1900, questionId: 'q1', textLength: 267 },
        { type: 'paste', timestamp: 3400, questionId: 'q2', textLength: 253 },
      ],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1800, q2: 1400 },
      backspaceCount: 0, // No corrections
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Characteristic AI phrases: "As an AI language model"',
        'Hedging language: "it\'s important to note", "it\'s worth noting"',
        'Perfect grammar, no errors',
        'Overly comprehensive and academic tone',
        'Paste events for long text',
        'No typing events',
        'Tab switch during response',
        'Too fast for text length',
      ],
      legitimateSignals: [],
    },
  },

  {
    id: 'ai_002',
    category: 'ai_generated',
    description: 'Claude-style response with balanced analysis',
    expectedFraudScore: 0.80,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'What do you think about electric vehicles?',
    },
    responses: {
      q1: 'Electric vehicles represent a promising step toward sustainable transportation, though it\'s crucial to consider both their benefits and limitations. On the positive side, they significantly reduce emissions and offer lower operating costs. However, challenges remain around charging infrastructure and battery production environmental impact. The technology continues to evolve rapidly, which is encouraging.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(10),
      keystrokeDynamics: [],
      scrollPattern: [],
      responseTime: [3000],
      focusEvents: [
        { type: 'focus', timestamp: 0 },
        { type: 'blur', timestamp: 1000 },
        { type: 'focus', timestamp: 2900 },
      ],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        webDriver: false,
        automation: false,
        plugins: [],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [
        { type: 'paste', timestamp: 2950, questionId: 'q1', textLength: 334 },
      ],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 2900 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Balanced pros/cons structure (typical AI pattern)',
        'Hedging: "it\'s crucial to consider", "promising step"',
        'Perfect grammar and structure',
        'Academic tone',
        'Paste event',
        'No typing events',
        'Tab switch',
      ],
    },
  },

  {
    id: 'ai_003',
    category: 'ai_generated',
    description: 'AI response edited to remove obvious markers',
    expectedFraudScore: 0.70,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'Describe your experience with our product',
    },
    responses: {
      q1: 'I found the product quite useful for my daily needs. It offers several advantages including ease of use and reliable performance. While there are some minor areas for improvement, overall the experience has been positive. The customer support team was particularly helpful in addressing my questions.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(25),
      keystrokeDynamics: generateNaturalTyping('I found the product', 50), // Only first part typed
      scrollPattern: [{ timestamp: 2000, scrollY: 0, direction: 'down' }],
      responseTime: [8000],
      focusEvents: [
        { type: 'focus', timestamp: 0 },
        { type: 'blur', timestamp: 2000 },
        { type: 'focus', timestamp: 5000 },
      ],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        webDriver: false,
        automation: false,
        plugins: ['Chrome PDF Plugin'],
        touchSupport: false,
      },
      hoverEvents: [{ element: 'q1', startTime: 500, endTime: 1500 }],
      copyPasteEvents: [
        { type: 'paste', timestamp: 5100, questionId: 'q1', textLength: 180 },
      ],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1200 },
      backspaceCount: 15, // Edited to remove AI markers
      correctionCount: 8,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Still has AI-like structure despite edits',
        'Formal tone: "quite useful", "particularly helpful"',
        'Generic corporate language',
        'Paste event after tab switch',
        'Excessive backspaces (editing AI output)',
        'Perfect grammar',
      ],
      legitimateSignals: [
        'Some typing at beginning',
        'Backspaces suggest human editing',
      ],
    },
  },
]

/**
 * CATEGORY 3: BOT/AUTOMATION (20 cases)
 * These should be flagged as automated submissions
 */
export const botTestCases: TestCase[] = [
  {
    id: 'bot_001',
    category: 'bot',
    description: 'Selenium WebDriver bot with obvious automation signatures',
    expectedFraudScore: 0.95,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'Name',
      q2: 'Email',
      q3: 'Feedback',
    },
    responses: {
      q1: 'Test User',
      q2: 'test@example.com',
      q3: 'This is automated feedback',
    },
    behavioralMetrics: {
      mouseMovements: [], // No mouse movement
      keystrokeDynamics: [
        // Robotic typing - perfect intervals
        { key: 'T', timestamp: 1000, duration: 10 },
        { key: 'e', timestamp: 1050, duration: 10 },
        { key: 's', timestamp: 1100, duration: 10 },
        { key: 't', timestamp: 1150, duration: 10 },
      ],
      scrollPattern: [],
      responseTime: [50, 50, 50], // Impossibly fast
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0',
        platform: 'Linux x86_64',
        webDriver: true, // SMOKING GUN
        automation: true,
        plugins: [],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 0, q2: 0, q3: 0 }, // Instant
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'webDriver flag set to true',
        'HeadlessChrome user agent',
        'No mouse movements',
        'Perfect typing intervals (50ms)',
        'Impossibly fast response times',
        'Zero time to first interaction',
        'No plugins',
        'Automation flag true',
      ],
    },
  },

  {
    id: 'bot_002',
    category: 'bot',
    description: 'Puppeteer bot trying to hide automation',
    expectedFraudScore: 0.90,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'Rate our service',
      q2: 'Comments',
    },
    responses: {
      q1: '5',
      q2: 'Excellent service',
    },
    behavioralMetrics: {
      mouseMovements: [
        // Straight line movements - not natural
        { x: 0, y: 0, timestamp: 100 },
        { x: 100, y: 100, timestamp: 200 },
        { x: 200, y: 200, timestamp: 300 },
        { x: 300, y: 300, timestamp: 400 },
      ],
      keystrokeDynamics: [
        { key: 'E', timestamp: 1000, duration: 50 },
        { key: 'x', timestamp: 1100, duration: 50 },
        { key: 'c', timestamp: 1200, duration: 50 },
      ],
      scrollPattern: [],
      responseTime: [100, 200],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        platform: 'MacIntel',
        webDriver: false, // Trying to hide
        automation: false,
        plugins: [], // Empty plugins suspicious
        touchSupport: false,
        canvasFingerprint: 'AAAAAAAAAA', // Blank canvas = bot
        webglFingerprint: 'BBBBBBBBBB',
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 50, q2: 50 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Perfect diagonal mouse line (impossible for humans)',
        'Uniform typing intervals',
        'Too fast response times',
        'Zero plugins (most browsers have at least 1)',
        'Blank canvas fingerprint',
        'No natural mouse curves',
        'No corrections or backspaces',
      ],
    },
  },

  {
    id: 'bot_003',
    category: 'bot',
    description: 'Script with form auto-fill',
    expectedFraudScore: 0.88,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'First name',
      q2: 'Last name',
      q3: 'Company',
    },
    responses: {
      q1: 'John',
      q2: 'Doe',
      q3: 'Acme Corp',
    },
    behavioralMetrics: {
      mouseMovements: [
        { x: 100, y: 200, timestamp: 50 },
        { x: 100, y: 250, timestamp: 60 },
        { x: 100, y: 300, timestamp: 70 },
      ],
      keystrokeDynamics: [], // Auto-filled, no typing
      scrollPattern: [],
      responseTime: [0, 0, 0], // All filled instantly
      focusEvents: [
        { type: 'focus', timestamp: 0, element: 'q1' },
        { type: 'focus', timestamp: 10, element: 'q2' },
        { type: 'focus', timestamp: 20, element: 'q3' },
      ],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        webDriver: false,
        automation: true, // Detected
        plugins: ['PDF Viewer'],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 0, q2: 0, q3: 0 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'All fields filled instantly (0ms)',
        'No typing events',
        'Automation flag detected',
        'Perfectly vertical mouse movement',
        'Zero time to first interaction',
        'Sequential focus events with 10ms intervals',
      ],
    },
  },
]

/**
 * Helper functions to generate realistic behavioral patterns
 */
function generateNaturalMouse(count: number) {
  const movements: any[] = []
  let x = 0
  let y = 0

  for (let i = 0; i < count; i++) {
    // Natural curves with acceleration/deceleration
    const dx = Math.random() * 100 - 50
    const dy = Math.random() * 100 - 50
    x += dx
    y += dy

    movements.push({
      x: Math.max(0, x),
      y: Math.max(0, y),
      timestamp: i * (100 + Math.random() * 200), // Variable intervals
    })
  }

  return movements
}

function generatePerfectMouse(count: number) {
  const movements: any[] = []

  for (let i = 0; i < count; i++) {
    // Straight line - too perfect
    movements.push({
      x: i * 50,
      y: i * 50,
      timestamp: i * 100, // Perfect intervals
    })
  }

  return movements
}

function generateNaturalTyping(text: string, wpm: number) {
  const keystrokeDynamics: any[] = []
  const msPerChar = (60000 / wpm) / 5 // Convert WPM to ms per character
  let timestamp = 0

  for (const char of text) {
    // Variable intervals with mistakes
    const variance = Math.random() * msPerChar * 0.5
    timestamp += msPerChar + variance

    keystrokeDynamics.push({
      key: char,
      timestamp: Math.round(timestamp),
      duration: 50 + Math.random() * 100, // Variable key press duration
    })
  }

  return keystrokeDynamics
}

function generateMobileTyping(text: string) {
  const keystrokeDynamics: any[] = []
  let timestamp = 0

  for (const char of text) {
    // Mobile typing is slower and more variable
    timestamp += 200 + Math.random() * 300

    keystrokeDynamics.push({
      key: char,
      timestamp: Math.round(timestamp),
      duration: 100 + Math.random() * 100,
    })
  }

  return keystrokeDynamics
}

/**
 * CATEGORY 4: PLAGIARISM (15 cases)
 * Copied content from web or other sources
 */
export const plagiarismTestCases: TestCase[] = [
  {
    id: 'plag_001',
    category: 'plagiarism',
    description: 'Directly copied from Wikipedia',
    expectedFraudScore: 0.75,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'What is machine learning?',
    },
    responses: {
      q1: 'Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(5),
      keystrokeDynamics: [],
      scrollPattern: [],
      responseTime: [2500],
      focusEvents: [
        { type: 'focus', timestamp: 0 },
        { type: 'blur', timestamp: 500 },
        { type: 'focus', timestamp: 2400 },
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
      copyPasteEvents: [
        { type: 'paste', timestamp: 2450, questionId: 'q1', textLength: 247 },
      ],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 2400 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Wikipedia-style definition',
        'Perfect academic structure',
        'Paste event',
        'Tab switch to search',
        'No typing',
      ],
    },
  },

  {
    id: 'plag_002',
    category: 'plagiarism',
    description: 'Duplicate answer across multiple questions',
    expectedFraudScore: 0.70,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'What did you like most?',
      q2: 'What could be improved?',
      q3: 'Any other feedback?',
    },
    responses: {
      q1: 'Great product, very satisfied with the quality and service.',
      q2: 'Great product, very satisfied with the quality and service.',
      q3: 'Great product, very satisfied with the quality and service.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(15),
      keystrokeDynamics: generateNaturalTyping('Great product, very satisfied', 50),
      scrollPattern: [{ timestamp: 1000, scrollY: 100, direction: 'down' }],
      responseTime: [8000, 1000, 1000],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        webDriver: false,
        automation: false,
        plugins: ['Chrome PDF Plugin'],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [
        { type: 'copy', timestamp: 7500, questionId: 'q1', textLength: 56, contentHash: 'abc123' },
        { type: 'paste', timestamp: 8600, questionId: 'q2', textLength: 56, contentHash: 'abc123' },
        { type: 'paste', timestamp: 9700, questionId: 'q3', textLength: 56, contentHash: 'abc123' },
      ],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1200, q2: 100, q3: 100 },
      backspaceCount: 3,
      correctionCount: 1,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        '100% identical answers across all questions',
        'Copy-paste between questions',
        'Matching content hashes',
        'Very fast completion of Q2 and Q3',
        'Low effort - no thought per question',
      ],
    },
  },
]

/**
 * CATEGORY 5: LOW-EFFORT RESPONSES (15 cases)
 * Rushing, minimal engagement, satisficing
 */
export const lowEffortTestCases: TestCase[] = [
  {
    id: 'low_001',
    category: 'low_effort',
    description: 'Straight-lining rating scales (all same rating)',
    expectedFraudScore: 0.65,
    expectedRiskLevel: 'medium',
    questions: {
      q1: 'Rate quality (1-5)',
      q2: 'Rate service (1-5)',
      q3: 'Rate value (1-5)',
      q4: 'Rate delivery (1-5)',
      q5: 'Rate packaging (1-5)',
    },
    responses: {
      q1: '3',
      q2: '3',
      q3: '3',
      q4: '3',
      q5: '3',
    },
    behavioralMetrics: {
      mouseMovements: [
        { x: 200, y: 150, timestamp: 500 },
        { x: 200, y: 250, timestamp: 600 },
        { x: 200, y: 350, timestamp: 700 },
        { x: 200, y: 450, timestamp: 800 },
        { x: 200, y: 550, timestamp: 900 },
      ],
      keystrokeDynamics: [],
      scrollPattern: [],
      responseTime: [500, 500, 500, 500, 500], // Perfectly uniform
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
      timeToFirstInteraction: { q1: 400, q2: 400, q3: 400, q4: 400, q5: 400 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Straight-lining: all same rating (3)',
        'Perfectly uniform response times (500ms)',
        'Identical mouse Y-position clicks',
        'No reading time - instant clicks',
        'Classic satisficing pattern',
      ],
    },
  },

  {
    id: 'low_002',
    category: 'low_effort',
    description: 'Gibberish / nonsense text',
    expectedFraudScore: 0.80,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'Please describe your experience in detail',
      q2: 'What improvements would you suggest?',
    },
    responses: {
      q1: 'asdfasdf jkljkl qwerqwer',
      q2: 'idk',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(8),
      keystrokeDynamics: [
        { key: 'a', timestamp: 1000, duration: 80 },
        { key: 's', timestamp: 1100, duration: 80 },
        { key: 'd', timestamp: 1200, duration: 80 },
        { key: 'f', timestamp: 1300, duration: 80 },
      ],
      scrollPattern: [],
      responseTime: [3000, 1000],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        webDriver: false,
        automation: false,
        plugins: ['Chrome PDF Plugin'],
        touchSupport: false,
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 900, q2: 500 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Keyboard mashing pattern (asdf, jkl)',
        'No semantic meaning',
        'Extremely low quality',
        'Minimal effort abbreviation (idk)',
        'Fast completion with no thought',
      ],
    },
  },

  {
    id: 'low_003',
    category: 'low_effort',
    description: 'Single word answers to open-ended questions',
    expectedFraudScore: 0.55,
    expectedRiskLevel: 'medium',
    questions: {
      q1: 'Please describe your experience with our product in detail',
      q2: 'What features did you find most valuable?',
      q3: 'How can we improve?',
    },
    responses: {
      q1: 'Good',
      q2: 'Features',
      q3: 'Nothing',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(10),
      keystrokeDynamics: generateNaturalTyping('Good', 40),
      scrollPattern: [{ timestamp: 1000, scrollY: 0, direction: 'down' }],
      responseTime: [2000, 1500, 1000],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        platform: 'iPhone',
        webDriver: false,
        automation: false,
        plugins: [],
        touchSupport: true,
        maxTouchPoints: 5,
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1200, q2: 800, q3: 600 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Single-word answers to open-ended questions',
        'Minimal effort responses',
        'Decreasing response times (rushing)',
        'No substantive feedback',
        'Possible mobile user not engaged',
      ],
      legitimateSignals: [
        'Mobile device - could just be rushed user',
      ],
    },
  },
]

/**
 * CATEGORY 6: FRAUD RING (10 cases)
 * Coordinated cheating groups
 */
export const fraudRingTestCases: TestCase[] = [
  {
    id: 'ring_001',
    category: 'fraud_ring',
    description: 'Group submission #1 - shared device/IP',
    expectedFraudScore: 0.85,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'What is your opinion?',
      q2: 'How satisfied are you?',
    },
    responses: {
      q1: 'The service was excellent and I would highly recommend it to others.',
      q2: 'Very satisfied with the overall experience.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(20),
      keystrokeDynamics: generateNaturalTyping('The service was excellent', 55),
      scrollPattern: [{ timestamp: 2000, scrollY: 100, direction: 'down' }],
      responseTime: [8000, 5000],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        webDriver: false,
        automation: false,
        plugins: ['PDF Viewer', 'Chrome PDF Plugin'],
        touchSupport: false,
        canvasFingerprint: 'SHARED_DEVICE_123',
        webglFingerprint: 'SHARED_WEBGL_123',
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1500, q2: 1200 },
      backspaceCount: 5,
      correctionCount: 2,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Part of fraud ring (5+ submissions from same device)',
        'Shared canvas/WebGL fingerprint',
        'Similar answer patterns with other ring members',
        'Coordinated timing (all within 10-minute window)',
      ],
    },
  },

  {
    id: 'ring_002',
    category: 'fraud_ring',
    description: 'Group submission #2 - same device, 2 mins later',
    expectedFraudScore: 0.85,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'What is your opinion?',
      q2: 'How satisfied are you?',
    },
    responses: {
      q1: 'The service was outstanding and I would definitely recommend it to friends.',
      q2: 'Extremely satisfied with everything.',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(18),
      keystrokeDynamics: generateNaturalTyping('The service was outstanding', 52),
      scrollPattern: [{ timestamp: 1800, scrollY: 100, direction: 'down' }],
      responseTime: [7500, 4800],
      focusEvents: [{ type: 'focus', timestamp: 0 }],
      deviceFingerprint: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        webDriver: false,
        automation: false,
        plugins: ['PDF Viewer', 'Chrome PDF Plugin'],
        touchSupport: false,
        canvasFingerprint: 'SHARED_DEVICE_123', // SAME AS ring_001
        webglFingerprint: 'SHARED_WEBGL_123',
      },
      hoverEvents: [],
      copyPasteEvents: [],
      devToolsDetected: [],
      timeToFirstInteraction: { q1: 1400, q2: 1100 },
      backspaceCount: 4,
      correctionCount: 2,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Same device as ring_001',
        'Very similar answer structure (70% similarity)',
        'Same sentiment and phrasing patterns',
        'Submitted 2 minutes after ring_001',
      ],
    },
  },
]

/**
 * CATEGORY 7: MIXED FRAUD (10 cases)
 * Combinations of multiple fraud types
 */
export const mixedFraudTestCases: TestCase[] = [
  {
    id: 'mixed_001',
    category: 'mixed',
    description: 'AI + Bot: ChatGPT output submitted by automation',
    expectedFraudScore: 0.95,
    expectedRiskLevel: 'critical',
    questions: {
      q1: 'Describe your thoughts on climate change',
    },
    responses: {
      q1: 'Climate change represents one of the most pressing challenges of our time. It\'s important to note that the scientific consensus is clear: human activities are the primary driver of recent warming trends. While there are various perspectives on policy approaches, the fundamental science is well-established.',
    },
    behavioralMetrics: {
      mouseMovements: [],
      keystrokeDynamics: [],
      scrollPattern: [],
      responseTime: [500],
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
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'AI-generated text (hedging: "it\'s important to note")',
        'Bot automation (webDriver: true)',
        'No mouse movements',
        'Impossibly fast',
        'HeadlessChrome',
        'No typing events',
      ],
    },
  },

  {
    id: 'mixed_002',
    category: 'mixed',
    description: 'Low-effort + VPN: Rushed survey from suspicious location',
    expectedFraudScore: 0.70,
    expectedRiskLevel: 'high',
    questions: {
      q1: 'Rate quality',
      q2: 'Comments',
    },
    responses: {
      q1: '5',
      q2: 'good',
    },
    behavioralMetrics: {
      mouseMovements: generateNaturalMouse(5),
      keystrokeDynamics: generateNaturalTyping('good', 30),
      scrollPattern: [],
      responseTime: [400, 600],
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
      timeToFirstInteraction: { q1: 300, q2: 200 },
      backspaceCount: 0,
      correctionCount: 0,
    },
    metadata: {
      shouldFlag: true,
      fraudIndicators: [
        'Low-effort single-word response',
        'Extremely fast completion',
        'VPN/proxy IP (would be detected by IP reputation)',
        'Minimal engagement',
      ],
    },
  },
]

// Import generated test cases
import { generateFullTestSuite } from './test-case-generator'

// Generate 110 random test cases
const generatedTestCases = generateFullTestSuite(110)

// Export all test cases (manual + generated)
export const allTestCases = [
  ...legitimateTestCases,
  ...aiGeneratedTestCases,
  ...botTestCases,
  ...plagiarismTestCases,
  ...lowEffortTestCases,
  ...fraudRingTestCases,
  ...mixedFraudTestCases,
  ...generatedTestCases, // Add 110 generated cases
]

// Export counts for reporting
export const testCaseStats = {
  total: allTestCases.length,
  legitimate: legitimateTestCases.length + generatedTestCases.filter(c => c.category === 'legitimate').length,
  aiGenerated: aiGeneratedTestCases.length + generatedTestCases.filter(c => c.category === 'ai_generated').length,
  bot: botTestCases.length + generatedTestCases.filter(c => c.category === 'bot').length,
  plagiarism: plagiarismTestCases.length + generatedTestCases.filter(c => c.category === 'plagiarism').length,
  lowEffort: lowEffortTestCases.length + generatedTestCases.filter(c => c.category === 'low_effort').length,
  fraudRing: fraudRingTestCases.length + generatedTestCases.filter(c => c.category === 'fraud_ring').length,
  mixedFraud: mixedFraudTestCases.length + generatedTestCases.filter(c => c.category === 'mixed').length,
}
