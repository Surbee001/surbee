import { Suspense } from 'react'
import SurbeeLogin from '@/components/auth/SurbeeLogin'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-neutral-400">Loading…</div>}>
      <SurbeeLogin />
    </Suspense>
  )
}

