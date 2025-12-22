import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('hero_signup'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source } = SubscribeSchema.parse(body)

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: true, message: 'Already subscribed' },
        { status: 200 }
      )
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from('waitlist_subscribers')
      .insert({
        email: email.toLowerCase(),
        source,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Waitlist subscribe error:', error)

      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { success: true, message: 'Already subscribed' },
          { status: 200 }
        )
      }

      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to waitlist',
      id: data.id,
    })

  } catch (error: any) {
    console.error('Waitlist subscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Invalid email address',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve subscriber count (optional, for admin use)
export async function GET(req: NextRequest) {
  try {
    const { count, error } = await supabase
      .from('waitlist_subscribers')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: count || 0,
    })

  } catch (error) {
    console.error('Waitlist count error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get count' },
      { status: 500 }
    )
  }
}
