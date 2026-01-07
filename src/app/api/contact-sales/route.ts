import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      companySize,
      companyName,
      firstName,
      lastName,
      email,
      phone,
      interest,
      message,
      userId,
      submittedAt,
    } = data;

    // Validate required fields
    if (!companySize || !companyName || !firstName || !lastName || !email || !interest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save to sales_leads table
    const { error } = await supabase.from('sales_leads').insert({
      company_size: companySize,
      company_name: companyName,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || null,
      interest: interest,
      message: message || null,
      user_id: userId || null,
      status: 'new',
      created_at: submittedAt || new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving sales lead:', error);
      // If table doesn't exist, just log and return success
      // The lead can be captured via logs until table is created
      console.log('Sales lead data:', {
        companySize,
        companyName,
        firstName,
        lastName,
        email,
        phone,
        interest,
        message,
      });
    }

    // TODO: Optionally send notification email to sales team
    // await sendEmailToSales({ ... });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact sales request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
