"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UserNameBadge() {
  const [label, setLabel] = useState<string>('')
  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      const user = data?.user
      setLabel(user?.user_metadata?.full_name || user?.email || 'You')
    })
    return () => {
      mounted = false
    }
  }, [])
  return <span className="text-white text-sm font-medium truncate max-w-[140px]" title={label}>{label}</span>
}

