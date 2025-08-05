"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SignForm, SignFormData } from "@/components/ui/sign-form"
import { Button } from "@/components/ui/button"
import { Copy, Share2 } from "lucide-react"

interface SignCardProps {
  onSign: (data: SignFormData) => void
  isLoading?: boolean
  error?: string
  signedState?: SignedState | null
}

interface SignedState {
  refCode: string
  referralCount: number
}

export function SignCard({ onSign, isLoading, error, signedState = null }: SignCardProps) {
  const [copied, setCopied] = useState(false)

  const handleSign = async (data: SignFormData) => {
    await onSign(data)
  }

  const referralUrl = signedState ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${signedState.refCode}` : ""

  const copyReferralLink = async () => {
    if (referralUrl) {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent("¡Firma para que Daniel Bilbao sea juez en el IA Hackathon! " + referralUrl)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const text = encodeURIComponent("¡Firma para que Daniel Bilbao sea juez en el IA Hackathon!")
    const url = encodeURIComponent(referralUrl)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank')
  }

  if (signedState) {
    return (
      <div className="border border-black/10 bg-white relative">
        {/* Success textured header */}
        <div className="h-2 pattern-diagonal border-b border-black/10"></div>
        <div className="p-4 space-y-4 border-x border-black/10">
          <div className="text-center space-y-2">
            {/* Geometric check mark */}
            <div className="w-6 h-6 border border-black mx-auto flex items-center justify-center">
              <div className="w-2 h-2 bg-black"></div>
            </div>
            <h3 className="text-sm font-mono font-medium text-black">FIRMA REGISTRADA</h3>
            <p className="text-xs text-black/60 font-mono">
              REFERIDOS: {signedState.referralCount}
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-mono text-black/80 tracking-wider">
                ENLACE PERSONAL
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={referralUrl}
                  readOnly
                  className="flex-1 h-8 px-2 py-1 border border-black/20 bg-white text-xs font-mono text-black/80 focus:outline-none focus:border-black/40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="h-8 px-2 border-black/20 hover:border-black/40 hover:bg-black/5 text-xs font-mono"
                >
                  {copied ? "✓" : "COPY"}
                </Button>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnWhatsApp}
                className="flex-1 h-8 text-xs font-mono border-black/20 hover:border-black/40 hover:bg-black/5"
              >
                WA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnLinkedIn}
                className="flex-1 h-8 text-xs font-mono border-black/20 hover:border-black/40 hover:bg-black/5"
              >
                LI
              </Button>
            </div>
          </div>
        </div>
        {/* Success footer */}
        <div className="h-1 bg-black/10"></div>
      </div>
    )
  }

  return (
    <div className="border border-black/10 bg-white relative">
      {/* Subtle textured header */}
      <div className="h-2 pattern-diagonal-subtle border-b border-black/5"></div>
      <div className="p-4 border-x border-black/10">
        <SignForm onSubmit={handleSign} isLoading={isLoading} error={error} />
      </div>
      {/* Structural footer */}
      <div className="h-1 bg-black/5"></div>
    </div>
  )
}