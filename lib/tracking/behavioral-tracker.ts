import { axiomLogger } from '../logging/axiom-client'

export class BehavioralTracker {
  private sessionId: string
  private surveyId: string
  private userId?: string
  private eventBuffer: any[] = []
  private lastMousePosition = { x: 0, y: 0 }
  private isTracking = false

  constructor(surveyId: string, userId?: string) {
    this.sessionId = this.generateSessionId()
    this.surveyId = surveyId
    this.userId = userId
  }

  startTracking() {
    if (this.isTracking) return
    this.isTracking = true

    let mouseThrottle: any
    document.addEventListener('mousemove', (e) => {
      clearTimeout(mouseThrottle)
      mouseThrottle = setTimeout(() => {
        const velocity = this.calculateVelocity({ x: e.clientX, y: e.clientY }, this.lastMousePosition)
        this.bufferBehavioralEvent('mouse_move', { x: e.clientX, y: e.clientY, velocity, target_element: (e.target as Element)?.tagName })
        this.lastMousePosition = { x: e.clientX, y: e.clientY }
      }, 100)
    })

    document.addEventListener('keydown', (e) => {
      const start = Date.now()
      const keyUp = () => {
        const dwellTime = Date.now() - start
        this.bufferBehavioralEvent('keystroke', { key: e.key.length === 1 ? 'character' : e.key, dwell_time: dwellTime, target_element: (e.target as Element)?.tagName })
        document.removeEventListener('keyup', keyUp, { once: true } as any)
      }
      document.addEventListener('keyup', keyUp, { once: true } as any)
    })

    let scrollThrottle: any
    document.addEventListener('scroll', () => {
      clearTimeout(scrollThrottle)
      scrollThrottle = setTimeout(() => {
        this.bufferBehavioralEvent('scroll', { scroll_y: window.scrollY, scroll_x: window.scrollX, page_height: document.documentElement.scrollHeight, viewport_height: window.innerHeight })
      }, 200)
    })

    window.addEventListener('focus', () => { this.bufferBehavioralEvent('focus', { timestamp: Date.now() }) })
    window.addEventListener('blur', () => { this.bufferBehavioralEvent('blur', { timestamp: Date.now() }) })
    document.addEventListener('visibilitychange', () => { this.bufferBehavioralEvent('visibility_change', { hidden: document.hidden, timestamp: Date.now() }) })

    setInterval(() => this.flushBehavioralEvents(), 2000)
  }

  stopTracking() {
    this.isTracking = false
    this.flushBehavioralEvents()
  }

  private bufferBehavioralEvent(eventType: string, payload: any) {
    this.eventBuffer.push({ userId: this.userId, sessionId: this.sessionId, surveyId: this.surveyId, eventType, payload, timestamp: Date.now() })
    if (this.eventBuffer.length >= 50) this.flushBehavioralEvents()
  }

  private async flushBehavioralEvents() {
    if (this.eventBuffer.length === 0) return
    const events = [...this.eventBuffer]
    this.eventBuffer = []
    for (const e of events) await axiomLogger.logUserBehavior(e)
  }

  private calculateVelocity(current: { x: number; y: number }, previous: { x: number; y: number }) {
    const dx = current.x - previous.x
    const dy = current.y - previous.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

