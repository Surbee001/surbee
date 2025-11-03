/**
 * IP Reputation and Geolocation Service
 *
 * Uses ip-api.com free tier (45 requests per minute)
 * Can be upgraded to paid services like ipapi.co or IP2Location for production
 */

export interface IPReputationData {
  ip: string
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  zip?: string
  lat?: number
  lon?: number
  timezone?: string
  isp?: string
  org?: string
  as?: string
  asname?: string
  // Risk indicators
  isProxy?: boolean
  isVPN?: boolean
  isTor?: boolean
  isDataCenter?: boolean
  isHosting?: boolean
  isCrawler?: boolean
  threatLevel?: 'low' | 'medium' | 'high' | 'very-high'
  riskScore?: number // 0-1
}

// Cache to avoid hitting rate limits
const cache = new Map<string, { data: IPReputationData; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get IP reputation data with caching
 */
export async function getIPReputation(ip: string): Promise<IPReputationData> {
  // Check cache first
  const cached = cache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // Use ip-api.com free tier
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,proxy,hosting`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`IP API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status === 'fail') {
      throw new Error(data.message || 'IP lookup failed')
    }

    // Detect proxies, VPNs, and data centers
    const isProxy = data.proxy === true
    const isHosting = data.hosting === true
    const isDataCenter = detectDataCenter(data.isp, data.org, data.asname)
    const isVPN = detectVPN(data.isp, data.org, data.asname)
    const isTor = detectTor(data.org, data.asname)

    // Calculate risk score
    let riskScore = 0
    if (isProxy) riskScore += 0.3
    if (isVPN) riskScore += 0.25
    if (isTor) riskScore += 0.4
    if (isDataCenter) riskScore += 0.2
    if (isHosting) riskScore += 0.15
    riskScore = Math.min(1, riskScore)

    // Determine threat level
    let threatLevel: 'low' | 'medium' | 'high' | 'very-high' = 'low'
    if (riskScore >= 0.7) threatLevel = 'very-high'
    else if (riskScore >= 0.5) threatLevel = 'high'
    else if (riskScore >= 0.3) threatLevel = 'medium'

    const reputation: IPReputationData = {
      ip,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      asname: data.asname,
      isProxy,
      isVPN,
      isTor,
      isDataCenter,
      isHosting,
      threatLevel,
      riskScore,
    }

    // Cache the result
    cache.set(ip, { data: reputation, timestamp: Date.now() })

    return reputation
  } catch (error) {
    console.error('Error fetching IP reputation:', error)

    // Return basic data on error
    return {
      ip,
      riskScore: 0,
      threatLevel: 'low',
    }
  }
}

/**
 * Detect if IP belongs to a data center
 */
function detectDataCenter(isp?: string, org?: string, asname?: string): boolean {
  const indicators = [
    'amazon', 'aws', 'google cloud', 'gcp', 'microsoft azure', 'azure',
    'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner', 'oracle cloud',
    'alibaba cloud', 'rackspace', 'ibm cloud', 'cloudflare', 'akamai',
    'fastly', 'cloudfront', 'cdn', 'data center', 'datacenter', 'hosting',
    'server', 'cloud', 'vps', 'dedicated',
  ]

  const text = `${isp} ${org} ${asname}`.toLowerCase()

  return indicators.some(indicator => text.includes(indicator))
}

/**
 * Detect if IP belongs to a VPN provider
 */
function detectVPN(isp?: string, org?: string, asname?: string): boolean {
  const vpnProviders = [
    'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'pia',
    'private internet access', 'protonvpn', 'mullvad', 'windscribe',
    'tunnelbear', 'hotspot shield', 'hidemyass', 'hma', 'ipvanish',
    'vyprvpn', 'purevpn', 'torguard', 'astrill', 'perfect privacy',
    'vpn', 'proxy', 'anonymous',
  ]

  const text = `${isp} ${org} ${asname}`.toLowerCase()

  return vpnProviders.some(provider => text.includes(provider))
}

/**
 * Detect Tor exit nodes
 */
function detectTor(org?: string, asname?: string): boolean {
  const torIndicators = ['tor', 'onion', 'privacy']

  const text = `${org} ${asname}`.toLowerCase()

  return torIndicators.some(indicator => text.includes(indicator))
}

/**
 * Validate timezone consistency with IP location
 */
export function validateTimezone(ipTimezone?: string, browserTimezone?: string): {
  isConsistent: boolean
  suspicionScore: number
  reason?: string
} {
  if (!ipTimezone || !browserTimezone) {
    return {
      isConsistent: true,
      suspicionScore: 0,
      reason: 'Insufficient timezone data',
    }
  }

  // Direct match
  if (ipTimezone === browserTimezone) {
    return {
      isConsistent: true,
      suspicionScore: 0,
    }
  }

  // Check if timezones are in the same region (e.g., America/New_York vs America/Chicago)
  const ipRegion = ipTimezone.split('/')[0]
  const browserRegion = browserTimezone.split('/')[0]

  if (ipRegion !== browserRegion) {
    return {
      isConsistent: false,
      suspicionScore: 0.6,
      reason: `Timezone mismatch: IP in ${ipRegion}, browser in ${browserRegion}`,
    }
  }

  // Same region but different city (less suspicious)
  return {
    isConsistent: false,
    suspicionScore: 0.2,
    reason: `Timezone city mismatch within ${ipRegion}`,
  }
}

/**
 * Check if multiple submissions from same IP
 */
export async function checkIPSubmissionRate(
  ip: string,
  supabase: any,
  windowMinutes: number = 60
): Promise<{
  submissionCount: number
  isExcessive: boolean
  riskScore: number
}> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', windowStart)

    if (error) {
      console.error('Error checking IP submission rate:', error)
      return { submissionCount: 0, isExcessive: false, riskScore: 0 }
    }

    const submissionCount = data?.length || 0

    // Calculate risk based on submission count
    let riskScore = 0
    let isExcessive = false

    if (submissionCount >= 50) {
      riskScore = 1
      isExcessive = true
    } else if (submissionCount >= 20) {
      riskScore = 0.8
      isExcessive = true
    } else if (submissionCount >= 10) {
      riskScore = 0.5
      isExcessive = true
    } else if (submissionCount >= 5) {
      riskScore = 0.3
    }

    return {
      submissionCount,
      isExcessive,
      riskScore,
    }
  } catch (error) {
    console.error('Error in checkIPSubmissionRate:', error)
    return { submissionCount: 0, isExcessive: false, riskScore: 0 }
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  // Check various headers for IP address
  const headers = request.headers

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  // Standard headers
  const xRealIP = headers.get('x-real-ip')
  if (xRealIP) return xRealIP

  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, use the first one
    return xForwardedFor.split(',')[0].trim()
  }

  // Vercel
  const xVercelForwardedFor = headers.get('x-vercel-forwarded-for')
  if (xVercelForwardedFor) return xVercelForwardedFor

  // Fallback
  return null
}
