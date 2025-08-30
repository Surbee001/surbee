"use client"

import { useEffect, useMemo, useState } from 'react'
import { Copy, Gift, Link as LinkIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/trpc/react'

type InviteSheetProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function InviteSheet({ open, onOpenChange }: InviteSheetProps) {
  const [copied, setCopied] = useState(false)
  const utils = api.useUtils()
  const { data } = api.user.getOrCreateReferral.useQuery(undefined, { enabled: open })
  const redeem = api.user.redeemReferral.useMutation({
    onSuccess: async () => {
      await utils.user.credits.invalidate()
    },
  })

  const [codeInput, setCodeInput] = useState('')
  const inviteUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return data?.code ? `${origin}/?ref=${encodeURIComponent(data.code)}` : ''
  }, [data?.code])

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-[#212121] border-l border-zinc-800 w-[420px] text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Refer & Earn</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Share your link. When your friend signs in and redeems, you both get 5 credits.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#1b1b1b] p-4">
            <div className="mb-2 text-sm text-zinc-300">Your invite link</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 bg-zinc-900 rounded-md border border-zinc-800 px-3 py-2">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                <input
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent text-sm outline-none w-full text-zinc-200 placeholder:text-zinc-500"
                  placeholder="Generating link..."
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (!inviteUrl) return
                  navigator.clipboard.writeText(inviteUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
                className="bg-white text-[#171717] hover:bg-white/90"
              >
                <Copy className="w-4 h-4 mr-1" /> {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-zinc-400">Have a code? Redeem here</div>
            <div className="flex items-center gap-2">
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
              />
              <Button
                disabled={!codeInput || redeem.status === 'pending'}
                onClick={() => redeem.mutate({ code: codeInput.trim() })}
                className="bg-white text-[#171717] hover:bg-white/90"
              >
                <Gift className="w-4 h-4 mr-1" /> {redeem.status === 'pending' ? 'Redeeming…' : 'Redeem 5'}
              </Button>
            </div>
            {redeem.isSuccess && (
              <div className="text-xs text-green-400">Credits added.</div>
            )}
            {redeem.isError && (
              <div className="text-xs text-red-400">{(redeem.error as any)?.message || 'Failed to redeem'}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-300">How it works</div>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>1. Share your unique invite link</li>
              <li>2. They sign in using the link and redeem your code</li>
              <li>3. You both receive 5 credits instantly</li>
            </ul>
          </div>
        </div>

        <SheetFooter className="mt-8">
          <div className="text-xs text-zinc-500">By inviting, you agree to our terms.</div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


