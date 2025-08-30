import { Suspense } from 'react'
import SurbeeSignup from '@/components/auth/SurbeeSignup'

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-neutral-400">Loading…</div>}>
      <SurbeeSignup />
    </Suspense>
  )
}