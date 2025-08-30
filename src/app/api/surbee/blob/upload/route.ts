import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const arrayBuffer = await file.arrayBuffer()
  const path = `uploads/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public').upload(path, new Uint8Array(arrayBuffer), { contentType: file.type, upsert: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const { data: pub } = supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public').getPublicUrl(path)
  return NextResponse.json({ url: pub?.publicUrl || null, path })
}

