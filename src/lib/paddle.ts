// Paddle configuration for Surbee payments

export const PADDLE_CONFIG = {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',

  // Product IDs
  products: {
    pro: 'pro_01kf1d56dtk50xcvrrk8yekvy3',
    max: 'pro_01kf1d578d5g1k54ysrnxqd698',
  },

  // Price IDs
  prices: {
    pro_monthly: 'pri_01kf1d5wa58g0vfxrg91d5nh1z',
    pro_annual: 'pri_01kf1d5wn0s14mpda639vy54sp',
    max_monthly: 'pri_01kf1d5wymvkxd7nx4sqqscxz1',
    max_annual: 'pri_01kf1d5xas0xms0qsf1j60ej8k',
  },
} as const;

export type PaddlePriceId = keyof typeof PADDLE_CONFIG.prices;

// Map our internal plan names to Paddle price IDs
export function getPaddlePriceId(plan: string, billing: 'monthly' | 'annual'): string | null {
  const key = `${plan}_${billing}` as PaddlePriceId;
  return PADDLE_CONFIG.prices[key] || null;
}

// Map Paddle price ID to our internal plan
export function getPlanFromPaddlePrice(priceId: string): { plan: string; billing: 'monthly' | 'annual' } | null {
  for (const [key, value] of Object.entries(PADDLE_CONFIG.prices)) {
    if (value === priceId) {
      const [plan, billing] = key.split('_') as [string, 'monthly' | 'annual'];
      return { plan, billing };
    }
  }
  return null;
}

// Plan configuration mapping for Paddle
export const PADDLE_PLAN_CONFIG = {
  pro: {
    name: 'Surbee Pro',
    monthlyCredits: 2000,
    dbPlan: 'surbee_pro',
  },
  max: {
    name: 'Surbee Max',
    monthlyCredits: 6000,
    dbPlan: 'surbee_max',
  },
} as const;
