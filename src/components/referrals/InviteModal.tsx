"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Copy, Gift, Link as LinkIcon, X, Check, AlertCircle } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type InviteModalProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const contentVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 }
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
}

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

export default function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [isClosing, setIsClosing] = useState(false)

  const referral = api.user.getOrCreateReferral.useQuery(undefined, {
    enabled: open,
    retry: false,
  })
  const redeem = api.user.redeemReferral.useMutation()

  const baseUrl = "https://surbee.dev"
  const inviteUrl = useMemo(() => {
    const code = referral.data?.code
    return code ? `${baseUrl}/?ref=${encodeURIComponent(code)}` : ""
  }, [referral.data?.code])

  const isUnauthorized = referral.status === "error" && (referral.error as any)?.data?.code === "UNAUTHORIZED"

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setCopied(false)
      setCodeInput("")
      setIsClosing(false)
    }
  }, [open])

  // Auto-clear success/error states
  useEffect(() => {
    if (redeem.isSuccess || redeem.isError) {
      const timer = setTimeout(() => {
        redeem.reset()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [redeem.isSuccess, redeem.isError, redeem.reset])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onOpenChange(false), 150)
  }

  const handleCopyLink = async () => {
    if (!inviteUrl) return
    
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRedeemCode = () => {
    const trimmedCode = codeInput.trim().toUpperCase()
    if (!trimmedCode) return
    
    redeem.mutate({ code: trimmedCode })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && codeInput.trim()) {
      handleRedeemCode()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
          <Dialog.Portal forceMount>
            <motion.div
              className="fixed inset-0 z-[9998]"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
            >
              <Dialog.Overlay className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            </motion.div>
            
            <motion.div
              className="fixed left-1/2 top-1/2 z-[9999] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <Dialog.Content
                className="relative rounded-2xl border border-zinc-800/50 bg-[#212121] shadow-2xl ring-1 ring-white/5"
                onEscapeKeyDown={(e) => {
                  e.preventDefault()
                  handleClose()
                }}
              >
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6">
                  <motion.button
                    className="absolute right-6 top-6 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    onClick={handleClose}
                    aria-label="Close modal"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Earn 5 credits each
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Dialog.Title className="text-3xl font-bold text-white leading-tight">
                      Spread the love
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-base text-zinc-400">
                      Share Surbee with friends and earn free credits together
                    </Dialog.Description>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-8">
                  {/* How it works */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">How it works:</h3>
                    <motion.ul
                      className="space-y-4"
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {[
                        { icon: "⚡", text: "Share your unique invite link" },
                        { icon: "✦", text: "Friends sign up and redeem your code" },
                        { icon: "▣", text: "You both get 5 credits instantly" }
                      ].map((step, index) => (
                        <motion.li
                          key={index}
                          className="flex items-center gap-4 text-zinc-200"
                          variants={itemVariants}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 text-sm font-medium ring-1 ring-white/10">
                            {step.icon}
                          </span>
                          <span className="text-sm font-medium">{step.text}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>

                  {/* Invite Link Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-medium text-zinc-300">Your invite link:</h3>

                    {isUnauthorized ? (
                      <motion.div
                        className="flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <span className="text-sm text-zinc-300">Sign in to generate your invite link</span>
                        </div>
                        <motion.a
                          href="/login?next=/"
                          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#171717] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Sign in
                        </motion.a>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-3">
                        <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-700/50 bg-[#111111] px-4 py-3">
                          <LinkIcon className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                          <input
                            readOnly
                            value={inviteUrl}
                            placeholder="Generating your unique link..."
                            className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                            aria-label="Invite link"
                          />
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="sm"
                            className="bg-white text-[#171717] hover:bg-white/90 focus:ring-2 focus:ring-white/20 font-medium px-4 py-3 h-auto"
                            disabled={!inviteUrl}
                            onClick={handleCopyLink}
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.div
                                  key="copied"
                                  className="flex items-center gap-2"
                                  variants={successVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Copied!</span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  className="flex items-center gap-2"
                                  variants={successVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span>Copy link</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>

                  {/* Redeem Code Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-medium text-zinc-300">Have a referral code?</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter referral code"
                          className="bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20 h-12"
                          maxLength={20}
                          disabled={redeem.status === 'pending'}
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="bg-white text-[#171717] hover:bg-white/90 focus:ring-2 focus:ring-white/20 font-medium px-6 py-3 h-12"
                          disabled={!codeInput.trim() || redeem.status === 'pending'}
                          onClick={handleRedeemCode}
                        >
                          <Gift className="mr-2 h-4 w-4" />
                          {redeem.status === 'pending' ? 'Redeeming…' : 'Redeem 5'}
                        </Button>
                      </motion.div>
                    </div>

                    {/* Status Messages */}
                    <AnimatePresence mode="wait">
                      {redeem.isSuccess && (
                        <motion.div
                          className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2"
                          variants={successVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <Check className="h-4 w-4" />
                          <span>Success! 5 credits added to your account.</span>
                        </motion.div>
                      )}
                      {redeem.isError && (
                        <motion.div
                          className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
                          variants={successVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{(redeem.error as any)?.message || 'Failed to redeem code. Please try again.'}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                  className="border-t border-zinc-800/50 px-8 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    className="text-center w-full text-xs text-zinc-500 hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1"
                    onClick={() => {
                      // Handle terms and conditions click
                      window.open('/terms', '_blank')
                    }}
                  >
                    View Terms and Conditions
                  </button>
                </motion.div>
              </Dialog.Content>
            </motion.div>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  )
}